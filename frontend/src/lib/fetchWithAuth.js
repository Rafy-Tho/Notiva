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
  const { maxRetries = config.retry.maxRetries, signal: userSignal, ...fetchOptions } = options;
  
  const abortController = new AbortController();
  const signal = userSignal || abortController.signal;
  const combinedSignal = userSignal
    ? {
        aborted: userSignal.aborted || abortController.aborted,
        addEventListener(event, handler) {
          userSignal.addEventListener(event, handler);
          abortController.addEventListener(event, handler);
        },
        removeEventListener(event, handler) {
          userSignal.removeEventListener(event, handler);
          abortController.removeEventListener(event, handler);
        },
        throwIfAborted() {
          if (userSignal.aborted) userSignal.throwIfAborted();
          if (abortController.aborted) abortController.throwIfAborted();
        },
      }
    : abortController.signal;

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: buildHeaders(fetchOptions),
        credentials: "include",
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        useAuthStore.getState().setUser(null);
        const { message } = await parseError(response);
        throw new Error(message ?? "Session expired");
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
      if (error.name === "AbortError" && (signal.aborted || (userSignal && userSignal.aborted))) {
        throw error;
      }
      if (attempt >= maxRetries) break;
      await sleep(config.retry.initialDelay * Math.pow(2, attempt));
    }
  }

  throw lastError;
}

export default fetchWithAuth;
