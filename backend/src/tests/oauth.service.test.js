import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";

const userRepo = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

const oauthRepo = vi.hoisted(() => ({
  findByProvider: vi.fn(),
  create: vi.fn(),
}));

const sessionSvc = vi.hoisted(() => ({
  createSession: vi.fn(),
}));

const authSvc = vi.hoisted(() => ({
  buildSessionContext: vi.fn(() => ({
    deviceName: "Test",
    ipAddress: "0.0.0.0",
    userAgent: "vitest",
  })),
}));

const userSvc = vi.hoisted(() => ({
  toPublicUser: vi.fn((u) => u),
}));

vi.mock("../modules/users/user.repository.js", () => userRepo);
vi.mock("../modules/auth/oauth.repository.js", () => oauthRepo);
vi.mock("../modules/auth/session.service.js", () => sessionSvc);
vi.mock("../modules/auth/auth.service.js", () => authSvc);
vi.mock("../modules/users/user.service.js", () => userSvc);
vi.mock("bcrypt", () => ({
  default: { hash: vi.fn(async () => "hashed:random-password"), compare: vi.fn() },
}));

const { handleGoogleCallback } = await import("../modules/auth/oauth.service.js");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const { privateKey: otherPrivateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const jwk = publicKey.export({ format: "jwk" });

function b64url(data) {
  return Buffer.from(data).toString("base64url");
}

function signJwt(payload, key = privateKey) {
  const header = { alg: "RS256", kid: "test-kid", typ: "JWT" };
  const headerB64 = b64url(JSON.stringify(header));
  const payloadB64 = b64url(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const sig = crypto.sign("RSA-SHA256", Buffer.from(data, "ascii"), key);
  return `${data}.${b64url(sig)}`;
}

function makePayload(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: "https://accounts.google.com",
    aud: "google-client-id",
    sub: "google-sub-123",
    email: "user@example.com",
    name: "User Name",
    picture: "https://example.com/pic.png",
    email_verified: true,
    iat: now - 60,
    exp: now + 3600,
    ...overrides,
  };
}

const validIdToken = signJwt(makePayload());

function certsResponse() {
  return { ok: true, json: async () => ({ keys: [{ ...jwk, kid: "test-kid", alg: "RS256", use: "sig" }] }) };
}

function tokenResponse(idToken = validIdToken) {
  return { ok: true, json: async () => ({ id_token: idToken, access_token: "access-tok" }) };
}

process.env.GOOGLE_CLIENT_ID = "google-client-id";

describe("handleGoogleCallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes("/token")) return tokenResponse();
      if (String(url).includes("/certs")) return certsResponse();
      throw new Error(`Unexpected URL: ${url}`);
    });
    sessionSvc.createSession.mockResolvedValue({ session: { id: "s1" }, rawToken: "raw-token" });
  });

  it("creates a new verified user and links the Google account when none exists", async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.create.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      emailVerifiedAt: new Date(),
    });
    oauthRepo.findByProvider.mockResolvedValue(null);
    oauthRepo.create.mockResolvedValue({ id: "a1" });

    const result = await handleGoogleCallback({ code: "code", redirectUri: "redir", req: null });

    expect(userRepo.create).toHaveBeenCalledWith({
      name: "User Name",
      email: "user@example.com",
      password: "hashed:random-password",
      emailVerifiedAt: expect.any(Date),
      avatar: "https://example.com/pic.png",
    });
    expect(oauthRepo.create).toHaveBeenCalledWith({
      userId: "u1",
      provider: "google",
      providerUserId: "google-sub-123",
    });
    expect(result.user.id).toBe("u1");
    expect(result.session).toEqual({ session: { id: "s1" }, rawToken: "raw-token" });
    expect(sessionSvc.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1" }),
    );
  });

  it("links an existing unverified user by email without touching the password", async () => {
    userRepo.findByEmail.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      emailVerifiedAt: null,
      avatar: null,
      deletedAt: null,
    });
    userRepo.update
      .mockResolvedValueOnce({
        id: "u1",
        emailVerifiedAt: new Date(),
        avatar: null,
      })
      .mockResolvedValueOnce({
        id: "u1",
        emailVerifiedAt: new Date(),
        avatar: "https://example.com/pic.png",
      });
    oauthRepo.findByProvider.mockResolvedValue(null);
    oauthRepo.create.mockResolvedValue({ id: "a1" });

    await handleGoogleCallback({ code: "code", redirectUri: "redir", req: null });

    expect(userRepo.update).toHaveBeenCalledWith("u1", {
      emailVerifiedAt: expect.any(Date),
    });
    expect(userRepo.update).toHaveBeenCalledWith("u1", {
      avatar: "https://example.com/pic.png",
    });
    expect(oauthRepo.create).toHaveBeenCalledWith({
      userId: "u1",
      provider: "google",
      providerUserId: "google-sub-123",
    });
  });

  it("logs in via an existing linked account without creating a new account", async () => {
    oauthRepo.findByProvider.mockResolvedValue({ userId: "u1" });
    userRepo.findById.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      emailVerifiedAt: new Date(),
      deletedAt: null,
    });

    const result = await handleGoogleCallback({ code: "code", redirectUri: "redir", req: null });

    expect(oauthRepo.create).not.toHaveBeenCalled();
    expect(sessionSvc.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1" }),
    );
    expect(result.user.id).toBe("u1");
    expect(result.session.rawToken).toBe("raw-token");
  });

  it("rejects a soft-deleted user", async () => {
    oauthRepo.findByProvider.mockResolvedValue({ userId: "u1" });
    userRepo.findById.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      deletedAt: new Date(),
    });

    await expect(
      handleGoogleCallback({ code: "code", redirectUri: "redir", req: null }),
    ).rejects.toMatchObject({ status: 401, code: "ACCOUNT_DELETED" });
  });

  it("recovers from the account-link race when the unique constraint fires", async () => {
    oauthRepo.findByProvider
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ userId: "u2" });
    userRepo.findByEmail.mockResolvedValue({
      id: "u2",
      deletedAt: null,
      emailVerifiedAt: new Date(),
      avatar: "https://example.com/pic.png",
    });
    oauthRepo.create.mockRejectedValue({ code: "P2002" });
    userRepo.findById.mockResolvedValue({ id: "u2", deletedAt: null, emailVerifiedAt: new Date() });

    const result = await handleGoogleCallback({ code: "code", redirectUri: "redir", req: null });

    expect(sessionSvc.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u2" }),
    );
    expect(result.user.id).toBe("u2");
  });

  it("rejects an id_token signed by a different key", async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes("/token"))
        return tokenResponse(signJwt(makePayload({ email_verified: true }), otherPrivateKey));
      if (String(url).includes("/certs")) return certsResponse();
      throw new Error(`Unexpected URL: ${url}`);
    });
    oauthRepo.findByProvider.mockResolvedValue(null);

    await expect(
      handleGoogleCallback({ code: "code", redirectUri: "redir", req: null }),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_GOOGLE_TOKEN" });
  });

  it("rejects an expired id_token", async () => {
    const expired = signJwt(makePayload({ exp: Math.floor(Date.now() / 1000) - 100 }));
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes("/token")) return tokenResponse(expired);
      if (String(url).includes("/certs")) return certsResponse();
      throw new Error(`Unexpected URL: ${url}`);
    });
    oauthRepo.findByProvider.mockResolvedValue(null);

    await expect(
      handleGoogleCallback({ code: "code", redirectUri: "redir", req: null }),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_GOOGLE_TOKEN" });
  });

  it("rejects an unverified Google email", async () => {
    const unverified = signJwt(makePayload({ email_verified: false }));
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes("/token")) return tokenResponse(unverified);
      if (String(url).includes("/certs")) return certsResponse();
      throw new Error(`Unexpected URL: ${url}`);
    });
    oauthRepo.findByProvider.mockResolvedValue(null);

    await expect(
      handleGoogleCallback({ code: "code", redirectUri: "redir", req: null }),
    ).rejects.toMatchObject({ status: 400, code: "GOOGLE_EMAIL_NOT_VERIFIED" });
  });
});