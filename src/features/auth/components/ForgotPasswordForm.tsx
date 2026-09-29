import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, MailCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schemas/forgotPasswordSchema';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { AlertBanner } from '../../../components/ui/AlertBanner';

interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void;
  className?: string;
}

/**
 * Componente de Formulario de Recuperación de Contraseña (US-FE-003).
 * Maneja de forma defensiva los 4 estados de UI: idle, loading, success y error.
 * Incorpora accesibilidad (WCAG AA), validación en tiempo real y prevención de enumeración (OWASP).
 */
export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  className = '',
}) => {
  const { forgotPassword, isLoading: globalLoading } = useAuth();

  const [formState, setFormState] = useState<'idle' | 'success'>('idle');
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
    },
  });

  const isBusy = isSubmitting || globalLoading;

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (isBusy) return;

    setErrorMessage(null);

    try {
      await forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setFormState('success');
      if (onSuccess) {
        onSuccess(data.email);
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorMessage(
        errorObj.message ||
          'Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.'
      );
    }
  };

  const handleResetForm = () => {
    setFormState('idle');
    setErrorMessage(null);
    setSubmittedEmail('');
    reset();
  };

  // VISTA 1: Estado de Éxito (Success State)
  if (formState === 'success') {
    return (
      <div className={`w-full text-center space-y-5 animate-fadeIn ${className}`}>
        {/* Icono de confirmación visual */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm animate-scaleUp">
            <MailCheck className="w-8 h-8" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            ¡Instrucciones Enviadas!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Hemos enviado las instrucciones de recuperación a tu correo electrónico
            corporativo si este se encuentra registrado.
          </p>

          {/* Badge con el correo enviado */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {submittedEmail}
            </span>
          </div>
        </div>

        {/* Acciones tras el envío */}
        <div className="pt-4 space-y-3">
          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>

          <button
            type="button"
            onClick={handleResetForm}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            ¿No lo recibiste? Intentar con otro correo
          </button>
        </div>
      </div>
    );
  }

  // VISTA 2: Formulario activo (Idle, Loading, Error States)
  return (
    <div className={`w-full ${className}`}>
      {/* Banner de error amigable ante fallos de conexión o servidor */}
      {errorMessage && (
        <div className="mb-6 animate-fadeIn">
          <AlertBanner
            variant="error"
            title="Error de Recuperación"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="Formulario de recuperación de contraseña"
        className="space-y-5"
      >
        {/* Campo único: Email corporativo */}
        <Input
          label="Email Corporativo"
          id="forgot-email"
          type="email"
          placeholder="ej. usuario@tiboli.io"
          autoComplete="email"
          required
          disabled={isBusy}
          error={errors.email?.message}
          leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          {...register('email', {
            onChange: () => {
              if (errorMessage) setErrorMessage(null);
            },
          })}
        />

        {/* Botón principal: "Send Reset Link" */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full text-base font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            isLoading={isBusy}
            loadingText="Enviando enlace..."
            disabled={isBusy}
          >
            Send Reset Link
          </Button>
        </div>

        {/* Enlace secundario: "Back to Sign In" */}
        <div className="pt-2 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};
