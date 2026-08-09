import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  History, 
  LogIn, 
  FileEdit, 
  CheckCircle2, 
  ShieldAlert, 
  Download, 
  MapPin, 
  Globe, 
  Smartphone, 
  Key, 
  FileCheck, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  AlertTriangle, 
  RefreshCw, 
  FileSpreadsheet, 
  Maximize2, 
  X, 
  Clock, 
  Server, 
  Fingerprint, 
  Activity, 
  Compass, 
  Building2, 
  Copy, 
  Check, 
  Plus
} from 'lucide-react';

export interface AuditLogEntry {
  id: string;
  category: 'admin_access' | 'document_signature' | 'role_config' | 'security_alert';
  actionName: string;
  user: {
    name: string;
    role: string;
    nip: string;
    email: string;
  };
  timestamp: string;
  ipAddress: string;
  ispProvider: string;
  geolocation: {
    lat: number;
    lng: number;
    locationName: string;
    accuracyMeters: number;
  };
  deviceMeta: {
    browser: string;
    os: string;
    deviceType: 'Desktop' | 'Mobile' | 'Tablet';
    fingerprintHash: string;
  };
  signatureMeta?: {
    documentTitle: string;
    documentId: string;
    signatureAlgorithm: string;
    bsreCertId: string;
    hashSha256: string;
    status: 'TTE_VALID' | 'REVOKED' | 'EXPIRED';
  };
  accessStatus: 'SUCCESS' | 'FAILED' | 'FLAGGED_SUSPICIOUS' | 'BLOCKED';
  riskScore: 'Low' | 'Medium' | 'High';
  notes: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-2026-0802-001',
    category: 'document_signature',
    actionName: 'Penandatanganan Digital TTE BSrE Laporan Bangunan',
    user: {
      name: 'Dr. Ir. H. Bambang Heri, MT',
      role: 'Kepala Dinas DPUPR',
      nip: '19700512 199503 1 002',
      email: 'bambang.dpupr@garutkab.go.id'
    },
    timestamp: '2026-08-02 08:30:14 WIB',
    ipAddress: '114.125.82.104',
    ispProvider: 'Telkomsel Corporate VPN Garut',
    geolocation: {
      lat: -7.218811,
      lng: 107.902230,
      locationName: 'Kantor DPUPR Kab. Garut (Jl. Raya Samarang No. 115)',
      accuracyMeters: 2.5
    },
    deviceMeta: {
      browser: 'Chrome 126.0 (Windows 11 x64)',
      os: 'Windows 11 Enterprise',
      deviceType: 'Desktop',
      fingerprintHash: 'fp_a8f9210c44b9872e'
    },
    signatureMeta: {
      documentTitle: 'BAP Layak Fungsi SDN 1 Tarogong Kidul',
      documentId: 'DOC-SLF-2026-0089',
      signatureAlgorithm: 'RSA-4096 / SHA-256 (BSrE BSSN)',
      bsreCertId: 'CERT-BSRE-2026-99214',
      hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      status: 'TTE_VALID'
    },
    accessStatus: 'SUCCESS',
    riskScore: 'Low',
    notes: 'Verifikasi biometrik PNS & OTP Token BSrE berhasil 100%.'
  },
  {
    id: 'AUD-2026-0802-002',
    category: 'admin_access',
    actionName: 'Akses Sesi Super Admin Dashboard Audit',
    user: {
      name: 'Ir. Hendra Pratama',
      role: 'Super Admin Sistem',
      nip: '19850412 201001 1 008',
      email: 'hendra.admin@garutkab.go.id'
    },
    timestamp: '2026-08-02 08:15:02 WIB',
    ipAddress: '180.252.120.45',
    ispProvider: 'Indonet Dedicated PUPR',
    geolocation: {
      lat: -7.215410,
      lng: 107.901240,
      locationName: 'Pusat Data Command Center Pemkab Garut',
      accuracyMeters: 1.8
    },
    deviceMeta: {
      browser: 'Firefox 125.0 (macOS Sonoma)',
      os: 'macOS 14.4.1',
      deviceType: 'Desktop',
      fingerprintHash: 'fp_77e02b1154c199e8'
    },
    accessStatus: 'SUCCESS',
    riskScore: 'Low',
    notes: 'Autentikasi MFA hardware key YubiKey berhasil.'
  },
  {
    id: 'AUD-2026-0802-003',
    category: 'security_alert',
    actionName: 'Percobaan Akses Admin Tidak Sah (Gagal Otentikasi)',
    user: {
      name: 'Pengguna Tidak Dikenal',
      role: 'Tamu / Anonym',
      nip: '-',
      email: 'unauthorized_attempt@external.com'
    },
    timestamp: '2026-08-02 07:44:19 WIB',
    ipAddress: '103.145.22.88',
    ispProvider: 'IP Transit Anonymized (Jakarta Host)',
    geolocation: {
      lat: -6.175392,
      lng: 106.827153,
      locationName: 'Lokasi Terdeteksi: Jakarta Pusat (Luar Wilayah Garut)',
      accuracyMeters: 450
    },
    deviceMeta: {
      browser: 'HeadlessChrome / Automated Bot',
      os: 'Linux x86_64',
      deviceType: 'Desktop',
      fingerprintHash: 'fp_UNKNOWN_SUSPICIOUS'
    },
    accessStatus: 'FLAGGED_SUSPICIOUS',
    riskScore: 'High',
    notes: 'Deteksi Brute Force: 5x salah password dalam 30 detik. IP otomatis diblokir selama 24 jam.'
  },
  {
    id: 'AUD-2026-0801-004',
    category: 'document_signature',
    actionName: 'Persetujuan TTE Rekomendasi Teknis RSUD Dr. Slamet',
    user: {
      name: 'Siti Aminah, ST, MT',
      role: 'Kabid Tata Bangunan',
      nip: '19781104 200312 2 003',
      email: 'siti.tatabangunan@garutkab.go.id'
    },
    timestamp: '2026-08-01 15:20:45 WIB',
    ipAddress: '114.125.80.211',
    ispProvider: 'Telkomsel Mobile LTE',
    geolocation: {
      lat: -7.214402,
      lng: 107.901522,
      locationName: 'Inspeksi Lapangan RSUD Dr. Slamet Garut',
      accuracyMeters: 4.2
    },
    deviceMeta: {
      browser: 'Safari Mobile (iOS 17.4)',
      os: 'iOS 17.4',
      deviceType: 'Mobile',
      fingerprintHash: 'fp_b332900fa2117822'
    },
    signatureMeta: {
      documentTitle: 'Surat Rekomendasi Pemugaran Gedung Rawat Inap',
      documentId: 'DOC-REK-2026-0142',
      signatureAlgorithm: 'ECDSA-P384 / SHA-384',
      bsreCertId: 'CERT-BSRE-2026-88102',
      hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'TTE_VALID'
    },
    accessStatus: 'SUCCESS',
    riskScore: 'Low',
    notes: 'TTE disahkan langsung di lokasi inspeksi via iPad Pro Geotagged.'
  },
  {
    id: 'AUD-2026-0801-005',
    category: 'role_config',
    actionName: 'Perubahan Hak Akses Role Tim Surveyor Lapangan',
    user: {
      name: 'Ir. Hendra Pratama',
      role: 'Super Admin Sistem',
      nip: '19850412 201001 1 008',
      email: 'hendra.admin@garutkab.go.id'
    },
    timestamp: '2026-08-01 11:10:00 WIB',
    ipAddress: '180.252.120.45',
    ispProvider: 'Indonet Dedicated PUPR',
    geolocation: {
      lat: -7.218811,
      lng: 107.902230,
      locationName: 'Kantor DPUPR Kab. Garut',
      accuracyMeters: 2.0
    },
    deviceMeta: {
      browser: 'Chrome 126.0 (Windows 11)',
      os: 'Windows 11',
      deviceType: 'Desktop',
      fingerprintHash: 'fp_a8f9210c44b9872e'
    },
    accessStatus: 'SUCCESS',
    riskScore: 'Low',
    notes: 'Menambahkan izin upload foto Geotagging & AI Vision untuk Budi Santoso (NIP 19890215 201402 1 003).'
  }
];

export function ActivityLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Live Audit Simulator function
  const handleSimulateAuditEntry = () => {
    setIsSimulating(true);

    // Try capturing browser real geolocation or default to DPUPR Garut
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => createSimulatedLog(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
        () => createSimulatedLog(-7.218811, 107.902230, 3.5),
        { timeout: 3000 }
      );
    } else {
      createSimulatedLog(-7.218811, 107.902230, 3.5);
    }
  };

  const createSimulatedLog = (lat: number, lng: number, acc: number) => {
    setTimeout(() => {
      const isTte = Math.random() > 0.4;
      const now = new Date();
      const timestampStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} WIB`;
      const randomIp = `114.125.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`;

      const newEntry: AuditLogEntry = {
        id: `AUD-2026-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
        category: isTte ? 'document_signature' : 'admin_access',
        actionName: isTte 
          ? 'Penandatanganan Digital TTE BSrE Baru (Simulasi Live)' 
          : 'Verifikasi Autentikasi Admin Kredensial Lapangan',
        user: {
          name: 'Ir. Hendra Pratama (Sesi Aktif)',
          role: 'Super Admin / Verifikator',
          nip: '19850412 201001 1 008',
          email: 'hendra.admin@garutkab.go.id'
        },
        timestamp: timestampStr,
        ipAddress: randomIp,
        ispProvider: 'Telkomsel Mobile LTE (Garut Gateway)',
        geolocation: {
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          locationName: `Koordinat GPS Presisi: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Garut, Jabar)`,
          accuracyMeters: Number(acc.toFixed(1))
        },
        deviceMeta: {
          browser: 'Chrome / Safari (Client Session)',
          os: 'Windows / macOS',
          deviceType: 'Desktop',
          fingerprintHash: `fp_${Math.random().toString(36).substring(2, 12)}`
        },
        signatureMeta: isTte ? {
          documentTitle: 'Sertifikat Layak Fungsi (SLF) - Puskesmas Cikajang',
          documentId: `DOC-SLF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          signatureAlgorithm: 'RSA-4096 / SHA-256 (BSrE BSSN)',
          bsreCertId: `CERT-BSRE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          hashSha256: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          status: 'TTE_VALID'
        } : undefined,
        accessStatus: 'SUCCESS',
        riskScore: 'Low',
        notes: isTte ? 'Dokumen berhasil ditandatangani digital dengan stempel TTE BSrE valid.' : 'Login admin diverifikasi dengan fingerprint perangkat.'
      };

      setLogs(prev => [newEntry, ...prev]);
      setIsSimulating(false);
      setSelectedLog(newEntry);
    }, 1200);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.actionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.nip.includes(searchTerm) ||
      log.ipAddress.includes(searchTerm) ||
      log.geolocation.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.signatureMeta && log.signatureMeta.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || log.accessStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // PDF Export simulation
  const handleExportAuditPdf = () => {
    alert(`Mengunduh Berkas Audit Security & Activity Log DPUPR Garut (${filteredLogs.length} Entri) dalam format PDF Resmi...`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-pupr-blue text-white p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge className="bg-pupr-yellow text-slate-950 font-bold text-[10px] uppercase tracking-wider">
              BSSN / BSrE Compliant
            </Badge>
            <Badge variant="outline" className="text-emerald-300 border-emerald-400/40 text-[10px] font-mono">
              ISO 27001 Audit Trail
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Security Audit & Activity Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Rekam jejak digital terenkripsi untuk seluruh otentikasi administrator, penandatanganan TTE BSrE, dan deteksi anomali akses dengan telemetri Geolocation GPS & IP Metadata.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <Button
            onClick={handleSimulateAuditEntry}
            disabled={isSimulating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md h-9"
          >
            <Plus size={15} className={`mr-1.5 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Mencatat Telemetri GPS...' : 'Simulasi Akses / TTE Baru'}
          </Button>

          <Button
            onClick={handleExportAuditPdf}
            variant="outline"
            className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100 text-xs font-semibold h-9"
          >
            <Download size={15} className="mr-1.5 text-pupr-yellow" />
            Ekspor Laporan Audit (PDF)
          </Button>
        </div>
      </div>

      {/* Security Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-2xs bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Audit Log</span>
            <div className="p-2 bg-blue-50 text-pupr-blue rounded-lg">
              <History size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{logs.length}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Aktif 100%</span>
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-2xs bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">TTE BSrE Valid</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileCheck size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {logs.filter(l => l.category === 'document_signature').length}
            </span>
            <span className="text-[11px] text-slate-400">Terverifikasi</span>
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-2xs bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Peringatan Keamanan</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600 font-mono">
              {logs.filter(l => l.accessStatus === 'FLAGGED_SUSPICIOUS' || l.accessStatus === 'BLOCKED').length}
            </span>
            <span className="text-[11px] text-red-500 font-semibold">Tindakan Otomatis</span>
          </div>
        </Card>

        <Card className="border-slate-200/80 shadow-2xs bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Akurasi GPS Telemetri</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <MapPin size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">± 2.4m</span>
            <span className="text-[11px] text-emerald-600 font-semibold">High Precision</span>
          </div>
        </Card>
      </div>

      {/* Main Log Viewer & Filter Table */}
      <Card className="border-slate-200 shadow-2xs rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/80 p-4 border-b border-slate-200 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <Input
                type="text"
                placeholder="Cari user, NIP, IP, lokasi, dokumen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl border-slate-200 bg-white"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  categoryFilter === 'ALL' ? 'bg-pupr-blue text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Semua Kategori ({logs.length})
              </button>
              <button
                onClick={() => setCategoryFilter('document_signature')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  categoryFilter === 'document_signature' ? 'bg-pupr-blue text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <FileCheck size={13} /> Signature TTE
              </button>
              <button
                onClick={() => setCategoryFilter('admin_access')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  categoryFilter === 'admin_access' ? 'bg-pupr-blue text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <LogIn size={13} /> Akses Admin
              </button>
              <button
                onClick={() => setCategoryFilter('security_alert')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  categoryFilter === 'security_alert' ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ShieldAlert size={13} /> Anomali / Alert
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <ShieldAlert size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Tidak ada log aktivitas yang sesuai dengan kriteria pencarian.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Status Icon Indicator */}
                    <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                      log.accessStatus === 'SUCCESS' && log.category === 'document_signature'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : log.accessStatus === 'SUCCESS'
                        ? 'bg-blue-100 text-pupr-blue border border-blue-200'
                        : 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                    }`}>
                      {log.category === 'document_signature' ? (
                        <FileCheck size={20} />
                      ) : log.accessStatus === 'FLAGGED_SUSPICIOUS' ? (
                        <ShieldAlert size={20} />
                      ) : (
                        <Key size={20} />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-pupr-blue transition-colors">
                          {log.actionName}
                        </span>
                        <Badge className={`text-[10px] font-mono ${
                          log.accessStatus === 'SUCCESS' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-300' : 'bg-red-500/15 text-red-700 border-red-300'
                        }`}>
                          {log.accessStatus}
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-400">#{log.id}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="font-medium text-slate-800 flex items-center gap-1">
                          <UserCheck size={13} className="text-slate-400" />
                          {log.user.name} <span className="text-slate-400">({log.user.role})</span>
                        </span>

                        <span className="flex items-center gap-1 text-slate-500 font-mono">
                          <Globe size={13} className="text-blue-500" />
                          {log.ipAddress}
                        </span>

                        <span className="flex items-center gap-1 text-slate-500 truncate max-w-xs">
                          <MapPin size={13} className="text-red-500 shrink-0" />
                          {log.geolocation.locationName}
                        </span>
                      </div>

                      {/* Signature title snippet if available */}
                      {log.signatureMeta && (
                        <div className="pt-1 flex items-center gap-2 text-xs text-emerald-800">
                          <span className="font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate">
                            📄 {log.signatureMeta.documentTitle} ({log.signatureMeta.documentId})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Meta Column */}
                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <div className="text-right text-xs">
                      <span className="text-slate-400 block flex items-center justify-end gap-1">
                        <Clock size={12} />
                        {log.timestamp}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{log.deviceMeta.deviceType} • {log.deviceMeta.browser.split(' ')[0]}</span>
                    </div>

                    <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 group-hover:text-pupr-blue">
                      <Maximize2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DETAIL AUDIT CERTIFICATE MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Top Header */}
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pupr-blue/30 text-pupr-yellow rounded-xl border border-pupr-blue/40">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Sertifikat Audit Keamanan & Telemetri Digital
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID Log: {selectedLog.id} • BSSN BSrE Verification Log
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-slate-800">
              {/* Event Overview Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aktivitas Terdaftar</span>
                  <Badge className={`font-mono text-xs ${
                    selectedLog.accessStatus === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    Status: {selectedLog.accessStatus}
                  </Badge>
                </div>
                <h4 className="text-lg font-black text-slate-900">{selectedLog.actionName}</h4>
                <p className="text-xs text-slate-600">{selectedLog.notes}</p>
              </div>

              {/* User Identity & Authentication */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] text-slate-500">
                    <UserCheck size={14} className="text-pupr-blue" /> Identitas Pengguna / Pelaku
                  </h5>
                  <div className="space-y-1 font-sans">
                    <div className="text-sm font-black text-slate-900">{selectedLog.user.name}</div>
                    <div className="text-slate-600 font-medium">Jabatan: {selectedLog.user.role}</div>
                    <div className="font-mono text-slate-500">NIP: {selectedLog.user.nip}</div>
                    <div className="text-slate-500 truncate">{selectedLog.user.email}</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] text-slate-500">
                    <Smartphone size={14} className="text-pupr-blue" /> Metadata Perangkat & Browser
                  </h5>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div>Browser: <strong className="text-slate-800">{selectedLog.deviceMeta.browser}</strong></div>
                    <div>Sistem Operasi: <strong className="text-slate-800">{selectedLog.deviceMeta.os}</strong></div>
                    <div>Tipe Perangkat: <strong className="text-slate-800">{selectedLog.deviceMeta.deviceType}</strong></div>
                    <div>Fingerprint: <strong className="text-amber-700">{selectedLog.deviceMeta.fingerprintHash}</strong></div>
                  </div>
                </div>
              </div>

              {/* Geolocation & IP Telemetry */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <h5 className="font-bold uppercase text-[11px] text-amber-300 flex items-center gap-1.5">
                  <Globe size={14} /> Telemetri Lokasi GPS Presisi & IP Network
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[10px]">Alamat IP Public & Network</span>
                    <span className="text-emerald-400 text-sm font-black">{selectedLog.ipAddress}</span>
                    <span className="text-slate-300 text-[11px] block">{selectedLog.ispProvider}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[10px]">Koordinat Geolocation GPS</span>
                    <span className="text-amber-300 text-sm font-black">{selectedLog.geolocation.lat}, {selectedLog.geolocation.lng}</span>
                    <span className="text-slate-300 text-[11px] block">Akurasi Radius: ±{selectedLog.geolocation.accuracyMeters} meter</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <MapPin size={14} className="text-red-400" />
                    {selectedLog.geolocation.locationName}
                  </span>
                  <Badge variant="outline" className="border-slate-700 text-slate-300 font-mono text-[10px]">
                    GPS Geotagged
                  </Badge>
                </div>
              </div>

              {/* TTE Signature Metadata (if applicable) */}
              {selectedLog.signatureMeta && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-emerald-950 flex items-center gap-1.5 uppercase text-[11px]">
                      <FileCheck size={15} className="text-emerald-600" /> Spesifikasi TTE Digital BSrE BSSN
                    </h5>
                    <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                      {selectedLog.signatureMeta.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-emerald-900">
                    <div>Dokumen: <strong className="text-emerald-950">{selectedLog.signatureMeta.documentTitle}</strong></div>
                    <div>ID Berkas: <strong className="text-emerald-950">{selectedLog.signatureMeta.documentId}</strong></div>
                    <div>Algoritma: <strong className="text-emerald-950">{selectedLog.signatureMeta.signatureAlgorithm}</strong></div>
                    <div>ID Sertifikat: <strong className="text-emerald-950">{selectedLog.signatureMeta.bsreCertId}</strong></div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-emerald-300 text-[11px] font-mono space-y-1">
                    <span className="text-slate-500 font-semibold block">Digest Hash SHA-256 Dokumen:</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-800 truncate">{selectedLog.signatureMeta.hashSha256}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(selectedLog.signatureMeta!.hashSha256)}
                        className="h-6 px-2 text-[10px]"
                      >
                        {copiedHash ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                PUPR Security Operations Center (SOC)
              </span>
              <Button
                size="sm"
                variant="pupr"
                onClick={() => setSelectedLog(null)}
                className="text-xs font-bold"
              >
                Tutup Bukti Audit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
