import { describe, it, expect } from 'vitest';
import { loginSchema } from '../loginSchema';

describe('loginSchema - Validaciones del Formulario', () => {
  it('Debe rechazar formulario si los campos están vacíos', () => {
    const result = loginSchema.safeParse({ identifier: '', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.identifier?.[0]).toBe('El correo corporativo o usuario es obligatorio.');
      expect(fieldErrors.password?.[0]).toBe('La contraseña es obligatoria.');
    }
  });

  it('Debe rechazar identificadores con formato inválido', () => {
    const result = loginSchema.safeParse({
      identifier: 'usuario@invalido', // Falta TLD
      password: 'Password123!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.identifier?.[0]).toContain('Ingresa un formato válido');
    }
  });

  it('Debe rechazar contraseñas con menos de 6 caracteres', () => {
    const result = loginSchema.safeParse({
      identifier: 'coder@tiboli.io',
      password: '123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password?.[0]).toBe(
        'La contraseña debe tener al menos 6 caracteres.'
      );
    }
  });

  it('Debe aceptar emails corporativos válidos y contraseñas de al menos 6 caracteres', () => {
    const result = loginSchema.safeParse({
      identifier: 'coder@tiboli.io',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.identifier).toBe('coder@tiboli.io');
    }
  });

  it('Debe aceptar identificadores de usuario corporativos (ej. coder.corp)', () => {
    const result = loginSchema.safeParse({
      identifier: 'coder.corp',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
  });
});
