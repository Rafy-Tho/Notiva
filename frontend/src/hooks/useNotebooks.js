import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fecthWithAuth";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_BASE_API;

// ── GET ──────────────────────────────────────────────────────────
export function useNotebooks() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["notebooks"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/notebooks`);
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
  });
}

export function useCreateNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }) => {
      const res = await fetchWithAuth(`${BASE_URL}/notebooks`, {
        method: "POST",
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notebooks"]);
    },
  });
}

export function useDeleteNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetchWithAuth(`${BASE_URL}/notebooks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notebooks"]);
    },
  });
}

export function useUpdateNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, color }) => {
      const res = await fetchWithAuth(`${BASE_URL}/notebooks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notebooks"]);
    },
  });
}
