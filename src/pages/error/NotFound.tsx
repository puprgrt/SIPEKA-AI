import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Compass, AlertCircle, FileText, Map, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-3xl text-center space-y-8">
        
        {/* Animated Badge & Hero Graphic */}
        <div className="relative inline-block">
          {/* Glass background blur */}
          <div className="absolute inset-0 bg-gradient-to-r from-pupr-blue/30 via-sky-500/20 to-amber-500/20 rounded-full blur-3xl opacity-70 animate-pulse pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-pupr-blue/10 text-pupr-blue border border-pupr-blue/20 backdrop-blur-md uppercase tracking-wider mb-4">
              Error Status 404
            </span>
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pupr-navy via-pupr-blue to-sky-500 dark:from-white dark:via-sky-400 dark:to-pupr-blue tracking-tighter leading-none select-none">
              404
            </h1>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Maaf, halaman atau modul <span className="font-mono text-pupr-blue font-semibold">{window.location.pathname}</span> yang Anda cari tidak tersedia, telah dipindahkan, atau rutenya tidak valid.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="h-12 px-6 rounded-2xl gap-2 font-semibold border-border/80 hover:bg-muted shadow-sm transition-all"
            id="btn-notfound-back"
          >
            <ArrowLeft size={18} />
            <span>Kembali ke Halaman Sebelumnya</span>
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="pupr"
            className="h-12 px-6 rounded-2xl gap-2 font-semibold shadow-lg shadow-pupr-blue/25 transition-all"
            id="btn-notfound-home"
          >
            <Home size={18} />
            <span>Kembali ke Dashboard Utama</span>
          </Button>
        </div>

        {/* Quick Navigation Cards */}
        <div className="pt-8 border-t border-border/60 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            Atau akses modul populer SIPEKA:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              to="/survey-list"
              className="p-3.5 rounded-2xl bg-white dark:bg-card border border-border/60 hover:border-pupr-blue/50 hover:shadow-md transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-pupr-blue flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Compass size={16} />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-pupr-blue">Survey Lapangan</p>
              <p className="text-[10px] text-slate-400">Daftar inspeksi gedung</p>
            </Link>

            <Link
              to="/assessment"
              className="p-3.5 rounded-2xl bg-white dark:bg-card border border-border/60 hover:border-pupr-blue/50 hover:shadow-md transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <AlertCircle size={16} />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">Assessment</p>
              <p className="text-[10px] text-slate-400">Penilaian kerusakan</p>
            </Link>

            <Link
              to="/gis"
              className="p-3.5 rounded-2xl bg-white dark:bg-card border border-border/60 hover:border-pupr-blue/50 hover:shadow-md transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Map size={16} />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600">Peta GIS</p>
              <p className="text-[10px] text-slate-400">Peta sebaran lokasi</p>
            </Link>

            <Link
              to="/report"
              className="p-3.5 rounded-2xl bg-white dark:bg-card border border-border/60 hover:border-pupr-blue/50 hover:shadow-md transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FileText size={16} />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600">Laporan Final</p>
              <p className="text-[10px] text-slate-400">Dokumen terverifikasi</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
