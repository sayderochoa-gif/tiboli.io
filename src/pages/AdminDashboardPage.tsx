import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Server,
  Activity,
  LogOut,
  CheckCircle,
  KeyRound,
  Lock,
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Button } from '../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white">tiboli.io</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                admin console
              </span>
            </div>
            <p className="text-xs text-slate-400">Ruta activa: /dashboard/admin</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 font-semibold text-xs">
              {user?.fullName?.charAt(0) || 'A'}
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
        <div className="rounded-2xl bg-linear-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-800/40 p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium mb-3">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Acceso Administrativo Concedido: {user?.role}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Panel de Administración Central &middot; {user?.fullName}
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Has iniciado sesión con privilegios de <strong>administrador</strong> y redirigido a <strong>/dashboard/admin</strong>. Cuentas con control total de gobernanza y accesos.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Usuarios Activos</p>
              <p className="text-2xl font-bold text-white mt-1">1,248</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Servidores</p>
              <p className="text-2xl font-bold text-white mt-1">99.98%</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Políticas de Acceso</p>
              <p className="text-2xl font-bold text-white mt-1">RBAC v2</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Intentos Bloqueados</p>
              <p className="text-2xl font-bold text-white mt-1">14 (401/403)</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Security & Audit Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Detalles del Operador Administrativo
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">ID Administrador:</span>
                <span className="font-mono text-slate-200">{user?.id}</span>
              </p>
              <p className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Email Corporativo:</span>
                <span className="text-slate-200">{user?.email}</span>
              </p>
              <p className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Departamento:</span>
                <span className="text-slate-200">{user?.department}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Nivel de Privilegios:</span>
                <span className="text-blue-400 font-semibold uppercase">{user?.role}</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              Cripto-Auditoría de Sesión
            </h3>
            <p className="text-[11px] text-slate-400">
              Token portador verificado y persistido en almacenamiento de sesión seguro:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 font-mono text-[10px] text-slate-300 break-all border border-slate-800">
              {token ? `${token.substring(0, 60)}...` : 'Sin token'}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
