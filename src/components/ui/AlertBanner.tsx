import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

export interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  action?: React.ReactNode;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = 'error',
  title,
  message,
  onClose,
  className = '',
  action,
}) => {
  const variantConfig = {
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />,
      closeBtn: 'text-rose-600 hover:bg-rose-100 focus:ring-rose-400',
      defaultTitle: 'Error de Autenticación',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />,
      closeBtn: 'text-amber-600 hover:bg-amber-100 focus:ring-amber-400',
      defaultTitle: 'Atención requerida',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" aria-hidden="true" />,
      closeBtn: 'text-blue-600 hover:bg-blue-100 focus:ring-blue-400',
      defaultTitle: 'Información',
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />,
      closeBtn: 'text-emerald-600 hover:bg-emerald-100 focus:ring-emerald-400',
      defaultTitle: 'Operación Exitosa',
    },
  }[variant];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        relative w-full rounded-xl border p-4 shadow-xs transition-all duration-200
        flex items-start gap-3.5 ${variantConfig.container} ${className}
      `}
    >
      <div className="mt-0.5">{variantConfig.icon}</div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold mb-0.5 tracking-tight">
            {title}
          </h4>
        )}
        <p className="text-sm leading-relaxed font-normal text-opacity-95">
          {message}
        </p>
        {action && <div className="mt-2">{action}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className={`
            p-1 rounded-md transition-colors focus:outline-none focus:ring-2
            ${variantConfig.closeBtn}
          `}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
