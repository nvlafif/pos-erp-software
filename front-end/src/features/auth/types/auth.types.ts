export type UserRole = 'OWNER' | 'GUDANG' | 'KASIR';

export interface AuthUser {
  id?: number;
  name?: string;
  email: string;
  role: UserRole | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthUser {
  token: string;
}