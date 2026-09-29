import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { getRedirectPathByRole } from '../features/auth/services/authService';
import type { SystemRole } from '../features/auth/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: SystemRole[];
}

/**
 * Componente Guardián de Rutas (Route Guard) (US-FE-002).
 * Protege contra accesos directos por URL y navegación hacia atrás ("Back")
 * a usuarios no autenticados o con rol no autorizado, utilizando reemplazo de historial.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Prevención de restauración de sesión desde la memoria caché del navegador (BFCache)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && (!isAuthenticated || !user)) {
        window.location.replace('/login');
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Redirigir a login si no hay sesión activa
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Si la ruta exige roles específicos y el usuario no lo posee, redirigir a su ruta legítima
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role as SystemRole);
    if (!hasRole) {
      const authorizedRoute = getRedirectPathByRole(user.role);
      return <Navigate to={authorizedRoute} replace />;
    }
  }

  return <>{children}</>;
};
