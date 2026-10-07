export const BASE_URL = (
  process.env.NEXT_PUBLIC_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1'
).replace(/\/$/, '');

const TOKEN_KEY = 'rumpi.token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {}

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  query?: Record<string, string | number>;
  json?: unknown;
  form?: FormData;
}

interface Envelope<T> {
  status: 'success' | 'fail' | 'error';
  message: string;
  data: T;
}

/** Gabungkan pesan utama dengan detail validasi per-field dari API. */
function describe(body: Envelope<unknown>): string {
  const details = Object.values((body.data ?? {}) as Record<string, string[]>).flat();
  return details.length ? `${body.message}: ${details.join(' ')}` : body.message;
}

export async function request<T = null>(
  path: string,
  { method = 'GET', query, json, form }: Options = {},
): Promise<{ message: string; data: T }> {
  const url = new URL(BASE_URL + path);
  Object.entries(query ?? {}).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(url, {
    method,
    headers,
    body: form ?? (json === undefined ? undefined : JSON.stringify(json)),
  });
  const body = (await response.json()) as Envelope<T>;
  if (body.status !== 'success') throw new ApiError(describe(body));
  return body;
}

/** Path aset dari API -> URL absolut HTTPS (hindari mixed content). */
export function assetUrl(path: string | null): string | null {
  if (!path) return null;
  const absolute = /^https?:\/\//.test(path)
    ? path
    : `${new URL(BASE_URL).origin}/${path.replace(/^\//, '')}`;
  return absolute.replace(/^http:\/\//, 'https://');
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());
