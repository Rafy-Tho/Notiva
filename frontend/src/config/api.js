// API Configuration
export const config = {
  baseURL: import.meta.env.VITE_BASE_API || '',
  timeout: 30000,
  retry: {
    maxRetries: 2,
    initialDelay: 1000,
    maxDelay: 10000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  },
};

// Get full URL for API endpoint
export function getApiUrl(path) {
  return `${config.baseURL}${path.startsWith('/') ? path : '/' + path}`;
}

// Exponential backoff delay
export function getRetryDelay(attempt) {
  const delay = config.retry.initialDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, config.retry.maxDelay);
}

// Check if status code is retryable
export function isRetryableStatus(status) {
  return config.retry.retryableStatuses.includes(status);
}
