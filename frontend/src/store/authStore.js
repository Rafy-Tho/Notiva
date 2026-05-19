// store/authStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const BASE_URL = import.meta.env.VITE_BASE_API;

// ── Refresh queue (module-level singleton) ──────────────────────
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(
    ({ resolve, reject }) => (error ? reject(error) : resolve(token)), // ← bug fix: was `reject` not `reject(error)`
  );
  refreshQueue = [];
};

// ── Session expired callback ─────────────────────────────────────
// Registered by the app so the store never touches window.location
let onSessionExpired = null;
export const registerSessionExpiredHandler = (fn) => {
  onSessionExpired = fn;
};

// ── Store ────────────────────────────────────────────────────────
export const useAuthStore = create(
  devtools(
    (set, get) => ({
      // State
      accessToken: null,
      user: null,
      isLoading: false,
      error: null,
      sessionRestored: false, // ← gate for fetchWithAuth
      sessionRestorePromise: null, // ← fetchWithAuth awaits this on page load

      // ── Login ────────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true, error: null }, false, "auth/login/pending");
        try {
          const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) {
            const { message } = await res.json();
            throw new Error(message ?? "Invalid credentials");
          }

          const { data } = await res.json();
          set(
            {
              accessToken: data.accessToken,
              user: data.user,
              isLoading: false,
              error: null,
            },
            false,
            "auth/login/fulfilled",
          );
        } catch (err) {
          set(
            { error: err.message, isLoading: false },
            false,
            "auth/login/rejected",
          );
          throw err;
        }
      },

      // ── Logout ───────────────────────────────────────────────
      logout: async () => {
        try {
          await fetch(`${BASE_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${get().accessToken}`,
            },
          });
        } finally {
          // Always clear state even if the request fails
          set({ accessToken: null, user: null }, false, "auth/logout");
        }
      },

      // ── Restore session on page reload ───────────────────────
      restoreSession: () => {
        // Return and store the promise so fetchWithAuth can await it
        const promise = (async () => {
          set({ isLoading: true }, false, "auth/restoreSession/pending");
          try {
            const res = await fetch(`${BASE_URL}/auth/refresh`, {
              method: "POST",
              credentials: "include",
            });

            if (!res.ok) {
              set(
                { isLoading: false, sessionRestored: true },
                false,
                "auth/restoreSession/skipped",
              );
              return;
            }

            const { data } = await res.json();
            set(
              {
                accessToken: data.accessToken,
                user: data.user,
                isLoading: false,
                sessionRestored: true,
              },
              false,
              "auth/restoreSession/fulfilled",
            );
          } catch {
            set(
              { isLoading: false, sessionRestored: true },
              false,
              "auth/restoreSession/rejected",
            );
          }
        })();

        set(
          { sessionRestorePromise: promise },
          false,
          "auth/restoreSession/init",
        );
        return promise;
      },

      // ── Silent token refresh (used inside fetchWithAuth) ─────
      refreshAccessToken: async () => {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          });
        }

        isRefreshing = true;

        try {
          const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (!res.ok) throw new Error("Session expired");

          const { data } = await res.json(); // ← bug fix: was `{ accessToken }`, your API returns `{ data }`
          set({ accessToken: data.accessToken }, false, "auth/tokenRefreshed");
          processQueue(null, data.accessToken);
          return data.accessToken;
        } catch (err) {
          processQueue(err);
          set({ accessToken: null, user: null }, false, "auth/sessionExpired");
          onSessionExpired?.(); // ← no more window.location here
          throw err;
        } finally {
          isRefreshing = false;
        }
      },
    }),
    { name: "AuthStore" },
  ),
);
