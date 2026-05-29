export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.wissegt.com/api/v1';

export function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return 'No se pudo completar la solicitud';
}

export async function apiRequest(endpoint, { token, headers, ...options } = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || payload?.msg || payload?.error || formatFieldErrors(payload) || `Error ${response.status}`);
  }

  return payload;
}

function formatFieldErrors(payload) {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') return null;
  const entries = Object.entries(payload);
  if (entries.length === 0) return null;
  return entries.map(([field, message]) => `${field}: ${message}`).join(', ');
}

async function fetchWithRetry(url, options) {
  const response = await fetch(url, options);
  if (response.status < 500 || options.method) return response;
  return fetch(url, options);
}

export function asList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
