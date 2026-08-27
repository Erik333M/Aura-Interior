import type { ApiError } from '@aura/types';

/**
 * The single place the app talks to the network. Components must never call
 * fetch directly — they go through the typed helpers in this folder, wrapped in
 * TanStack Query hooks.
 *
 * In dev, Vite proxies /api to the API server, so a relative base works and
 * there is no CORS round-trip.
 */
const BASE = import.meta.env['VITE_API_URL'] ?? '';

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiError).error?.code === 'string'
  );
}

export async function request<T>(pathname: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${pathname}`, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });
  } catch (cause) {
    // Network-level failure: no response at all.
    throw new ApiRequestError(0, 'NETWORK_ERROR', 'Could not reach the server.', undefined);
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* non-JSON error body — fall through to the generic message */
    }
    if (isApiError(body)) {
      throw new ApiRequestError(res.status, body.error.code, body.error.message, body.error.fields);
    }
    throw new ApiRequestError(res.status, 'HTTP_ERROR', `Request failed with ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Build a query string, dropping empty values and expanding arrays. */
export function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length > 0) sp.set(key, value.join(','));
    } else if (typeof value === 'boolean') {
      if (value) sp.set(key, 'true');
    } else {
      sp.set(key, String(value));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}
