import { useAuthStore } from "../store/authStore";
import { config, isRetryableStatus } from "../config/api";

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

// Sleep utility for retry delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWithAuth(url, options = {}) {
  const {
    maxRetries = config.retry.maxRetries,
    signal: userSignal,
    ...fetchOptions
  } = options;

  // Keepalive requests must survive page unload, so they are intentionally
  // not tied to the caller's abort signal.
  const abortSignal = fetchOptions.keepalive === true ? null : userSignal;

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const onUserAbort = () => controller.abort();
    let timeoutId;

    if (abortSignal) {
      if (abortSignal.aborted) {
        controller.abort();
      } else {
        abortSignal.addEventListener("abort", onUserAbort);
      }
    }

    try {
      timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: buildHeaders(fetchOptions),
        credentials: "include",
        signal: controller.signal,
      });

      // A 401 (expired/invalid session) is a permanent condition: never
      // retry it, otherwise boot-time session checks hammer the server.
      if (response.status === 401) {
        useAuthStore.getState().setUser(null);
        const { message } = await parseError(response);
        lastError = new Error(message ?? "Session expired");
        break;
      }

      if (!response.ok && attempt < maxRetries && isRetryableStatus(response.status)) {
        lastError = new Error(`HTTP ${response.status}`);
        await sleep(config.retry.initialDelay * Math.pow(2, attempt));
        continue;
      }

      if (!response.ok) {
        const { message } = await parseError(response);
        throw new Error(message ?? `HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;

      // A caller-initiated abort is final; timeouts abort our internal
      // controller and stay retryable.
      if (error.name === "AbortError" && abortSignal?.aborted) {
        throw error;
      }

      if (attempt >= maxRetries) break;
      await sleep(config.retry.initialDelay * Math.pow(2, attempt));
    } finally {
      clearTimeout(timeoutId);
      abortSignal?.removeEventListener("abort", onUserAbort);
    }
  }

  throw lastError;
}

export default fetchWithAuth;
