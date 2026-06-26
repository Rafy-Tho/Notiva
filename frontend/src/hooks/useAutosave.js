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
  const { debounceMs = 1000, enabled = true, maxRetries = 3, localKey } =
    options;

  const [status, setStatus] = useState("idle");
  const [lastSaved, setLastSaved] = useState(null);

  const dataRef = useRef(data);
  const saveFnRef = useRef(saveFn);
  const abortRef = useRef(null);
  const lastSavedDataRef = useRef(undefined);
  const retryCountRef = useRef(0);
  const enabledRef = useRef(enabled);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { saveFnRef.current = saveFn; }, [saveFn]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const debouncedData = useDebounce(data, debounceMs);

  const performSave = useCallback(
    async (dataToSave) => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (dataToSave === lastSavedDataRef.current) return;

        if (abortRef.current) abortRef.current.abort();
        const abortController = new AbortController();
        abortRef.current = abortController;

        if (attempt === 0) setStatus("saving");
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
            try { localStorage.removeItem(localKey); } catch { /* ignore */ }
          }
          return;
        } catch {
          if (abortController.signal.aborted) return;
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
            continue;
          }
          setStatus("error");
          retryCountRef.current = 0;
        }
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
        try { localStorage.removeItem(localKey); } catch { /* ignore */ }
      }
    } catch {
      if (abortController.signal.aborted) return;
      setStatus("error");
    }
  }, [localKey]);

  return { status, lastSaved, saveNow };
}
