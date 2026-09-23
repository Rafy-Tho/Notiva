import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/noteflow_test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.NODE_ENV = "test";
process.env.HOSTINGER_API_BASE_URL = "https://api.mail.hostinger.com";
process.env.HOSTINGER_MAIL_MAILBOX_ID = "AC123";
process.env.HOSTINGER_MAIL_API_KEY = "test-key";
process.env.MAIL_FROM = "no-reply@example.com";
process.env.MAIL_FROM_NAME = "NoteFlow";

const { redisMock, prismaMock, cloudinaryMock, fetchMock } = vi.hoisted(() => ({
  redisMock: { status: "ready", ping: vi.fn().mockResolvedValue("PONG") },
  prismaMock: { $queryRaw: vi.fn().mockResolvedValue([{ "1": 1 }]) },
  cloudinaryMock: { api: { ping: vi.fn().mockResolvedValue({ status: "ok" }) } },
  fetchMock: vi.fn().mockResolvedValue({ status: 200, ok: true }),
}));

vi.mock("../db/prisma.js", () => ({ default: prismaMock }));
vi.mock("../config/redis.js", () => ({ getRedisClient: () => redisMock }));
vi.mock("../config/cloudinary.js", () => ({ default: cloudinaryMock }));
vi.stubGlobal("fetch", fetchMock);

const { checkHealth, renderHealthPage } = await import("../app/health.js");

function hostingerError(status) {
  return (url) =>
    url.includes("/api/v1/me") ? { status, ok: status < 400 } : { status: 200, ok: true };
}

describe("renderHealthPage", () => {
  const operationalMeta = {
    verdict: "Operational",
    db: { status: "connected", ms: 12 },
    redis: { status: "connected", ms: 3 },
    email: { status: "connected", ms: 24 },
    cloudinary: { status: "connected", ms: 88 },
    google: { status: "not_configured", ms: null },
    version: "1.0.0",
    environment: "test",
    node: "v22.0.0",
    uptimeLabel: "1h 2m 3s",
    startedAt: new Date("2026-09-23T00:00:00.000Z").getTime(),
    now: new Date("2026-09-23T01:00:00.000Z"),
    memoryRss: "42.0 MB",
    memoryHeap: "30.0 MB",
    origin: "http://localhost:5000",
    stack: [
      { name: "Node.js", version: "22.0.0" },
      { name: "Express", version: "5.2.1" },
    ],
    routes: [{ path: "/api/v1/notes", label: "Notes", note: "create", auth: "auth" }],
    methods: ["GET", "POST"],
  };

  it("renders the wordmark and operational verdict", () => {
    const html = renderHealthPage(operationalMeta);

    expect(html).toContain("NoteFlow");
    expect(html).toContain("Operational");
    expect(html).toContain('<div class="pill" role="status">');
    expect(html).not.toContain('<div class="pill degraded" role="status">');
  });

  it("renders route paths, method chips, and the curl probe", () => {
    const html = renderHealthPage(operationalMeta);

    expect(html).toContain("/api/v1/notes");
    expect(html).toContain("GET");
    expect(html).toContain("POST");
    expect(html).toContain("curl -s http://localhost:5000/");
    expect(html).toContain("data:image/svg+xml");
  });

  it("renders the integrations section with per-service states", () => {
    const html = renderHealthPage(operationalMeta);

    expect(html).toContain("Integrations");
    expect(html).toContain("Email (Hostinger)");
    expect(html).toContain("Media (Cloudinary)");
    expect(html).toContain("Sign-in (Google OAuth)");
    expect(html).toContain("Not configured");
    expect(html).toContain("Connected");
  });

  it("renders bad-credentials and unreachable integration states", () => {
    const html = renderHealthPage({
      ...operationalMeta,
      verdict: "Degraded",
      email: { status: "bad_credentials", ms: null },
      cloudinary: { status: "unreachable", ms: null },
      google: { status: "connected", ms: 41 },
    });

    expect(html).toContain("Bad credentials");
    expect(html).toContain("Unreachable");
  });

  it("marks the page degraded and reflects lost connections", () => {
    const html = renderHealthPage({
      ...operationalMeta,
      verdict: "Degraded",
      db: { status: "unreachable", ms: null },
    });

    expect(html).toContain("Degraded");
    expect(html).toContain('<div class="pill degraded" role="status">');
    expect(html).not.toContain('<div class="pill" role="status">');
  });
});

describe("checkHealth", () => {
  beforeEach(() => {
    prismaMock.$queryRaw.mockReset();
    prismaMock.$queryRaw.mockResolvedValue([{ "1": 1 }]);
    redisMock.ping.mockReset();
    redisMock.ping.mockResolvedValue("PONG");
    redisMock.status = "ready";
    cloudinaryMock.api.ping.mockReset();
    cloudinaryMock.api.ping.mockResolvedValue({ status: "ok" });
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ status: 200, ok: true });
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
    process.env.GOOGLE_CALLBACK_URL = "http://localhost:5000/api/v1/auth/google/callback";
  });

  afterEach(() => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_CALLBACK_URL;
  });

  it("reports Operational when every dependency and integration responds", async () => {
    const health = await checkHealth("http://localhost:5000");

    expect(health.verdict).toBe("Operational");
    expect(health.db.status).toBe("connected");
    expect(health.redis.status).toBe("connected");
    expect(health.email.status).toBe("connected");
    expect(health.cloudinary.status).toBe("connected");
    expect(health.google.status).toBe("connected");
    expect(health.origin).toBe("http://localhost:5000");
    expect(typeof health.uptimeLabel).toBe("string");
  });

  it("stays Operational when google is not configured", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_CALLBACK_URL;

    const health = await checkHealth();

    expect(health.verdict).toBe("Operational");
    expect(health.google.status).toBe("not_configured");
    expect(fetchMock).not.toHaveBeenCalledWith("https://accounts.google.com/.well-known/openid-configuration");
  });

  it("reports Degraded when the database is unreachable", async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error("connection refused"));

    const health = await checkHealth();

    expect(health.verdict).toBe("Degraded");
    expect(health.db.status).toBe("unreachable");
  });

  it("reports Degraded when redis is unavailable", async () => {
    redisMock.status = "end";

    const health = await checkHealth();

    expect(health.verdict).toBe("Degraded");
    expect(health.redis.status).toBe("unreachable");
  });

  it("reports Degraded when redis ping times out", async () => {
    redisMock.ping.mockImplementation(() => new Promise(() => {}));

    const health = await checkHealth();

    expect(health.verdict).toBe("Degraded");
    expect(health.redis.status).toBe("unreachable");
  });

  it("reports Degraded when the email provider is unreachable", async () => {
    fetchMock.mockImplementation(hostingerError(500));

    const health = await checkHealth();

    expect(health.verdict).toBe("Degraded");
    expect(health.email.status).toBe("unreachable");
  });

  it("reports Degraded when the email credentials are invalid", async () => {
    fetchMock.mockImplementation(hostingerError(401));

    const health = await checkHealth();

    expect(health.verdict).toBe("Degraded");
    expect(health.email.status).toBe("bad_credentials");
  });

  it("reports Degraded when cloudinary returns bad credentials", async () => {
    cloudinaryMock.api.ping.mockRejectedValue({ http_code: 401 });

    const health = await checkHealth();

    expect(health.verdict).toBe("Degraded");
    expect(health.cloudinary.status).toBe("bad_credentials");
  });

  it("reports Degraded when google is configured but unreachable", async () => {
    fetchMock.mockImplementation((url) => {
      if (url.includes("accounts.google.com")) throw new TypeError("fetch failed");
      return { status: 200, ok: true };
    });

    const health = await checkHealth();

    expect(health.verdict).toBe("Degraded");
    expect(health.google.status).toBe("unreachable");
  });
});