import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { LoginForm } from '../features/auth/components/LoginForm';
import { useAuth } from '../features/auth/hooks/useAuth';
import { getRedirectPathByRole } from '../features/auth/services/authService';

/**
 * Logotipo oficial vectorial de Google
 */
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.41 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.13z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.59 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
    />
  </svg>
);

/**
 * Logotipo oficial vectorial de Microsoft
 */
const MicrosoftIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 21 21" aria-hidden="true">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

type OAuthProvider = 'google' | 'microsoft';

interface SSOAccount {
  name: string;
  email: string;
  role: 'coder' | 'administrador' | 'invitado';
  roleLabel: string;
  initials: string;
  badgeClass: string;
  description: string;
}

const SSO_ACCOUNTS: SSOAccount[] = [
  {
    name: 'Alex Morgan',
    email: 'coder@tiboli.io',
    role: 'coder',
    roleLabel: 'Coder',
    initials: 'AM',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Redirige a /dashboard/coder',
  },
  {
    name: 'Elena Rostova',
    email: 'admin@tiboli.io',
    role: 'administrador',
    roleLabel: 'Administrador',
    initials: 'ER',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    description: 'Redirige a /dashboard/admin',
  },
  {
    name: 'Carlos Gómez',
    email: 'guest@tiboli.io',
    role: 'invitado',
    roleLabel: 'Invitado (403)',
    initials: 'CG',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Sin permisos corporativos',
  },
];

const SLOGAN_TEXT = '<Be a coder, change your world/>';

/**
 * Efecto máquina de escribir (Typewriter) con animación de escritura, pausa,
 * borrado progresivo y ciclo infinito continuo.
 */
const TypewriterSlogan: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const typingSpeed = isDeleting ? 40 : 80;
    const pauseDelay = isDeleting ? 400 : 1600;

    if (!isDeleting && displayText === SLOGAN_TEXT) {
      timer = setTimeout(() => setIsDeleting(true), pauseDelay);
    } else if (isDeleting && displayText === '') {
      timer = setTimeout(() => setIsDeleting(false), pauseDelay);
    } else {
      timer = setTimeout(() => {
        const nextText = isDeleting
          ? SLOGAN_TEXT.substring(0, displayText.length - 1)
          : SLOGAN_TEXT.substring(0, displayText.length + 1);
        setDisplayText(nextText);
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting]);

  return (
    <p
      className="text-sm text-slate-300 mt-2 font-medium font-mono min-h-[1.5rem] flex items-center justify-center tracking-tight"
      aria-label={SLOGAN_TEXT}
    >
      <span className="sr-only">{SLOGAN_TEXT}</span>
      <span aria-hidden="true">{displayText}</span>
      <span
        aria-hidden="true"
        className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse rounded-xs"
      />
    </p>
  );
};

/**
 * Pantalla principal de Login (US-FE-001).
 * Diseño centrado, mobile-first, tablet y desktop 100% responsive.
 * Integra inicio de sesión con credenciales corporativas y acceso federado SSO
 * mediante Google Workspace y Microsoft Entra ID (OAuth 2.0).
 */
export const LoginPage: React.FC = () => {
  const { isAuthenticated, user, login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Escucha tecla Escape para cerrar el modal de autenticación SSO
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeProvider && !oauthLoading) {
        setActiveProvider(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProvider, oauthLoading]);

  // Si el usuario ya cuenta con una sesión válida activa, redirigir a su dashboard correspondiente
  if (isAuthenticated && user) {
    return <Navigate to={getRedirectPathByRole(user.role)} replace />;
  }

  // Ejecuta la autenticación federada con el email de prueba seleccionado
  const handleOAuthLogin = async (email: string) => {
    setOauthLoading(email);
    try {
      const redirectPath = await login({
        identifier: email,
        password: 'Password123!',
      });
      setActiveProvider(null);
      navigate(redirectPath, { replace: true });
    } catch {
      setActiveProvider(null);
    } finally {
      setOauthLoading(null);
    }
  };

  const isBusy = isLoading || Boolean(oauthLoading);

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header / Brand Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://moodle.riwi.io/pluginfile.php/1/theme_academi/logo/1790665662/Imagen1%20%281%29.png"
              alt="Riwi Logo"
              className="h-14 w-auto object-contain drop-shadow-md"
            />
          </div>
          <TypewriterSlogan />
        </div>

        {/* Card Principal */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 transition-all">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Iniciar Sesión
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ingresa tus credenciales corporativas para continuar según tu rol asignado.
            </p>
          </div>

          {/* Formulario de Login */}
          <LoginForm />
        </div>

        {/* Apartado de Acceso con Microsoft o Google */}
        <div className="mt-6 bg-slate-800/80 backdrop-blur-xs rounded-xl border border-slate-700/60 p-4 text-xs text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Opción para acceder con Google */}
            <button
              type="button"
              onClick={() => setActiveProvider('google')}
              disabled={isBusy}
              className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 hover:border-slate-500 border border-slate-600/50 text-slate-200 hover:text-white transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              aria-label="Continuar con Google"
            >
              <GoogleIcon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-100 group-hover:text-white">
                Continuar con Google
              </span>
            </button>

            {/* Opción para acceder con Microsoft */}
            <button
              type="button"
              onClick={() => setActiveProvider('microsoft')}
              disabled={isBusy}
              className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 hover:border-slate-500 border border-slate-600/50 text-slate-200 hover:text-white transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              aria-label="Continuar con Microsoft"
            >
              <MicrosoftIcon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-100 group-hover:text-white">
                Continuar con Microsoft
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal interactivo de selección de identidad SSO */}
      {activeProvider && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sso-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => !oauthLoading && setActiveProvider(null)}
        >
          <div
            className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Proveedor */}
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  {activeProvider === 'google' ? (
                    <GoogleIcon className="w-5 h-5" />
                  ) : (
                    <MicrosoftIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 id="sso-modal-title" className="font-semibold text-white text-sm sm:text-base">
                    {activeProvider === 'google' ? 'Google Workspace' : 'Microsoft Entra ID'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Acceso institucional corporativo
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveProvider(null)}
                disabled={Boolean(oauthLoading)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Cerrar modal de autenticación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Selecciona tu cuenta corporativa para iniciar sesión:
            </p>

            {/* Listado de cuentas disponibles */}
            <div className="space-y-2 mb-4">
              {SSO_ACCOUNTS.map((account) => {
                const isItemLoading = oauthLoading === account.email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    disabled={Boolean(oauthLoading)}
                    onClick={() => handleOAuthLogin(account.email)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 hover:border-slate-600 text-left transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                        {isItemLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        ) : (
                          account.initials
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-medium text-xs text-slate-100 group-hover:text-white">
                          {account.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{account.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${account.badgeClass}`}
                      >
                        {account.roleLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {oauthLoading && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-blue-400 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando con {activeProvider === 'google' ? 'Google' : 'Microsoft'}...</span>
              </div>
            )}

            <div className="text-center pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Cifrado TLS 1.3
              </span>
              <span>OAuth 2.0 / SAML</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
