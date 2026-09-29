import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { AuthProvider } from '../../features/auth/context/AuthContext';

const renderLoginPage = () => {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard/coder" element={<div>Coder Dashboard View</div>} />
          <Route path="/dashboard/admin" element={<div>Admin Dashboard View</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('LoginPage - Opciones de acceso con Google y Microsoft (SSO)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('1. Renderiza los botones de acceso con Google y Microsoft en el contenedor especificado', () => {
    renderLoginPage();

    // Verifica que los botones existan
    const googleBtn = screen.getByRole('button', { name: /Continuar con Google/i });
    const microsoftBtn = screen.getByRole('button', { name: /Continuar con Microsoft/i });

    expect(googleBtn).toBeInTheDocument();
    expect(microsoftBtn).toBeInTheDocument();
    expect(screen.getByText('<Be a coder, change your world/>')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /tiboli\.io/i })).not.toBeInTheDocument();
  });

  it('2. Al hacer clic en "Continuar con Google", abre el modal con las cuentas corporativas disponibles', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /Continuar con Google/i });
    await user.click(googleBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Google Workspace')).toBeInTheDocument();
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
  });

  it('3. Al hacer clic en "Continuar con Microsoft", abre el modal con título de Microsoft', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const microsoftBtn = screen.getByRole('button', { name: /Continuar con Microsoft/i });
    await user.click(microsoftBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Microsoft Entra ID')).toBeInTheDocument();
  });

  it('4. Permite cerrar el modal haciendo clic en el botón de cerrar', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /Continuar con Google/i });
    await user.click(googleBtn);

    const closeBtn = screen.getByRole('button', { name: /Cerrar modal/i });
    await user.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('5. Flujo SSO: Seleccionar la cuenta de Coder en el modal autentica y redirige a /dashboard/coder', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /Continuar con Google/i });
    await user.click(googleBtn);

    const alexMorganBtn = screen.getByRole('button', { name: /Alex Morgan/i });
    await user.click(alexMorganBtn);

    await waitFor(
      () => {
        expect(screen.getByText('Coder Dashboard View')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
