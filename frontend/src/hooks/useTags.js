import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fecthWithAuth";

const BASE_URL = import.meta.env.VITE_BASE_API;

// ── GET ──────────────────────────────────────────────────────────
export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/tags`);
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }) => {
      const res = await fetchWithAuth(`${BASE_URL}/tags`, {
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
      queryClient.invalidateQueries(["tags"]);
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, color }) => {
      const res = await fetchWithAuth(`${BASE_URL}/tags/${id}`, {
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
      queryClient.invalidateQueries(["tags"]);
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetchWithAuth(`${BASE_URL}/tags/${id}`, {
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
      queryClient.invalidateQueries(["tags"]);
    },
  });
}
