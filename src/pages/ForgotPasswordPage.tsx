import React from 'react';
import { Navigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';
import { useAuth } from '../features/auth/hooks/useAuth';
import { getRedirectPathByRole } from '../features/auth/services/authService';

/**
 * Pantalla de Recuperación de Contraseña (US-FE-003).
 * Diseño centrado, responsive, accesible y alineado con el sistema de diseño corporativo.
 */
export const ForgotPasswordPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Si el usuario ya cuenta con sesión activa, redirigir a su dashboard correspondiente
  if (isAuthenticated && user) {
    return <Navigate to={getRedirectPathByRole(user.role)} replace />;
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header / Brand Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://moodle.riwi.io/pluginfile.php/1/theme_academi/logo/1790665662/Imagen1%20%281%29.png"
              alt="Riwi Logo"
              className="h-14 w-auto object-contain drop-shadow-md"
            />
          </div>
          <p className="text-sm text-slate-300 font-medium font-mono">
            {'<Be a coder, change your world/>'}
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 transition-all">
          <div className="mb-6 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <KeyRound className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recuperar Contraseña
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Ingresa tu correo corporativo y te enviaremos un enlace seguro para restablecer tu acceso.
              </p>
            </div>
          </div>

          {/* Formulario de Recuperación con todos los estados de UI */}
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
};
