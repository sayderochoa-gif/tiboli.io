import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../features/auth/context/AuthContext';
import { ProtectedRoute } from '../ProtectedRoute';
import { CoderDashboardPage } from '../../pages/CoderDashboardPage';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';
import { sessionStorageService } from '../../services/storage/sessionStorage';
import type { AuthUser } from '../../features/auth/types/auth.types';

const MOCK_CODER_USER: AuthUser = {
  id: 'usr_coder_001',
  email: 'coder@tiboli.io',
  fullName: 'Alex Morgan',
  role: 'coder',
  department: 'Software Engineering',
};

const MOCK_ADMIN_USER: AuthUser = {
  id: 'usr_admin_001',
  email: 'admin@tiboli.io',
  fullName: 'Elena Rostova',
  role: 'administrador',
  department: 'Security & Operations',
};

const renderWithRouter = (initialEntries = ['/dashboard/coder']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Página de Login Mock</div>} />
          <Route
            path="/dashboard/coder"
            element={
              <ProtectedRoute allowedRoles={['coder']}>
                <CoderDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('US-FE-002: Cierre de Sesión (Sign Out) y Auth Guard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('1. Interfaz protegida: Renderiza botón "Sign Out" claramente visible en Coder Dashboard', () => {
    sessionStorageService.saveSession('valid_token_coder', MOCK_CODER_USER);
    renderWithRouter(['/dashboard/coder']);

    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    expect(signOutBtn).toBeInTheDocument();
  });

  it('2. Limpieza Completa: Al pulsar "Sign Out", purga tokens de almacenamiento y contexto', async () => {
    const user = userEvent.setup();
    sessionStorageService.saveSession('valid_token_coder', MOCK_CODER_USER);
    localStorage.setItem('tiboli_auth_token', 'cached_token');

    renderWithRouter(['/dashboard/coder']);

    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    await user.click(signOutBtn);

    // Esperar redirección al login
    await waitFor(() => {
      expect(screen.getByText('Página de Login Mock')).toBeInTheDocument();
    });

    // Validar purga total de almacenamiento
    expect(sessionStorageService.getSession()).toBeNull();
    expect(sessionStorage.getItem('tiboli_auth_token')).toBeNull();
    expect(localStorage.getItem('tiboli_auth_token')).toBeNull();
  });

  it('3. Auth Guard (Interceptación de usuario no autenticado): Redirige inmediatamente a /login', () => {
    // Sin sesión en storage
    renderWithRouter(['/dashboard/coder']);

    // ProtectedRoute intercepta y redirige
    expect(screen.getByText('Página de Login Mock')).toBeInTheDocument();
    expect(screen.queryByText(/coder workspace/i)).not.toBeInTheDocument();
  });

  it('4. Auth Guard (RBAC): Redirige a ruta autorizada si un coder intenta entrar a /dashboard/admin', () => {
    sessionStorageService.saveSession('valid_token_coder', MOCK_CODER_USER);
    renderWithRouter(['/dashboard/admin']);

    // Coder intentando entrar a admin debe ser redirigido a /dashboard/coder
    expect(screen.getByText('coder workspace')).toBeInTheDocument();
    expect(screen.queryByText('admin console')).not.toBeInTheDocument();
  });

  it('5. Sign Out en Admin Dashboard: Limpia sesión y redirige a /login con replace', async () => {
    const user = userEvent.setup();
    sessionStorageService.saveSession('valid_token_admin', MOCK_ADMIN_USER);

    renderWithRouter(['/dashboard/admin']);

    expect(screen.getByText('admin console')).toBeInTheDocument();
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    await user.click(signOutBtn);

    await waitFor(() => {
      expect(screen.getByText('Página de Login Mock')).toBeInTheDocument();
    });

    expect(sessionStorageService.getSession()).toBeNull();
  });
});
