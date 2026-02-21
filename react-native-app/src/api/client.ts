import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await AsyncStorage.getItem('token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.message ?? body?.error ?? `İstek başarısız (${res.status})`;

    if (res.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }

    throw new ApiError(message, res.status);
  }

  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  const raw = await res.text();
  if (!raw.trim()) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return JSON.parse(raw) as T;
  }

  return raw as T;
}
