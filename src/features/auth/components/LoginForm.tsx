import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import { Input } from '../../../components/ui/Input';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { Button } from '../../../components/ui/Button';
import { AlertBanner } from '../../../components/ui/AlertBanner';

interface LoginFormProps {
  onSuccess?: (redirectPath: string) => void;
  className?: string;
}

/**
 * Componente principal de Login (US-FE-001).
 * Implementa control de formulario mediante React Hook Form + Zod,
 * retroalimentación accesible e inmediata, prevención de múltiples envíos,
 * y soporte para redirecciones basadas en roles ('coder' y 'administrador').
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, className = '' }) => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  // Flag unificado para deshabilitar interacciones y prevenir doble submit
  const isBusy = isLoading || isSubmitting;

  const onSubmit = async (data: LoginFormData) => {
    if (isBusy) return;

    try {
      // Intento de autenticación delegando en la capa de servicios desacoplada
      const redirectPath = await login(data);

      if (onSuccess) {
        onSuccess(redirectPath);
      } else {
        // Redirección inmediata según el rol asignado
        navigate(redirectPath, { replace: true });
      }
    } catch {
      // El error de autenticación ya queda registrado y tipado en el AuthContext
      // No se ejecuta la redirección si el rol es no autorizado (403) o credenciales inválidas (401)
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Banner de error para códigos 401 (Credenciales inválidas) y 403 (Rol no autorizado) */}
      {authError && (
        <div className="mb-6 animate-fadeIn">
          <AlertBanner
            variant="error"
            title={
              authError.statusCode === 403
                ? 'Acceso Denegado (403)'
                : 'Fallo de Autenticación'
            }
            message={authError.message}
            onClose={clearError}
            action={
              authError.statusCode === 403 ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 mt-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Requiere permisos de 'coder' o 'administrador'.</span>
                </div>
              ) : undefined
            }
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="Formulario de inicio de sesión corporativo"
        className="space-y-5"
      >
        {/* Campo 1: Email / Usuario corporativo */}
        <Input
          label="Email / Usuario corporativo"
          id="login-identifier"
          type="text"
          placeholder="ej. coder@tiboli.io"
          autoComplete="username"
          required
          disabled={isBusy}
          error={errors.identifier?.message}
          leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          {...register('identifier', {
            onChange: () => {
              if (authError) clearError();
            },
          })}
        />

        {/* Campo 2: Contraseña con toggle de visibilidad accesible */}
        <PasswordInput
          label="Contraseña"
          id="login-password"
          placeholder="••••••••••••"
          autoComplete="current-password"
          required
          disabled={isBusy}
          error={errors.password?.message}
          {...register('password', {
            onChange: () => {
              if (authError) clearError();
            },
          })}
        />

        {/* Enlace accesible de Recuperación de Contraseña (US-FE-003) */}
        <div className="flex items-center justify-end -mt-2">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
            aria-label="Forgot Password?"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Botón principal de acción: "Sign In" con spinner y prevención de multi-submit */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full text-base font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            isLoading={isBusy}
            loadingText="Iniciando sesión..."
            disabled={isBusy}
          >
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
};
