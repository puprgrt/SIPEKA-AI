import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardGlass, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  Wrench, 
  FileText, 
  Calendar, 
  Search, 
  MapPin, 
  User, 
  AlertCircle, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Check, 
  Info,
  Shield,
  ArrowRight,
  TrendingUp,
  Camera,
  X,
  FileCheck
} from 'lucide-react';

export interface StakeholderBuilding {
  id: string;
  name: string;
  ownerOpd: string;
  address: string;
  slfStatus: 'Sertifikat Layak (SLF Valid)' | 'Pemeliharaan Berjalan' | 'Perlu Intervensi' | 'Dalam Proses Asesmen';
  overallEligibilityScore: number;
  eligibilityCategory: 'Sangat Layak' | 'Layak Dengan Catatan' | 'Perlu Perbaikan';
  lastAssessmentDate: string;
  repairProgressPct: number;
  estimatedRepairCostIdr: number;
  repairMilestones: Array<{
    title: string;
    description: string;
    date: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  }>;
  simplifiedMetrics: {
    structuralSafety: 'Baik' | 'Sedang' | 'Perlu Perbaikan';
    fireSafety: 'Baik' | 'Sedang' | 'Perlu Perbaikan';
    healthSanitation: 'Baik' | 'Sedang' | 'Perlu Perbaikan';
    accessibilityEase: 'Baik' | 'Sedang' | 'Perlu Perbaikan';
  };
  maskedTechnicalDetails: {
    internalRssiStressCoeff: string;
    surveyorInternalLog: string;
    bsreSignerCertificateKey: string;
  };
}

const STAKEHOLDER_BUILDINGS: StakeholderBuilding[] = [
  {
    id: 'STK-001',
    name: 'Puskesmas DTP Cikajang',
    ownerOpd: 'Dinas Kesehatan Kabupaten Garut',
    address: 'Jl. Raya Cikajang No. 42, Kecamatan Cikajang, Garut',
    slfStatus: 'Pemeliharaan Berjalan',
    overallEligibilityScore: 78,
    eligibilityCategory: 'Layak Dengan Catatan',
    lastAssessmentDate: '15 Juli 2026',
    repairProgressPct: 65,
    estimatedRepairCostIdr: 45500000,
    repairMilestones: [
      {
        title: 'Inspeksi & Asesmen Awal Kelaikan Fungsi',
        description: 'Tim teknis DPUPR menyelesaikan evaluasi keandalan bangunan gedung.',
        date: '15 Juli 2026',
        status: 'COMPLETED'
      },
      {
        title: 'Penerbitan Rekomendasi Pemeliharaan Preventif',
        description: 'Penerbitan dokumen rekomendasi perbaikan struktur kolom teras.',
        date: '20 Juli 2026',
        status: 'COMPLETED'
      },
      {
        title: 'Pengerjaan Perkuatan Kolom & Epoksi Grouting',
        description: 'Kontraktor pelaksana melakukan injeksi retak & pemasangan lapisan perkuat.',
        date: '28 Juli 2026',
        status: 'IN_PROGRESS'
      },
      {
        title: 'Verifikasi Akhir & Perpanjangan Sertifikat SLF',
        description: 'Pemeriksaan ulang oleh Reviewer Teknis DPUPR setelah fisik 100%.',
        date: '15 Agustus 2026 (Terjadwal)',
        status: 'PENDING'
      }
    ],
    simplifiedMetrics: {
      structuralSafety: 'Sedang',
      fireSafety: 'Baik',
      healthSanitation: 'Baik',
      accessibilityEase: 'Baik'
    },
    maskedTechnicalDetails: {
      internalRssiStressCoeff: '🔒 [TERLINDUNGI: KOEFISIEN MATRIKS FEA STRUKTUR INTERNAL PUPR]',
      surveyorInternalLog: '🔒 [TERLINDUNGI: CATATAN VERIFIKATOR INTERNAL TIM KERJA BSB]',
      bsreSignerCertificateKey: '🔒 [TERLINDUNGI: HASH KUNCI SWASTASATU SERTIFIKAT DIGITAL]'
    }
  },
  {
    id: 'STK-002',
    name: 'SDN 1 Tarogong Kidul',
    ownerOpd: 'Dinas Pendidikan Kabupaten Garut',
    address: 'Jl. Oded S. Soemantri No. 12, Tarogong Kidul, Garut',
    slfStatus: 'Sertifikat Layak (SLF Valid)',
    overallEligibilityScore: 92,
    eligibilityCategory: 'Sangat Layak',
    lastAssessmentDate: '02 Agustus 2026',
    repairProgressPct: 100,
    estimatedRepairCostIdr: 0,
    repairMilestones: [
      {
        title: 'Inspeksi Lapangan Berkala Tahun 2026',
        description: 'Survei kelaikan fungsi komponen arsitektur dan struktur.',
        date: '25 Juli 2026',
        status: 'COMPLETED'
      },
      {
        title: 'Penandatanganan TTE Sertifikat SLF Resmi',
        description: 'Sertifikat Layak Fungsi disahkan oleh Kepala Dinas PUPR via TTE BSrE.',
        date: '02 Agustus 2026',
        status: 'COMPLETED'
      }
    ],
    simplifiedMetrics: {
      structuralSafety: 'Baik',
      fireSafety: 'Baik',
      healthSanitation: 'Baik',
      accessibilityEase: 'Baik'
    },
    maskedTechnicalDetails: {
      internalRssiStressCoeff: '🔒 [TERLINDUNGI: DATA FORMULA PEMBOBOTAN FORM B-16]',
      surveyorInternalLog: '🔒 [TERLINDUNGI: CATATAN LOG INSPEKTUR UTAMA]',
      bsreSignerCertificateKey: '🔒 [TERLINDUNGI: KUNCI ASIMETRIS SERTIFIKAT TTE]'
    }
  },
  {
    id: 'STK-003',
    name: 'Pasar Rakyat Wanaraja',
    ownerOpd: 'Dinas Perdagangan & Perindustrian Kab. Garut',
    address: 'Jl. Raya Wanaraja No. 88, Wanaraja, Garut',
    slfStatus: 'Perlu Intervensi',
    overallEligibilityScore: 48,
    eligibilityCategory: 'Perlu Perbaikan',
    lastAssessmentDate: '10 Juni 2026',
    repairProgressPct: 25,
    estimatedRepairCostIdr: 320000000,
    repairMilestones: [
      {
        title: 'Penerbitan Surat Peringatan Kelaikan Fungsi',
        description: 'Notifikasi penanganan darurat rangka baja dan pedestal kolom.',
        date: '12 Juni 2026',
        status: 'COMPLETED'
      },
      {
        title: 'Penyusunan Rencana Kerja & Anggaran (RKA)',
        description: 'Pengalokasian anggaran pemeliharaan darurat pasar rakyat.',
        date: '05 Juli 2026',
        status: 'IN_PROGRESS'
      },
      {
        title: 'Pengerjaan Perkuatan Pedestal & Rangka Atap',
        description: 'Pelaksanaan rekonstruksi elemen penunjang keselamatan.',
        date: '20 Agustus 2026 (Mendatang)',
        status: 'PENDING'
      }
    ],
    simplifiedMetrics: {
      structuralSafety: 'Perlu Perbaikan',
      fireSafety: 'Sedang',
      healthSanitation: 'Sedang',
      accessibilityEase: 'Baik'
    },
    maskedTechnicalDetails: {
      internalRssiStressCoeff: '🔒 [TERLINDUNGI: TENSOR REGANGAN BETON RAW DATA]',
      surveyorInternalLog: '🔒 [TERLINDUNGI: DOKUMEN INTERNAL TIM AHLI BANGUNAN GEDUNG]',
      bsreSignerCertificateKey: '🔒 [TERLINDUNGI: TOKEN OTENTIKASI CA BSRE]'
    }
  }
];

export function StakeholderPortal() {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('STK-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ title: '', desc: '', date: '' });

  const selectedBuilding = STAKEHOLDER_BUILDINGS.find(b => b.id === selectedBuildingId) || STAKEHOLDER_BUILDINGS[0];

  const filteredBuildings = STAKEHOLDER_BUILDINGS.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.ownerOpd.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-pupr-blue text-white p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge className="bg-pupr-yellow text-slate-950 font-bold text-[10px] uppercase tracking-wider">
              Portal Pemilik Bangunan / Stakeholder View
            </Badge>
            <Badge variant="outline" className="text-emerald-300 border-emerald-400/40 text-[10px] font-mono">
              Read-Only Access
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ringkasan Kelaikan & Progres Perbaikan Gedung
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Layanan pemantauan khusus instansi pemilik bangunan gedung (OPD/Pemohon) untuk memantau status Sertifikat Layak Fungsi (SLF), perkembangan perbaikan fisik, dan ringkasan hasil asesmen tanpa eksposur detail teknis internal.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <Button
            size="sm"
            onClick={() => {
              alert(`Mengunduh Ringkasan Laporan Resmi Kelaikan Fungsi (${selectedBuilding.name}) untuk Pemilik Bangunan...`);
            }}
            className="bg-pupr-yellow hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md h-9"
          >
            <Download size={15} className="mr-1.5" /> Unduh Ringkasan Laporan (PDF)
          </Button>
        </div>
      </div>

      {/* Masking Notice Bar */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-800 rounded-xl shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="text-xs space-y-0.5">
            <span className="font-extrabold text-slate-900 block">
              🔒 Proteksi Kerahasiaan Data Teknis Internal PUPR Aktif
            </span>
            <span className="text-slate-600">
              Formulasi matematika rumit, tensor tegangan struktur internal, dan log catatan verifikator telah disederhanakan agar mudah dipahami oleh pengelola instansi.
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-amber-300 hover:bg-amber-100/50 transition-all shrink-0 flex items-center gap-1.5"
        >
          {showTechnicalDetails ? <EyeOff size={14} className="text-red-600" /> : <Eye size={14} className="text-pupr-blue" />}
          {showTechnicalDetails ? 'Sembunyikan Proteksi' : 'Lihat Status Proteksi'}
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Building Selector & Info */}
        <div className="space-y-4 lg:col-span-1">
          <CardGlass className="border-slate-200 dark:border-slate-800 shadow-2xs rounded-2xl bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Daftar Bangunan Gedung Anda
              </label>
              <Badge variant="outline" className="text-[10px] font-mono">
                {filteredBuildings.length} Unit
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <Input
                type="text"
                placeholder="Cari gedung atau instansi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredBuildings.map((bld) => (
                <button
                  key={bld.id}
                  onClick={() => setSelectedBuildingId(bld.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                    selectedBuildingId === bld.id
                      ? 'bg-blue-50/80 border-pupr-blue text-pupr-blue shadow-xs font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-extrabold text-slate-900 truncate">{bld.name}</span>
                    <Badge className={`text-[9px] ${
                      bld.slfStatus.includes('SLF Valid') ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {bld.slfStatus.includes('SLF Valid') ? 'SLF Terbit' : 'Proses'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{bld.ownerOpd}</p>
                  
                  <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100 font-mono">
                    <span className="text-slate-500">Skor: <strong className="text-slate-900">{bld.overallEligibilityScore}%</strong></span>
                    <span className="text-pupr-blue font-bold">Progres: {bld.repairProgressPct}%</span>
                  </div>
                </button>
              ))}
            </div>
          </CardGlass>
        </div>

        {/* Right Column: Detailed Building Summary & Live Progress Tracker */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header Card for Selected Building */}
          <CardGlass className="border-slate-200 dark:border-slate-800 shadow-2xs rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-900 text-white text-[10px] font-mono">
                    {selectedBuilding.id}
                  </Badge>
                  <Badge className={`text-[10px] font-bold ${
                    selectedBuilding.overallEligibilityScore >= 85 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    Kategori: {selectedBuilding.eligibilityCategory}
                  </Badge>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{selectedBuilding.name}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin size={13} className="text-red-500" /> {selectedBuilding.address}
                </p>
                <p className="text-xs text-slate-600 font-medium pt-1">
                  Pengelola Instansi: <strong>{selectedBuilding.ownerOpd}</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="sm"
                  onClick={() => setShowIncidentModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md h-auto py-2 shrink-0 flex items-center gap-2"
                >
                  <AlertCircle size={15} /> Lapor Insiden Darurat
                </Button>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center shrink-0 min-w-[140px]">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Indeks Kelaikan
                  </span>
                  <span className="text-3xl font-black text-pupr-blue font-mono">
                    {selectedBuilding.overallEligibilityScore}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Inspeksi: {selectedBuilding.lastAssessmentDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Simplified Key Performance Health Cards for Building Owners */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Ringkasan Keandalan Komponen Bangunan (Informasi Non-Teknis)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">Keselamatan Struktur</span>
                  <span className={`text-sm font-black ${
                    selectedBuilding.simplifiedMetrics.structuralSafety === 'Baik' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {selectedBuilding.simplifiedMetrics.structuralSafety}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">Proteksi Kebakaran</span>
                  <span className="text-sm font-black text-emerald-600">
                    {selectedBuilding.simplifiedMetrics.fireSafety}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">Kesehatan & Sanitasi</span>
                  <span className="text-sm font-black text-emerald-600">
                    {selectedBuilding.simplifiedMetrics.healthSanitation}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">Kemudahan Aksesibilitas</span>
                  <span className="text-sm font-black text-emerald-600">
                    {selectedBuilding.simplifiedMetrics.accessibilityEase}
                  </span>
                </div>
              </div>
            </div>
          </CardGlass>

          {/* BUDGET INTEGRATION CARD */}
          <CardGlass className="border-slate-200 dark:border-slate-800 shadow-2xs rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
               <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <FileCheck size={18} className="text-pupr-blue" />
                    Estimasi Anggaran Perbaikan (RAB)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Estimasi kasar rencana anggaran biaya perbaikan untuk usulan ke dinas terkait.
                  </p>
               </div>
               <div className="text-right">
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 font-mono text-[10px]">Total Estimasi</Badge>
                  <p className="text-xl font-black text-slate-900 font-mono">
                    Rp {selectedBuilding.estimatedRepairCostIdr.toLocaleString('id-ID')}
                  </p>
               </div>
             </div>
             
             <div className="flex items-center justify-between bg-amber-50 p-4 rounded-xl border border-amber-200/50">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-900">Gunakan nilai ini untuk pengajuan RKA Instansi</p>
                    <p className="text-[11px] text-amber-700/80">
                      Nilai estimasi RAB ini diterbitkan secara otomatis oleh sistem berdasarkan standar harga satuan dan volume kerusakan hasil asesmen tim PUPR. 
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => alert('Mengunduh rincian RAB lengkap format Excel/PDF')}
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs shadow-sm h-8 shrink-0"
                  variant="outline"
                >
                  <Download size={14} className="mr-1.5" /> Rincian RAB
                </Button>
             </div>
          </CardGlass>

          {/* REPAIR PROGRESS TRACKER (MILESTONES TIMELINE) */}
          <CardGlass className="border-slate-200 dark:border-slate-800 shadow-2xs rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Wrench size={18} className="text-pupr-blue" />
                  Progres Pemeliharaan & Perbaikan Fisik Bangunan
                </h3>
                <p className="text-xs text-slate-500">
                  Pelacakan real-time tahapan pengerjaan perbaikan dan kesiapan re-inspeksi SLF
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-md h-8"
                >
                  <Layers size={14} className="mr-1.5" /> Upload Bukti Perbaikan (Before-After)
                </Button>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Total Progres Selesai</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    {selectedBuilding.repairProgressPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-pupr-blue to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedBuilding.repairProgressPct}%` }}
                />
              </div>
            </div>

            {/* Milestones Vertical Steps */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {selectedBuilding.repairMilestones.map((ms, idx) => (
                <div key={idx} className="relative flex items-start gap-4 group">
                  {/* Status Circle Bullet */}
                  <div className={`absolute -left-6 top-0.5 p-1 rounded-full text-white ${
                    ms.status === 'COMPLETED' ? 'bg-emerald-600 ring-4 ring-emerald-100' : ms.status === 'IN_PROGRESS' ? 'bg-pupr-blue ring-4 ring-blue-100 animate-pulse' : 'bg-slate-300'
                  }`}>
                    {ms.status === 'COMPLETED' ? <Check size={12} /> : <Clock size={12} />}
                  </div>

                  <div className="space-y-1 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 w-full">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">{ms.title}</h4>
                      <Badge className={`text-[10px] font-mono ${
                        ms.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : ms.status === 'IN_PROGRESS' ? 'bg-blue-100 text-pupr-blue' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {ms.status === 'COMPLETED' ? 'Selesai' : ms.status === 'IN_PROGRESS' ? 'Sedang Berjalan' : 'Terjadwal'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{ms.description}</p>
                    <span className="text-[11px] font-mono text-slate-400 block pt-1">
                      📅 Tanggal: {ms.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardGlass>

          {/* MASKED TECHNICAL DETAILS PANEL */}
          {showTechnicalDetails && (
            <CardGlass className="border-amber-300 shadow-2xs rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 p-5 space-y-3">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={14} className="text-amber-700" />
                Detail Teknis Terproteksi (Akses Terbatas Tim Internal PUPR)
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <span className="text-slate-400 block text-[10px]">Formula FEA Tensor Tegangan Kolom:</span>
                  <span className="text-slate-800">{selectedBuilding.maskedTechnicalDetails.internalRssiStressCoeff}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <span className="text-slate-400 block text-[10px]">Catatan Rahasia Verifikator Lapangan:</span>
                  <span className="text-slate-800">{selectedBuilding.maskedTechnicalDetails.surveyorInternalLog}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <span className="text-slate-400 block text-[10px]">Kunci Sertifikat Asimetris BSrE:</span>
                  <span className="text-slate-800">{selectedBuilding.maskedTechnicalDetails.bsreSignerCertificateKey}</span>
                </div>
              </div>
            </CardGlass>
          )}
        </div>
      </div>

      {/* Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-red-50 text-red-900">
              <h3 className="font-bold flex items-center gap-2">
                <AlertCircle size={18} /> Lapor Insiden Darurat
              </h3>
              <button onClick={() => setShowIncidentModal(false)} className="text-red-900/50 hover:text-red-900">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Jenis Insiden</label>
                <select 
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({...incidentForm, title: e.target.value})}
                >
                  <option value="">Pilih Kategori Darurat...</option>
                  <option value="Gempa Bumi">Gempa Bumi (Kerusakan Struktural Mendadak)</option>
                  <option value="Kebakaran">Kebakaran Gedung</option>
                  <option value="Cuaca Ekstrem">Angin Kencang / Cuaca Ekstrem (Atap Runtuh)</option>
                  <option value="Lainnya">Kondisi Kritis Lainnya</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Deskripsi Singkat</label>
                <textarea 
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[100px]"
                  placeholder="Jelaskan secara singkat bagian mana yang mengalami kerusakan parah akibat insiden..."
                  value={incidentForm.desc}
                  onChange={(e) => setIncidentForm({...incidentForm, desc: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Tanggal Insiden</label>
                <input 
                  type="date"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  value={incidentForm.date}
                  onChange={(e) => setIncidentForm({...incidentForm, date: e.target.value})}
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setShowIncidentModal(false)}>Batal</Button>
              <Button 
                variant="pupr" 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  alert(`Laporan insiden (${incidentForm.title}) untuk gedung ${selectedBuilding.name} berhasil dikirim ke BPBD dan Dinas PUPR Garut.`);
                  setShowIncidentModal(false);
                  setIncidentForm({ title: '', desc: '', date: '' });
                }}
              >
                Kirim Laporan Darurat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Bukti Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Layers size={18} className="text-emerald-600" /> Unggah Bukti Perbaikan Mandiri
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200/60 text-xs leading-relaxed">
                <p><strong>Info:</strong> Fasilitas ini digunakan untuk melaporkan progres perbaikan bangunan yang dilakukan secara mandiri oleh instansi Anda sebelum jadwal inspeksi ulang (Re-Inspeksi SLF) oleh tim PUPR.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[140px] space-y-2">
                  <Camera size={24} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">Foto Kondisi SEBELUM (Before)</span>
                  <span className="text-[10px] text-slate-400">Klik untuk upload foto</span>
                </div>
                <div className="border-2 border-dashed border-emerald-200 rounded-xl p-4 text-center bg-emerald-50/30 hover:bg-emerald-50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[140px] space-y-2">
                  <Camera size={24} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">Foto Kondisi SESUDAH (After)</span>
                  <span className="text-[10px] text-emerald-500/80">Klik untuk upload foto</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Keterangan Perbaikan</label>
                <textarea 
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[80px]"
                  placeholder="Deskripsikan secara singkat item apa saja yang telah diperbaiki pada komponen ini..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>Batal</Button>
              <Button 
                variant="pupr" 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  alert(`Bukti perbaikan mandiri untuk gedung ${selectedBuilding.name} berhasil diunggah.`);
                  setShowUploadModal(false);
                }}
              >
                Kirim Bukti Perbaikan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
