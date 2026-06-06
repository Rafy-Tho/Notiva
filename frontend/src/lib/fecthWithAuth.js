function buildHeaders(options) {
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
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
  const response = await fetch(url, {
    ...option,
    headers: buildHeaders(option),
    credentials: "include",
  });

  if (response.status === 401) {
    const { message } = await parseError(response);
    throw new Error(message ?? "Session expired");
  }

  return response;
}
