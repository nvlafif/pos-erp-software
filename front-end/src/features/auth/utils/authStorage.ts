import type { AuthUser, UserRole } from '../types/auth.types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function setAuthSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getNormalizedRole(): UserRole | null {
  const user = getStoredUser();
  if (!user?.role) return null;
  const cleaned = String(user.role).replace(/^ROLE_/i, '').toUpperCase();
  if (cleaned === 'OWNER' || cleaned === 'GUDANG' || cleaned === 'KASIR') {
    return cleaned;
  }
  return null;
}

export function getDefaultRouteByRole(role: UserRole | null): string {
  switch (role) {
    case 'OWNER':
      return '/dashboard';
    case 'KASIR':
      return '/pos';
    case 'GUDANG':
      return '/inventory';
    default:
      return '/login';
  }
}