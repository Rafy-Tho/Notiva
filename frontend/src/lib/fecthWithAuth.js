import { useAuthStore } from "../store/authStore";

export async function fetchWithAuth(url, option = {}) {
  const accessToken = useAuthStore.getState().accessToken;
  const refreshAccessToken = useAuthStore.getState().refreshAccessToken;

  const makeRequest = (token) =>
    fetch(url, {
      ...option,
      credentials: "include",
      headers: buildHeaders(option, token),
    });

  let response = await makeRequest(accessToken);

  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      response = await makeRequest(newToken);
    } catch {
      throw new Error("Session expired");
    }
  }
}

function buildHeaders(options, token) {
  const headers = { ...options.headers };

  // Only set content-type for json let the browser handle formdata

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
