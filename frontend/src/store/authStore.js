import { create } from "zustand";
import { getApiUrl } from "@/config/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

async function fetchJson(url, opts = {}) {
  const headers = { ...opts.headers };
  if (!(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetchWithAuth(url, { ...opts, headers });
  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message ?? "Something went wrong");
  }
  const { data } = await res.json();
  return data;
}

let restorePromise = null;

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isRestoring: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson(getApiUrl("/auth/register"), {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      set({ isLoading: false, error: null });
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson(getApiUrl("/auth/login"), {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await fetchJson(getApiUrl("/auth/logout"), { method: "POST" });
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  restoreSession: async () => {
    // Deduplicate concurrent boot calls (e.g. StrictMode double-mount)
    // so /auth/verify is only fired once per page load.
    if (restorePromise) return restorePromise;
    restorePromise = (async () => {
      set({ isRestoring: true });
      try {
        const data = await fetchJson(getApiUrl("/auth/verify"));
        set({ user: data.user, isAuthenticated: true, isRestoring: false });
      } catch {
        set({ user: null, isAuthenticated: false, isRestoring: false });
      } finally {
        restorePromise = null;
      }
    })();
    return restorePromise;
  },

  delete: async () => {
    await fetchJson(getApiUrl("/me"), { method: "DELETE" });
    set({ user: null, isAuthenticated: false });
  },

  verifyEmailCode: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson(getApiUrl("/auth/verify-email"), {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  resendVerificationCode: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson(getApiUrl("/auth/resend-verification"), {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      set({ isLoading: false, error: null });
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  resetPasswordCode: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson(getApiUrl("/auth/reset-password-code"), {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      set({ isLoading: false, error: null });
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  confirmPasswordReset: async (email, code, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson(getApiUrl("/auth/confirm-password-reset"), {
        method: "POST",
        body: JSON.stringify({ email, code, password }),
      });
      set({ isLoading: false, error: null });
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
