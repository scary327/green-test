import type { Credentials } from '@/api/greenApi';

const KEY = 'green-api-credentials';

export function loadCredentials(): Credentials | null {
  const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as Credentials;
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: Credentials, remember: boolean) {
  clearCredentials();
  (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(credentials));
}

export function clearCredentials() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
