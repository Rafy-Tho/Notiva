import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { getApiUrl } from "@/config/api";
export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (name) => {
      const res = await fetchWithAuth(getApiUrl("/me"), {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
  });
};

export const useUpdateAvatar = () => {
  return useMutation({
    mutationFn: async (avatar) => {
      const res = await fetchWithAuth(getApiUrl("/me/avatar"), {
        method: "POST",
        body: avatar,
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwords) => {
      const res = await fetchWithAuth(getApiUrl("/me/password"), {
        method: "POST",
        body: JSON.stringify(passwords),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(getApiUrl("/me"), {
        method: "DELETE",
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
    },
  });
};

export const useRemoveAvatar = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(getApiUrl("/me/avatar"), {
        method: "DELETE",
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Something went wrong");
      }
      const { data } = await res.json();
      return data;
    },
  });
};
