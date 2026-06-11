import { create } from "zustand";
import { devtools } from "zustand/middleware";

const BASE_URL = import.meta.env.VITE_BASE_API;

async function fetchJson(url, opts = {}) {
  const headers = { ...opts.headers };
  if (!(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { ...opts, headers, credentials: "include" });
  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message ?? "Something went wrong");
  }
  const { data } = await res.json();
  return data;
}

export const useAuthStore = create(
  devtools(
    (set) => ({
      user: null,
      isLoading: true,
      error: null,

      setUser: (user) => set({ user }),

      register: async (name, email, password) => {
        set({ isLoading: true, error: null }, false, "auth/register/pending");
        try {
          const data = await fetchJson(`${BASE_URL}/auth/register`, {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
          });
          set(
            { user: data.user, isLoading: false, error: null },
            false,
            "auth/register/fulfilled",
          );
        } catch (err) {
          set(
            { error: err.message, isLoading: false },
            false,
            "auth/register/rejected",
          );
          throw err;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null }, false, "auth/login/pending");
        try {
          const data = await fetchJson(`${BASE_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          set(
            { user: data.user, isLoading: false, error: null },
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

      logout: async () => {
        try {
          await fetchJson(`${BASE_URL}/auth/logout`, { method: "POST" });
        } finally {
          set({ user: null }, false, "auth/logout");
        }
      },

      restoreSession: async () => {
        try {
          const data = await fetchJson(`${BASE_URL}/auth/verify`);
          set({ user: data.user }, false, "auth/verify/fulfilled");
        } catch {
          set({ user: null }, false, "auth/verify/rejected");
        } finally {
          set({ isLoading: false }, false, "auth/verify/done");
        }
      },

      delete: async () => {
        await fetchJson(`${BASE_URL}/me`, { method: "DELETE" });
        set({ user: null }, false, "auth/deleteAccount");
      },
    }),
    { name: "AuthStore" },
  ),
);
