import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { CoderDashboardPage } from '../pages/CoderDashboardPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Ruta de Login (US-FE-001) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Ruta de Recuperación de Contraseña (US-FE-003) */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Rutas de Redirección según Rol */}
      <Route
        path="/dashboard/coder"
        element={
          <ProtectedRoute allowedRoles={['coder']}>
            <CoderDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Redirección por defecto a /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
