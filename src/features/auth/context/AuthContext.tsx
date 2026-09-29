import React, { useCallback, useState } from 'react';
import { sessionStorageService } from '../../../services/storage/sessionStorage';
import {
  AuthServiceError,
  forgotPasswordService,
  getRedirectPathByRole,
  loginService,
  logoutService,
} from '../services/authService';
import type {
  AuthContextValue,
  AuthErrorPayload,
  AuthUser,
  ForgotPasswordResponse,
  LoginCredentials,
} from '../types/auth.types';
import { AuthContext } from './authContextDefinition';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Inicialización directa y perezosa (lazy) desde sessionStorage para evitar renders en cascada
  const [user, setUser] = useState<AuthUser | null>(() => {
    return sessionStorageService.getSession()?.user ?? null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return sessionStorageService.getSession()?.token ?? null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<AuthErrorPayload | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Ejecuta el inicio de sesión contra el servicio de autenticación (US-FE-001).
   * Retorna la ruta a la que debe redirigirse el usuario según su rol de negocio.
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loginService(credentials);

        // Guardado seguro en sessionStorage
        sessionStorageService.saveSession(response.token, response.user);

        // Actualización de estado en memoria
        setUser(response.user);
        setToken(response.token);
        setError(null);

        // Resolución de la ruta de redirección según el rol verificado
        const redirectPath = getRedirectPathByRole(response.user.role);
        return redirectPath;
      } catch (err: unknown) {
        if (err instanceof AuthServiceError) {
          const payload = err.toPayload();
          setError(payload);
          throw err;
        }

        const fallbackError: AuthErrorPayload = {
          code: 'UNKNOWN_ERROR',
          message: 'Ocurrió un error inesperado al iniciar sesión. Inténtalo de nuevo.',
          statusCode: 500,
        };
        setError(fallbackError);
        throw fallbackError;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Cierre de sesión seguro y purga completa de estado y almacenamiento (US-FE-002).
   */
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (e) {
      console.error('Error al notificar servicio de logout:', e);
    } finally {
      // Purga exhaustiva de almacenamiento y cookies
      sessionStorageService.clearSession();
      // Reseteo de estado en memoria a no autenticado
      setUser(null);
      setToken(null);
      setError(null);
    }
  }, []);

  /**
   * Procesa la solicitud de recuperación de contraseña (US-FE-003).
   */
  const forgotPassword = useCallback(async (email: string): Promise<ForgotPasswordResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await forgotPasswordService(email);
      return response;
    } catch (err: unknown) {
      if (err instanceof AuthServiceError) {
        const payload = err.toPayload();
        setError(payload);
        throw err;
      }

      const fallbackError: AuthErrorPayload = {
        code: 'NETWORK_ERROR',
        message: 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.',
        statusCode: 500,
      };
      setError(fallbackError);
      throw fallbackError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    error,
    login,
    logout,
    clearError,
    forgotPassword,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
