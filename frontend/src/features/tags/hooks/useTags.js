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
    onMutate: async ({ name, color }) => {
      await queryClient.cancelQueries({ queryKey: ["tags"] });
      const previousList = queryClient.getQueryData(["tags"]);
      if (Array.isArray(previousList)) {
        const tempId = `temp-${crypto.randomUUID()}`;
        const now = new Date().toISOString();
        queryClient.setQueryData(["tags"], (old) => [
          ...old,
          {
            id: tempId,
            name,
            color,
            deletedAt: null,
            createdAt: now,
            updatedAt: now,
          },
        ]);
        return { previousList, tempId };
      }
      return { previousList };
    },
    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["tags"], context.previousList);
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(["tags"], (old) => {
        if (!Array.isArray(old)) return old;
        const idx = old.findIndex((x) => x.id === context?.tempId);
        if (idx === -1) return old;
        const copy = [...old];
        copy[idx] = data;
        return copy;
      });
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
    onMutate: async ({ id, name, color }) => {
      await queryClient.cancelQueries({ queryKey: ["tags"] });
      const previousList = queryClient.getQueryData(["tags"]);
      if (Array.isArray(previousList)) {
        queryClient.setQueryData(["tags"], (old) =>
          old.map((x) => (x.id === id ? { ...x, name, color } : x)),
        );
        return { previousList };
      }
      return { previousList };
    },
    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["tags"], context.previousList);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tags"], (old) =>
        Array.isArray(old) ? old.map((x) => (x.id === data.id ? data : x)) : old,
      );
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tags"] });
      const previousList = queryClient.getQueryData(["tags"]);
      if (Array.isArray(previousList)) {
        queryClient.setQueryData(["tags"], (old) =>
          old.filter((x) => x.id !== id),
        );
        return { previousList };
      }
      return { previousList };
    },
    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["tags"], context.previousList);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tags"], (old) =>
        Array.isArray(old) ? old.filter((x) => x.id !== data.id) : old,
      );
    },
  });
}
