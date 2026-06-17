import { create } from "zustand";
import { fetchWithAuth } from "../lib/fecthWithAuth";

const BASE_URL = import.meta.env.VITE_BASE_API;

export const useNoteCountsStore = create((set) => ({
  all: 0,
  favorites: 0,
  archive: 0,
  trash: 0,
  notebooks: [],
  tags: [],
  loading: false,
  fetchCounts: async () => {
    set({ loading: true });
    try {
      const res = await fetchWithAuth(`${BASE_URL}/notes/counts`);
      if (!res.ok) return;
      const { data } = await res.json();
      set({ ...data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
