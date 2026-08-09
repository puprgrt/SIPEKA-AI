import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { AccessDenied } from '@/pages/error/AccessDenied';

interface ProtectedGuardProps {
  allowedRoles?: string[];
  moduleName?: string;
  children?: ReactNode;
}

export function ProtectedGuard({ allowedRoles, moduleName, children }: ProtectedGuardProps) {
  const { activeRole } = useRole();

  // Jika allowedRoles tidak ditentukan atau role pengguna diizinkan
  if (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(activeRole)) {
    return children ? <>{children}</> : <Outlet />;
  }

  // Jika role pengguna tidak diizinkan
  return <AccessDenied moduleName={moduleName} allowedRoles={allowedRoles} />;
}
