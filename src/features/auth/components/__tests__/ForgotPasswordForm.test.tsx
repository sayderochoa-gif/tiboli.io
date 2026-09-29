import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPasswordForm } from '../ForgotPasswordForm';
import { AuthProvider } from '../../context/AuthContext';

const renderForgotPasswordForm = (props = {}) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ForgotPasswordForm {...props} />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ForgotPasswordForm Component - US-FE-003 Criterios de Aceptación', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('1. Estructura: Debe renderizar campo Email, botón "Send Reset Link" y enlace "Back to Sign In"', () => {
    renderForgotPasswordForm();

    expect(screen.getByLabelText(/Email Corporativo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Sign In/i })).toBeInTheDocument();
  });

  it('2. Validación en cliente: Muestra error si el campo está vacío al enviar', async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('El correo electrónico es obligatorio.')).toBeInTheDocument();
    });
  });

  it('3. Validación en cliente: Muestra error si el formato del correo no es válido', async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText(/Email Corporativo/i);
    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });

    await user.type(emailInput, 'correo-invalido');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Ingresa un formato de correo electrónico válido (ej. usuario@empresa.com).')
      ).toBeInTheDocument();
    });
  });

  it('4. Estado de Éxito: Muestra vista de confirmación con el mensaje exacto especificado', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();
    renderForgotPasswordForm({ onSuccess: onSuccessMock });

    const emailInput = screen.getByLabelText(/Email Corporativo/i);
    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });

    await user.type(emailInput, 'coder@tiboli.io');
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(screen.getByText('¡Instrucciones Enviadas!')).toBeInTheDocument();
        expect(
          screen.getByText(
            /Hemos enviado las instrucciones de recuperación a tu correo electrónico corporativo si este se encuentra registrado\./i
          )
        ).toBeInTheDocument();
        expect(screen.getByText('coder@tiboli.io')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Back to Sign In/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(onSuccessMock).toHaveBeenCalledWith('coder@tiboli.io');
  });

  it('5. Manejo de Errores: Muestra banner accesible con mensaje amigable ante fallos de conexión', async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText(/Email Corporativo/i);
    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });

    // 'error@tiboli.io' simula error 500 / fallo de conexión en el mock
    await user.type(emailInput, 'error@tiboli.io');
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(
          screen.getByText('Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.')
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('6. Reintento: Permite volver a intentar con otro correo desde la vista de éxito', async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText(/Email Corporativo/i);
    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });

    await user.type(emailInput, 'coder@tiboli.io');
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(screen.getByText('¡Instrucciones Enviadas!')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const retryBtn = screen.getByRole('button', { name: /¿No lo recibiste\? Intentar con otro correo/i });
    await user.click(retryBtn);

    expect(screen.getByLabelText(/Email Corporativo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
  });
});
