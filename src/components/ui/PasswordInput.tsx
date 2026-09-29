import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, type InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightElement'> {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      showPasswordLabel = 'Mostrar contraseña',
      hidePasswordLabel = 'Ocultar contraseña',
      leftIcon = <Lock className="w-4 h-4" aria-hidden="true" />,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setShowPassword((prev) => !prev);
    };

    const actionLabel = showPassword ? hidePasswordLabel : showPasswordLabel;

    return (
      <Input
        {...props}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        leftIcon={leftIcon}
        rightElement={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            aria-label={actionLabel}
            aria-pressed={showPassword}
            tabIndex={disabled ? -1 : 0}
            className="p-1.5 text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        }
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
