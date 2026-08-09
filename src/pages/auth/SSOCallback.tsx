import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, CheckCircle2, Building, User, Award, ArrowRight } from 'lucide-react';
import { verifySSOToken, PUPRIdUser } from '../../lib/puprIdSSO';
import { useRole, Role } from '@/contexts/RoleContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

export function SSOCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveRole } = useRole();
  const { showToast } = useToast();
  const { login } = useAuth();
  
  const [statusStep, setStatusStep] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [statusMessage, setStatusMessage] = useState('Mengautentikasi dengan Portal PUPR-ID...');
  const [userData, setUserData] = useState<PUPRIdUser | null>(null);

  // Gunakan ref agar tidak terpengaruh oleh React StrictMode double-mount
  const hasProcessed = React.useRef(false);

  useEffect(() => {
    // Cegah double-execution di React StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSSO = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token') || urlParams.get('code') || 'sim_token_198503152010011002';

        setStatusMessage('Menerima Token SSO. Memverifikasi ke server PUPR-ID...');

        // Verifikasi token via backend API / fallback client
        const user = await verifySSOToken(token);

        setUserData(user);
        setStatusStep('success');
        setStatusMessage('Autentikasi Berhasil! Menyinkronkan profil...');

        // ✅ KRITIS: Simpan sesi ke AuthContext agar ProtectedGuard mengenali user sebagai authenticated
        login({
          id: user.id,
          name: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          nip: user.nip,
        });

        // Update RoleContext secara otomatis sesuai role dari PUPR-ID
        if (user.role) {
          setActiveRole(user.role as Role);
        }

        showToast(`Login SSO PUPR-ID Berhasil: Selamat datang, ${user.fullName} (${user.role})`, 'success');

        // Pengalihan ke Dashboard — gunakan window.location sebagai fallback jika navigate gagal
        setTimeout(() => {
          try {
            navigate('/', { replace: true });
          } catch {
            window.location.replace('/');
          }
        }, 1200);
      } catch (error) {
        console.error('SSO Process Error:', error);
        setStatusStep('error');
        setStatusMessage('Gagal memverifikasi token SSO PUPR-ID.');
        
        showToast('Autentikasi Gagal: Terjadi kesalahan saat memverifikasi SSO PUPR-ID.', 'error');

        setTimeout(() => {
          try {
            navigate('/auth/login', { replace: true });
          } catch {
            window.location.replace('/auth/login');
          }
        }, 2000);
      }
    };

    processSSO();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, navigate, setActiveRole, showToast, login]);

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <Card className="border border-pupr-blue/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-card">
        <div className="bg-gradient-to-r from-pupr-navy via-pupr-blue to-sky-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30">
            <Building className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">SSO PUPR-ID</h2>
          <p className="text-xs text-sky-100 mt-1 font-medium">Layanan Autentikasi Terpadu Kementrian / DPUPR</p>
        </div>

        <CardContent className="pt-6 pb-8 flex flex-col items-center justify-center space-y-5 px-6">
          {statusStep === 'verifying' && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-pupr-blue/20 border-t-pupr-blue animate-spin" />
                <ShieldCheck className="w-6 h-6 text-pupr-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Memproses Login SSO</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">{statusMessage}</p>
              </div>
            </div>
          )}

          {statusStep === 'success' && userData && (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Autentikasi Terverifikasi</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Menghubungkan ke Dashboard SIPEKA...</p>
                </div>
              </div>

              {/* User Identity Card */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-border/80 space-y-3">
                <div className="flex items-center gap-3.5">
                  <img 
                    src={userData.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
                    alt={userData.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-pupr-blue shadow-sm" 
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{userData.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">NIP: {userData.nip}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Instansi / Unit:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[200px]">{userData.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jabatan:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[200px]">{userData.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role SIPEKA:</span>
                    <span className="px-2 py-0.5 font-bold text-[10px] bg-pupr-blue/10 text-pupr-blue rounded-full">{userData.role}</span>
                  </div>
                </div>

                {userData.signedCertInfo && (
                  <div className="flex items-center justify-between text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-300 p-2 rounded-xl border border-amber-500/20">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Award size={13} className="text-amber-600" />
                      Sertifikat TTE ({userData.signedCertInfo.issuer})
                    </span>
                    <span className="font-bold text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-200">
                      {userData.signedCertInfo.status}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                <span>Mengalihkan dalam 1 detik</span>
                <ArrowRight size={12} className="animate-pulse" />
              </div>
            </div>
          )}

          {statusStep === 'error' && (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                !
              </div>
              <p className="text-sm font-semibold text-rose-600">{statusMessage}</p>
              <p className="text-xs text-slate-400">Mengembalikan ke halaman login...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
