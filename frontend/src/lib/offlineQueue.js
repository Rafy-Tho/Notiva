import { useState, useEffect } from "react";

const OFFLINE_KEY = "api_offline_queue";

export function isOnline() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function getOfflineQueue() {
  if (typeof localStorage === "undefined") return [];
  try {
    const data = localStorage.getItem(OFFLINE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setOfflineQueue(queue) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(queue));
  } catch {
    // Storage quota exceeded or disabled
  }
}

export function addToOfflineQueue(mutations) {
  const queue = getOfflineQueue();
  const deduplicated = [...queue, mutations];
  setOfflineQueue(deduplicated);
}

export function clearOfflineQueue() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(OFFLINE_KEY);
  } catch {
    // Ignore
  }
}

export async function processOfflineQueue(fetchFn, invalidateQueries) {
  const queue = getOfflineQueue();
  if (queue.length === 0) return [];
  clearOfflineQueue();

  const results = [];
  for (const mutations of queue) {
    for (const mutation of mutations) {
      try {
        const result = await fetchFn(mutation);
        results.push({ success: true, mutation, result });
      } catch (error) {
        results.push({ success: false, mutation, error });
      }
    }
  }

  if (invalidateQueries) {
    invalidateQueries();
  }

  return results;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator === "undefined" || navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
