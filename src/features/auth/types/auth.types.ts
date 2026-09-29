/**
 * Tipos de dominio y contratos para el módulo de Autenticación (US-FE-001, US-FE-002, US-FE-003).
 * Arquitectura limpia: Define las estructuras de datos sin dependencias de frameworks externos.
 */

export type SystemRole = 'coder' | 'administrador';

export type UserRole = SystemRole | string;

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED_ROLE'
  | 'ACCOUNT_INACTIVE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface AuthErrorPayload {
  code: AuthErrorCode;
  message: string;
  statusCode: number;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthErrorPayload | null;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<string>;
  logout: () => Promise<void> | void;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
}
