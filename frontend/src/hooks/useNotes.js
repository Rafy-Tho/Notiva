import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useUpdateNote(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note) => {
      const res = await fetchWithAuth(`${BASE_URL}/notes/${id}`, {
        method: "PATCH",
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
      queryClient.invalidateQueries(["note", id]);
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
