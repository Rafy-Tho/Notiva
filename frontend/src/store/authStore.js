import { create } from "zustand";
import { devtools } from "zustand/middleware";

const BASE_URL = import.meta.env.VITE_BASE_API;

function getAuth() {
  try {
    const stored = JSON.parse(localStorage.getItem("auth") || "null");
    return stored;
  } catch {
    return null;
  }
}

function isAuthenticated() {
  return localStorage.getItem("isAuth") === "true";
}

function saveAuth(user) {
  if (user) {
    localStorage.setItem("auth", JSON.stringify(user));
    localStorage.setItem("isAuth", "true");
  } else {
    localStorage.removeItem("auth");
    localStorage.removeItem("isAuth");
  }
}

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

const storedUser = getAuth();

export const useAuthStore = create(
  devtools(
    (set, get) => ({
      user: storedUser,
      isLoading: false,
      error: null,

      setUser: (user) => {
        saveAuth(user);
        set({ user });
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null }, false, "auth/register/pending");
        try {
          const data = await fetchJson(`${BASE_URL}/auth/register`, {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
          });
          saveAuth(data.user);
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
          saveAuth(data.user);
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
          saveAuth(null);
          set({ user: null }, false, "auth/logout");
        }
      },

      restoreSession: async () => {
        if (isAuthenticated() && !!get().user)
          try {
            const data = await fetchJson(`${BASE_URL}/auth/verify`);
            saveAuth(data.user);
            set({ user: data.user }, false, "auth/verify/fulfilled");
          } catch {
            saveAuth(null);
            set({ user: null }, false, "auth/verify/rejected");
          } finally {
            set({ isLoading: false }, false, "auth/verify/done");
          }
      },

      delete: async () => {
        await fetchJson(`${BASE_URL}/me`, { method: "DELETE" });
        saveAuth(null);
        set({ user: null }, false, "auth/deleteAccount");
      },
    }),
    { name: "AuthStore" },
  ),
);
