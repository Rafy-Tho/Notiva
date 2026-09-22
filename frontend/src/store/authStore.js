import { create } from "zustand";
import { getApiUrl } from "@/config/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

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
  const res = await fetchWithAuth(url, { ...opts, headers });
  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message ?? "Something went wrong");
  }
  const { data } = await res.json();
  return data;
}

const storedUser = getAuth();

export const useAuthStore = create((set, get) => ({
  user: storedUser,
  isLoading: false,
  error: null,
  isAuthenticated: isAuthenticated(),

  setUser: (user) => {
    saveAuth(user);
    set({ user });
  },

  register: async (name, email, password) => {
    set({ isLoading: false, error: null });
    try {
       const data = await fetchJson(getApiUrl("/auth/register"), {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      saveAuth(data.user);
      set({ user: data.user, isLoading: false, error: null });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ isLoading: false, error: null });
    try {
       const data = await fetchJson(getApiUrl("/auth/login"), {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveAuth(data.user);
      set({ user: data.user, isLoading: false, error: null });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
       await fetchJson(getApiUrl("/auth/logout"), { method: "POST" });
    } finally {
      saveAuth(null);
      set({ user: null });
    }
  },

  restoreSession: async () => {
    if (get().isAuthenticated && !!get().user)
      try {
         const data = await fetchJson(getApiUrl("/auth/verify"));
        saveAuth(data.user);
        set({ user: data.user });
      } catch {
        saveAuth(null);
        set({ user: null });
      }
  },

  delete: async () => {
     await fetchJson(getApiUrl("/me"), { method: "DELETE" });
    saveAuth(null);
    set({ user: null });
  },
}));
