import { ErrorResponse } from '../types';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const normalizeApiBaseUrl = (url: string): string => {
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api/v1')) {
    clean = `${clean}/api/v1`;
  }
  return clean;
};

export const API_BASE_URL = normalizeApiBaseUrl(rawBaseUrl);
const TOKEN_KEY = 'raktsetu_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  status: number;
  errorResponse?: ErrorResponse;

  constructor(status: number, message: string, errorResponse?: ErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorResponse = errorResponse;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      removeAuthToken();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    if (!response.ok) {
      let errResponse: ErrorResponse | undefined;
      let errMsg = `Request failed with status ${response.status}`;
      try {
        errResponse = await response.json();
        if (errResponse?.message) {
          errMsg = errResponse.message;
        }
      } catch {
        // Response body wasn't JSON
      }
      throw new ApiError(response.status, errMsg, errResponse);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    if ((error as { name?: string })?.name === 'AbortError') {
      throw error;
    }
    // Network failure (server unreachable)
    throw new ApiError(0, 'Unable to connect to RaktSetu backend. Please ensure the server is running.');
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method: 'GET', ...options }),
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined, ...options }),
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined, ...options }),
  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined, ...options }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method: 'DELETE', ...options }),
};
