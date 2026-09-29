import type { AuthUser } from '../../features/auth/types/auth.types';

/**
 * Servicio de almacenamiento de sesión con enfoque en seguridad y arquitectura limpia.
 * 
 * NOTA DE SEGURIDAD (OWASP Best Practices):
 * - En aplicaciones SPA de producción con backend dedicado, el patrón recomendado es almacenar el token
 *   de refresco en cookies seguras con flags `HttpOnly`, `Secure` y `SameSite=Strict` para mitigar ataques XSS.
 * - Para esta implementación del lado cliente, utilizamos `sessionStorage` encapsulado para evitar que
 *   los tokens persistan tras cerrar la pestaña/navegador (evitando riesgos inherentes a `localStorage`).
 * - Se encapsula a través de una interfaz desacoplada para facilitar el cambio a memoria o cookies según el entorno.
 */

const STORAGE_KEYS = {
  TOKEN: 'tiboli_auth_token',
  USER: 'tiboli_auth_user',
} as const;

export interface StoredSession {
  token: string;
  user: AuthUser;
}

class SessionStorageService {
  /**
   * Guarda de forma segura los datos de sesión activa en sessionStorage.
   */
  public saveSession(token: string, user: AuthUser): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error al persistir la sesión en sessionStorage:', error);
    }
  }

  /**
   * Recupera la sesión guardada si existe y es válida.
   */
  public getSession(): StoredSession | null {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      const userRaw = sessionStorage.getItem(STORAGE_KEYS.USER);

      if (!token || !userRaw) {
        return null;
      }

      const user = JSON.parse(userRaw) as AuthUser;
      return { token, user };
    } catch (error) {
      console.error('Error al recuperar la sesión activa:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Obtiene únicamente el token de autenticación.
   */
  public getToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Obtiene el usuario autenticado actualmente almacenado.
   */
  public getUser(): AuthUser | null {
    const session = this.getSession();
    return session ? session.user : null;
  }

  /**
   * Limpia exhaustivamente todos los datos de sesión (Logout o sesión expirada) (US-FE-002).
   * Purga tokens y credenciales de sessionStorage, localStorage y cookies de cliente.
   */
  public clearSession(): void {
    try {
      // 1. Purgar sessionStorage
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.clear();

      // 2. Purgar localStorage por defensa en profundidad
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('tiboli_auth_token');
        localStorage.removeItem('tiboli_auth_user');
      }

      // 3. Invalidar cualquier rastro de cookie en cliente
      if (typeof document !== 'undefined' && document.cookie) {
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
          }
        });
      }
    } catch (error) {
      console.error('Error al purgar completamente la sesión:', error);
    }
  }
}

export const sessionStorageService = new SessionStorageService();
