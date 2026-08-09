import React, { ReactNode } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { AccessDenied } from '@/pages/error/AccessDenied';

interface ProtectedGuardProps {
  allowedRoles?: string[];
  moduleName?: string;
  children?: ReactNode;
}

export function ProtectedGuard({ allowedRoles, moduleName, children }: ProtectedGuardProps) {
  const { activeRole } = useRole();
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-pupr-blue/30 border-t-pupr-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted url
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Jika allowedRoles tidak ditentukan atau role pengguna diizinkan
  if (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(activeRole)) {
    return children ? <>{children}</> : <Outlet />;
  }

  // Jika role pengguna tidak diizinkan
  return <AccessDenied moduleName={moduleName} allowedRoles={allowedRoles} />;
}
