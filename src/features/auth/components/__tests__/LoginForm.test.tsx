import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../context/AuthContext';

const renderLoginForm = (props = {}) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginForm {...props} />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('LoginForm Component - Criterios de Aceptación US-FE-001', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('1. Estructura: Debe renderizar campos Email, Contraseña y botón "Sign In"', () => {
    renderLoginForm();

    expect(screen.getByLabelText(/Email \/ Usuario corporativo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('2. Accesibilidad: Botón de alternar visibilidad de contraseña conmuta type y aria-label', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const passwordInput = screen.getByLabelText(/^Contraseña/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleButton = screen.getByRole('button', { name: /Mostrar contraseña/i });
    expect(toggleButton).toBeInTheDocument();

    // Clic para mostrar contraseña
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    expect(screen.getByRole('button', { name: /Ocultar contraseña/i })).toBeInTheDocument();

    // Clic para ocultar contraseña
    await user.click(screen.getByRole('button', { name: /Ocultar contraseña/i }));
    expect(passwordInput.type).toBe('password');
  });

  it('3. Validación en cliente: Muestra feedback inline si los campos están vacíos', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('El correo corporativo o usuario es obligatorio.')
      ).toBeInTheDocument();
      expect(screen.getByText('La contraseña es obligatoria.')).toBeInTheDocument();
    });
  });

  it('4. Validación en cliente: Muestra feedback inline si la contraseña es menor a 6 caracteres', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/Email \/ Usuario corporativo/i);
    const passwordInput = screen.getByLabelText(/^Contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    await user.type(emailInput, 'coder@tiboli.io');
    await user.type(passwordInput, '123');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('La contraseña debe tener al menos 6 caracteres.')
      ).toBeInTheDocument();
    });
  });

  it('5. Manejo de Errores 401: Muestra banner accesible con el mensaje exacto especificado', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/Email \/ Usuario corporativo/i);
    const passwordInput = screen.getByLabelText(/^Contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    await user.type(emailInput, 'usuario_inexistente@tiboli.io');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(
          screen.getByText(
            'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.'
          )
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('6. Manejo de Errores 403: Muestra banner accesible con mensaje de permisos insuficientes', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/Email \/ Usuario corporativo/i);
    const passwordInput = screen.getByLabelText(/^Contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    // Usuario 'guest@tiboli.io' tiene rol 'invitado' (no 'coder' ni 'administrador')
    await user.type(emailInput, 'guest@tiboli.io');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(
          screen.getByText(
            'Tu cuenta no cuenta con permisos suficientes para acceder a la plataforma. Contacta al administrador.'
          )
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('7. Éxito: Invoca onSuccess con la ruta correspondiente según el rol del usuario', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    renderLoginForm({ onSuccess: onSuccessMock });

    const emailInput = screen.getByLabelText(/Email \/ Usuario corporativo/i);
    const passwordInput = screen.getByLabelText(/^Contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    // Autenticar como coder
    await user.type(emailInput, 'coder@tiboli.io');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(onSuccessMock).toHaveBeenCalledWith('/dashboard/coder');
      },
      { timeout: 3000 }
    );
  });

  it('8. US-FE-003: Debe renderizar el enlace interactivo "Forgot Password?" que apunta a /forgot-password', () => {
    renderLoginForm();

    const forgotLink = screen.getByRole('link', { name: /Forgot Password\?/i });
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink).toHaveAttribute('href', '/forgot-password');
  });
});

