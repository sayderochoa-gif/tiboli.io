# tiboli.io — Frontend Platform

Implementación de la Historia de Usuario **US-FE-001 — Login**, desarrollada bajo estándares de **Senior Frontend**, arquitectura limpia (Feature-Driven Architecture), accesibilidad WCAG y directrices de seguridad OWASP.

---

## 🚀 Arquitectura y Stack Tecnológico

- **Framework:** React 19 + TypeScript (ES2023 / Bundler module resolution).
- **Herramienta de Construcción:** Vite 8.
- **Estilos:** Tailwind CSS v4 con `@tailwindcss/vite`.
- **Formularios & Validación:** React Hook Form + Zod con `@hookform/resolvers/zod`.
- **Enrutamiento & Guards:** React Router v7 con rutas protegidas basadas en roles (RBAC).
- **Iconografía:** Lucide React (accesible mediante `aria-hidden` y `aria-label`).
- **Testing:** Vitest + React Testing Library + `@testing-library/jest-dom` + `jsdom`.
- **Calidad de Código:** Oxlint y TypeScript en modo estricto.

---

## 📁 Estructura del Proyecto

```text
src/
├── components/
│   └── ui/                     # Componentes atómicos accesibles
│       ├── AlertBanner.tsx     # Notificaciones accesibles (401/403/errores)
│       ├── Button.tsx          # Botón con estados de carga y spinner
│       ├── Input.tsx           # Input con soporte de iconos y feedback inline
│       └── PasswordInput.tsx   # Input de contraseña con toggle show/hide accesible
├── features/
│   └── auth/                   # Módulo de Autenticación desacoplado (US-FE-001)
│       ├── components/
│       │   ├── LoginForm.tsx   # Formulario controlado de inicio de sesión
│       │   └── __tests__/      # Tests de integración del componente
│       ├── context/
│       │   ├── AuthContext.tsx # Proveedor de estado global de sesión
│       │   └── authContextDefinition.ts
│       ├── hooks/
│       │   └── useAuth.ts      # Custom hook para consumo seguro de AuthContext
│       ├── schemas/
│       │   ├── loginSchema.ts  # Validación en cliente con Zod
│       │   └── __tests__/
│       ├── services/
│       │   ├── authService.ts  # Mock y servicio de autenticación con casos 200/401/403
│       │   └── __tests__/
│       └── types/
│           └── auth.types.ts   # Contratos e interfaces del dominio
├── pages/
│   ├── LoginPage.tsx           # Vista principal de Login 100% responsive
│   ├── CoderDashboardPage.tsx  # Dashboard de rol 'coder' (/dashboard/coder)
│   └── AdminDashboardPage.tsx  # Dashboard de rol 'administrador' (/dashboard/admin)
├── routes/
│   ├── AppRoutes.tsx           # Definición de rutas del sistema
│   └── ProtectedRoute.tsx      # Guardián de rutas con validación de roles
└── services/
    └── storage/
        ├── sessionStorage.ts   # Persistencia segura de sesión (OWASP)
        └── __tests__/
```

---

## 📋 Matriz de Credenciales de Prueba y Criterios de Aceptación

Para facilitar la verificación manual inmediata, la pantalla de Login incorpora una barra de accesos directos (**Demo Helper**):

| Escenario | Email / Usuario | Contraseña | Rol | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **1. Coder (Éxito)** | `coder@tiboli.io` | `Password123!` | `coder` | Redirige inmediatamente a `/dashboard/coder` |
| **2. Admin (Éxito)** | `admin@tiboli.io` | `Password123!` | `administrador` | Redirige inmediatamente a `/dashboard/admin` |
| **3. Rol No Autorizado** | `guest@tiboli.io` | `Password123!` | `invitado` | **Error 403**: Bloquea redirección y muestra banner: *"Tu cuenta no cuenta con permisos suficientes para acceder a la plataforma. Contacta al administrador."* |
| **4. Cuenta Inactiva** | `inactive@tiboli.io` | `Password123!` | Inactivo | **Error 403**: Bloquea redirección y muestra mensaje de permisos insuficientes. |
| **5. Credenciales Inválidas** | `cualquiera@tiboli.io` | `PasswordErronea` | - | **Error 401**: Muestra banner: *"Credenciales inválidas. Por favor, verifica tu usuario y contraseña."* |
| **6. Validación en Cliente** | *(vacío)* | *(vacío)* | - | Feedback inline en inputs: campos obligatorios y formato corporativo. |

---

## 🔒 Consideraciones de Seguridad y Buenas Prácticas (OWASP)

1. **Almacenamiento de Sesión:**
   - Se utiliza `sessionStorage` encapsulado en lugar de `localStorage` para asegurar que el token de sesión no persista indefinidamente tras cerrar la pestaña o el navegador, mitigando riesgos de fuga de sesiones en terminales compartidas.
   - La arquitectura está completamente desacoplada a través de `sessionStorageService`, facilitando la transición a cookies con flags `HttpOnly`, `Secure` y `SameSite=Strict` para producción con backend real.

2. **Mitigación de Enumeración de Usuarios:**
   - El mensaje ante fallos de contraseña o usuario inexistente es uniforme (*"Credenciales inválidas. Por favor, verifica tu usuario y contraseña."*), evitando divulgar si un usuario existe o no en la plataforma.

3. **Prevención de Ataques de Fuerza Bruta y Múltiples Submits:**
   - La interfaz bloquea todos los inputs y el botón "Sign In" mientras la petición está en curso (`isBusy` / `isLoading`), previniendo envíos concurrentes duplicados.

4. **Accesibilidad WCAG 2.1 AA:**
   - Atributos `aria-invalid`, `aria-describedby` y `role="alert"` en campos con error.
   - Botón interactivo de mostrar/ocultar contraseña con `aria-label` dinámico (`"Mostrar contraseña"` / `"Ocultar contraseña"`) y navegación por teclado sin pérdida de foco.

---

## 🛠️ Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en http://localhost:5173
npm run dev

# Ejecutar suite de pruebas unitarias e integración (20 tests)
npm test

# Ejecutar linter Oxlint
npm run lint

# Compilar para producción (TypeScript + Vite)
npm run build
```
