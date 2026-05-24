import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fecthWithAuth";
const BASE_URL = import.meta.env.VITE_BASE_API;
export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (name) => {
      const res = await fetchWithAuth(`${BASE_URL}/me`, {
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
      const res = await fetchWithAuth(`${BASE_URL}/me/avatar`, {
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
      const res = await fetchWithAuth(`${BASE_URL}/me/password`, {
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

export const useRemoveAvatar = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`${BASE_URL}/me/avatar`, {
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
