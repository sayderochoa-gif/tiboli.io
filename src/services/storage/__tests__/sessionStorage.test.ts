import { describe, it, expect, beforeEach } from 'vitest';
import { sessionStorageService } from '../sessionStorage';
import type { AuthUser } from '../../../features/auth/types/auth.types';

describe('sessionStorageService - Almacenamiento seguro', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  const mockUser: AuthUser = {
    id: 'usr_001',
    email: 'coder@tiboli.io',
    fullName: 'Alex Morgan',
    role: 'coder',
  };

  it('Debe guardar y recuperar la sesión correctamente', () => {
    sessionStorageService.saveSession('sample_token_xyz', mockUser);

    const session = sessionStorageService.getSession();
    expect(session).not.toBeNull();
    expect(session?.token).toBe('sample_token_xyz');
    expect(session?.user.email).toBe('coder@tiboli.io');
    expect(sessionStorageService.getToken()).toBe('sample_token_xyz');
    expect(sessionStorageService.getUser()?.role).toBe('coder');
  });

  it('Debe limpiar la sesión al invocar clearSession', () => {
    sessionStorageService.saveSession('sample_token_xyz', mockUser);
    sessionStorageService.clearSession();

    expect(sessionStorageService.getSession()).toBeNull();
    expect(sessionStorageService.getToken()).toBeNull();
    expect(sessionStorageService.getUser()).toBeNull();
  });
});
