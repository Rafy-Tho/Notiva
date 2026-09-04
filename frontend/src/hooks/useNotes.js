import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fecthWithAuth";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_BASE_API;

async function throwResponseError(response, fallback) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // The response may not contain JSON, especially for infrastructure errors.
  }

  const error = new Error(body?.message ?? fallback);
  error.status = response.status;
  error.code = body?.code ?? null;
  throw error;
}

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
        await throwResponseError(res, "Something went wrong");
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
        await throwResponseError(res, "Something went wrong");
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
        await throwResponseError(res, "Something went wrong");
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
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ signal, keepalive, ...note }) => {
      const res = await fetchWithAuth(`${BASE_URL}/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(note),
        signal,
        keepalive,
      });
      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["note", id], data);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
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
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
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
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
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
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
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
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
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
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
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
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
