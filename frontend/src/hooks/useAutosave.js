// hooks/useAutosave.js

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import equal from "fast-deep-equal";

const EMPTY = Symbol("EMPTY");

export function useAutosave(value, save, { delay = 2000, resetKey } = {}) {
  const [status, setStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const mounted = useRef(true);

  const timer = useRef(null);
  const resetTimer = useRef(null);

  const latestValue = useRef(value);
  const lastSavedValue = useRef(value);

  const pendingValue = useRef(EMPTY);

  const inFlight = useRef(false);

  const ready = useRef(false);

  // Keep latest value
  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  // Reset when switching resource/note
  useEffect(() => {
    ready.current = false;

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
    };
  }, []);

  const executeSave = useCallback(
    async (valueToSave) => {
      // Prevent duplicate saves
      if (equal(valueToSave, lastSavedValue.current)) {
        return;
      }

      inFlight.current = true;

      if (mounted.current) {
        setStatus("saving");
      }

      try {
        await save(valueToSave);

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

      // Save latest queued change
      if (pendingValue.current !== EMPTY) {
        const nextValue = pendingValue.current;

        pendingValue.current = EMPTY;

        if (!equal(nextValue, lastSavedValue.current)) {
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
    [save],
  );

  const executeSaveRef = useRef(executeSave);

  useEffect(() => {
    executeSaveRef.current = executeSave;
  }, [executeSave]);

  // Autosave effect
  useEffect(() => {
    // Prevent first-render save
    if (!ready.current) {
      ready.current = true;

      lastSavedValue.current = value;

      return;
    }

    // Prevent duplicate save
    if (equal(value, lastSavedValue.current)) {
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      // Queue latest value while request active
      if (inFlight.current) {
        pendingValue.current = latestValue.current;

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

    const latest = latestValue.current;

    if (equal(latest, lastSavedValue.current)) {
      return;
    }

    if (inFlight.current) {
      pendingValue.current = latest;

      return;
    }

    await executeSaveRef.current(latest);
  }, []);

  // Best effort save on refresh/tab close
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
