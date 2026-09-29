import type {
  AuthErrorPayload,
  AuthResponse,
  AuthUser,
  ForgotPasswordResponse,
  LoginCredentials,
  SystemRole,
} from '../types/auth.types';

/**
 * Error personalizado para operaciones de autenticación.
 * Permite tipado estricto y desacoplamiento de respuestas HTTP.
 */
export class AuthServiceError extends Error {
  public readonly code: AuthErrorPayload['code'];
  public readonly statusCode: number;

  constructor(payload: AuthErrorPayload) {
    super(payload.message);
    this.name = 'AuthServiceError';
    this.code = payload.code;
    this.statusCode = payload.statusCode;
    Object.setPrototypeOf(this, AuthServiceError.prototype);
  }

  public toPayload(): AuthErrorPayload {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Base de datos simulada de credenciales corporativas para pruebas de los Criterios de Aceptación.
 * En un entorno de producción, las credenciales reales se verifican contra un backend seguro mediante hash bcrypt/argon2.
 */
interface MockAccount {
  user: AuthUser;
  passwordHash: string; // En este mock se compara la contraseña de prueba
  isActive: boolean;
}

export const MOCK_ACCOUNTS: Record<string, MockAccount> = {
  // Caso de Éxito 1: Rol 'coder' -> Redirige a /dashboard/coder
  'coder@tiboli.io': {
    user: {
      id: 'usr_coder_001',
      email: 'coder@tiboli.io',
      fullName: 'Alex Morgan',
      role: 'coder',
      department: 'Software Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    passwordHash: 'Password123!',
    isActive: true,
  },

  // Caso de Éxito 2: Rol 'administrador' -> Redirige a /dashboard/admin
  'admin@tiboli.io': {
    user: {
      id: 'usr_admin_001',
      email: 'admin@tiboli.io',
      fullName: 'Elena Rostova',
      role: 'administrador',
      department: 'Security & Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    passwordHash: 'Password123!',
    isActive: true,
  },

  // Caso de Fallo 1: Credenciales válidas pero rol sin permisos (403 Forbidden)
  'guest@tiboli.io': {
    user: {
      id: 'usr_guest_003',
      email: 'guest@tiboli.io',
      fullName: 'Carlos Gómez',
      role: 'invitado', // Rol no permitido en los criterios
      department: 'External Partner',
    },
    passwordHash: 'Password123!',
    isActive: true,
  },

  // Caso de Fallo 2: Rol inactivo
  'inactive@tiboli.io': {
    user: {
      id: 'usr_inactive_004',
      email: 'inactive@tiboli.io',
      fullName: 'Marcos Soto',
      role: 'coder',
      department: 'Engineering',
    },
    passwordHash: 'Password123!',
    isActive: false, // Cuenta inactiva
  },
};

/**
 * Roles válidos del sistema que tienen permiso para ingresar.
 */
export const VALID_ROLES: readonly SystemRole[] = ['coder', 'administrador'] as const;

/**
 * Verifica si un rol es válido para acceder al sistema.
 */
export function isValidSystemRole(role: string): role is SystemRole {
  return VALID_ROLES.includes(role as SystemRole);
}

/**
 * Resuelve la ruta de redirección según el rol de negocio asignado.
 */
export function getRedirectPathByRole(role: string): string {
  switch (role) {
    case 'coder':
      return '/dashboard/coder';
    case 'administrador':
      return '/dashboard/admin';
    default:
      return '/login';
  }
}

/**
 * Generador seguro de token ficticio para la sesión del cliente (formato similar a JWT).
 */
function generateMockToken(user: AuthUser): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora de expiración
    })
  );
  const signature = btoa('mock_secure_signature_tiboli_' + Date.now());
  return `${header}.${payload}.${signature}`;
}

/**
 * Función que simula la latencia de red para tests de UX (isLoading, spinners).
 */
const simulateNetworkLatency = (ms: number = 750) =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      import.meta.env.MODE === 'test' ? 10 : ms
    )
  );

/**
 * Servicio de Autenticación principal (`loginService`).
 * 
 * Cumple con los criterios de aceptación:
 * - 401: Credenciales inválidas.
 * - 403: Cuenta sin permisos suficientes o rol no autorizado (distinto de coder o administrador).
 * - 200: Retorna sesión, token y usuario si las credenciales y rol son correctos.
 * 
 * @param credentials Credenciales ingresadas por el usuario
 * @returns Promise<AuthResponse>
 * @throws AuthServiceError
 */
export async function loginService(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulación de delay de red realista
  await simulateNetworkLatency(800);

  const identifier = credentials.identifier.trim().toLowerCase();
  const password = credentials.password;

  // Búsqueda en mock de usuarios (por email o prefijo de usuario)
  let matchedAccount: MockAccount | undefined = undefined;

  for (const [mockEmail, account] of Object.entries(MOCK_ACCOUNTS)) {
    const username = mockEmail.split('@')[0];
    if (identifier === mockEmail.toLowerCase() || identifier === username.toLowerCase()) {
      matchedAccount = account;
      break;
    }
  }

  // 1. Caso de Error 401: Usuario no encontrado o contraseña incorrecta
  if (!matchedAccount || matchedAccount.passwordHash !== password) {
    throw new AuthServiceError({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.',
    });
  }

  // 2. Caso de Error 403: Usuario existe pero no está activo o rol no autorizado
  if (!matchedAccount.isActive) {
    throw new AuthServiceError({
      statusCode: 403,
      code: 'ACCOUNT_INACTIVE',
      message: 'Tu cuenta no cuenta con permisos suficientes para acceder a la plataforma. Contacta al administrador.',
    });
  }

  const userRole = matchedAccount.user.role;
  if (!isValidSystemRole(userRole)) {
    throw new AuthServiceError({
      statusCode: 403,
      code: 'UNAUTHORIZED_ROLE',
      message: 'Tu cuenta no cuenta con permisos suficientes para acceder a la plataforma. Contacta al administrador.',
    });
  }

  // 3. Caso de Éxito: Generación de token y respuesta de autenticación válida
  const token = generateMockToken(matchedAccount.user);

  return {
    token,
    user: {
      ...matchedAccount.user,
      lastLogin: new Date().toISOString(),
    },
    expiresIn: 3600,
  };
}

/**
 * Servicio de Cierre de Sesión simulado (US-FE-002).
 * Simula la notificación de invalidación de token y registro de auditoría en servidor.
 */
export async function logoutService(): Promise<void> {
  await simulateNetworkLatency(100);
}

/**
 * Servicio de Recuperación de Contraseña (US-FE-003).
 * Simula el procesamiento asíncrono para enviar instrucciones de restablecimiento.
 *
 * Principios de Seguridad (OWASP ASVS):
 * - Anti-Enumeration: No revela si el email existe o no en la base de datos para prevenir recolección de emails.
 * - Simulación de fallos: Los emails 'error@tiboli.io' o 'fail@tiboli.io' simulan error 500 de servidor / red.
 *
 * @param email Correo electrónico corporativo
 * @returns Promise<ForgotPasswordResponse>
 * @throws AuthServiceError
 */
export async function forgotPasswordService(email: string): Promise<ForgotPasswordResponse> {
  await simulateNetworkLatency(750);

  const cleanEmail = email.trim().toLowerCase();

  // Simulación de fallo de red / error 500 para pruebas de UX y QA defensivo
  if (cleanEmail === 'error@tiboli.io' || cleanEmail === 'fail@tiboli.io') {
    throw new AuthServiceError({
      statusCode: 500,
      code: 'NETWORK_ERROR',
      message: 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.',
    });
  }

  return {
    success: true,
    message:
      'Hemos enviado las instrucciones de recuperación a tu correo electrónico corporativo si este se encuentra registrado.',
  };
}

