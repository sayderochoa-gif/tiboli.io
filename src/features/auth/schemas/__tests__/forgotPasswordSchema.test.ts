import { describe, it, expect } from 'vitest';
import { forgotPasswordSchema } from '../forgotPasswordSchema';

describe('forgotPasswordSchema - Validación US-FE-003', () => {
  it('1. Debe aceptar un correo electrónico válido', () => {
    const validData = { email: 'usuario@tiboli.io' };
    const result = forgotPasswordSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('usuario@tiboli.io');
    }
  });

  it('2. Debe fallar si el correo está vacío', () => {
    const emptyData = { email: '' };
    const result = forgotPasswordSchema.safeParse(emptyData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El correo electrónico es obligatorio.');
    }
  });

  it('3. Debe fallar si el formato de correo es inválido', () => {
    const invalidData = { email: 'correo-no-valido' };
    const result = forgotPasswordSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Ingresa un formato de correo electrónico válido (ej. usuario@empresa.com).'
      );
    }
  });

  it('4. Debe hacer trim de espacios en blanco en el correo', () => {
    const trimmedData = { email: '  admin@tiboli.io  ' };
    const result = forgotPasswordSchema.safeParse(trimmedData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('admin@tiboli.io');
    }
  });
});
