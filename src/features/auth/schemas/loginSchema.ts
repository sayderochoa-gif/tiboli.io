import { z } from 'zod';

/**
 * Esquema de validación en cliente para el formulario de Login (US-FE-001).
 * Implementa validación estricta pero amigable para correos corporativos o identificadores corporativos,
 * garantizando retroalimentación inmediata e inline según los criterios de aceptación.
 */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'El correo corporativo o usuario es obligatorio.')
    .refine(
      (val) => {
        // Valida formato de correo estándar/corporativo (usuario@empresa.com)
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        // O identificador de usuario corporativo (letras, números, puntos o guiones, mín 3 caracteres)
        const usernamePattern = /^[a-zA-Z0-9._-]{3,30}$/;
        return emailPattern.test(val) || usernamePattern.test(val);
      },
      {
        message: 'Ingresa un formato válido de correo corporativo (ej. usuario@empresa.com) o identificador.',
      }
    ),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria.')
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
