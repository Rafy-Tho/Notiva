import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuthStore } from "@/store/authStore";
import { getApiUrl } from "@/config/api";

// ── GET ──────────────────────────────────────────────────────────
export function useTags() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
       const res = await fetchWithAuth(getApiUrl("/tags"));
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }) => {
       const res = await fetchWithAuth(getApiUrl("/tags"), {
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
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, color }) => {
       const res = await fetchWithAuth(getApiUrl(`/tags/${id}`), {
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
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
       const res = await fetchWithAuth(getApiUrl(`/tags/${id}`), {
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
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
