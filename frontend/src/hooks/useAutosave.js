import equal from "fast-deep-equal";
import { useCallback, useEffect, useRef, useState } from "react";

export function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function isRetryableError(error) {
  if (!error || error.name === "AbortError") return false;
  if (error.status === 409 || (error.status >= 400 && error.status < 500)) {
    return false;
  }
  return !error.status || error.status === 429 || error.status >= 500;
}

function payloadForSnapshot(snapshot, signal, expectedUpdatedAt, keepalive) {
  const payload =
    snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
      ? { ...snapshot }
      : { content: snapshot };

  return {
    ...payload,
    signal,
    expectedUpdatedAt,
    keepalive,
  };
}

function readLocalDraft(localKey, data, serverUpdatedAt) {
  if (!localKey || typeof localStorage === "undefined") return null;

  try {
    const stored = JSON.parse(localStorage.getItem(localKey) || "null");
    const serverTime = serverUpdatedAt
      ? new Date(serverUpdatedAt).getTime()
      : 0;

    if (
      stored?.data !== undefined &&
      Number(stored.savedAt) > serverTime &&
      !equal(stored.data, data)
    ) {
      return stored;
    }

    if (stored) localStorage.removeItem(localKey);
  } catch {
    return null;
  }

  return null;
}

export function useAutoSave(data, saveFn, options = {}) {
  const {
    debounceMs = 1000,
    enabled = true,
    maxRetries = 3,
    localKey,
    serverUpdatedAt = null,
    onSaved,
  } = options;

  const [status, setStatus] = useState("idle");
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState(null);
  const [localDraft, setLocalDraft] = useState(() =>
    readLocalDraft(localKey, data, serverUpdatedAt),
  );

  const dataRef = useRef(data);
  const observedDataRef = useRef(data);
  const saveFnRef = useRef(saveFn);
  const onSavedRef = useRef(onSaved);
  const enabledRef = useRef(enabled);
  const mountedRef = useRef(true);
  const isDirtyRef = useRef(false);
  const abortRef = useRef(null);
  const inFlightRef = useRef(null);
  const queuedSaveRef = useRef(null);
  const retryResolveRef = useRef(null);
  const saveSnapshotRef = useRef(null);
  const retryTimerRef = useRef(null);
  const revisionRef = useRef(0);
  const retryAttemptRef = useRef(0);
  const lastSavedDataRef = useRef(data);
  const expectedUpdatedAtRef = useRef(serverUpdatedAt);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (retryResolveRef.current) {
      retryResolveRef.current(false);
      retryResolveRef.current = null;
    }
  }, []);

  const writeLocalDraft = useCallback(
    (snapshot) => {
      if (!localKey) return;

      try {
        localStorage.setItem(
          localKey,
          JSON.stringify({
            data: snapshot,
            savedAt: Date.now(),
            serverUpdatedAt: expectedUpdatedAtRef.current,
          }),
        );
      } catch {
        // Local persistence is best effort.
      }
    },
    [localKey],
  );

  const removeLocalDraft = useCallback(() => {
    if (!localKey) return;

    try {
      localStorage.removeItem(localKey);
    } catch {
      // Local persistence is best effort.
    }
    setLocalDraft(null);
  }, [localKey]);

  const saveSnapshot = useCallback(
    (snapshot, revision, attempt = 0, requestOptions = {}, force = false) => {
      if (!enabledRef.current || !mountedRef.current) {
        return Promise.resolve(false);
      }
      if (revision !== revisionRef.current) return Promise.resolve(false);

      const currentRequest = inFlightRef.current;
      if (currentRequest) {
        const changedRequest =
          revision !== currentRequest.revision ||
          !equal(snapshot, currentRequest.snapshot);

        queuedSaveRef.current = {
          snapshot,
          revision,
          requestOptions,
          force: force || changedRequest,
        };
        return currentRequest.promise;
      }

      if (!force && equal(snapshot, lastSavedDataRef.current)) {
        return Promise.resolve(true);
      }

      clearRetryTimer();

      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("saving");
      setError(null);

      const operation = (async () => {
        let operationResult = false;
        let nextJob = null;

        try {
          const result = await Promise.resolve().then(() =>
            saveFnRef.current(
              payloadForSnapshot(
                snapshot,
                controller.signal,
                expectedUpdatedAtRef.current,
                requestOptions.keepalive,
              ),
            ),
          );

          // A successful older request still advances the server version.
          if (result?.updatedAt) {
            expectedUpdatedAtRef.current = result.updatedAt;
          }
          onSavedRef.current?.(result);

          const isCurrent =
            !controller.signal.aborted &&
            revision === revisionRef.current &&
            equal(snapshot, dataRef.current);

          if (isCurrent) {
            lastSavedDataRef.current = snapshot;
            isDirtyRef.current = false;
            setIsDirty(false);
            setLastSaved(new Date());
            setStatus("saved");
            setError(null);
            retryAttemptRef.current = 0;
            removeLocalDraft();
            operationResult = true;
          } else {
            setStatus("saving");
            if (revision !== revisionRef.current && !queuedSaveRef.current) {
              queuedSaveRef.current = {
                snapshot: dataRef.current,
                revision: revisionRef.current,
                requestOptions: {},
                force: true,
              };
            }
          }
        } catch (saveError) {
          const superseded =
            controller.signal.aborted || !mountedRef.current;

          if (!superseded && isRetryableError(saveError) && attempt < maxRetries) {
            const nextAttempt = attempt + 1;
            retryAttemptRef.current = nextAttempt;

            // A retry is not an in-flight request. This lets a newer draft
            // replace it and cancel the timer without creating a stale retry.
            if (inFlightRef.current?.controller === controller) {
              inFlightRef.current = null;
            }

            operationResult = await new Promise((resolve) => {
              retryResolveRef.current = resolve;
              retryTimerRef.current = setTimeout(() => {
                retryTimerRef.current = null;
                retryResolveRef.current = null;
                resolve(
                  saveSnapshotRef.current?.(
                    snapshot,
                    revision,
                    nextAttempt,
                    requestOptions,
                    force,
                  ) ?? false,
                );
              }, 2000 * nextAttempt);
            });
          } else if (!superseded) {
            queuedSaveRef.current = null;
            setError(saveError);
            setStatus(saveError.status === 409 ? "conflict" : "error");
            retryAttemptRef.current = 0;
          }
        } finally {
          if (inFlightRef.current?.controller === controller) {
            inFlightRef.current = null;
            nextJob = queuedSaveRef.current;
            queuedSaveRef.current = null;
          }
        }

        if (nextJob && mountedRef.current && enabledRef.current) {
          return saveSnapshotRef.current?.(
            nextJob.snapshot,
            nextJob.revision,
            0,
            nextJob.requestOptions,
            nextJob.force,
          ) ?? false;
        }

        return operationResult;
      })();

      inFlightRef.current = { controller, revision, snapshot, promise: operation };
      return operation;
    },
    [clearRetryTimer, maxRetries, removeLocalDraft],
  );

  useEffect(() => {
    saveSnapshotRef.current = saveSnapshot;
  }, [saveSnapshot]);

  useEffect(() => {
    if (equal(data, observedDataRef.current)) return;

    observedDataRef.current = data;
    dataRef.current = data;
    revisionRef.current += 1;
    clearRetryTimer();
    retryAttemptRef.current = 0;

    const dirty = !equal(data, lastSavedDataRef.current);
    isDirtyRef.current = dirty;
    setIsDirty(dirty);

    if (dirty) {
      setError(null);
      setStatus("idle");
      writeLocalDraft(data);
    } else {
      removeLocalDraft();
    }
  }, [clearRetryTimer, data, removeLocalDraft, writeLocalDraft]);

  const debouncedData = useDebounce(data, debounceMs);

  useEffect(() => {
    if (!enabledRef.current || !isDirtyRef.current) return;
    if (!equal(debouncedData, dataRef.current)) return;

    void saveSnapshot(debouncedData, revisionRef.current);
  }, [debouncedData, saveSnapshot]);

  const flush = useCallback(
    (requestOptions = {}) => {
      if (!enabledRef.current || !isDirtyRef.current) return Promise.resolve(true);

      clearRetryTimer();
      const revision = revisionRef.current;
      return saveSnapshot(dataRef.current, revision, 0, requestOptions);
    },
    [clearRetryTimer, saveSnapshot],
  );

  const setServerUpdatedAt = useCallback((value) => {
    expectedUpdatedAtRef.current = value;
  }, []);

  const saveNow = useCallback(() => flush(), [flush]);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden" && isDirtyRef.current) {
        void flush({ keepalive: true });
      }
    };

    const flushOnPageHide = () => {
      if (isDirtyRef.current) void flush({ keepalive: true });
    };

    document.addEventListener("visibilitychange", flushWhenHidden);
    window.addEventListener("pagehide", flushOnPageHide);

    return () => {
      document.removeEventListener("visibilitychange", flushWhenHidden);
      window.removeEventListener("pagehide", flushOnPageHide);
    };
  }, [flush]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearRetryTimer();
      abortRef.current?.abort();
    };
  }, [clearRetryTimer]);

  const restoreLocalDraft = useCallback(() => {
    if (!localDraft) return null;
    const restored = localDraft.data;
    removeLocalDraft();
    return restored;
  }, [localDraft, removeLocalDraft]);

  return {
    status,
    error,
    lastSaved,
    isDirty,
    localDraft,
    restoreLocalDraft,
    discardLocalDraft: removeLocalDraft,
    setServerUpdatedAt,
    saveNow,
    flush,
  };
}
