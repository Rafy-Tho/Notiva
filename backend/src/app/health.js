import { readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { env } from "../config/env.js";
import prisma from "../db/prisma.js";
import { getRedisClient } from "../config/redis.js";
import cloudinary from "../config/cloudinary.js";
import { logger } from "../common/utils/logger.js";

const REDIS_PING_TIMEOUT_MS = 1500;
const PROVIDER_TIMEOUT_MS = 3000;
const GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration";

const ROUTE_GROUPS = [
  { path: "/api/v1/auth", label: "Authentication", note: "register · login · verify · reset", auth: "public" },
  { path: "/api/v1/me", label: "Profile", note: "account details · avatar · password", auth: "auth" },
  { path: "/api/v1/notes", label: "Notes", note: "create · edit · search · favorites · trash", auth: "auth" },
  { path: "/api/v1/notebooks", label: "Notebooks", note: "organize notes into collections", auth: "auth" },
  { path: "/api/v1/tags", label: "Tags", note: "classify and filter notes", auth: "auth" },
];

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

function readPackageJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

const backendPkg = readPackageJson(new URL("../package.json", import.meta.url));
const frontendPkg = readPackageJson(new URL("../../frontend/package.json", import.meta.url));

function cleanVersion(value) {
  return value ? String(value).replace(/^[\^~]/, "") : null;
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function pingDatabase() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "connected", ms: Date.now() - startedAt };
  } catch (err) {
    logger.debug("Health check: database unreachable:", err.message);
    return { status: "unreachable", ms: null };
  }
}

async function pingRedis() {
  const redis = getRedisClient();
  if (redis.status === "end") return { status: "unreachable", ms: null };
  const startedAt = Date.now();
  try {
    await Promise.race([
      redis.ping(),
      sleep(REDIS_PING_TIMEOUT_MS).then(() => {
        throw new Error("redis ping timeout");
      }),
    ]);
    return { status: "connected", ms: Date.now() - startedAt };
  } catch {
    return { status: "unreachable", ms: null };
  }
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    sleep(ms).then(() => {
      throw new Error("provider check timed out");
    }),
  ]);
}

function googleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CALLBACK_URL,
  );
}

async function pingEmail() {
  const startedAt = Date.now();
  try {
    const res = await withTimeout(
      fetch(`${env.hostingerBaseUrl}/api/v1/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${env.hostingerApiKey}` },
      }),
      PROVIDER_TIMEOUT_MS,
    );
    if (res.status === 200) return { status: "connected", ms: Date.now() - startedAt };
    if (res.status === 401 || res.status === 403) {
      return { status: "bad_credentials", ms: null };
    }
    return { status: "unreachable", ms: null };
  } catch {
    return { status: "unreachable", ms: null };
  }
}

async function pingCloudinary() {
  const startedAt = Date.now();
  try {
    const result = await withTimeout(cloudinary.api.ping(), PROVIDER_TIMEOUT_MS);
    if (result?.status === "ok") return { status: "connected", ms: Date.now() - startedAt };
    return { status: "unreachable", ms: null };
  } catch (err) {
    if (err?.http_code === 401 || err?.http_code === 403) {
      return { status: "bad_credentials", ms: null };
    }
    return { status: "unreachable", ms: null };
  }
}

async function pingGoogle() {
  if (!googleConfigured()) return { status: "not_configured", ms: null };
  const startedAt = Date.now();
  try {
    const res = await withTimeout(fetch(GOOGLE_DISCOVERY_URL), PROVIDER_TIMEOUT_MS);
    if (res.ok) return { status: "connected", ms: Date.now() - startedAt };
    return { status: "unreachable", ms: null };
  } catch {
    return { status: "unreachable", ms: null };
  }
}

export async function checkHealth(origin) {
  const [db, redis, email, cloudinaryStatus, google] = await Promise.all([
    pingDatabase(),
    pingRedis(),
    pingEmail(),
    pingCloudinary(),
    pingGoogle(),
  ]);
  const uptime = process.uptime();
  const now = new Date();

  const requiredOk =
    db.status === "connected" &&
    redis.status === "connected" &&
    email.status === "connected" &&
    cloudinaryStatus.status === "connected";
  const googleOk = google.status === "connected" || google.status === "not_configured";

  return {
    verdict: requiredOk && googleOk ? "Operational" : "Degraded",
    db,
    redis,
    email,
    cloudinary: cloudinaryStatus,
    google,
    version: backendPkg?.version || "-",
    environment: env.nodeEnv,
    node: process.version,
    uptimeLabel: formatUptime(uptime),
    startedAt: now.getTime() - uptime * 1000,
    now,
    memoryRss: formatMb(process.memoryUsage().rss),
    memoryHeap: formatMb(process.memoryUsage().heapUsed),
    origin: origin || `http://localhost:${env.port}`,
    stack: [
      { name: "Node.js", version: process.version.replace(/^v/, "") },
      { name: "Express", version: cleanVersion(backendPkg?.dependencies?.express) },
      { name: "Prisma", version: cleanVersion(backendPkg?.dependencies?.prisma || backendPkg?.dependencies?.["@prisma/client"]) },
      { name: "ioredis", version: cleanVersion(backendPkg?.dependencies?.ioredis) },
      { name: "PostgreSQL", version: null },
      { name: "React", version: cleanVersion(frontendPkg?.dependencies?.react) },
    ],
    routes: ROUTE_GROUPS,
    methods: METHODS,
  };
}

export function renderHealthPage(meta) {
  const degraded = meta.verdict !== "Operational";
  const pillClass = degraded ? "pill degraded" : "pill";
  const dotClass = degraded ? "dot deg" : "dot";

  const stats = [
    { label: "Service version", value: meta.version },
    { label: "Environment", value: meta.environment, mono: false },
    { label: "Node.js", value: meta.node, mono: true },
    { label: "Uptime", value: meta.uptimeLabel, mono: true },
    { label: "Started", value: new Date(meta.startedAt).toISOString(), mono: true },
    { label: "Memory (RSS)", value: meta.memoryRss, mono: true },
    { label: "Memory (heap)", value: meta.memoryHeap, mono: true },
    { label: "Last checked", value: meta.now.toISOString(), mono: true },
  ];

  const statHtml = stats
    .map(
      ({ label, value }) =>
        `<div class="stat"><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div>`,
    )
    .join("");

  const STATUS_PRESENTATION = {
    connected: { tone: "ok", label: "Connected" },
    not_configured: { tone: "neutral", label: "Not configured" },
    bad_credentials: { tone: "crit", label: "Bad credentials" },
    unreachable: { tone: "warn", label: "Unreachable" },
  };

  const systemRow = (name, { status, ms }) => {
    const presentation = STATUS_PRESENTATION[status] || STATUS_PRESENTATION.unreachable;
    const ok = status === "connected";
    return `<div class="sys-row">
      <span class="sys-name">${name}</span>
      <span class="sys-meta">${ok && typeof ms === "number" ? `${ms}ms` : "—"}</span>
      <span class="sys-status ${presentation.tone}">${presentation.label}</span>
    </div>`;
  };

  const systemsHtml = [
    systemRow("Database (PostgreSQL)", meta.db),
    systemRow("Cache & rate limit (Redis)", meta.redis),
    systemRow("API server", { status: "connected", ms: null }),
  ].join("");

  const integrationsHtml = [
    systemRow("Email (Hostinger)", meta.email),
    systemRow("Media (Cloudinary)", meta.cloudinary),
    systemRow("Sign-in (Google OAuth)", meta.google),
  ].join("");

  const routeCards = meta.routes
    .map(
      ({ path, label, note, auth }) => `<div class="route-card">
        <div class="route-card-head"><span class="route-label">${label}</span><span class="route-auth ${auth}">${auth}</span></div>
        <div class="route-path">${path}</div>
        <div class="route-note">${note}</div>
      </div>`,
    )
    .join("");

  const methodChips = meta.methods.map((m) => `<span class="chip method">${m}</span>`).join("");

  const stackChips = meta.stack
    .filter(({ version }) => version)
    .map(({ name, version }) => `<span class="chip">${name} <b>${version}</b></span>`)
    .join("");

  const curl = `curl -s ${meta.origin}/`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0a100d">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230e1c16'/%3E%3Cpath d='M7 25c0-9 6-15 18-17-2 12-8 18-18 17z' fill='%2334d399'/%3E%3Cpath d='M8 23l9-9' stroke='%23052e21' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E">
<title>NoteFlow API · Health</title>
<style>
  :root {
    --bg: #0a100d;
    --card: #0e1c16;
    --card-soft: rgba(14, 28, 22, 0.66);
    --border: rgba(52, 211, 153, 0.16);
    --border-strong: rgba(52, 211, 153, 0.34);
    --accent: #34d399;
    --accent-deep: #059669;
    --accent-soft: rgba(52, 211, 153, 0.12);
    --text: #e8f5ee;
    --muted: #8fb3a3;
    --muted-2: #5f8071;
    --degrade: #fbbf24;
    --danger: #f87171;
    --mono: ui-monospace, "SFMono-Regular", "JetBrains Mono", Menlo, Consolas, monospace;
    --sans: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body { height: 100%; }

  body {
    font-family: var(--sans);
    color: var(--text);
    background-color: var(--bg);
    background-image:
      radial-gradient(900px 500px at 15% -10%, rgba(16, 185, 129, 0.16), transparent 60%),
      radial-gradient(800px 500px at 90% 110%, rgba(6, 95, 70, 0.22), transparent 60%),
      radial-gradient(600px 400px at 80% -10%, rgba(5, 150, 105, 0.10), transparent 55%);
    background-attachment: fixed;
    min-height: 100vh;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  .bg-grid {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(rgba(52, 211, 153, 0.08) 1px, transparent 1px);
    background-size: 26px 26px;
    mask-image: radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%);
  }

  .wrap {
    position: relative;
    max-width: 880px;
    margin: 0 auto;
    padding: clamp(24px, 6vw, 64px) 20px 40px;
  }

  .panel {
    background: var(--card-soft);
    border: 1px solid var(--border);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 1px 0 rgba(52, 211, 153, 0.12) inset, 0 24px 60px -24px rgba(0, 0, 0, 0.7);
    animation: fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    overflow: hidden;
  }

  .panel::before {
    content: "";
    display: block;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    background-size: 200% 100%;
    animation: shimmer 3.5s ease-in-out infinite;
  }

  header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px 26px 20px;
  }

  .logo {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(145deg, rgba(52, 211, 153, 0.22), rgba(14, 28, 22, 0.9));
    border: 1px solid var(--border-strong);
    display: grid;
    place-items: center;
    flex-shrink: 0;
    box-shadow: 0 8px 24px -10px rgba(16, 185, 129, 0.45);
  }

  .wordmark { flex: 1; min-width: 0; }

  .eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-2);
  }

  h1 {
    font-size: clamp(20px, 4vw, 26px);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-top: 2px;
  }

  h1 .muted { color: var(--muted); font-weight: 600; }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--accent-soft);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .pill.degraded { background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.35); }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 2.2s ease-out infinite;
  }

  .dot.deg { background: var(--degrade); animation-name: pulse-deg; }

  section { padding: 6px 26px 26px; }

  section .heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  section .heading h2 {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  section .heading .sub { font-size: 12px; color: var(--muted-2); }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
    min-width: 0;
  }

  .stat-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted-2);
    margin-bottom: 5px;
  }

  .stat-value {
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    word-break: break-all;
  }

  .systems { display: flex; flex-direction: column; gap: 8px; }

  .sys-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
  }

  .sys-name { font-size: 13px; font-weight: 600; flex: 1; }

  .sys-meta { font-family: var(--mono); font-size: 12px; color: var(--muted-2); }

  .sys-status {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 4px 9px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
  }

  .sys-status.ok { color: var(--accent); background: var(--accent-soft); }
  .sys-status.warn { color: var(--degrade); background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.35); }
  .sys-status.crit { color: var(--danger); background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.35); }
  .sys-status.neutral { color: var(--muted-2); background: rgba(143, 179, 163, 0.08); border-color: rgba(143, 179, 163, 0.2); }

  .route-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }

  .route-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 13px 14px;
  }

  .route-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  .route-label { font-size: 13px; font-weight: 600; }

  .route-auth {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 999px;
  }

  .route-auth.public { color: var(--accent); background: var(--accent-soft); }
  .route-auth.auth { color: var(--muted); background: rgba(143, 179, 163, 0.12); }

  .route-path { font-family: var(--mono); font-size: 12px; color: var(--accent); word-break: break-all; }

  .route-note { font-size: 11px; color: var(--muted-2); margin-top: 4px; }

  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }

  .chip {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    border: 1px solid var(--border);
    background: var(--card);
    border-radius: 999px;
    padding: 4px 10px;
  }

  .chip.method { color: var(--accent); border-color: var(--border-strong); }

  .chip b { color: var(--text); font-weight: 600; }

  .probe {
    background: #07110d;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
    overflow-x: auto;
  }

  .probe-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted-2);
    margin-bottom: 8px;
  }

  .probe code {
    font-family: var(--mono);
    font-size: 12.5px;
    color: var(--accent);
    display: block;
    white-space: pre;
  }

  .probe code span { color: var(--muted-2); }

  .divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0 26px;
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 18px;
    padding: 16px 26px 20px;
    font-size: 11px;
    color: var(--muted-2);
  }

  footer .brand { font-weight: 600; color: var(--muted); }

  footer .spacer { flex: 1; }

  footer a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
    padding: 5px 11px;
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    transition: background 0.2s ease, color 0.2s ease;
  }

  footer a:hover { background: var(--accent-soft); color: var(--accent-deep); }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.45); }
    70% { box-shadow: 0 0 0 9px rgba(52, 211, 153, 0); }
    100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
  }

  @keyframes pulse-deg {
    0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.45); }
    70% { box-shadow: 0 0 0 9px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @media (min-width: 560px) {
    .stats { grid-template-columns: repeat(4, 1fr); }
  }

  @media (prefers-reduced-motion: reduce) {
    .dot, .panel::before, .panel { animation: none !important; }
  }
</style>
</head>
<body>
  <div class="bg-grid" aria-hidden="true"></div>
  <main class="wrap">
    <div class="panel">
      <header>
        <div class="logo" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M7 25c0-9 6-15 18-17-2 12-8 18-18 17z" fill="#34d399"/>
            <path d="M8 23l9-9" stroke="#052e21" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="wordmark">
          <div class="eyebrow">System Status</div>
          <h1>NoteFlow <span class="muted">API</span></h1>
        </div>
        <div class="${pillClass}" role="status">
          <span class="${dotClass}"></span>
          <span class="pill-text">${meta.verdict}</span>
        </div>
      </header>

      <section>
        <div class="heading"><h2>Process</h2></div>
        <div class="stats">${statHtml}</div>
      </section>

      <hr class="divider">

      <section>
        <div class="heading"><h2>Dependencies</h2><span class="sub">live status of the services this API relies on</span></div>
        <div class="systems">${systemsHtml}</div>
      </section>

      <hr class="divider">

      <section>
        <div class="heading"><h2>Integrations</h2><span class="sub">third-party services (Google is optional)</span></div>
        <div class="systems">${integrationsHtml}</div>
      </section>

      <hr class="divider">

      <section>
        <div class="heading"><h2>API surface</h2><span class="sub">all routes are under</span></div>
        <div class="route-grid">${routeCards}</div>
        <div class="chips">${methodChips}</div>
      </section>

      <hr class="divider">

      <section>
        <div class="heading"><h2>Stack</h2><span class="sub">versions</span></div>
        <div class="chips">${stackChips}</div>
      </section>

      <hr class="divider">

      <section>
        <div class="heading"><h2>Probe</h2></div>
        <div class="probe">
          <div class="probe-label">Health probe</div>
          <code>${curl}</code>
        </div>
      </section>

      <footer>
        <span class="brand">NoteFlow</span>
        <span>v${meta.version}</span>
        <span>${meta.environment}</span>
        <span class="spacer"></span>
        <time datetime="${meta.now.toISOString()}">${meta.now.toISOString()}</time>
        <a href="/">Refresh</a>
      </footer>
    </div>
  </main>
</body>
</html>`;
}