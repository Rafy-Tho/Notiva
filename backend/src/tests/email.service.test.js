import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.HOSTINGER_API_BASE_URL = "https://api.mail.hostinger.com";
process.env.HOSTINGER_MAIL_MAILBOX_ID = "AC123";
process.env.HOSTINGER_MAIL_API_KEY = "test-key";
process.env.MAIL_FROM = "no-reply@example.com";
process.env.MAIL_FROM_NAME = "NoteFlow";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const { send } = await import("../modules/email/email.service.js");

function apiResponse(status, { body, headers } = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers(headers || {}),
    json: async () => body,
  };
}

function sentPayload() {
  const [url, opts] = mockFetch.mock.calls[0];
  return { url, body: JSON.parse(opts.body), opts };
}

const DEFAULT_OPTS = { to: "a@b.com", subject: "Hello", text: "Body text" };

describe("email.service send", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("builds the Hostinger V1.Send.Request payload shape", async () => {
    mockFetch.mockResolvedValueOnce(apiResponse(204));

    const result = await send(DEFAULT_OPTS);

    const { url, body, opts } = sentPayload();
    expect(url).toBe("https://api.mail.hostinger.com/api/v1/mailboxes/AC123/send");
    expect(opts.method).toBe("POST");
    expect(opts.headers.Authorization).toBe("Bearer test-key");
    expect(body).toEqual({
      to: ["a@b.com"],
      displayName: "NoteFlow",
      subject: "Hello",
      text: "Body text",
      html: "<p>Body text</p>",
    });
    expect(result).toEqual({ success: true });
  });

  it("accepts 204 No Content as success and does not parse a body", async () => {
    mockFetch.mockResolvedValueOnce(apiResponse(204));

    await expect(send(DEFAULT_OPTS)).resolves.toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("treats 400 as a permanent error and does not retry", async () => {
    mockFetch.mockResolvedValueOnce(apiResponse(400, { body: { code: "bad_request" } }));

    await expect(send(DEFAULT_OPTS)).rejects.toThrow("Email service error: 400");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries transient 5xx errors and succeeds on the next attempt", async () => {
    mockFetch
      .mockResolvedValueOnce(apiResponse(500, { body: {} }))
      .mockResolvedValueOnce(apiResponse(204));

    await expect(send(DEFAULT_OPTS)).resolves.toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("honors the retry-after header for 429 responses", async () => {
    mockFetch
      .mockResolvedValueOnce(apiResponse(429, { headers: { "retry-after": "0" }, body: {} }))
      .mockResolvedValueOnce(apiResponse(204));

    await expect(send(DEFAULT_OPTS)).resolves.toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("fails after exhausting retries on a persistent 500", async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(apiResponse(500, { body: {} })),
    );

    await expect(send(DEFAULT_OPTS)).rejects.toThrow("Email service error: 500");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("wraps request timeouts as retryable and eventually throws", async () => {
    mockFetch.mockImplementation(() => {
      const err = new Error("aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });

    await expect(send(DEFAULT_OPTS)).rejects.toThrow("Email service request timed out");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});