import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardGlass, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LeafletMap } from '@/components/ui/LeafletMap';
import { 
  ClipboardList, 
  MapPin, 
  Camera, 
  WifiOff, 
  Wifi,
  UploadCloud, 
  CheckCircle2, 
  BrainCircuit, 
  ShieldCheck, 
  ListTodo, 
  Users,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Download,
  AlertTriangle,
  Search,
  Compass,
  Layers,
  FileText,
  Sparkles,
  Mic,
  ExternalLink,
  Eye,
  SlidersHorizontal,
  Trash2,
  CheckSquare,
  ArrowRight,
  Clock,
  Radio,
  FileCheck,
  Send,
  Building2,
  Maximize2,
  QrCode,
  Scan,
  X,
  Wrench,
  History
} from 'lucide-react';
import { QRCodeScannerModal, ScannedBuildingData, font_sample_buildings } from '@/components/survey/QRCodeScannerModal';
import { EvidenceGallery } from '@/components/survey/EvidenceGallery';
import { QRCodeSVG } from 'qrcode.react';

// Sample Field Assignments Data
interface FieldAssignment {
  id: string;
  buildingName: string;
  instansi: string;
  kecamatan: string;
  surveyor: string;
  priority: 'Urgent' | 'Normal' | 'Rutin';
  status: 'Belum Mulai' | 'Sedang Berlangsung' | 'Selesai Lapangan' | 'Tersinkron';
  targetDate: string;
  distanceMeter: number;
  progressPercent: number;
  lat: number;
  lng: number;
}

const INITIAL_ASSIGNMENTS: FieldAssignment[] = [
  {
    id: 'TSK-2026-001',
    buildingName: 'Puskesmas DTP Cikajang',
    instansi: 'Dinas Kesehatan Kab. Garut',
    kecamatan: 'Cikajang',
    surveyor: 'Ir. Hendra Pratama',
    priority: 'Urgent',
    status: 'Sedang Berlangsung',
    targetDate: '2026-08-02',
    distanceMeter: 28,
    progressPercent: 65,
    lat: -7.3245,
    lng: 107.7891,
  },
  {
    id: 'TSK-2026-002',
    buildingName: 'SDN 1 Tarogong Kidul',
    instansi: 'Dinas Pendidikan Kab. Garut',
    kecamatan: 'Tarogong Kidul',
    surveyor: 'Budi Santoso, ST',
    priority: 'Normal',
    status: 'Belum Mulai',
    targetDate: '2026-08-03',
    distanceMeter: 1420,
    progressPercent: 0,
    lat: -7.2028,
    lng: 107.8824,
  },
  {
    id: 'TSK-2026-003',
    buildingName: 'Pasar Rakyat Wanaraja',
    instansi: 'Disperindag Kab. Garut',
    kecamatan: 'Wanaraja',
    surveyor: 'Dedin Kusnadi, A.Md',
    priority: 'Rutin',
    status: 'Selesai Lapangan',
    targetDate: '2026-08-01',
    distanceMeter: 5400,
    progressPercent: 100,
    lat: -7.1852,
    lng: 107.9712,
  },
  {
    id: 'TSK-2026-004',
    buildingName: 'Gedung Serbaguna Cisurupan',
    instansi: 'Kecamatan Cisurupan',
    kecamatan: 'Cisurupan',
    surveyor: 'Ir. Hendra Pratama',
    priority: 'Urgent',
    status: 'Belum Mulai',
    targetDate: '2026-08-04',
    distanceMeter: 890,
    progressPercent: 0,
    lat: -7.3112,
    lng: 107.7944,
  }
];

export function SurveyWorkspace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(true);
  const [assignments, setAssignments] = useState<FieldAssignment[]>(INITIAL_ASSIGNMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(2);

  // GPS state
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; acc: number } | null>({
    lat: -7.3245,
    lng: 107.7891,
    acc: 3.5
  });
  const [isGettingGps, setIsGettingGps] = useState(false);

  // New Assignment Form State
  const [showNewAssignmentModal, setShowNewAssignmentModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    buildingName: '',
    instansi: '',
    kecamatan: '',
    surveyor: 'Ir. Hendra Pratama',
    priority: 'Normal' as 'Urgent' | 'Normal' | 'Rutin',
    targetDate: new Date().toISOString().split('T')[0]
  });

  // AI Field Assistant State
  const [aiScanImage, setAiScanImage] = useState<string | null>(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<{ damageLevel: string; percentage: number; component: string; recommendation: string } | null>(null);

  // Camera Geotag State
  const [geotagPhoto, setGeotagPhoto] = useState<string | null>(null);
  const [photoNote, setPhotoNote] = useState('');

  // QR Code Scanner Modal State
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [selectedBuildingFromQr, setSelectedBuildingFromQr] = useState<ScannedBuildingData | null>(null);

  // QR Generator State
  const [qrGenBuildingId, setQrGenBuildingId] = useState<string>(Object.keys(font_sample_buildings)[0]);
  const [qrGenSize, setQrGenSize] = useState(250);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSyncData = () => {
    if (!isOnline) {
      showToast('⚠️ Gagal sinkronisasi: Koneksi internet offline. Aktifkan mode online.');
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setPendingSyncCount(0);
      setAssignments(prev => prev.map(a => a.status === 'Selesai Lapangan' ? { ...a, status: 'Tersinkron' } : a));
      showToast('✅ Berhasil menyinkronkan 2 data survei & 14 foto ke server PUPR!');
    }, 1800);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.buildingName || !newAssignment.instansi) {
      showToast('Mohon lengkapi nama bangunan dan instansi.');
      return;
    }
    const created: FieldAssignment = {
      id: `TSK-2026-00${assignments.length + 1}`,
      buildingName: newAssignment.buildingName,
      instansi: newAssignment.instansi,
      kecamatan: newAssignment.kecamatan || 'Garut Kota',
      surveyor: newAssignment.surveyor,
      priority: newAssignment.priority,
      status: 'Belum Mulai',
      targetDate: newAssignment.targetDate,
      distanceMeter: 500,
      progressPercent: 0,
      lat: -7.2100,
      lng: 107.9000
    };
    setAssignments([created, ...assignments]);
    setShowNewAssignmentModal(false);
    setNewAssignment({
      buildingName: '',
      instansi: '',
      kecamatan: '',
      surveyor: 'Ir. Hendra Pratama',
      priority: 'Normal',
      targetDate: new Date().toISOString().split('T')[0]
    });
    showToast(`Penerbitan Surat Tugas ${created.id} Berhasil!`);
  };

  const handleGetLiveLocation = () => {
    setIsGettingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            acc: Number(pos.coords.accuracy.toFixed(1))
          });
          setIsGettingGps(false);
          showToast('Koordinat GPS presisi tinggi berhasil diperbarui!');
        },
        () => {
          setIsGettingGps(false);
          // Fallback location inside Garut Regency
          setGpsCoords({ lat: -7.2144, lng: 107.9015, acc: 4.2 });
          showToast('GPS diperbarui (Mode Simulasi Garut Kota).');
        },
        { timeout: 5000 }
      );
    } else {
      setIsGettingGps(false);
      showToast('Geolocation API tidak didukung browser.');
    }
  };

  const handleAiScan = () => {
    setIsAiScanning(true);
    setAiResult(null);
    setTimeout(() => {
      setIsAiScanning(false);
      setAiResult({
        damageLevel: 'Rusak Sedang (Kerusakan Struktur Sedang)',
        percentage: 38.5,
        component: 'Kolom Utama Beton K-250 & Dinding Bata',
        recommendation: 'Injeksi semen epoksi pada retakan diagonal, perkuatan jacketing kolom beton sebelum penggunaan gedung kembali.'
      });
      showToast('Analisis AI Lapangan PUPR selesai!');
    }, 2000);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Surveyor', icon: ClipboardList },
    { id: 'evidence', label: 'Galeri Bukti & AI Retak', icon: ImageIcon, badge: 5 },
    { id: 'assignments', label: 'Penugasan Tim', icon: Users, badge: assignments.length },
    { id: 'qr', label: 'Pindai Tag QR Gedung', icon: QrCode },
    { id: 'qr-generator', label: 'Generator Tag QR', icon: QrCode },
    { id: 'inspection', label: 'Inspeksi & Checklist', icon: ListTodo },
    { id: 'location', label: 'GPS & Geofence', icon: MapPin },
    { id: 'camera', label: 'Kamera & Geotag', icon: Camera },
    { id: 'offline', label: 'Sync & Offline', icon: isOnline ? Wifi : WifiOff, alert: pendingSyncCount > 0 },
    { id: 'ai', label: 'AI Assistant', icon: BrainCircuit },
  ];

  const filteredAssignments = assignments.filter(a => 
    a.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.instansi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.kecamatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-pupr-blue uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-pupr-blue/20">
              PUPR Field Inspection Engine
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
              isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Terhubung Online' : 'Mode Offline Field'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Workspace Inspeksi Lapangan</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Sistem pengumpulan data fisik & teknis bangunan gedung PUPR offline-first, presisi GPS, dan geotagging resmi.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowQrScannerModal(true)}
            className="text-xs bg-amber-50/80 border-amber-300 text-amber-900 font-bold hover:bg-amber-100 shadow-xs"
          >
            <QrCode size={15} className="mr-1.5 text-pupr-blue" />
            Pindai QR Tag Gedung
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsOnline(!isOnline)}
            className="text-xs bg-slate-50 border-slate-300"
          >
            {isOnline ? <WifiOff size={14} className="mr-1.5 text-amber-600" /> : <Wifi size={14} className="mr-1.5 text-emerald-600" />}
            {isOnline ? 'Simulasi Offline' : 'Aktifkan Online'}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSyncData}
            disabled={isSyncing}
            className="text-xs bg-white dark:bg-slate-900 border-pupr-blue/30 text-pupr-blue"
          >
            <RefreshCw size={14} className={`mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {pendingSyncCount > 0 ? `Sync Data (${pendingSyncCount})` : 'Sync Lapangan'}
          </Button>

          <Button 
            variant="pupr" 
            size="sm"
            onClick={() => navigate('/survey/new')}
            className="text-xs shadow-sm"
          >
            <Plus size={15} className="mr-1.5" />
            Mulai Survey Baru
          </Button>
        </div>
      </div>

      {/* Active Scanned QR Building Banner */}
      {selectedBuildingFromQr && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pupr-blue/40 text-pupr-yellow rounded-xl border border-pupr-blue/50 shrink-0">
              <QrCode size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-400 font-mono">[{selectedBuildingFromQr.tagId}]</span>
                <h3 className="text-sm font-bold text-white">{selectedBuildingFromQr.buildingName}</h3>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-[10px]">
                  Maintenance Record Active
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedBuildingFromQr.instansi} • {selectedBuildingFromQr.kecamatan} | Kondisi: <strong className="text-amber-300">{selectedBuildingFromQr.damageStatus} ({selectedBuildingFromQr.damagePercentage}%)</strong> | Status: {selectedBuildingFromQr.maintenanceStatus}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowQrScannerModal(true)}
              className="text-xs h-8 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            >
              <Eye size={13} className="mr-1 text-pupr-blue" /> Inspeksi Histori Record
            </Button>
            <Button 
              size="sm" 
              variant="pupr" 
              onClick={() => {
                showToast(`Membuka Form Survei untuk ${selectedBuildingFromQr.buildingName}...`);
                navigate('/survey/new');
              }}
              className="text-xs h-8 font-bold"
            >
              Mulai Survey <ArrowRight size={13} className="ml-1" />
            </Button>
            <button 
              onClick={() => setSelectedBuildingFromQr(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Navigation & Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Vertical Tabs */}
        <div className="w-full lg:w-64 space-y-1.5 shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-pupr-blue text-white shadow-md font-bold'
                    : 'bg-white dark:bg-card text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-border/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                </div>

                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white dark:bg-slate-900/20 text-white' : 'bg-slate-100 text-slate-600 dark:text-slate-400 border border-slate-200'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>
            );
          })}

          {/* Device GPS Quick Card */}
          <Card className="mt-4 border-slate-200/80 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio size={13} className="text-emerald-400 animate-pulse" /> Geolocation Sensor
              </span>
              <span className="text-[10px] font-mono text-emerald-400">+/- {gpsCoords?.acc}m</span>
            </div>
            <div className="text-[11px] font-mono space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-700/60">
              <div className="flex justify-between">
                <span className="text-slate-400">LAT:</span>
                <span className="text-emerald-300 font-bold">{gpsCoords?.lat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">LNG:</span>
                <span className="text-emerald-300 font-bold">{gpsCoords?.lng}</span>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleGetLiveLocation}
              disabled={isGettingGps}
              className="w-full text-[11px] h-8 bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
            >
              <Compass size={13} className={`mr-1.5 ${isGettingGps ? 'animate-spin text-pupr-yellow' : ''}`} />
              {isGettingGps ? 'Mendeteksi...' : 'Update Presisi GPS'}
            </Button>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* TAB 1: DASHBOARD SURVEYOR */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 border-slate-200/80 shadow-xs bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Tugas Hari Ini</span>
                    <div className="p-2 bg-blue-50 text-pupr-blue rounded-lg">
                      <ClipboardList size={18} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">4</div>
                  <span className="text-[11px] text-emerald-600 font-medium">2 Lokasi Terdekat</span>
                </Card>

                <Card className="p-4 border-slate-200/80 shadow-xs bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Selesai Inspeksi</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">12</div>
                  <span className="text-[11px] text-slate-500">Minggu Ini</span>
                </Card>

                <Card className="p-4 border-slate-200/80 shadow-xs bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Pending Sync</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <WifiOff size={18} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">{pendingSyncCount}</div>
                  <span className="text-[11px] text-amber-600 font-semibold">Siap Diunggah</span>
                </Card>

                <Card className="p-4 border-slate-200/80 shadow-xs bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Akurasi GPS</span>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Radio size={18} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">{gpsCoords?.acc}m</div>
                  <span className="text-[11px] text-emerald-600 font-medium">Kualitas Baik</span>
                </Card>
              </div>

              {/* Active Assignments List */}
              <CardGlass className="border-0 shadow-sm">
                <CardHeader className="border-b border-border/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold">Daftar Penugasan Lapangan Hari Ini</CardTitle>
                    <CardDescription className="text-xs">Target inspeksi fisik & penilaian tingkat kerusakan gedung PUPR</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64 group">
                    <Search className="absolute left-3.5 top-2.5 text-slate-400 group-focus-within:text-pupr-blue transition-colors" size={14} />
                    <Input 
                      placeholder="Cari gedung / instansi..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 text-xs h-9 bg-muted dark:bg-slate-800 border-transparent focus-visible:border-pupr-blue/40 transition-all rounded-xl"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0 divide-y divide-slate-100">
                  {filteredAssignments.map(task => (
                    <div key={task.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">{task.buildingName}</span>
                          <Badge variant="outline" className={`text-[10px] font-bold ${
                            task.priority === 'Urgent' ? 'bg-red-50 text-red-600 border-red-200' :
                            task.priority === 'Normal' ? 'bg-blue-50 text-pupr-blue border-blue-200' :
                            'bg-slate-100 text-slate-600 dark:text-slate-400 border-slate-200'
                          }`}>
                            {task.priority}
                          </Badge>
                          <span className="text-[11px] text-slate-400 font-mono">#{task.id}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 size={13} className="text-slate-400" /> {task.instansi}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" /> {task.kecamatan} ({task.distanceMeter}m)
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={13} className="text-slate-400" /> {task.surveyor}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="flex items-center gap-3 pt-1">
                          <div className="flex-1 max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-pupr-blue h-full rounded-full transition-all" style={{ width: `${task.progressPercent}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{task.progressPercent}%</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setActiveTab('location');
                            setGpsCoords({ lat: task.lat, lng: task.lng, acc: 3.5 });
                          }}
                          className="text-xs h-8 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border-slate-300"
                        >
                          <MapPin size={13} className="mr-1 text-pupr-blue" />
                          GPS Rute
                        </Button>
                        <Button 
                          variant="pupr" 
                          size="sm"
                          onClick={() => navigate('/survey/new')}
                          className="text-xs h-8 shadow-xs"
                        >
                          {task.progressPercent > 0 ? 'Lanjutkan Inspeksi' : 'Mulai Inspeksi'}
                          <ArrowRight size={13} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CardGlass>

              {/* Field Activity Feed */}
              <Card className="border-0 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-pupr-blue" />
                    Log Logistik & Activity Surveyor Terkini
                  </h3>
                  <span className="text-xs text-slate-500">Live Updating</span>
                </div>

                <div className="space-y-3">
                  {[
                    { time: '10:42 AM', user: 'Ir. Hendra Pratama', act: 'Mengambil 4 foto geotagged komponen struktur Puskesmas Cikajang', icon: Camera, color: 'text-blue-600 bg-blue-50' },
                    { time: '09:15 AM', user: 'Budi Santoso, ST', act: 'Menyelesaikan verifikasi elevasi pondasi di SDN 1 Tarogong', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                    { time: '08:30 AM', user: 'Sistem SIPEKA', act: 'Menerbitkan 3 Surat Tugas Inspeksi Khusus Bangunan Pendidikan', icon: FileCheck, color: 'text-pupr-blue bg-blue-50' },
                  ].map((log, idx) => {
                    const LogIcon = log.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <div className={`p-1.5 rounded-lg shrink-0 ${log.color}`}>
                          <LogIcon size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{log.user}</p>
                          <p className="text-slate-600 dark:text-slate-400">{log.act}</p>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">{log.time}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: EVIDENCE GALLERY & AI RETAK */}
          {activeTab === 'evidence' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <EvidenceGallery />
            </div>
          )}

          {/* TAB 3: PENUGASAN TIM */}
          {activeTab === 'assignments' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Penugasan Tim & Surat Tugas Inspeksi</h3>
                  <p className="text-xs text-slate-500">Pengaturan personel surveyor dan legitimasi inspeksi resmi PUPR</p>
                </div>
                <Button 
                  variant="pupr" 
                  size="sm"
                  onClick={() => setShowNewAssignmentModal(true)}
                  className="text-xs"
                >
                  <Plus size={14} className="mr-1.5" /> Penerbitan Surat Tugas Baru
                </Button>
              </div>

              {/* Assignments Table Card */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-5">No. Surat Tugas</th>
                        <th className="p-3.5">Bangunan Target</th>
                        <th className="p-3.5">Ketua Tim Surveyor</th>
                        <th className="p-3.5">Prioritas</th>
                        <th className="p-3.5">Batas Waktu</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 pr-5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assignments.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="p-3.5 pl-5 font-mono font-bold text-pupr-blue">{item.id}</td>
                          <td className="p-3.5 font-semibold text-slate-900">
                            <div>{item.buildingName}</div>
                            <div className="text-[11px] font-normal text-slate-500">{item.instansi}</div>
                          </td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300">{item.surveyor}</td>
                          <td className="p-3.5">
                            <Badge variant="outline" className={`text-[10px] font-bold ${
                              item.priority === 'Urgent' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-pupr-blue border-blue-200'
                            }`}>
                              {item.priority}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">{item.targetDate}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Selesai Lapangan' || item.status === 'Tersinkron'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'Sedang Berlangsung'
                                  ? 'bg-blue-50 text-pupr-blue border border-blue-200'
                                  : 'bg-slate-100 text-slate-600 dark:text-slate-400 border border-slate-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3.5 pr-5 text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => showToast(`Mengunduh Surat Tugas Resmi ${item.id} (PDF)...`)}
                              className="h-7 text-[11px] bg-white dark:bg-slate-900 border-slate-300"
                            >
                              <Download size={12} className="mr-1 text-pupr-blue" /> Cetak ST
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Form Modal for New Assignment */}
              {showNewAssignmentModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-0 shadow-2xl animate-in zoom-in-95">
                    <CardHeader className="border-b border-slate-100 pb-3">
                      <CardTitle className="text-base font-bold">Terbitkan Surat Tugas Survey Baru</CardTitle>
                      <CardDescription className="text-xs">Form penerbitan tugas tim inspeksi ke lokasi bangunan</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleCreateAssignment}>
                      <CardContent className="space-y-4 pt-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">Nama Bangunan / Gedung *</label>
                          <Input 
                            placeholder="Contoh: RSUD Dr. Slamet Garut" 
                            value={newAssignment.buildingName}
                            onChange={e => setNewAssignment({ ...newAssignment, buildingName: e.target.value })}
                            className="text-xs h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">Nama Instansi Pemilik *</label>
                          <Input 
                            placeholder="Contoh: Dinas Kesehatan Kab. Garut" 
                            value={newAssignment.instansi}
                            onChange={e => setNewAssignment({ ...newAssignment, instansi: e.target.value })}
                            className="text-xs h-9"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">Kecamatan</label>
                            <Input 
                              placeholder="Tarogong Kidul" 
                              value={newAssignment.kecamatan}
                              onChange={e => setNewAssignment({ ...newAssignment, kecamatan: e.target.value })}
                              className="text-xs h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">Prioritas Tugas</label>
                            <select 
                              value={newAssignment.priority}
                              onChange={e => setNewAssignment({ ...newAssignment, priority: e.target.value as any })}
                              className="w-full h-9 rounded-md border border-slate-300 bg-white dark:bg-slate-900 px-2 text-xs"
                            >
                              <option value="Normal">Normal</option>
                              <option value="Urgent">Urgent (Darurat)</option>
                              <option value="Rutin">Rutin</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">Ketua Tim Surveyor</label>
                          <Input 
                            value={newAssignment.surveyor}
                            onChange={e => setNewAssignment({ ...newAssignment, surveyor: e.target.value })}
                            className="text-xs h-9"
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-slate-100 pt-3 flex justify-end gap-2">
                        <Button variant="outline" type="button" size="sm" onClick={() => setShowNewAssignmentModal(false)} className="h-8 text-xs">
                          Batal
                        </Button>
                        <Button variant="pupr" type="submit" size="sm" className="h-8 text-xs">
                          Terbitkan Surat Tugas
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INSPEKSI & CHECKLIST */}
          {activeTab === 'inspection' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-0 shadow-sm p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Checklist Penilaian Komponen PUPR</h3>
                    <p className="text-xs text-slate-500">Form cepat pemeriksaan visual komponen Pondasi, Struktur, Arsitektur, dan MEP</p>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => navigate('/survey/new')} className="text-xs">
                    Buka Form Evaluasi Penuh <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>

                {/* Component Checklists Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { group: '1. Komponen Struktur (Ponderasi 45%)', color: 'border-blue-200 bg-blue-50/30', items: ['Pondasi & Sloof', 'Kolom Beton / Baja', 'Balok Struktur', 'Plat Lantai / Dak'] },
                    { group: '2. Komponen Arsitektur (Ponderasi 30%)', color: 'border-emerald-200 bg-emerald-50/30', items: ['Dinding Penutup & Plesteran', 'Kusen Pintu & Jendela', 'Penutup Atap & Kuda-Kuda', 'Finishing Plafon'] },
                    { group: '3. Komponen Utilitas / MEP (Ponderasi 25%)', color: 'border-amber-200 bg-amber-50/30', items: ['Instalasi Listrik & Panel', 'Pipa Air Bersih & Kotor', 'Sanitair & Drainase', 'Sistem Proteksi Kebakaran'] },
                  ].map((sec, idx) => (
                    <div key={idx} className={`p-4 border rounded-xl ${sec.color} space-y-3`}>
                      <h4 className="font-bold text-xs text-slate-800">{sec.group}</h4>
                      <div className="space-y-2">
                        {sec.items.map((it, i) => (
                          <label key={i} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 hover:border-pupr-blue">
                            <input type="checkbox" defaultChecked={i === 0 || i === 2} className="rounded text-pupr-blue focus:ring-pupr-blue" />
                            <span className="font-medium">{it}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: GPS & GEOFENCE */}
          {activeTab === 'location' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-0 shadow-sm p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Validasi Geofencing & Koordinat Lapangan</h3>
                    <p className="text-xs text-slate-500">Peta interaktif OpenStreetMap untuk validasi radius geofence lokasi fisik surveyor</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs py-1 px-3 self-start sm:self-auto">
                    <CheckCircle2 size={14} className="mr-1 text-emerald-600" /> Geofence Verified (28m dari lokasi)
                  </Badge>
                </div>

                {/* OpenStreetMap Leaflet Container */}
                <div className="h-[380px] w-full rounded-2xl overflow-hidden shadow-sm">
                  <LeafletMap
                    center={gpsCoords ? [gpsCoords.lat, gpsCoords.lng] : [-7.2278, 107.9087]}
                    zoom={15}
                    height="100%"
                    tileStyle="osm"
                    showGeofenceRadius={100}
                    geofenceCenter={gpsCoords ? [gpsCoords.lat, gpsCoords.lng] : undefined}
                    pickupLocation={true}
                    onLocationPick={(coords) => {
                      setGpsCoords({ ...coords, acc: 10 });
                    }}
                    markers={assignments.map(t => ({
                      id: t.id,
                      lat: t.lat,
                      lng: t.lng,
                      title: t.buildingName,
                      subtitle: t.kecamatan,
                      severity: t.priority === 'Urgent' ? 'Rusak Berat' : 'Rusak Sedang',
                      address: `${t.instansi}, ${t.kecamatan}`
                    }))}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: KAMERA & GEOTAG */}
          {activeTab === 'camera' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-0 shadow-sm p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Studio Geotagging & Stempel Foto Inspeksi</h3>
                  <p className="text-xs text-slate-500">Pemberian watermark otomatis stempel resmi PUPR, koordinat GPS, dan timestamp BAP</p>
                </div>

                {/* Geotag Card Simulator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Pilih Foto Komponen Rusak</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/70 transition-colors text-center cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="geotag-upload"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const url = URL.createObjectURL(e.target.files[0]);
                            setGeotagPhoto(url);
                            showToast('Foto berhasil dimuat & stempel geotag telah diterapkan!');
                          }
                        }} 
                      />
                      <label htmlFor="geotag-upload" className="cursor-pointer flex flex-col items-center">
                        <Camera size={32} className="text-pupr-blue mb-2" />
                        <span className="text-xs font-bold text-slate-800">Klik / Ambil Foto Kamera</span>
                        <span className="text-[11px] text-slate-500 mt-1">Otomatis menyuntikkan metadata EXIF & GPS</span>
                      </label>
                    </div>

                    <Input 
                      placeholder="Catatan komponen (Misal: Retak rambut 2mm pada balok)"
                      value={photoNote}
                      onChange={e => setPhotoNote(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  {/* Preview Watermarked Photo */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Hasil Stempel Geotag PUPR</span>
                    <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
                      {geotagPhoto ? (
                        <img src={geotagPhoto} alt="Geotag Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-slate-500 text-xs">
                          <ImageIcon size={36} className="mx-auto mb-2 opacity-40" />
                          Unggah foto untuk melihat sampel geotag
                        </div>
                      )}

                      {/* PUPR Geotag Watermark Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-sm border border-slate-700 p-2.5 rounded-xl text-white text-[10px] space-y-1">
                        <div className="flex items-center justify-between font-bold border-b border-slate-700 pb-1">
                          <span className="text-pupr-yellow flex items-center gap-1">
                            <ShieldCheck size={12} /> BAP INSPEKSI LAPANGAN PUPR
                          </span>
                          <span className="font-mono text-slate-300">2026-08-01 10:42 WIB</span>
                        </div>
                        <div className="flex justify-between font-mono text-emerald-400">
                          <span>LAT: {gpsCoords?.lat} | LNG: {gpsCoords?.lng}</span>
                          <span>ALT: 712m</span>
                        </div>
                        <p className="text-slate-300 truncate font-sans">
                          {photoNote || 'Retak diagonal 45° pada struktur utama - Puskesmas Cikajang'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 6: SYNC & OFFLINE ENGINE */}
          {activeTab === 'offline' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-0 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Engine Offline-First & Sinkronisasi LocalStorage</h3>
                    <p className="text-xs text-slate-500">Status antrean data survei lokal yang belum terunggah ke server cloud PUPR</p>
                  </div>
                  <Button 
                    variant="pupr" 
                    size="sm" 
                    onClick={handleSyncData}
                    disabled={isSyncing}
                    className="text-xs shadow-sm self-start sm:self-auto"
                  >
                    <RefreshCw size={14} className={`mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Proses Sinkronisasi...' : 'Unggah Semua Antrean Data'}
                  </Button>
                </div>

                {/* Local Cache Usage */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block font-medium">Draft Survei Lokal</span>
                    <span className="text-xl font-bold text-slate-900 mt-1 block">{pendingSyncCount} Berkas</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block font-medium">Foto Terkompresi</span>
                    <span className="text-xl font-bold text-slate-900 mt-1 block">14 Gambar (32 MB)</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block font-medium">Peta GIS Off-line</span>
                    <span className="text-xl font-bold text-emerald-600 mt-1 block">Garut Selatan Ready</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 7: AI ASSISTANT LAPANGAN */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-0 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-pupr-blue/10 text-pupr-blue rounded-xl">
                    <BrainCircuit size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Asisten Pintar Inspeksi AI PUPR</h3>
                    <p className="text-xs text-slate-500">Deteksi otomatis tingkat kerusakan fisik dan rekomendasi standar perbaikan</p>
                  </div>
                </div>

                {/* AI Scanner Demo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Uji Analisis Kerusakan Komponen dengan AI</label>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
                      <Sparkles size={28} className="text-pupr-blue mx-auto animate-pulse" />
                      <p className="text-xs text-slate-600 dark:text-slate-400">Simulasi pemindaian AI pada komponen retak balok beton Puskesmas Cikajang</p>
                      <Button 
                        variant="pupr" 
                        size="sm" 
                        onClick={handleAiScan}
                        disabled={isAiScanning}
                        className="text-xs w-full"
                      >
                        {isAiScanning ? (
                          <>
                            <RefreshCw size={14} className="animate-spin mr-1.5" /> Memindai Komponen...
                          </>
                        ) : (
                          <>
                            <BrainCircuit size={14} className="mr-1.5" /> Jalankan Pemindaian AI
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* AI Results */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Hasil Diagnosa AI Lapangan</span>
                    {aiResult ? (
                      <div className="p-4 bg-blue-50/60 border border-pupr-blue/30 rounded-xl space-y-2.5 animate-in fade-in text-xs">
                        <div className="flex items-center justify-between border-b border-pupr-blue/20 pb-2">
                          <span className="font-bold text-pupr-blue">{aiResult.component}</span>
                          <Badge className="bg-amber-600 text-white font-bold">{aiResult.percentage}% Kerusakan</Badge>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Kategori: </span>
                          <span className="text-slate-900 font-bold">{aiResult.damageLevel}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200">
                          <span className="font-semibold text-slate-800 block mb-1">Rekomendasi Penanganan PUPR:</span>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{aiResult.recommendation}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-44 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 text-center p-4">
                        Tekan 'Jalankan Pemindaian AI' untuk melihat diagnosa otomatis.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: QR CODE SCANNER MODULE */}
          {activeTab === 'qr' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-0 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-pupr-blue/10 text-pupr-blue rounded-xl shrink-0">
                      <QrCode size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Modul Pemindai Tag QR Gedung PUPR</h3>
                      <p className="text-xs text-slate-500">
                        Penarikan data instan profil & histori inspeksi fisik bangunan melalui stiker identitas QR Code Garut.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="pupr"
                    size="sm"
                    onClick={() => setShowQrScannerModal(true)}
                    className="text-xs font-bold shadow-md shrink-0"
                  >
                    <Scan size={15} className="mr-1.5" /> Buka Kamera Pemindai Tag
                  </Button>
                </div>

                {/* Info Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-pupr-blue">
                      <ShieldCheck size={16} /> Identifikasi Aset Terverifikasi
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Menghubungkan lokasi fisik surveyor secara langsung ke master data bangunan SIMBG / SIPEKA tanpa perlu pengetikan manual.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <Clock size={16} /> Histori Inspeksi Real-Time
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Menampilkan persentase kerusakan terakhir, nama surveyor, tanggal survei, dan status persetujuan kepala bidang secara instan.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                      <FileCheck size={16} /> Langsung Mulai Form Survei
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Setiap hasil pemindaian langsung menyediakan opsi otomatis membuka form evaluasi kerusakan dengan metadata bangunan terisi penuh.
                    </p>
                  </div>
                </div>

                {/* Directory of Tagged Buildings in Garut */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 size={15} className="text-pupr-blue" />
                      Daftar Bangunan Gedung Ber-Tag QR Terdaftar (Kab. Garut)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">5 Gedung Siap Scan</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.values(font_sample_buildings).map((b) => (
                      <div key={b.tagId} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 rounded-xl hover:border-pupr-blue transition-all flex items-start justify-between gap-3 shadow-2xs">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">{b.buildingName}</span>
                            <Badge variant="outline" className="text-[9px] font-mono bg-blue-50 text-pupr-blue border-blue-200">
                              {b.tagId}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{b.instansi} • {b.kecamatan}</p>
                          <div className="flex items-center gap-2 pt-1 text-[10px]">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Status: <strong className="text-slate-900">{b.damageStatus} ({b.damagePercentage}%)</strong></span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 font-mono">{b.coords}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBuildingFromQr(b);
                            setShowQrScannerModal(true);
                          }}
                          className="h-8 text-[11px] border-pupr-blue/30 text-pupr-blue hover:bg-blue-50 font-semibold shrink-0"
                        >
                          <Scan size={13} className="mr-1" /> Scan Tag
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: QR CODE GENERATOR MODULE */}
          {activeTab === 'qr-generator' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="border-0 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-pupr-blue/10 text-pupr-blue rounded-xl shrink-0">
                      <QrCode size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Generator Tag QR Gedung</h3>
                      <p className="text-xs text-slate-500">
                        Hasilkan dan cetak QR Code unik untuk identifikasi fisik bangunan gedung.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="pupr"
                    size="sm"
                    onClick={() => {
                      showToast(`Mencetak QR Code Tag: ${font_sample_buildings[qrGenBuildingId]?.tagId || 'N/A'}`);
                      window.print();
                    }}
                    className="text-xs font-bold shadow-md shrink-0"
                  >
                    <FileText size={15} className="mr-1.5" /> Cetak QR Code
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Gedung</label>
                      <select 
                        className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                        value={qrGenBuildingId}
                        onChange={(e) => setQrGenBuildingId(e.target.value)}
                      >
                        {Object.entries(font_sample_buildings).map(([id, b]) => (
                          <option key={id} value={id}>
                            {b.buildingName} - {b.tagId}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ukuran QR (px)</label>
                      <input 
                        type="range"
                        min="150" max="400" step="10"
                        value={qrGenSize}
                        onChange={(e) => setQrGenSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-slate-500 text-right">{qrGenSize} x {qrGenSize} px</div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <div className="bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-200 rounded-xl text-center space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm">{font_sample_buildings[qrGenBuildingId]?.buildingName}</h4>
                      <div className="flex justify-center bg-white dark:bg-slate-900 p-2">
                        {/* We use a mock unique ID formatted cleanly */}
                        <QRCodeSVG 
                          value={JSON.stringify({ 
                            type: 'SIPEKA_BUILDING_TAG', 
                            tagId: font_sample_buildings[qrGenBuildingId]?.tagId 
                          })} 
                          size={qrGenSize}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <p className="font-mono text-xs text-slate-600 dark:text-slate-400 tracking-widest">{font_sample_buildings[qrGenBuildingId]?.tagId}</p>
                      <p className="text-[10px] text-slate-400">DINAS PUPR KAB. GARUT</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      <QRCodeScannerModal
        isOpen={showQrScannerModal}
        onClose={() => setShowQrScannerModal(false)}
        onBuildingSelect={(building) => {
          setSelectedBuildingFromQr(building);
          showToast(`Berhasil menarik data pemeliharaan untuk ${building.buildingName} [Tag: ${building.tagId}]`);
        }}
        onNavigateToSurvey={(building) => {
          showToast(`Membuka Form Inspeksi untuk ${building.buildingName}...`);
          navigate('/survey/new');
        }}
      />
    </div>
  );
}
