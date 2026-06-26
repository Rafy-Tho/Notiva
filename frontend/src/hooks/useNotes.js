import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fecthWithAuth";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_BASE_API;

// ── GET (paginated, with search/filter) ─────────────────────────
export function useNotes(params = {}) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["notes", params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params.search) sp.set("search", params.search);
      if (params.dateFilter) sp.set("dateFilter", params.dateFilter);
      if (params.notebookId) sp.set("notebookId", params.notebookId);
      if (params.tagId) sp.set("tagId", params.tagId);
      if (params.trashed) sp.set("trashed", "true");
      if (params.isArchived) sp.set("isArchived", "true");
      if (params.isFavorite) sp.set("isFavorite", "true");
      if (params.isPinned) sp.set("isPinned", "true");
      if (params.includeContent) sp.set("includeContent", "true");
      if (params.page) sp.set("page", params.page);

      const res = await fetchWithAuth(
        `${BASE_URL}/notes?limit=10&${sp.toString()}`,
      );

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }

      const { data } = await res.json();
      return { notes: data.notes, total: data.total, totalPages: data.totalPages, hasMore: data.hasMore, page: data.page };
    },
    enabled: !!user,
  });
}

export function useNotesInfinite(queryParams = {}) {
  const user = useAuthStore((s) => s.user);
  return useInfiniteQuery({
    queryKey: ["notes", "infinite", queryParams],
    queryFn: async ({ pageParam = 1 }) => {
      const sp = new URLSearchParams();
      sp.set("page", pageParam);
      sp.set("limit", "10");
      if (queryParams.search) sp.set("search", queryParams.search);
      if (queryParams.dateFilter) sp.set("dateFilter", queryParams.dateFilter);
      if (queryParams.notebookId) sp.set("notebookId", queryParams.notebookId);
      if (queryParams.tagId) sp.set("tagId", queryParams.tagId);
      if (queryParams.trashed) sp.set("trashed", "true");
      if (queryParams.isArchived) sp.set("isArchived", "true");
      if (queryParams.isFavorite) sp.set("isFavorite", "true");
      if (queryParams.isPinned) sp.set("isPinned", "true");
      if (queryParams.includeContent) sp.set("includeContent", "true");

      const res = await fetchWithAuth(`${BASE_URL}/notes?${sp.toString()}`);
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!user,
  });
}

export function useNote(id) {
  const user = useAuthStore((s) => s.user);
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
    enabled: !!user,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note) => {
      const res = await fetchWithAuth(`${BASE_URL}/notes`, {
        method: "POST",
        body: JSON.stringify(note),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"]);
    },
  });
}

export function useUpdateNote(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ signal, ...note }) => {
      // ✅ signal extracted here
      const res = await fetchWithAuth(`${BASE_URL}/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(note),
        signal,
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["note", id]);
    },
    // ✅ removed invalid `enabled`
  });
}

export function useTogglePin(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/notes/${id}/pin`, {
        method: "POST",
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["note", id]);
    },
  });
}

export function useToggleFavorite(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/notes/${id}/favorite`, {
        method: "POST",
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["note", id]);
    },
  });
}

export function useToggleArchive(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/notes/${id}/archive`, {
        method: "POST",
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["note", id]);
    },
  });
}

export function useRemove(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/notes/${id}`, {
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
      queryClient.invalidateQueries(["notes"]);
    },
  });
}

export function usePurge(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/notes/${id}/purge`, {
        method: "POST",
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"]);
    },
  });
}

export function useRestore(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/notes/${id}/restore`, {
        method: "POST",
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"]);
    },
  });
}
