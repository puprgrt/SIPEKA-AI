import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Timeline } from '@/components/ui/timeline';
import { Building2, AlertTriangle, CheckCircle2, Clock, Map as MapIcon, LineChart, Cuboid, Activity, ShieldCheck, FileText, Plus, MessageCircle, FileWarning, TrendingUp, BarChart3, Layers, BrainCircuit, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole } from '@/contexts/RoleContext';
import { useQuery } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const { activeRole } = useRole();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No token');
      
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  useEffect(() => {
    if (!['Super Administrator', 'Pengelola', 'Kepala Dinas', 'Kepala Bidang'].includes(activeRole) && activeTab === 'predictive') {
      setActiveTab('overview');
    }
  }, [activeRole, activeTab]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    ...(['Super Administrator', 'Pengelola', 'Kepala Dinas', 'Kepala Bidang'].includes(activeRole) ? [
      { id: 'predictive', label: 'Predictive Analytics', icon: LineChart },
    ] : []),
    { id: 'bim', label: 'BIM & Digital Twin', icon: Cuboid },
  ];

  // Timeline items based on role
  const getTimelineItems = () => {
    if (['Super Administrator', 'Kepala Dinas', 'Kepala Bidang'].includes(activeRole)) {
      return [
        { title: 'Laporan Selesai & Ditandatangani', description: 'SDN 1 Tarogong Kidul — BAP telah diverifikasi', time: '10 menit lalu', status: 'success' as const },
        { title: 'AI Risk Alert: Kritis', description: 'Struktur atap berpotensi ambruk di Balai Desa Sukamaju', time: '1 jam lalu', status: 'danger' as const },
        { title: 'Survey Dimulai', description: 'Puskesmas Cikajang (Tim A) — 3 komponen selesai', time: '2 jam lalu', status: 'info' as const },
        { title: 'Sinkronisasi Data Offline', description: '24 bangunan dari 3 tim surveyor disinkronisasi', time: '5 jam lalu', status: 'default' as const },
      ];
    } else if (activeRole === 'Pengelola') {
      return [
        { title: 'Permohonan Disetujui', description: 'Permohonan untuk Puskesmas Cikajang telah disetujui', time: '1 jam lalu', status: 'success' as const },
        { title: 'Jadwal Survei Ditetapkan', description: 'Tim survei akan datang ke SDN 1 Tarogong Kidul', time: '3 jam lalu', status: 'info' as const },
        { title: 'Permohonan Baru Terkirim', description: 'Anda mengajukan permohonan untuk Balai Desa', time: '1 hari lalu', status: 'default' as const },
        { title: 'Laporan Diterbitkan', description: 'Laporan final untuk SMPN 2 Garut tersedia', time: '3 hari lalu', status: 'success' as const },
      ];
    } else if (activeRole === 'Surveyor') {
      return [
        { title: 'Sinkronisasi Berhasil', description: 'Data inspeksi Balai Desa Sukamaju tersimpan', time: '10 menit lalu', status: 'success' as const },
        { title: 'Tugas Baru Ditugaskan', description: 'SDN 1 Tarogong Kidul — prioritas tinggi', time: '1 jam lalu', status: 'info' as const },
        { title: 'Draft Disimpan Lokal', description: 'Data sementara Puskesmas Cikajang tersimpan offline', time: '2 jam lalu', status: 'default' as const },
        { title: 'Peringatan Baterai', description: 'Baterai perangkat tinggal 15%', time: '3 jam lalu', status: 'warning' as const },
      ];
    }
    return [
      { title: 'AI Review Selesai', description: 'Hasil inspeksi Balai Desa Sukamaju siap direview', time: '15 menit lalu', status: 'success' as const },
      { title: 'Butuh Validasi', description: 'Data foto Puskesmas Cikajang tidak lengkap', time: '1 jam lalu', status: 'danger' as const },
      { title: 'Tugas Review Baru', description: 'SDN 1 Tarogong Kidul masuk ke antrean review', time: '2 jam lalu', status: 'info' as const },
      { title: 'Review Disetujui', description: 'SMPN 2 Garut diteruskan ke Kepala Bidang', time: '5 jam lalu', status: 'default' as const },
    ];
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* ── Hero Header ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-border/60 shadow-[var(--shadow-sm)]">
        {/* Blueprint grid background */}
        <div className="absolute inset-0 bg-blueprint pointer-events-none" />
        {/* Decorative gradient orbs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-pupr-blue/5 dark:bg-pupr-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-16 w-48 h-48 bg-garut-green/5 dark:bg-garut-green/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Command Center
              </h1>
              <Badge variant="pupr" className="text-[10px]">
                <ShieldCheck size={12} className="mr-1" />
                {activeRole}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg">
              {activeRole === 'Pengelola' 
                ? 'Pantau status permohonan penilaian kondisi bangunan instansi Anda.'
                : 'Pemantauan real-time kondisi bangunan gedung & Decision Support Platform.'}
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 dark:text-slate-500">
              <Calendar size={13} />
              <span className="font-mono" data-mono>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {activeRole !== 'Pengelola' && (
              <Button variant="pupr" onClick={() => navigate('/report')} className="shadow-md shadow-pupr-blue/15">
                <FileText size={16} />
                Laporan Eksekutif
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-pupr-blue text-white shadow-md shadow-pupr-blue/20"
                : "bg-white dark:bg-card text-slate-500 dark:text-slate-400 hover:bg-muted dark:hover:bg-slate-800 border border-border/60"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="space-y-6 pb-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <div className="animate-slide-up">
                <StatCard
                  title={activeRole === 'Pengelola' ? 'Bangunan Dikelola' : activeRole === 'Surveyor' ? 'Total Penugasan' : activeRole === 'Reviewer Teknis' ? 'Menunggu Review' : 'Total Bangunan'}
                  value={stats?.totalBuildings || 3245}
                  icon={activeRole === 'Surveyor' ? FileText : activeRole === 'Reviewer Teknis' ? Clock : Building2}
                  trend={activeRole === 'Pengelola' || activeRole === 'Surveyor' || activeRole === 'Reviewer Teknis' ? undefined : { value: '12%', positive: true }}
                  subtitle={activeRole === 'Pengelola' ? 'Terdaftar di sistem' : activeRole === 'Surveyor' ? 'Bulan ini' : activeRole === 'Reviewer Teknis' ? 'Perlu tindakan' : 'dari tahun lalu'}
                  accentColor="blue"
                />
              </div>
              <div className="animate-slide-up delay-100">
                <StatCard
                  title={activeRole === 'Pengelola' ? 'Permohonan Aktif' : activeRole === 'Surveyor' ? 'Survei Aktif' : activeRole === 'Reviewer Teknis' ? 'Review Aktif' : 'Sedang Disurvei'}
                  value={stats?.activeSurveys || 124}
                  icon={activeRole === 'Surveyor' || activeRole === 'Reviewer Teknis' ? Activity : Clock}
                  subtitle={activeRole === 'Pengelola' ? 'Menunggu jadwal survey' : activeRole === 'Surveyor' ? 'Sedang berjalan' : activeRole === 'Reviewer Teknis' ? 'Dalam proses review' : 'Tersebar di 8 kecamatan'}
                  accentColor="amber"
                />
              </div>
              <div className="animate-slide-up delay-200">
                <StatCard
                  title={activeRole === 'Pengelola' ? 'Perlu Perbaikan' : activeRole === 'Surveyor' ? 'Belum Sinkronisasi' : activeRole === 'Reviewer Teknis' ? 'Butuh Validasi Lapangan' : 'Kerusakan Berat'}
                  value={stats?.criticalDamage || 58}
                  icon={activeRole === 'Surveyor' ? FileWarning : AlertTriangle}
                  trend={{ value: activeRole === 'Surveyor' ? 'Perlu Koneksi' : 'Prioritas Tinggi', positive: false }}
                  accentColor="red"
                />
              </div>
              <div className="animate-slide-up delay-300">
                <StatCard
                  title={activeRole === 'Pengelola' ? 'Riwayat Permohonan' : activeRole === 'Surveyor' ? 'Survei Selesai' : activeRole === 'Reviewer Teknis' ? 'Selesai Direview' : 'Selesai Diperbaiki'}
                  value={stats?.completedReports || 892}
                  icon={CheckCircle2}
                  subtitle={activeRole === 'Pengelola' ? 'Sejak 2024' : activeRole === 'Surveyor' ? 'Telah disinkronisasi' : activeRole === 'Reviewer Teknis' ? 'Bulan ini' : 'Tahun anggaran 2026'}
                  accentColor="green"
                />
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left: Map or Task List */}
              <div className="lg:col-span-2 space-y-5">
                {['Super Administrator', 'Kepala Dinas', 'Kepala Bidang'].includes(activeRole) ? (
                  /* GIS Command Center Card */
                  <Card className="h-[420px] flex flex-col relative overflow-hidden animate-slide-up">
                    {/* Blueprint pattern background */}
                    <div className="absolute inset-0 bg-blueprint opacity-60" />
                    <CardHeader className="relative z-10 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border/40 pb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <MapIcon size={16} className="text-pupr-blue" />
                            Risk Matrix & Heatmap
                          </CardTitle>
                          <CardDescription>Distribusi Spasial Kerusakan Bangunan</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate('/gis')} className="gap-1.5">
                          Buka GIS
                          <ArrowRight size={14} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10 flex-1 p-0 flex items-center justify-center">
                      <div className="text-center p-8 bg-white/60 dark:bg-card/60 backdrop-blur-xl rounded-2xl shadow-sm border border-border/40 max-w-sm mx-4">
                        <div className="w-14 h-14 bg-pupr-blue-50 dark:bg-pupr-blue/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <MapIcon size={28} className="text-pupr-blue" />
                        </div>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">GIS Command Center</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          Sistem menampilkan cluster kerusakan tinggi di wilayah selatan Garut.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Task / Request List */
                  <Card className="h-[420px] flex flex-col animate-slide-up">
                    <CardHeader className="pb-3 border-b border-border/40">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Layers size={16} className="text-pupr-blue" />
                            {activeRole === 'Pengelola' ? 'Daftar Permohonan Terbaru' : 
                             activeRole === 'Surveyor' ? 'Jadwal Survei Hari Ini' : 
                             'Antrean Review'}
                          </CardTitle>
                          <CardDescription>
                            {activeRole === 'Pengelola' ? 'Status permohonan penilaian kondisi bangunan.' : 
                             activeRole === 'Surveyor' ? 'Daftar penugasan lapangan yang harus diselesaikan.' : 
                             'Daftar hasil survei yang perlu direview.'}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate(activeRole === 'Pengelola' ? '/survey' : activeRole === 'Surveyor' ? '/survey' : '/assessment')} className="text-pupr-blue gap-1.5">
                          Lihat Semua
                          <ArrowRight size={14} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                      <div className="divide-y divide-border/40">
                        {(stats?.recentList?.length ? stats.recentList : [1, 2, 3, 4]).map((i: any, index: number) => (
                          <div key={typeof i === 'object' ? i.id || index : index} className="p-4 hover:bg-muted/50 dark:hover:bg-slate-800/30 transition-colors flex items-center justify-between group cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-pupr-blue-50 dark:bg-pupr-blue/15 flex items-center justify-center text-pupr-blue shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                <Building2 size={18} />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                                  {activeRole === 'Pengelola' ? `${typeof i === 'object' && i.buildingName ? i.buildingName : `Bangunan ${index + 1}`}` : 
                                   activeRole === 'Surveyor' ? `Inspeksi ${typeof i === 'object' && i.buildingName ? i.buildingName : `Bangunan ${index + 1}`}` : 
                                   `Review Teknis ${typeof i === 'object' && i.buildingName ? i.buildingName : `Bangunan ${index + 1}`}`}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {activeRole === 'Pengelola' ? 'Diajukan 2 hari yang lalu' : 
                                   activeRole === 'Surveyor' ? 'Target selesai: Hari ini, 15:00 WIB' : 
                                   'Survei selesai 1 hari yang lalu oleh Tim A'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Badge variant={index === 0 ? 'pupr' : index === 1 ? 'warning' : index === 2 ? 'success' : 'outline'}>
                                {index === 0 ? (activeRole === 'Surveyor' ? 'Sedang Berjalan' : activeRole === 'Reviewer Teknis' ? 'Review Aktif' : 'Menunggu Jadwal') : 
                                 index === 1 ? (activeRole === 'Surveyor' ? 'Belum Mulai' : activeRole === 'Reviewer Teknis' ? 'Butuh Klarifikasi' : 'Draft') : 
                                 index === 2 ? 'Selesai' : 'Arsip'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Insight Card */}
                {['Super Administrator', 'Kepala Dinas', 'Kepala Bidang'].includes(activeRole) && (
                  <div className="glass rounded-2xl p-5 border border-border/40 animate-slide-up delay-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pupr-blue to-sky-blue flex items-center justify-center shrink-0 shadow-sm">
                        <BrainCircuit size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          SIPEKA AI Insight
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          Berdasarkan analisis <strong className="text-slate-800 dark:text-white">3.245 bangunan</strong>, ditemukan <strong className="text-danger">58 bangunan</strong> dengan kerusakan berat yang memerlukan tindakan segera.  Cluster terbesar berada di Kecamatan Bungbulang dan Pameungpeuk.
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Button variant="outline" size="sm" onClick={() => navigate('/ai-review')} className="gap-1.5 text-pupr-blue border-pupr-blue/20 hover:bg-pupr-blue-50 dark:hover:bg-pupr-blue/10">
                            <BrainCircuit size={14} />
                            Lihat Detail
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate('/gis')} className="gap-1.5">
                            <MapIcon size={14} />
                            Lihat di Peta
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Activity Timeline */}
              <div className="space-y-5">
                <Card className="h-full flex flex-col animate-slide-up delay-100">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity size={16} className="text-pupr-blue" />
                      {['Super Administrator', 'Kepala Dinas', 'Kepala Bidang'].includes(activeRole) ? 'Executive Timeline' : 
                       activeRole === 'Pengelola' ? 'Riwayat Update' : 'Aktivitas Terbaru'}
                    </CardTitle>
                    <CardDescription>
                      {['Super Administrator', 'Kepala Dinas', 'Kepala Bidang'].includes(activeRole) ? 'Aktivitas sistem & AI Alerts' : 
                       'Update status terbaru'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5 flex-1 overflow-y-auto custom-scrollbar">
                    <Timeline items={getTimelineItems()} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictive' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6">
            <Card className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center animate-slide-up">
              <div className="w-16 h-16 bg-pupr-blue-50 dark:bg-pupr-blue/15 rounded-2xl flex items-center justify-center text-pupr-blue mb-5">
                <LineChart size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Predictive Analytics</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed">
                Model AI sedang memprediksi penurunan kondisi komponen (degradation curve) berdasarkan usia bangunan dan material untuk 5 tahun ke depan.
              </p>
            </Card>
            <Card className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center animate-slide-up delay-100">
              <div className="w-16 h-16 bg-garut-green-50 dark:bg-garut-green/15 rounded-2xl flex items-center justify-center text-garut-green mb-5">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Budget Planning</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed">
                Estimasi kebutuhan biaya rehabilitasi untuk Tahun Anggaran 2027 berdasarkan rekomendasi perbaikan dan standar harga satuan.
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'bim' && (
          <div className="pb-6">
            <Card className="h-[600px] flex flex-col bg-slate-900 text-slate-100 overflow-hidden relative animate-scale-in">
              {/* Background */}
              <div className="absolute inset-0 bg-blueprint" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
              
              <CardHeader className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Cuboid size={16} className="text-sky-blue" />
                      BIM Integration & Digital Twin
                    </CardTitle>
                    <CardDescription className="text-slate-400">Representasi digital 3D Puskesmas Cikajang</CardDescription>
                  </div>
                  <Badge variant="info" className="bg-sky-blue/15 text-sky-blue-light border-sky-blue/30">IFC Model Loaded</Badge>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 flex-1 p-6 flex items-center justify-center">
                <div className="text-center space-y-5 max-w-lg">
                  <div className="w-24 h-24 rounded-2xl border border-sky-blue/20 bg-sky-blue/10 flex items-center justify-center mx-auto">
                    <Cuboid size={40} className="text-sky-blue animate-float" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Digital Twin Workspace</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                    Sistem dapat memuat model IFC (Industry Foundation Classes) dan memetakan data inspeksi secara visual langsung ke dalam elemen 3D bangunan. 
                  </p>
                  <div className="pt-2 flex gap-3 justify-center">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/10">
                      Isolasi Komponen Rusak
                    </Button>
                    <Button variant="pupr" className="shadow-lg shadow-pupr-blue/30">
                      Tampilkan Heatmap 3D
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ── Floating Action Button ──────────────────────────────── */}
      <div className="fixed bottom-24 right-6 z-40">
        {/* FAB Menu */}
        <div className={cn(
          "flex flex-col items-end gap-2 absolute bottom-16 right-0 transition-all duration-300",
          isFabOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible pointer-events-none'
        )}>
          <Button
            variant="outline"
            className="flex items-center gap-3 bg-white dark:bg-card hover:bg-muted text-slate-700 dark:text-slate-200 shadow-lg border-border/60 rounded-2xl py-5 pl-4 pr-2 font-medium min-w-[240px] justify-between group"
            onClick={() => {
              window.open('https://wa.me/6285117211173?text=Halo%20Layanan%20Publik%20DPUPR%20Kab.%20Garut', '_blank');
              setIsFabOpen(false);
            }}
          >
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">WA Pelayanan Publik</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono" data-mono>085117211173</span>
            </div>
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <MessageCircle size={18} />
            </div>
          </Button>
          
          <Button
            variant="outline" 
            className="flex items-center gap-3 bg-white dark:bg-card hover:bg-muted text-slate-700 dark:text-slate-200 shadow-lg border-border/60 rounded-2xl py-5 pl-4 pr-2 font-medium min-w-[240px] justify-between group"
            onClick={() => {
              navigate('/survey');
              setIsFabOpen(false);
            }}
          >
            <span className="text-sm">Self-Assessment Mandiri</span>
            <div className="w-9 h-9 bg-warning rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <FileWarning size={18} />
            </div>
          </Button>
        </div>
        
        {/* Main FAB */}
        <Button
          className={cn(
            "relative z-10 w-12 h-12 rounded-2xl shadow-lg shadow-pupr-blue/20 bg-pupr-blue hover:bg-pupr-blue-light text-white flex items-center justify-center transition-all duration-300",
            isFabOpen ? 'rotate-45 bg-slate-700 hover:bg-slate-600 shadow-slate-700/20' : 'rotate-0'
          )}
          onClick={() => setIsFabOpen(!isFabOpen)}
        >
          <Plus size={22} />
        </Button>
      </div>
    </div>
  );
}
