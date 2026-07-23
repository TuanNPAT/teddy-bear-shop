import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { cmsMockApi } from '../../api/cmsMockApi';
import { toast } from 'sonner';

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'STAFF')[];
}

export default function AdminGuard({ children, allowedRoles }: AdminGuardProps) {
  const { token, user, logout } = useAuthStore();
  const location = useLocation();

  const isStaffDeactivated = !!(user && user.role === 'STAFF' && !cmsMockApi.isStaffActive(user.email));

  useEffect(() => {
    if (isStaffDeactivated) {
      logout();
      toast.error('Tài khoản của bạn đã bị khóa bởi Quản trị viên!');
    }
  }, [isStaffDeactivated, logout]);

  if (isStaffDeactivated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role as any)) {
    if (user.role === 'STAFF') {
      // Staff is only allowed on Orders
      return <Navigate to="/admin/orders" replace />;
    }
    // Customer goes to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
