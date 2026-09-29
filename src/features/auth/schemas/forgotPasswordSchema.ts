import { z } from 'zod';

/**
 * Esquema de validación en tiempo real para la recuperación de contraseña (US-FE-003).
 * Exige formato de correo electrónico corporativo válido y campo requerido.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio.')
    .email('Ingresa un formato de correo electrónico válido (ej. usuario@empresa.com).'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
