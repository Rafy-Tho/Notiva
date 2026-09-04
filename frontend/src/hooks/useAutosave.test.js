import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoSave } from "./useAutosave";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}

describe("useAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("keeps newer content dirty when an older request resolves late", async () => {
    const firstRequest = deferred();
    const save = vi
      .fn()
      .mockReturnValueOnce(firstRequest.promise)
      .mockResolvedValue({ updatedAt: "2026-09-04T00:00:01.000Z" });

    const { result, rerender } = renderHook(
      ({ data }) =>
        useAutoSave(data, save, {
          debounceMs: 10,
          maxRetries: 0,
          localKey: "note-draft",
        }),
      { initialProps: { data: { title: "A", content: "A" } } },
    );

    rerender({ data: { title: "B", content: "B" } });
    await act(async () => {
      vi.advanceTimersByTime(10);
      await Promise.resolve();
    });
    expect(save).toHaveBeenCalledTimes(1);

    rerender({ data: { title: "C", content: "C" } });
    expect(save.mock.calls[0][0].signal.aborted).toBe(false);
    await act(async () => {
      firstRequest.resolve({ updatedAt: "2026-09-04T00:00:00.500Z" });
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][0].title).toBe("C");
    expect(save.mock.calls[1][0].expectedUpdatedAt).toBe(
      "2026-09-04T00:00:00.500Z",
    );
    expect(result.current.isDirty).toBe(false);
  });

  it("does not retry a superseded snapshot", async () => {
    const firstRequest = deferred();
    const save = vi.fn().mockReturnValueOnce(firstRequest.promise).mockResolvedValue({
      updatedAt: "2026-09-04T00:00:01.000Z",
    });

    const { rerender } = renderHook(
      ({ data }) =>
        useAutoSave(data, save, {
          debounceMs: 10,
          maxRetries: 1,
          localKey: "note-draft",
        }),
      { initialProps: { data: { title: "A", content: "A" } } },
    );

    rerender({ data: { title: "B", content: "B" } });
    await act(async () => {
      vi.advanceTimersByTime(10);
      await Promise.resolve();
    });
    expect(save).toHaveBeenCalledTimes(1);

    await act(async () => {
      firstRequest.reject(Object.assign(new Error("temporary"), { status: 503 }));
      await Promise.resolve();
    });

    rerender({ data: { title: "C", content: "C" } });
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][0].title).toBe("C");
  });
});
