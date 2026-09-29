import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightElement,
      id: customId,
      disabled,
      className = '',
      containerClassName = '',
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasError = Boolean(error);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wide text-slate-700 select-none flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div
              className={`absolute left-3.5 flex items-center pointer-events-none transition-colors ${
                hasError ? 'text-rose-500' : 'text-slate-400'
              }`}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={`
              w-full h-11 text-sm rounded-lg transition-all duration-150 border bg-white
              placeholder:text-slate-400 text-slate-900
              ${leftIcon ? 'pl-10' : 'pl-3.5'}
              ${rightElement ? 'pr-11' : 'pr-3.5'}
              ${
                hasError
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100/80 text-rose-950'
                  : 'border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
              }
              ${
                disabled
                  ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed select-none'
                  : 'shadow-xs'
              }
              focus:outline-none
              ${className}
            `}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-2 flex items-center">{rightElement}</div>
          )}
        </div>

        {/* Mensaje de error inline accesible */}
        {hasError ? (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-0.5 animate-fadeIn"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500 mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
