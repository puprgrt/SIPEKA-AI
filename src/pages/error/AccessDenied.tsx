import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ShieldX, Lock, ArrowLeft, Home, UserCheck, MessageCircle, Send, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole, Role } from '@/contexts/RoleContext';
import { useToast } from '@/contexts/ToastContext';

interface AccessDeniedProps {
  moduleName?: string;
  allowedRoles?: string[];
}

export function AccessDenied({ moduleName, allowedRoles }: AccessDeniedProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRole, setActiveRole, availableRoles } = useRole();
  const { showToast } = useToast();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [targetRole, setTargetRole] = useState(allowedRoles?.[0] || 'Super Administrator');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const displayModule = moduleName || location.pathname;

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    showToast('Permohonan izin akses telah dikirimkan ke Admin SIPEKA DPUPR', 'success');
    setTimeout(() => {
      setShowRequestModal(false);
      setIsSubmitted(false);
      setRequestReason('');
    }, 1800);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Halo Layanan DPUPR Garut, saya mengajukan permohonan akses modul SIPEKA AI:\n` +
      `- Role Saya: ${activeRole}\n` +
      `- Modul: ${displayModule}\n` +
      `- Permohonan Role: ${targetRole}\n` +
      `- Alasan: ${requestReason || 'Dibutuhkan untuk tugas dinas'}`
    );
    window.open(`https://wa.me/6285117211173?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="w-full max-w-2xl text-center space-y-8">
        
        {/* Animated Badge & Lock Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 via-amber-500/20 to-pupr-blue/30 rounded-full blur-3xl opacity-70 animate-pulse pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-xl shadow-rose-500/10">
              <ShieldX size={40} className="animate-pulse" />
            </div>
            
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 backdrop-blur-md uppercase tracking-wider">
              Error Status 403 • Akses Dibatasi
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Akses Terbatas ke Modul Ini
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Role Anda saat ini (<span className="font-bold text-pupr-blue">{activeRole}</span>) tidak memiliki izin untuk membuka modul <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{displayModule}</span>.
          </p>
        </div>

        {/* Role & Access Info Card */}
        <div className="bg-white dark:bg-card rounded-2xl border border-border/70 p-5 shadow-lg max-w-md mx-auto text-left space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="text-xs text-slate-400 font-medium">Role Aktif Anda:</span>
            <span className="px-2.5 py-1 text-xs font-bold bg-pupr-blue/10 text-pupr-blue rounded-lg border border-pupr-blue/20">
              {activeRole}
            </span>
          </div>

          {allowedRoles && allowedRoles.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium block">Role yang diizinkan:</span>
              <div className="flex flex-wrap gap-1.5">
                {allowedRoles.map((role) => (
                  <span key={role} className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                    ✓ {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Role Switcher Demo Shortcut */}
          <div className="pt-2 border-t border-border/60">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Simulasi Ganti Role (Pengujian Demo):
            </label>
            <select
              value={activeRole}
              onChange={(e) => {
                setActiveRole(e.target.value as Role);
                showToast(`Role berhasil diubah ke: ${e.target.value}`, 'info');
              }}
              className="w-full h-9 bg-muted dark:bg-slate-800 border border-border rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 px-3 outline-none focus:ring-1 focus:ring-pupr-blue cursor-pointer"
              id="select-403-role-switch"
            >
              {availableRoles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name} ({role.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="h-11 px-5 rounded-2xl gap-2 text-xs font-semibold"
            id="btn-403-back"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </Button>

          <Button
            onClick={() => setShowRequestModal(true)}
            variant="pupr"
            className="h-11 px-5 rounded-2xl gap-2 text-xs font-semibold shadow-md shadow-pupr-blue/20"
            id="btn-403-request"
          >
            <ShieldAlert size={16} />
            <span>Ajukan Izin Akses</span>
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="h-11 px-5 rounded-2xl gap-2 text-xs font-semibold"
            id="btn-403-home"
          >
            <Home size={16} />
            <span>Dashboard</span>
          </Button>
        </div>

      </div>

      {/* Modal Form Ajukan Izin Akses */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-pupr-blue/10 text-pupr-blue flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Permohonan Hak Akses</h3>
                <p className="text-xs text-slate-400">Dinas PUPR Kabupaten Garut</p>
              </div>
            </div>

            {isSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Permohonan Terkirim</h4>
                <p className="text-xs text-slate-500">Administrator SIPEKA akan meninjau permohonan Anda dalam 1x24 jam.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Modul yang Diminta:</label>
                  <input
                    type="text"
                    disabled
                    value={displayModule}
                    className="w-full h-10 px-3 bg-muted rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 border border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Role Target:</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-medium border border-border text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {(allowedRoles || ['Super Administrator', 'Kepala Bidang', 'Reviewer Teknis']).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Alasan Kebutuhan Akses:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Jelaskan kebutuhan tugas dinas atau proyek..."
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl text-xs border border-border text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-pupr-blue resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleWhatsAppContact}
                    className="flex-1 h-10 text-xs font-semibold gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp DPUPR</span>
                  </Button>

                  <Button
                    type="submit"
                    variant="pupr"
                    className="flex-1 h-10 text-xs font-semibold gap-1.5"
                  >
                    <Send size={14} />
                    <span>Kirim Sistem</span>
                  </Button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
