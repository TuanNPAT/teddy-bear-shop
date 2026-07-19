import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

interface CustomerGuardProps {
  children: React.ReactNode;
}

export default function CustomerGuard({ children }: CustomerGuardProps) {
  const { user } = useAuthStore();

  if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
    // Redirect admin and staff to admin dashboard or orders
    if (user.role === 'STAFF') {
      return <Navigate to="/admin/orders" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
