import { create } from "zustand";

const BASE_URL = import.meta.env.VITE_BASE_API;
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token) => {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject : resolve(token),
  );
  refreshQueue = [];
};

export const useAuthStore = create((set, get) => ({
  // State
  accessToken: null,
  user: null,
  isLoading: false,
  error: null,
  // Setters
  setAccessToken: (token) => set({ accessToken: token }),
  // login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Invalid credentials");
      const data = await response.json();
      set({ accessToken: data.accessToken, user: data.user });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },
  // logout
  logout: async () => {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${get().accessToken}`,
      },
      credentials: "include",
    });
    set({ accessToken: null, user: null });
  },
  // Restore session on page reload
  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        set({ isLoading: false });
        return;
      }

      const { accessToken, user } = await res.json();
      set({ accessToken, user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  // ── Silent token refresh (used inside fetchWithAuth) ─
  refreshAccessToken: async () => {
    // If already refreshing, queue this call
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

      const { accessToken } = await res.json();
      set({ accessToken }); // Update store with new token
      processQueue(null, accessToken);
      return accessToken;
    } catch (err) {
      processQueue(err);
      set({ accessToken: null, user: null }); // Force logout state
      window.location.href = "/login";
      throw err;
    } finally {
      isRefreshing = false;
    }
  },
}));
