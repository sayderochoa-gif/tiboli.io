import { describe, it, expect } from 'vitest';
import {
  loginService,
  logoutService,
  forgotPasswordService,
  getRedirectPathByRole,
  AuthServiceError,
} from '../authService';

describe('authService - US-FE-001 Criterios de Aceptación', () => {
  it('ÉXITO 1: Debe autenticar al usuario con rol "coder" y resolver ruta /dashboard/coder', async () => {
    const response = await loginService({
      identifier: 'coder@tiboli.io',
      password: 'Password123!',
    });

    expect(response).toBeDefined();
    expect(response.token).toBeDefined();
    expect(response.user.role).toBe('coder');
    expect(response.user.email).toBe('coder@tiboli.io');

    const redirect = getRedirectPathByRole(response.user.role);
    expect(redirect).toBe('/dashboard/coder');
  });

  it('ÉXITO 2: Debe autenticar al usuario con rol "administrador" y resolver ruta /dashboard/admin', async () => {
    const response = await loginService({
      identifier: 'admin@tiboli.io',
      password: 'Password123!',
    });

    expect(response).toBeDefined();
    expect(response.token).toBeDefined();
    expect(response.user.role).toBe('administrador');
    expect(response.user.email).toBe('admin@tiboli.io');

    const redirect = getRedirectPathByRole(response.user.role);
    expect(redirect).toBe('/dashboard/admin');
  });

  it('FALLO 401: Debe rechazar credenciales inexistentes con mensaje y status 401', async () => {
    await expect(
      loginService({
        identifier: 'desconocido@tiboli.io',
        password: 'Password123!',
      })
    ).rejects.toThrowError(
      'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.'
    );

    try {
      await loginService({
        identifier: 'desconocido@tiboli.io',
        password: 'Password123!',
      });
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AuthServiceError);
      const authErr = err as AuthServiceError;
      expect(authErr.statusCode).toBe(401);
      expect(authErr.code).toBe('INVALID_CREDENTIALS');
    }
  });

  it('FALLO 401: Debe rechazar contraseña incorrecta para un usuario existente con status 401', async () => {
    try {
      await loginService({
        identifier: 'coder@tiboli.io',
        password: 'WrongPassword!',
      });
      expect.unreachable('Debería haber lanzado un error');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AuthServiceError);
      const authErr = err as AuthServiceError;
      expect(authErr.statusCode).toBe(401);
      expect(authErr.message).toBe(
        'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.'
      );
    }
  });

  it('FALLO 403: Debe bloquear acceso si el usuario existe pero tiene un rol no permitido', async () => {
    try {
      await loginService({
        identifier: 'guest@tiboli.io',
        password: 'Password123!',
      });
      expect.unreachable('Debería haber lanzado un error 403');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AuthServiceError);
      const authErr = err as AuthServiceError;
      expect(authErr.statusCode).toBe(403);
      expect(authErr.code).toBe('UNAUTHORIZED_ROLE');
      expect(authErr.message).toBe(
        'Tu cuenta no cuenta con permisos suficientes para acceder a la plataforma. Contacta al administrador.'
      );
    }
  });

  it('FALLO 403: Debe bloquear acceso si la cuenta del usuario está inactiva', async () => {
    try {
      await loginService({
        identifier: 'inactive@tiboli.io',
        password: 'Password123!',
      });
      expect.unreachable('Debería haber lanzado un error 403');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AuthServiceError);
      const authErr = err as AuthServiceError;
      expect(authErr.statusCode).toBe(403);
      expect(authErr.code).toBe('ACCOUNT_INACTIVE');
      expect(authErr.message).toBe(
        'Tu cuenta no cuenta con permisos suficientes para acceder a la plataforma. Contacta al administrador.'
      );
    }
  });
});

describe('logoutService - US-FE-002 Criterios de Aceptación', () => {
  it('Debe resolver exitosamente la promesa de cierre de sesión', async () => {
    await expect(logoutService()).resolves.toBeUndefined();
  });
});

describe('forgotPasswordService - US-FE-003 Criterios de Aceptación', () => {
  it('ÉXITO: Debe responder positivamente con mensaje genérico anti-enumeración para email válido', async () => {
    const response = await forgotPasswordService('coder@tiboli.io');

    expect(response.success).toBe(true);
    expect(response.message).toBe(
      'Hemos enviado las instrucciones de recuperación a tu correo electrónico corporativo si este se encuentra registrado.'
    );
  });

  it('ÉXITO: Responde positivamente incluso si el correo no existe (OWASP Anti-Enumeration)', async () => {
    const response = await forgotPasswordService('no_registrado@tiboli.io');

    expect(response.success).toBe(true);
    expect(response.message).toContain('Hemos enviado las instrucciones de recuperación');
  });

  it('FALLO 500: Debe lanzar AuthServiceError ante fallo de red o simulación de error', async () => {
    try {
      await forgotPasswordService('error@tiboli.io');
      expect.unreachable('Debería haber lanzado un error');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AuthServiceError);
      const authErr = err as AuthServiceError;
      expect(authErr.statusCode).toBe(500);
      expect(authErr.code).toBe('NETWORK_ERROR');
      expect(authErr.message).toBe(
        'Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.'
      );
    }
  });
});

