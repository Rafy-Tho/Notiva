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
export function useAutoSave(data, saveFn, options = {}) {
  const {
    debounceMs = 1000,
    intervalMs = 0,
    saveOnBlur = true,
    enabled = true,
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

  // Keep refs in sync
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

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
    if (dirty) setStatus("dirty");
  }, [data]);

  // Core save executor
  const executeSave = useCallback(async () => {
    if (!isDirtyRef.current || !enabled) return;

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
      setIsDirty(false);
      setLastSaved(new Date());
      setStatus("saved");
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("[useAutoSave] Save failed:", err);
      setStatus("error");
    }
  }, [enabled]);

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
