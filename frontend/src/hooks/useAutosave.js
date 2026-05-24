// hooks/useAutosave.js

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import equal from "fast-deep-equal";

const EMPTY = Symbol("EMPTY");

export function useAutosave(
  value,
  save,
  {
    delay = 2000,
    resetKey,

    // Prevent accidental empty overwrite
    allowEmpty = false,

    // Optional validation
    isValidValue,
  } = {},
) {
  const [status, setStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const mounted = useRef(true);

  const timer = useRef(null);
  const resetTimer = useRef(null);

  const latestValue = useRef(value);

  // The actual confirmed saved value
  const lastSavedValue = useRef(value);

  // Queue while request active
  const pendingValue = useRef(EMPTY);

  // Prevent concurrent saves
  const inFlight = useRef(false);

  // Skip first render
  const ready = useRef(false);

  // Prevent stale async saves
  const version = useRef(0);

  // Detect reset/loading state
  const resetting = useRef(false);

  // -----------------------------
  // Helpers
  // -----------------------------

  const clearAllTimers = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  };

  const isEmptyValue = useCallback((v) => {
    if (v == null) return true;

    if (typeof v === "string") {
      return v.trim() === "";
    }

    return false;
  }, []);

  const canSaveValue = useCallback(
    (v) => {
      if (!allowEmpty && isEmptyValue(v)) {
        return false;
      }

      if (isValidValue && !isValidValue(v)) {
        return false;
      }

      return true;
    },
    [allowEmpty, isEmptyValue, isValidValue],
  );

  // -----------------------------
  // Keep latest value
  // -----------------------------

  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  // -----------------------------
  // Reset when switching note
  // -----------------------------

  useEffect(() => {
    resetting.current = true;

    clearAllTimers();

    pendingValue.current = EMPTY;

    version.current += 1;

    lastSavedValue.current = value;
    latestValue.current = value;

    ready.current = false;

    // Wait one tick so editor can hydrate
    queueMicrotask(() => {
      resetting.current = false;
      ready.current = true;
    });
  }, [resetKey]);

  // -----------------------------
  // Cleanup
  // -----------------------------

  useEffect(() => {
    return () => {
      mounted.current = false;
      clearAllTimers();
    };
  }, []);

  // -----------------------------
  // Save executor
  // -----------------------------

  const executeSave = useCallback(
    async (valueToSave) => {
      // Ignore invalid values
      if (!canSaveValue(valueToSave)) {
        return;
      }

      // Ignore duplicates
      if (equal(valueToSave, lastSavedValue.current)) {
        return;
      }

      const currentVersion = version.current;

      inFlight.current = true;

      if (mounted.current) {
        setStatus("saving");
      }

      try {
        await save(valueToSave);

        // Ignore stale save result
        if (currentVersion !== version.current) {
          return;
        }

        lastSavedValue.current = valueToSave;

        if (mounted.current) {
          setStatus("saved");
          setLastSavedAt(new Date());
        }
      } catch (error) {
        console.error(error);

        if (mounted.current) {
          setStatus("error");

          toast.error("Failed to save changes", {
            id: "autosave-error",
          });
        }

        return;
      } finally {
        inFlight.current = false;
      }

      // Process queued change
      if (pendingValue.current !== EMPTY) {
        const nextValue = pendingValue.current;

        pendingValue.current = EMPTY;

        if (
          canSaveValue(nextValue) &&
          !equal(nextValue, lastSavedValue.current)
        ) {
          await executeSave(nextValue);
        }

        return;
      }

      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }

      resetTimer.current = setTimeout(() => {
        if (!mounted.current) return;

        setStatus((current) => (current === "saved" ? "idle" : current));
      }, 2000);
    },
    [save, canSaveValue],
  );

  const executeSaveRef = useRef(executeSave);

  useEffect(() => {
    executeSaveRef.current = executeSave;
  }, [executeSave]);

  // -----------------------------
  // Autosave effect
  // -----------------------------

  useEffect(() => {
    // Ignore during reset
    if (resetting.current) {
      return;
    }

    // First render baseline
    if (!ready.current) {
      ready.current = true;

      lastSavedValue.current = value;

      return;
    }

    // Ignore invalid values
    if (!canSaveValue(value)) {
      return;
    }

    // Ignore unchanged
    if (equal(value, lastSavedValue.current)) {
      return;
    }

    clearAllTimers();

    timer.current = setTimeout(() => {
      const latest = latestValue.current;

      // Ignore invalid latest value
      if (!canSaveValue(latest)) {
        return;
      }

      // Queue while request active
      if (inFlight.current) {
        pendingValue.current = latest;
        return;
      }

      void executeSaveRef.current(latest);
    }, delay);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [value, delay, canSaveValue]);

  // -----------------------------
  // Manual flush
  // -----------------------------

  const flush = useCallback(async () => {
    clearAllTimers();

    const latest = latestValue.current;

    if (!canSaveValue(latest)) {
      return;
    }

    if (equal(latest, lastSavedValue.current)) {
      return;
    }

    if (inFlight.current) {
      pendingValue.current = latest;
      return;
    }

    await executeSaveRef.current(latest);
  }, [canSaveValue]);

  // -----------------------------
  // Before unload
  // -----------------------------

  useEffect(() => {
    const handleBeforeUnload = () => {
      void flush();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flush]);

  return {
    status,
    lastSavedAt,
    flush,
  };
}
