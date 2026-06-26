import { useState, useEffect, useRef, useCallback } from "react";

export function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useAutoSave(data, saveFn, options = {}) {
  const {
    debounceMs = 1000,
    enabled = true,
    maxRetries = 3,
    localKey,
  } = options;

  const [status, setStatus] = useState("idle");
  const [lastSaved, setLastSaved] = useState(null);

  const dataRef = useRef(data);
  const saveFnRef = useRef(saveFn);
  const abortRef = useRef(null);
  const lastSavedDataRef = useRef(undefined);
  const retryCountRef = useRef(0);
  const enabledRef = useRef(enabled);

  dataRef.current = data;
  saveFnRef.current = saveFn;
  enabledRef.current = enabled;

  const debouncedData = useDebounce(data, debounceMs);

  const performSave = useCallback(
    async (dataToSave, isRetry = false) => {
      if (dataToSave === lastSavedDataRef.current) return;

      if (abortRef.current) abortRef.current.abort();
      const abortController = new AbortController();
      abortRef.current = abortController;

      if (!isRetry) setStatus("saving");
      try {
        await saveFnRef.current({
          signal: abortController.signal,
          content: dataToSave,
        });
        if (abortController.signal.aborted) return;

        lastSavedDataRef.current = dataToSave;
        setLastSaved(new Date());
        setStatus("saved");
        retryCountRef.current = 0;

        if (localKey) {
          try {
            localStorage.removeItem(localKey);
          } catch {
            //
          }
        }
      } catch {
        if (abortController.signal.aborted) return;
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          await new Promise((r) => setTimeout(r, 2000 * retryCountRef.current));
          return performSave(dataToSave, true);
        }
        setStatus("error");
        retryCountRef.current = 0;
      }
    },
    [maxRetries, localKey],
  );

  useEffect(() => {
    if (!enabledRef.current) return;
    if (debouncedData === lastSavedDataRef.current) return;
    performSave(debouncedData);
  }, [debouncedData, performSave]);

  const saveNow = useCallback(async () => {
    if (!enabledRef.current) return;
    const currentData = dataRef.current;

    if (abortRef.current) abortRef.current.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    setStatus("saving");
    try {
      await saveFnRef.current({
        signal: abortController.signal,
        content: currentData,
      });
      if (abortController.signal.aborted) return;

      lastSavedDataRef.current = currentData;
      setLastSaved(new Date());
      setStatus("saved");
      retryCountRef.current = 0;

      if (localKey) {
        try {
          localStorage.removeItem(localKey);
        } catch {
          //
        }
      }
    } catch {
      if (abortController.signal.aborted) return;
      setStatus("error");
    }
  }, [localKey]);

  return { status, lastSaved, saveNow };
}
