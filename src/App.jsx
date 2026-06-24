/**
 * @fileoverview Ana uygulama bileşeni.
 * Route tanımları, ProtectedRoute ve yönlendirmeler.
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";

import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";

/**
 * Korumalı route bileşeni.
 * Kullanıcı oturumu yoksa giriş sayfasına yönlendirir.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Yükleme sırasında tam ekran spinner
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-lightPrimary dark:bg-navy-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-navy-700" />
            <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-brand-500" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  // Kullanıcı yoksa giriş sayfasına yönlendir
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children;
}

const App = () => {
  return (
    <Routes>
      <Route path="auth/*" element={<AuthLayout />} />
      <Route
        path="admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/admin/converter" replace />} />
    </Routes>
  );
};

export default App;
