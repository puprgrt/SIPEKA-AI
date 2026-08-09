import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Role = string;

export interface RoleDef {
  id: number;
  name: string;
  users: number;
  type: 'System' | 'Custom';
  description: string;
}

const INITIAL_ROLES: RoleDef[] = [
  { id: 1, name: 'Super Administrator', users: 2, type: 'System', description: 'Memiliki akses penuh ke seluruh sistem dan konfigurasi.' },
  { id: 5, name: 'Pengelola', users: 12, type: 'Custom', description: 'Pengelola bangunan gedung dari instansi/OPD lain (Pemohon).' },
  { id: 2, name: 'Kepala Dinas', users: 1, type: 'Custom', description: 'Akses view-only ke executive dashboard dan laporan akhir.' },
  { id: 6, name: 'Kepala Bidang', users: 4, type: 'Custom', description: 'Mengawasi kegiatan teknis, assessment, dan laporan sektoral.' },
  { id: 3, name: 'Reviewer Teknis', users: 5, type: 'System', description: 'Memeriksa, menilai, dan menyetujui hasil survey lapangan.' },
  { id: 4, name: 'Surveyor', users: 24, type: 'System', description: 'Melakukan inspeksi lapangan dan mengunggah data.' },
];

interface RoleContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  availableRoles: RoleDef[];
  setAvailableRoles: (roles: RoleDef[]) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<Role>('Super Administrator');
  const [availableRoles, setAvailableRoles] = useState<RoleDef[]>(INITIAL_ROLES);

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole, availableRoles, setAvailableRoles }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
