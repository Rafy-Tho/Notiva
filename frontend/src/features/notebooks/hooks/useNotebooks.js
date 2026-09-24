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
    onMutate: async ({ name, color }) => {
      await queryClient.cancelQueries({ queryKey: ["notebooks"] });
      const previousList = queryClient.getQueryData(["notebooks"]);
      if (Array.isArray(previousList)) {
        const tempId = `temp-${crypto.randomUUID()}`;
        const now = new Date().toISOString();
        queryClient.setQueryData(["notebooks"], (old) =>
          insertNotebookByName(old, {
            id: tempId,
            name,
            color,
            deletedAt: null,
            createdAt: now,
            updatedAt: now,
          }),
        );
        return { previousList, tempId };
      }
      return { previousList };
    },
    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["notebooks"], context.previousList);
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(["notebooks"], (old) => {
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notebooks"] });
      const previousList = queryClient.getQueryData(["notebooks"]);
      if (Array.isArray(previousList)) {
        queryClient.setQueryData(["notebooks"], (old) =>
          old.filter((x) => x.id !== id),
        );
        return { previousList };
      }
      return { previousList };
    },
    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["notebooks"], context.previousList);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["notebooks"], (old) =>
        Array.isArray(old) ? old.filter((x) => x.id !== data.id) : old,
      );
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
    onMutate: async ({ id, name, color }) => {
      await queryClient.cancelQueries({ queryKey: ["notebooks"] });
      const previousList = queryClient.getQueryData(["notebooks"]);
      if (Array.isArray(previousList)) {
        queryClient.setQueryData(["notebooks"], (old) =>
          old.map((x) => (x.id === id ? { ...x, name, color } : x)),
        );
        return { previousList };
      }
      return { previousList };
    },
    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["notebooks"], context.previousList);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["notebooks"], (old) => {
        if (!Array.isArray(old)) return old;
        return old
          .map((x) => (x.id === data.id ? data : x))
          .sort((a, b) => a.name.localeCompare(b.name));
      });
    },
  });
}

function insertNotebookByName(list, item) {
  const idx = list.findIndex((x) => x.name.localeCompare(item.name) > 0);
  if (idx === -1) return [...list, item];
  return [...list.slice(0, idx), item, ...list.slice(idx)];
}
