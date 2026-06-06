// useAutoSave.js — drop-in auto-save hook for React
// Combines debounce + interval + visibilitychange for full coverage

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useDebounce
 * Returns a debounced version of `value` after `delay` ms of inactivity.
 */
export function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * useAutoSave
 *
 * @param {any}      data                  - The value to watch and save
 * @param {function} saveFn                - Async save function: (data, signal) => Promise<void>
 * @param {object}   options
 * @param {number}   options.debounceMs    - ms to wait after last change (default: 1000)
 * @param {number}   options.intervalMs    - ms between interval-saves (default: 0 = disabled)
 * @param {boolean}  options.saveOnBlur    - save when tab loses visibility (default: true)
 * @param {boolean}  options.enabled       - master switch (default: true)
 * @param {number}   options.maxRetries    - max retry attempts on error (default: 3)
 *
 * @returns {{ status, lastSaved, isDirty, saveNow }}
 *   status    — 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
 *   lastSaved — Date | null
 *   isDirty   — boolean
 *   saveNow   — () => void  (trigger a manual save)
 */
export function useAutoSave(data, saveFn, options = {}) {
  const {
    debounceMs = 1000,
    intervalMs = 0,
    saveOnBlur = true,
    enabled = true,
    maxRetries = 3,
  } = options;

  const [status, setStatus] = useState("idle");
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Refs so callbacks always see fresh values without re-creating effects
  const dataRef = useRef(data);
  const saveFnRef = useRef(saveFn);
  const isDirtyRef = useRef(false);
  const abortRef = useRef(null);
  const lastSavedDataRef = useRef(undefined); // tracks what was last successfully saved
  const retryCountRef = useRef(0);
  const enabledRef = useRef(enabled);

  // Keep refs in sync
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Save pending changes on unmount
  useEffect(() => {
    return () => {
      if (isDirtyRef.current && enabledRef.current) {
        saveFnRef
          .current(dataRef.current, new AbortController().signal)
          .catch(() => {});
      }
    };
  }, []);

  // Detect dirty state whenever data changes
  useEffect(() => {
    if (lastSavedDataRef.current === undefined) {
      // First render — treat as clean baseline
      lastSavedDataRef.current = data;
      return;
    }

    const dirty =
      JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current);
    isDirtyRef.current = dirty;
    setIsDirty(dirty);

    if (dirty) {
      retryCountRef.current = 0; // user made a new change — reset retry count
      setStatus("dirty");
    }
  }, [data]);

  // Core save executor
  const executeSave = useCallback(async () => {
    if (!isDirtyRef.current || !enabled) return;
    if (retryCountRef.current >= maxRetries) return; // stop retrying after max failures

    // Cancel any previous in-flight save
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("saving");

    try {
      await saveFnRef.current(dataRef.current, controller.signal);

      if (controller.signal.aborted) return; // a newer save superseded this one

      lastSavedDataRef.current = dataRef.current;
      isDirtyRef.current = false;
      retryCountRef.current = 0; // reset on success
      setIsDirty(false);
      setLastSaved(new Date());
      setStatus("saved");
    } catch (err) {
      if (err?.name === "AbortError") return;
      retryCountRef.current += 1; // increment on failure
      console.error(
        `[useAutoSave] Save failed (attempt ${retryCountRef.current}/${maxRetries}):`,
        err,
      );
      setStatus("error");
    }
  }, [enabled, maxRetries]);

  // ── 1. Debounce save ──────────────────────────────────────────────────────
  const debouncedData = useDebounce(data, debounceMs);

  useEffect(() => {
    if (!enabled) return;
    executeSave();
  }, [debouncedData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Interval save ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !intervalMs) return;

    const id = setInterval(() => {
      if (isDirtyRef.current) executeSave();
    }, intervalMs);

    return () => clearInterval(id);
  }, [enabled, intervalMs, executeSave]);

  // ── 3. Visibility-change (tab blur) save ──────────────────────────────────
  useEffect(() => {
    if (!enabled || !saveOnBlur) return;

    const handler = () => {
      if (document.visibilityState === "hidden" && isDirtyRef.current) {
        executeSave();
      }
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [enabled, saveOnBlur, executeSave]);

  return { status, lastSaved, isDirty, saveNow: executeSave };
}
