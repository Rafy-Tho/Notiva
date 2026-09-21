import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: async (email) => {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_BASE_API}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );
      const { data } = await res.json();
      return data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ password, token }) => {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_BASE_API}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password, token }),
        },
      );
      const { data } = await res.json();
      return data;
    },
  });
};
