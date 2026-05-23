// hooks/useAutosave.js
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const EMPTY = Symbol("EMPTY");

export function useAutosave(value, save, { delay = 3000, resetKey } = {}) {
  const [status, setStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const timer = useRef(null);
  const resetTimer = useRef(null);

  const inFlight = useRef(false);
  const pending = useRef(EMPTY);

  const latestValue = useRef(value);

  const initial = useRef(true);
  const mounted = useRef(true);

  const lastSavedValue = useRef(null);

  const abortController = useRef(null);

  // Keep latest value
  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  // IMPORTANT:
  // Reset baseline when server data changes
  useEffect(() => {
    lastSavedValue.current = value;
  }, [resetKey]);

  // Cleanup
  useEffect(() => {
    return () => {
      mounted.current = false;

      if (timer.current) {
        clearTimeout(timer.current);
      }

      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }

      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const executeSave = useCallback(
    async (initialValue) => {
      let toSave = initialValue;

      while (true) {
        // Skip identical saves
        if (JSON.stringify(toSave) === JSON.stringify(lastSavedValue.current)) {
          break;
        }

        // Cancel previous request
        if (abortController.current) {
          abortController.current.abort();
        }

        abortController.current = new AbortController();

        inFlight.current = true;

        if (mounted.current) {
          setStatus("saving");
        }

        try {
          await save(toSave, abortController.current.signal);

          lastSavedValue.current = toSave;

          if (mounted.current) {
            setStatus("saved");
            setLastSavedAt(new Date());
          }
        } catch (error) {
          if (error?.name === "AbortError") {
            break;
          }

          console.error(error);

          if (mounted.current) {
            setStatus("error");

            toast.error("Failed to save changes", {
              id: "autosave-error",
            });
          }

          pending.current = EMPTY;

          break;
        } finally {
          inFlight.current = false;
        }

        if (pending.current !== EMPTY) {
          toSave = pending.current;
          pending.current = EMPTY;
        } else {
          break;
        }
      }

      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }

      resetTimer.current = setTimeout(() => {
        if (!mounted.current) return;

        setStatus((current) => (current === "saved" ? "idle" : current));
      }, 2000);
    },
    [save],
  );

  const executeSaveRef = useRef(executeSave);

  useEffect(() => {
    executeSaveRef.current = executeSave;
  }, [executeSave]);

  // Autosave
  useEffect(() => {
    // Skip initial mount
    if (initial.current) {
      initial.current = false;

      lastSavedValue.current = value;

      return;
    }

    // Skip unchanged values
    if (JSON.stringify(value) === JSON.stringify(lastSavedValue.current)) {
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
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

  // Manual flush
  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    if (
      JSON.stringify(latestValue.current) ===
      JSON.stringify(lastSavedValue.current)
    ) {
      return;
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
