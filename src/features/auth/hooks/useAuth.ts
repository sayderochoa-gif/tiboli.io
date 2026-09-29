import { useContext } from 'react';
import { AuthContext } from '../context/authContextDefinition';
import type { AuthContextValue } from '../types/auth.types';

/**
 * Hook personalizado para consumir el contexto de autenticación de forma segura y tipada.
 * Lanza un error si se utiliza fuera del AuthProvider para asegurar una arquitectura limpia.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider.');
  }

  return context;
}
