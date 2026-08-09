import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building, Lock, Mail, ChevronRight, Eye, EyeOff, ShieldCheck, Zap, ArrowRight, UserCheck } from 'lucide-react';
import { googleSignIn } from '../../lib/firebase';
import { getSSOAuthorizationUrl, MOCK_PUPR_ID_USERS } from '../../lib/puprIdSSO';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Login() {
  const navigate = useNavigate();
  const { setActiveRole } = useRole();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSSOLoading, setIsSSOLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handlePUPRIDLogin = () => {
    setIsSSOLoading(true);
    const authUrl = getSSOAuthorizationUrl('/auth/callback');
    
    // Redirect pengguna ke Portal SSO PUPR-ID
    setTimeout(() => {
      window.location.href = authUrl;
    }, 400);
  };

  const handleSimulatedSSOLogin = (nip: string) => {
    setIsSSOLoading(true);
    setShowSimulationModal(false);
    
    showToast(`Menghubungkan SSO PUPR-ID: Memverifikasi NIP ${nip}...`, 'info');

    // MOCK login for simulated SSO
    const mockUser = MOCK_PUPR_ID_USERS[nip];
    if (mockUser) {
      setTimeout(() => {
        login({
          id: mockUser.nip,
          name: mockUser.fullName,
          email: `${mockUser.nip}@pupr.go.id`, // simulated email
          avatarUrl: mockUser.avatarUrl,
          nip: mockUser.nip,
        });
        navigate('/');
      }, 600);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await googleSignIn();
      navigate("/");
    } catch (error) {
      console.error("Google sign in failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Fallback local login
      login({
        id: 'local_user',
        name: formData.email.split('@')[0],
        email: formData.email,
      });
      navigate('/');
    }, 1000);
  };

  return (
    <div className="w-full max-w-md animate-slide-up relative">
      {/* Logo Bar */}
      <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
        <div className="flex items-center gap-3 bg-white dark:bg-card p-3 px-5 rounded-2xl shadow-[var(--shadow-sm)] border border-border/60">
          <img src="/logo-garut.svg" alt="Garut" className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <img src="/logo-pupr.svg" alt="PUPR" className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="w-px h-8 bg-border/60" />
          <img src="/logo-sipeka.svg" alt="SIPEKA" className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-xl)] bg-white dark:bg-card border border-border/40">
        <div className="p-8">
          {/* Header */}
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Masuk ke <span className="text-gradient-pupr">SIPEKA</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gunakan Single Sign-On **PUPR-ID** atau kredensial akun terdaftar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email atau NIP</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pupr-blue transition-colors" size={16} />
                <Input 
                  type="text" 
                  placeholder="nama@garutkab.go.id / 19850315..." 
                  className="pl-10 h-11"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kata Sandi</label>
                <Link to="/auth/forgot-password" className="text-xs font-semibold text-pupr-blue hover:text-pupr-blue-light transition-colors">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pupr-blue transition-colors" size={16} />
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  className="pl-10 pr-10 h-11"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="pupr" 
              className="w-full h-12 text-base font-semibold shadow-md shadow-pupr-blue/20 mt-2"
              disabled={isLoading || isSSOLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Masuk Biasa</span>
                  <ChevronRight size={18} />
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-card px-3 text-slate-400 font-medium">Atau masuk dengan</span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <Button 
              type="button" 
              variant="default"
              className="w-full h-12 font-semibold text-white bg-gradient-to-r from-pupr-navy via-pupr-blue to-sky-600 hover:opacity-95 shadow-md shadow-pupr-blue/20 gap-3 border border-white/10"
              onClick={handlePUPRIDLogin}
              disabled={isSSOLoading}
            >
              {isSSOLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengalihkan ke PUPR-ID...</span>
                </div>
              ) : (
                <>
                  <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center border border-white/30">
                    <Building className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <span>Masuk via SSO puprID</span>
                  <ShieldCheck className="w-4 h-4 ml-auto text-amber-300" />
                </>
              )}
            </Button>

            {/* Quick Fast-Login Demo Option */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-400">Pengujian Lokal (SSO Fast-Login):</span>
              <button 
                type="button"
                onClick={() => setShowSimulationModal(!showSimulationModal)}
                className="text-pupr-blue font-semibold hover:underline flex items-center gap-1"
              >
                <Zap size={13} className="text-amber-500" />
                Pilih Akun NIP
              </button>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-11 font-medium gap-2.5 text-slate-700 dark:text-slate-300" 
              onClick={handleGoogleLogin} 
              disabled={isLoading || isSSOLoading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google Workspace
            </Button>
          </div>
        </div>
      </div>
      
      {/* Simulation Modal Popover */}
      {showSimulationModal && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-pupr-blue/30 p-5 z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-pupr-blue" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Simulasi SSO PUPR-ID</h3>
            </div>
            <button 
              onClick={() => setShowSimulationModal(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            Pilih salah satu profil ASN terverifikasi untuk menguji alur autentikasi dan penyesuaian hak akses (Role):
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {Object.values(MOCK_PUPR_ID_USERS).map((user) => (
              <button
                key={user.nip}
                onClick={() => handleSimulatedSSOLogin(user.nip)}
                className="w-full text-left p-2.5 rounded-xl border border-border/80 hover:border-pupr-blue hover:bg-pupr-blue/5 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img src={user.avatarUrl} alt={user.fullName} className="w-9 h-9 rounded-full object-cover border border-pupr-blue/30" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-pupr-blue">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">NIP: {user.nip}</p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-semibold bg-pupr-blue/10 text-pupr-blue rounded">
                      {user.role}
                    </span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-pupr-blue group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-8 space-y-1">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Dinas PUPR Kabupaten Garut
        </p>
        <p className="text-[10px] text-slate-300 dark:text-slate-600 font-mono" data-mono>
          Powered by SIPEKA v2.0 Enterprise & PUPR-ID SSO
        </p>
      </div>
    </div>
  );
}
