import { useAuthStore } from "../store/authStore";
const REFRESHABLE_CODES = ["TOKEN_EXPIRED", "NO_TOKEN"];

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

async function parseError(response) {
  try {
    const data = await response.clone().json();
    return { code: data.code ?? null, message: data.message ?? null };
  } catch {
    return { code: null, message: null };
  }
}

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
    const { code } = await parseError(response);
    if (REFRESHABLE_CODES.includes(code)) {
      try {
        const newToken = await refreshAccessToken();
        response = await makeRequest(newToken);
      } catch {
        throw new Error("Session expired");
      }
    }
  }
  return response;
}
