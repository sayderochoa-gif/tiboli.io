import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  GitBranch,
  LogOut,
  Terminal,
  User,
  CheckCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Button } from '../components/ui/Button';

export const CoderDashboardPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white">tiboli.io</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                coder workspace
              </span>
            </div>
            <p className="text-xs text-slate-400">Ruta activa: /dashboard/coder</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-semibold text-xs">
              {user?.fullName?.charAt(0) || 'C'}
            </div>
            <div className="text-left text-xs">
              <p className="font-medium text-slate-200">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="Sign Out"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-linear-to-r from-emerald-950/60 via-slate-800 to-slate-900 border border-emerald-800/40 p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-3">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Autenticación Exitosa con Rol: {user?.role}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ¡Bienvenido de vuelta, {user?.fullName}!
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Has sido redirigido exitosamente a la ruta autorizada para desarrolladores (<strong>/dashboard/coder</strong>). Tu sesión se encuentra cifrada y activa.
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: User Profile */}
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <User className="w-4 h-4" />
              <h3>Perfil de Usuario</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex justify-between border-b border-slate-700/40 pb-1.5">
                <span className="text-slate-400">ID Usuario:</span>
                <span className="font-mono text-slate-200">{user?.id}</span>
              </p>
              <p className="flex justify-between border-b border-slate-700/40 pb-1.5">
                <span className="text-slate-400">Rol:</span>
                <span className="font-semibold text-emerald-400">{user?.role}</span>
              </p>
              <p className="flex justify-between border-b border-slate-700/40 pb-1.5">
                <span className="text-slate-400">Departamento:</span>
                <span>{user?.department || 'Engineering'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Último Login:</span>
                <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : 'Ahora'}</span>
              </p>
            </div>
          </div>

          {/* Card 2: Environment info */}
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <GitBranch className="w-4 h-4" />
              <h3>Entorno de Desarrollo</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex justify-between border-b border-slate-700/40 pb-1.5">
                <span className="text-slate-400">Rama Activa:</span>
                <span className="font-mono text-slate-200">feature/frontend</span>
              </p>
              <p className="flex justify-between border-b border-slate-700/40 pb-1.5">
                <span className="text-slate-400">Criterio:</span>
                <span className="font-medium text-slate-200">US-FE-001 (Coder)</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Estado de Sesión:</span>
                <span className="text-emerald-400 font-medium">Activa (sessionStorage)</span>
              </p>
            </div>
          </div>

          {/* Card 3: Token Audit */}
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <KeyRound className="w-4 h-4" />
              <h3>Token de Sesión (Mock JWT)</h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Token verificado e inyectado en el almacenamiento seguro:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[10px] text-slate-300 break-all border border-slate-800">
              {token ? `${token.substring(0, 50)}...` : 'Sin token'}
            </div>
          </div>
        </div>

        {/* Code Projects Sample */}
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <h3>Repositorios Asignados</h3>
            </div>
            <span className="text-xs text-slate-400">3 repositorios activos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/40 hover:border-emerald-500/40 transition-colors">
              <p className="font-semibold text-slate-200 mb-1">tiboli.io / frontend</p>
              <p className="text-slate-400 text-[11px]">Módulo de autenticación y diseño de componentes.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/40 hover:border-emerald-500/40 transition-colors">
              <p className="font-semibold text-slate-200 mb-1">tiboli.io / backend-api</p>
              <p className="text-slate-400 text-[11px]">Servicios RESTful y JWT middleware.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/40 hover:border-emerald-500/40 transition-colors">
              <p className="font-semibold text-slate-200 mb-1">tiboli.io / core-engine</p>
              <p className="text-slate-400 text-[11px]">Algoritmos de procesamiento en tiempo real.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
