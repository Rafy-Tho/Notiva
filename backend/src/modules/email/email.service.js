import { env } from "../../config/env.js";
import { logger } from "../../common/utils/logger.js";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 20;
const BASE_BACKOFF_MS = 300;
const MAX_BACKOFF_MS = 5_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Exponential backoff with jitter, capped so a hung provider cannot stall callers.
function backoffDelay(attempt) {
  const base = Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS);
  return Math.round(base / 2 + Math.random() * (base / 2));
}

function parseRetryAfter(headerValue) {
  if (!headerValue) return null;
  const seconds = Number(headerValue);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(headerValue);
  if (Number.isNaN(date)) return null;
  return Math.max(0, date - Date.now());
}

// Transient failures only: network/timeout, 429 and 5xx. Client errors (400,
// 401, 403, 404, 422) are permanent and retrying them would just repeat.
const isRetryableStatus = (statusCode) => statusCode === 429 || statusCode >= 500;

function requestError(message, metadata = {}) {
  const err = new Error(message);
  err.isEmailServiceError = true;
  Object.assign(err, metadata);
  return err;
}

async function request(payload) {
  const url = `${env.hostingerBaseUrl}/api/v1/mailboxes/${env.hostingerMailboxId}/send`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.hostingerApiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // 204 No Content means the message was accepted.
    if (res.status === 204) return;

    // Read the error envelope for metadata only. The body is never surfaced
    // in the thrown error or logs, so email content cannot leak.
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    throw requestError(`Email service error: ${res.status}`, {
      statusCode: res.status,
      code: body?.code,
      retryable: isRetryableStatus(res.status),
      retryAfterMs: parseRetryAfter(res.headers.get("retry-after")),
      correlationId: body?.correlation_id,
    });
  } catch (error) {
    if (error.isEmailServiceError) throw error;
    if (error?.name === "AbortError") {
      throw requestError("Email service request timed out", { retryable: true });
    }
    throw requestError("Email service request failed", { retryable: true });
  } finally {
    clearTimeout(timer);
  }
}

async function sendWithRetry(payload) {
  let lastError;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await request(payload);
    } catch (error) {
      lastError = error;
      if (!error.retryable || attempt === MAX_ATTEMPTS - 1) break;
      const delay =
        error.retryAfterMs >= 0
          ? Math.min(error.retryAfterMs, MAX_BACKOFF_MS)
          : backoffDelay(attempt);
      await sleep(delay);
    }
  }
  throw lastError;
}

export async function send({ to, subject, text, html }) {
  const payload = {
    to: [to],
    displayName: env.mailFromName,
    subject,
    text,
    html: html || `<p>${text}</p>`,
  };

  try {
    await sendWithRetry(payload);
    logger.info("Email sent");
    return { success: true };
  } catch (error) {
    // Non-sensitive metadata only; never the recipient, codes, or content.
    logger.error("Email error:", error.message);
    throw error;
  }
}

export async function sendVerificationEmail(to, code) {
  return send({
    to,
    subject: "Verify Your Email",
    text: `Your verification code is: ${code}. This code expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verify Your Email</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #16a34a;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to, code) {
  return send({
    to,
    subject: "Password Reset Code",
    text: `Your password reset code is: ${code}. This code expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset</h2>
        <p>Your password reset code is:</p>
        <h1 style="color: #16a34a;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to, name) {
  return send({
    to,
    subject: "Welcome to NoteFlow",
    text: `Welcome ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to NoteFlow!</h2>
        <p>Hi ${name},</p>
        <p>We're glad to have you on board.</p>
      </div>
    `,
  });
}