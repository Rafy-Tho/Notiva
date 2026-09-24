import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithAuth, setOnUnauthorizedHandler } from "./fetchWithAuth";

function jsonResponse(body, status = 200) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
    clone() {
      return this;
    },
  };
}

function abortableFetch() {
  return vi.fn(
    (url, init) =>
      new Promise((resolve, reject) => {
        if (init.signal.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        init.signal.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      }),
  );
}

describe("fetchWithAuth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes a real AbortSignal to fetch when a caller signal is provided", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: { ok: true } }));
    vi.stubGlobal("fetch", fetchMock);

    const controller = new AbortController();
    const response = await fetchWithAuth("/api/v1/notes/1", {
      method: "PATCH",
      body: JSON.stringify({ title: "A" }),
      signal: controller.signal,
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const init = fetchMock.mock.calls[0][1];
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(init.signal.aborted).toBe(false);
  });

  it("propagates caller aborts and does not retry them", async () => {
    const fetchMock = abortableFetch();
    vi.stubGlobal("fetch", fetchMock);

    const controller = new AbortController();
    const promise = fetchWithAuth("/api/v1/notes/1", {
      method: "PATCH",
      signal: controller.signal,
    });

    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not tie keepalive requests to the caller signal", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: { ok: true } }));
    vi.stubGlobal("fetch", fetchMock);

    const controller = new AbortController();
    await fetchWithAuth("/api/v1/notes/1", {
      method: "PATCH",
      keepalive: true,
      signal: controller.signal,
    });

    const init = fetchMock.mock.calls[0][1];
    expect(init.keepalive).toBe(true);
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(init.signal).not.toBe(controller.signal);
  });

  it("retries retryable statuses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: "busy" }, 503))
      .mockResolvedValueOnce(jsonResponse({ data: { ok: true } }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithAuth("/api/v1/notes");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("invokes the onUnauthorized handler on 401 without retrying", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: "Session expired" }, 401));
    vi.stubGlobal("fetch", fetchMock);

    const onUnauthorized = vi.fn();
    setOnUnauthorizedHandler(onUnauthorized);

    await expect(fetchWithAuth("/api/v1/notes")).rejects.toThrow(
      "Session expired",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
