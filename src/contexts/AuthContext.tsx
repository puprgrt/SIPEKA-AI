import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRole } from './RoleContext';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  nip?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sipeka_auth_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // We need to sync with RoleContext to reset roles on logout
  const { setActiveRole } = useRole();

  useEffect(() => {
    // Check local storage for existing session on mount
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse auth session', e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } else {
      // Fallback: cek apakah ada sesi SSO PUPR-ID yang tersimpan (key lama)
      // Ini menangani kasus di mana SSO login berhasil tapi auth session belum tersinkron
      const ssoSession = localStorage.getItem('sipeka_pupr_id_user');
      if (ssoSession) {
        try {
          const ssoUser = JSON.parse(ssoSession);
          const bridgedUser = {
            id: ssoUser.id || ssoUser.nip,
            name: ssoUser.fullName,
            email: ssoUser.email,
            avatarUrl: ssoUser.avatarUrl,
            nip: ssoUser.nip,
          };
          setUser(bridgedUser);
          setIsAuthenticated(true);
          // Sinkronkan ke key auth utama agar konsisten
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(bridgedUser));
        } catch (e) {
          console.error('Failed to bridge SSO session', e);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Hapus juga sesi SSO PUPR-ID agar tidak auto-restore saat refresh
    localStorage.removeItem('sipeka_pupr_id_user');
    
    // Optional: Reset role to a default unprivileged state if necessary
    // Tapi karena role biasanya tergantung user yang login, biarkan role context 
    // juga tereset atau biarkan default 'Dinas PUPR - Admin'
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
