import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuthStore } from "@/store/authStore";
import { getApiUrl } from "@/config/api";
import { wordCount } from "@/lib/sanitize";
import { useNoteCountsStore } from "@/store/useNoteCountsStore";
import { noteCountsDelta, notePurgeDelta } from "@/lib/noteCounts";
import {
  findCachedNote,
  insertNoteIntoLists,
  patchNoteInLists,
  removeNoteFromAllLists,
  restoreNotesLists,
  snapshotNotesLists,
} from "../lib/noteListCache";

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
        getApiUrl(`/notes?limit=20&${sp.toString()}`),
      );

      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }

      const { data } = await res.json();
      return { notes: data.notes, total: data.total, totalPages: data.totalPages, hasMore: data.hasMore, page: data.page };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useNotesInfinite(queryParams = {}) {
  const user = useAuthStore((s) => s.user);
  return useInfiniteQuery({
    queryKey: ["notes", "infinite", queryParams],
    queryFn: async ({ pageParam = 1 }) => {
      const sp = new URLSearchParams();
      sp.set("page", pageParam);
      sp.set("limit", "20");
      if (queryParams.search) sp.set("search", queryParams.search);
      if (queryParams.dateFilter) sp.set("dateFilter", queryParams.dateFilter);
      if (queryParams.notebookId) sp.set("notebookId", queryParams.notebookId);
      if (queryParams.tagId) sp.set("tagId", queryParams.tagId);
      if (queryParams.trashed) sp.set("trashed", "true");
      if (queryParams.isArchived) sp.set("isArchived", "true");
      if (queryParams.isFavorite) sp.set("isFavorite", "true");
      if (queryParams.isPinned) sp.set("isPinned", "true");
      if (queryParams.includeContent) sp.set("includeContent", "true");

      const res = await fetchWithAuth(`${getApiUrl(`/notes?${sp.toString()}`)}`);
      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
}

export function useNote(id) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const res = await fetchWithAuth(getApiUrl(`/notes/${id}`));
      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note) => {
      const res = await fetchWithAuth(getApiUrl("/notes"), {
        method: "POST",
        body: JSON.stringify(note),
      });
      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["note", data.id], data);
      insertNoteIntoLists(queryClient, data);
      applyCountsIfAny(noteCountsDelta(null, data));
    },
  });
}

export function useUpdateNote(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ signal, keepalive, ...note }) => {
      const res = await fetchWithAuth(`${getApiUrl(`/notes/${id}`)}`, {
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
    onMutate: async (variables = {}) => {
      await queryClient.cancelQueries({ queryKey: ["note", id] });
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNote = queryClient.getQueryData(["note", id]);
      const previousLists = snapshotNotesLists(queryClient);
      const previousCounts = snapshotCounts();
      const optimisticPatch = { ...variables };
      delete optimisticPatch.signal;
      delete optimisticPatch.keepalive;
      delete optimisticPatch.expectedUpdatedAt;
      if (Object.hasOwn(optimisticPatch, "content")) {
        optimisticPatch.wordCount = wordCount(optimisticPatch.content);
      }
      queryClient.setQueryData(["note", id], (old) =>
        old ? { ...old, ...optimisticPatch } : old,
      );
      patchNoteInLists(queryClient, id, optimisticPatch);
      if (previousNote) {
        applyCountsIfAny(
          noteCountsDelta(previousNote, { ...previousNote, ...optimisticPatch }),
        );
      }
      return { previousNote, previousLists, previousCounts };
    },
    onError: (err, variables, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(["note", id], context.previousNote);
      }
      restoreNotesLists(queryClient, context?.previousLists);
      restoreCounts(context?.previousCounts);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["note", id], data);
      patchNoteInLists(queryClient, id, data);
    },
  });
}

export function useTogglePin(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(getApiUrl(`/notes/${id}/pin`), {
        method: "POST",
      });
      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["note", id] });
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNote = queryClient.getQueryData(["note", id]);
      const previousLists = snapshotNotesLists(queryClient);
      const previousCounts = snapshotCounts();
      const nextValue = !previousNote?.isPinned;
      queryClient.setQueryData(["note", id], (old) =>
        old ? { ...old, isPinned: nextValue } : old,
      );
      patchNoteInLists(queryClient, id, { isPinned: nextValue });
      return { previousNote, previousLists, previousCounts };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["note", id], data);
      patchNoteInLists(queryClient, id, data);
    },
    onError: (err, _, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(["note", id], context.previousNote);
      }
      restoreNotesLists(queryClient, context?.previousLists);
      restoreCounts(context?.previousCounts);
    },
  });
}

export function useToggleFavorite(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(getApiUrl(`/notes/${id}/favorite`), {
        method: "POST",
      });
      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["note", id] });
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNote = queryClient.getQueryData(["note", id]);
      const previousLists = snapshotNotesLists(queryClient);
      const previousCounts = snapshotCounts();
      const nextValue = !previousNote?.isFavorite;
      queryClient.setQueryData(["note", id], (old) =>
        old ? { ...old, isFavorite: nextValue } : old,
      );
      patchNoteInLists(queryClient, id, { isFavorite: nextValue });
      if (previousNote) {
        applyCountsIfAny(
          noteCountsDelta(previousNote, { ...previousNote, isFavorite: nextValue }),
        );
      }
      return { previousNote, previousLists, previousCounts };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["note", id], data);
      patchNoteInLists(queryClient, id, data);
    },
    onError: (err, _, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(["note", id], context.previousNote);
      }
      restoreNotesLists(queryClient, context?.previousLists);
      restoreCounts(context?.previousCounts);
    },
  });
}

export function useToggleArchive(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(getApiUrl(`/notes/${id}/archive`), {
        method: "POST",
      });
      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["note", id] });
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNote = queryClient.getQueryData(["note", id]);
      const previousLists = snapshotNotesLists(queryClient);
      const previousCounts = snapshotCounts();
      const nextValue = !previousNote?.isArchived;
      queryClient.setQueryData(["note", id], (old) =>
        old ? { ...old, isArchived: nextValue } : old,
      );
      patchNoteInLists(queryClient, id, { isArchived: nextValue });
      if (previousNote) {
        applyCountsIfAny(
          noteCountsDelta(previousNote, { ...previousNote, isArchived: nextValue }),
        );
      }
      return { previousNote, previousLists, previousCounts };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["note", id], data);
      patchNoteInLists(queryClient, id, data);
    },
    onError: (err, _, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(["note", id], context.previousNote);
      }
      restoreNotesLists(queryClient, context?.previousLists);
      restoreCounts(context?.previousCounts);
    },
  });
}

export function useRemove(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(getApiUrl(`/notes/${id}`), {
        method: "DELETE",
      });
      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["note", id] });
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNote = queryClient.getQueryData(["note", id]);
      const previousLists = snapshotNotesLists(queryClient);
      const previousCounts = snapshotCounts();
      const deletedAt = new Date().toISOString();
      const nextNote = { ...previousNote, deletedAt };
      queryClient.setQueryData(["note", id], (old) =>
        old ? { ...old, deletedAt } : old,
      );
      patchNoteInLists(queryClient, id, { deletedAt });
      if (previousNote) {
        applyCountsIfAny(noteCountsDelta(previousNote, nextNote));
      }
      return { previousNote, previousLists, previousCounts };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["note", id], data);
      patchNoteInLists(queryClient, id, data);
    },
    onError: (err, _, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(["note", id], context.previousNote);
      }
      restoreNotesLists(queryClient, context?.previousLists);
      restoreCounts(context?.previousCounts);
    },
  });
}

export function usePurge(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(getApiUrl(`/notes/${id}/purge`), {
        method: "POST",
      });
      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["note", id] });
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNote =
        queryClient.getQueryData(["note", id]) ?? findCachedNote(queryClient, id);
      const previousLists = snapshotNotesLists(queryClient);
      const previousCounts = snapshotCounts();
      queryClient.removeQueries({ queryKey: ["note", id] });
      removeNoteFromAllLists(queryClient, id);
      if (previousNote) {
        applyCountsIfAny(notePurgeDelta(previousNote));
      }
      return { previousNote, previousLists, previousCounts };
    },
    onError: (err, _, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(["note", id], context.previousNote);
      }
      restoreNotesLists(queryClient, context?.previousLists);
      restoreCounts(context?.previousCounts);
    },
  });
}

export function useRestore(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(getApiUrl(`/notes/${id}/restore`), {
        method: "POST",
      });
      if (!res.ok) {
        await throwResponseError(res, "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["note", id] });
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNote =
        queryClient.getQueryData(["note", id]) ?? findCachedNote(queryClient, id);
      const previousLists = snapshotNotesLists(queryClient);
      const previousCounts = snapshotCounts();
      const nextNote = { ...previousNote, deletedAt: null };
      queryClient.setQueryData(["note", id], (old) =>
        old ? { ...old, deletedAt: null } : old,
      );
      patchNoteInLists(queryClient, id, { deletedAt: null });
      if (previousNote) {
        applyCountsIfAny(noteCountsDelta(previousNote, nextNote));
      }
      return { previousNote, previousLists, previousCounts };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["note", id], data);
      patchNoteInLists(queryClient, id, data);
    },
    onError: (err, _, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(["note", id], context.previousNote);
      }
      restoreNotesLists(queryClient, context?.previousLists);
      restoreCounts(context?.previousCounts);
    },
  });
}

function snapshotCounts() {
  return { ...useNoteCountsStore.getState() };
}

function restoreCounts(previous) {
  if (previous) useNoteCountsStore.setState(previous, true);
}

function applyCountsIfAny(deltas) {
  if (!deltas) return;
  if (
    deltas.all === 0 &&
    deltas.favorites === 0 &&
    deltas.archive === 0 &&
    deltas.trash === 0 &&
    Object.keys(deltas.notebooks).length === 0 &&
    Object.keys(deltas.tags).length === 0
  ) {
    return;
  }
  useNoteCountsStore.getState().applyCounts(deltas);
}