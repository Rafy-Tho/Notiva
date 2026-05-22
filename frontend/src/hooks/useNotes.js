import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fecthWithAuth";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_BASE_API;

// ── GET ──────────────────────────────────────────────────────────
export function useNotes() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/notes`);
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    enabled: !!token,
  });
}

export function useNote(id) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/notes/${id}`);
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    enabled: !!token,
  });
}
