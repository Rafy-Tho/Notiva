import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const EMPTY = Symbol("EMPTY");

export function useAutosave(value, save, delay = 3000) {
  const [status, setStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const timer = useRef(null);
  const resetTimer = useRef(null);

  const inFlight = useRef(false);
  const pending = useRef(EMPTY);

  const latestValue = useRef(value);

  const initial = useRef(true);
  const mounted = useRef(true);

  // Keep latest value without rerendering
  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;

      if (timer.current) {
        clearTimeout(timer.current);
      }

      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  // Main save executor
  const executeSave = useCallback(
    async (initialValue) => {
      let toSave = initialValue;

      while (true) {
        inFlight.current = true;

        if (mounted.current) {
          setStatus("saving");
        }

        try {
          await save(toSave);

          if (mounted.current) {
            setStatus("saved");
            setLastSavedAt(new Date());
          }
        } catch (error) {
          console.error(error);

          if (mounted.current) {
            setStatus("error");
            toast.error("Failed to save changes");
          }

          // STOP all queued saves after failure
          pending.current = EMPTY;
          break;
        } finally {
          inFlight.current = false;
        }

        // Process only the newest pending value
        if (pending.current !== EMPTY) {
          toSave = pending.current;
          pending.current = EMPTY;
        } else {
          break;
        }
      }

      // Reset "saved" badge
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }

      resetTimer.current = setTimeout(() => {
        if (!mounted.current) return;

        setStatus((s) => (s === "saved" ? "idle" : s));
      }, 2000);
    },
    [save],
  );

  // Keep latest executeSave reference
  const executeSaveRef = useRef(executeSave);

  useEffect(() => {
    executeSaveRef.current = executeSave;
  }, [executeSave]);

  // Debounced autosave
  useEffect(() => {
    // Skip initial render
    if (initial.current) {
      initial.current = false;
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      // If already saving,
      // keep only latest value queued
      if (inFlight.current) {
        pending.current = latestValue.current;
        return;
      }

      void executeSaveRef.current(latestValue.current);
    }, delay);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [value, delay]);

  // Stable flush
  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    if (inFlight.current) {
      pending.current = latestValue.current;
      return;
    }

    await executeSaveRef.current(latestValue.current);
  }, []);

  return {
    status,
    lastSavedAt,
    flush,
  };
}
