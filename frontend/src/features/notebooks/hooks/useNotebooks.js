import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuthStore } from "@/store/authStore";
import { getApiUrl } from "@/config/api";

// ── GET ──────────────────────────────────────────────────────────
export function useNotebooks() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["notebooks"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetchWithAuth(getApiUrl("/notebooks"));
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
      const res = await fetchWithAuth(getApiUrl("/notebooks"), {
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
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
    },
  });
}

export function useDeleteNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetchWithAuth(getApiUrl(`/notebooks/${id}`), {
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
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
    },
  });
}

export function useUpdateNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, color }) => {
      const res = await fetchWithAuth(getApiUrl(`/notebooks/${id}`), {
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
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
    },
  });
}
