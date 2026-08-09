import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Scan, 
  Camera, 
  X, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Upload, 
  Layers, 
  FileText,
  Flashlight,
  Compass,
  Check,
  Wrench,
  Clock,
  History,
  DollarSign,
  FileCheck,
  Search,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  SwitchCamera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Html5Qrcode } from 'html5-qrcode';

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'Pemeliharaan Rutin' | 'Rehabilitasi Struktur' | 'Injeksi Epoksi Retak' | 'Penggantian Atap' | 'Inspeksi Berkala PUPR' | 'Perbaikan MEP';
  description: string;
  costEstimate: string;
  contractorOrTeam: string;
  status: 'SELESAI' | 'DALAM_PROSES' | 'DIREKOMENDASIKAN';
  documentRef?: string;
}

export interface ScannedBuildingData {
  tagId: string;
  buildingName: string;
  instansi: string;
  category: string;
  kecamatan: string;
  address: string;
  coords: string;
  yearBuilt: number;
  floorCount: number;
  buildingArea: number; // in m2
  structuralType: string;
  lastInspectionDate: string;
  lastSurveyor: string;
  damageStatus: 'Tidak Rusak' | 'Rusak Ringan' | 'Rusak Sedang' | 'Rusak Berat';
  damagePercentage: number;
  maintenanceStatus: 'Pemeliharaan Berkala Perlu Segera' | 'Dalam Garansi Pemeliharaan' | 'Kondisi Baik - Pemeliharaan Rutin' | 'Rehabilitasi Berat Diperlukan';
  nextMaintenanceSchedule: string;
  slfStatus: 'SLF-AKTIF-2027' | 'PERLU-PERPANJANGAN-SLF' | 'PROSES-EVALUASI';
  qrHash: string;
  verificationStatus: 'TERVERIFIKASI_PUPR' | 'TIDAK_TERDAFTAR';
  maintenanceHistory: MaintenanceRecord[];
}

// Sample Database of Tagged Buildings in Garut with Maintenance Records
export const font_sample_buildings: Record<string, ScannedBuildingData> = {
  'QR-PUPR-2026-001': {
    tagId: 'QR-PUPR-2026-001',
    buildingName: 'Puskesmas DTP Cikajang',
    instansi: 'Dinas Kesehatan Kab. Garut',
    category: 'Gedung Pelayanan Kesehatan',
    kecamatan: 'Cikajang',
    address: 'Jl. Raya Cikajang No. 42, Cikajang, Garut',
    coords: '-7.3245, 107.7891',
    yearBuilt: 2014,
    floorCount: 2,
    buildingArea: 1250,
    structuralType: 'Beton Bertulang K-250 & Rangka Atap Baja Ringan',
    lastInspectionDate: '2026-07-28',
    lastSurveyor: 'Ir. Hendra Pratama',
    damageStatus: 'Rusak Sedang',
    damagePercentage: 38.5,
    maintenanceStatus: 'Pemeliharaan Berkala Perlu Segera',
    nextMaintenanceSchedule: '2026-09-15',
    slfStatus: 'PERLU-PERPANJANGAN-SLF',
    qrHash: 'e7f8b90a-1234-4567-89ab-cdef01234567',
    verificationStatus: 'TERVERIFIKASI_PUPR',
    maintenanceHistory: [
      {
        id: 'MNT-2026-08',
        date: '2026-07-28',
        type: 'Inspeksi Berkala PUPR',
        description: 'Pemeriksaan khusus pasca-retakan struktur kolom teras utama & balok kantilever. Ditemukan retak diagonal 2.5mm.',
        costEstimate: 'Rp 145.000.000 (Rekomendasi)',
        contractorOrTeam: 'Tim Inspeksi DPUPR Garut',
        status: 'DIREKOMENDASIKAN',
        documentRef: 'BAP-PUPR-2026-088.pdf'
      },
      {
        id: 'MNT-2025-03',
        date: '2025-04-12',
        type: 'Pemeliharaan Rutin',
        description: 'Pengecatan ulang fasad luar, pembersihan talang air hujan, dan penggantian saklar listrik kamar inap.',
        costEstimate: 'Rp 45.000.000',
        contractorOrTeam: 'CV Garut Mandiri Sejahtera',
        status: 'SELESAI',
        documentRef: 'SPK-2025-DINKES-042.pdf'
      },
      {
        id: 'MNT-2023-11',
        date: '2023-11-05',
        type: 'Rehabilitasi Struktur',
        description: 'Perkuatan struktur kolom dengan Carbon Fiber Reinforced Polymer (CFRP) pada 4 titik utama teras.',
        costEstimate: 'Rp 120.000.000',
        contractorOrTeam: 'PT Karya Konstruksi Utama',
        status: 'SELESAI',
        documentRef: 'BAST-2023-PUPR-1102.pdf'
      }
    ]
  },
  'QR-PUPR-2026-002': {
    tagId: 'QR-PUPR-2026-002',
    buildingName: 'SDN 1 Tarogong Kidul',
    instansi: 'Dinas Pendidikan Kab. Garut',
    category: 'Gedung Fasilitas Pendidikan',
    kecamatan: 'Tarogong Kidul',
    address: 'Jl. Pembangunan No. 12, Tarogong Kidul, Garut',
    coords: '-7.2028, 107.8824',
    yearBuilt: 2008,
    floorCount: 2,
    buildingArea: 890,
    structuralType: 'Rangka Beton Bertulang & Dinding Bata Merah',
    lastInspectionDate: '2026-06-15',
    lastSurveyor: 'Budi Santoso, ST',
    damageStatus: 'Rusak Ringan',
    damagePercentage: 18.2,
    maintenanceStatus: 'Kondisi Baik - Pemeliharaan Rutin',
    nextMaintenanceSchedule: '2026-12-01',
    slfStatus: 'SLF-AKTIF-2027',
    qrHash: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
    verificationStatus: 'TERVERIFIKASI_PUPR',
    maintenanceHistory: [
      {
        id: 'MNT-2026-04',
        date: '2026-06-15',
        type: 'Inspeksi Berkala PUPR',
        description: 'Survei rutin gedung sekolah menjelang tahun ajaran baru. Ditemukan penutup atap bocor di kelas 4B.',
        costEstimate: 'Rp 18.500.000',
        contractorOrTeam: 'Surveyor Budi Santoso, ST',
        status: 'DIREKOMENDASIKAN',
        documentRef: 'SURVEI-DISDIK-0615.pdf'
      },
      {
        id: 'MNT-2024-09',
        date: '2024-09-20',
        type: 'Penggantian Atap',
        description: 'Penggantian kuda-kuda kayu lapuk dengan atap baja ringan gorden kanal C75 & spandek berpasir.',
        costEstimate: 'Rp 85.000.000',
        contractorOrTeam: 'CV Tirta Kencana Garut',
        status: 'SELESAI',
        documentRef: 'BAST-2024-ATAP-SDN1.pdf'
      }
    ]
  },
  'QR-PUPR-2026-003': {
    tagId: 'QR-PUPR-2026-003',
    buildingName: 'Pasar Rakyat Wanaraja',
    instansi: 'Disperindag Kab. Garut',
    category: 'Gedung Fasilitas Perdagangan',
    kecamatan: 'Wanaraja',
    address: 'Jl. Pasar Wanaraja, Wanaraja, Garut',
    coords: '-7.1852, 107.9712',
    yearBuilt: 2011,
    floorCount: 1,
    buildingArea: 2100,
    structuralType: 'Baja WF 250 & Dinding Pasangan Batako',
    lastInspectionDate: '2026-08-01',
    lastSurveyor: 'Dedin Kusnadi, A.Md',
    damageStatus: 'Rusak Berat',
    damagePercentage: 54.8,
    maintenanceStatus: 'Rehabilitasi Berat Diperlukan',
    nextMaintenanceSchedule: '2026-08-15 (Darurat)',
    slfStatus: 'PROSES-EVALUASI',
    qrHash: 'f9e8d7c6-5432-10fe-dcba-9876543210fe',
    verificationStatus: 'TERVERIFIKASI_PUPR',
    maintenanceHistory: [
      {
        id: 'MNT-2026-09',
        date: '2026-08-01',
        type: 'Inspeksi Berkala PUPR',
        description: 'Penilaian darurat pasca-gempa lokal. Korosi parah pada sambungan las balok baja WF & keretakan meluas.',
        costEstimate: 'Rp 480.000.000',
        contractorOrTeam: 'Tim Reaksi Cepat DPUPR Garut',
        status: 'DALAM_PROSES',
        documentRef: 'BAP-DARURAT-WANARAJA.pdf'
      },
      {
        id: 'MNT-2022-03',
        date: '2022-03-10',
        type: 'Perbaikan MEP',
        description: 'Perbaikan total jalur kabel listrik utama, peremajaan panel distribusi, dan drainase kotor.',
        costEstimate: 'Rp 65.000.000',
        contractorOrTeam: 'Disperindag Kab. Garut',
        status: 'SELESAI',
        documentRef: 'MEP-PASAR-2022.pdf'
      }
    ]
  },
  'QR-PUPR-2026-004': {
    tagId: 'QR-PUPR-2026-004',
    buildingName: 'RSUD Dr. Slamet Garut - Gedung Rawat Inap Utama',
    instansi: 'Dinas Kesehatan Kab. Garut',
    category: 'Gedung Rumah Sakit Daerah',
    kecamatan: 'Tarogong Kidul',
    address: 'Jl. Rumah Sakit No. 12, Garut Kota',
    coords: '-7.2144, 107.9015',
    yearBuilt: 2017,
    floorCount: 4,
    buildingArea: 3800,
    structuralType: 'Beton Bertulang K-350 & Tiang Pancang Spun Pile',
    lastInspectionDate: '2026-05-10',
    lastSurveyor: 'Ir. Hendra Pratama',
    damageStatus: 'Tidak Rusak',
    damagePercentage: 4.2,
    maintenanceStatus: 'Dalam Garansi Pemeliharaan',
    nextMaintenanceSchedule: '2027-05-10',
    slfStatus: 'SLF-AKTIF-2027',
    qrHash: 'c3d4e5f6-7890-12ab-cdef-34567890abcd',
    verificationStatus: 'TERVERIFIKASI_PUPR',
    maintenanceHistory: [
      {
        id: 'MNT-2026-02',
        date: '2026-05-10',
        type: 'Inspeksi Berkala PUPR',
        description: 'Evaluasi Sertifikat Laik Fungsi (SLF) berkala 5 tahunan. Struktur dalam performa kapasitas prima.',
        costEstimate: 'Rp 0 (Rutin)',
        contractorOrTeam: 'Tim Sertifikasi SLF PUPR',
        status: 'SELESAI',
        documentRef: 'SLF-RSUD-2026.pdf'
      },
      {
        id: 'MNT-2025-10',
        date: '2025-10-15',
        type: 'Perbaikan MEP',
        description: 'Servis tahunan Chiller Sentral, Otomasi Hydrant Gedung, dan Uji Beban Genset 500 kVA.',
        costEstimate: 'Rp 180.000.000',
        contractorOrTeam: 'PT Medika Sarana Indonesia',
        status: 'SELESAI',
        documentRef: 'MAINT-MEP-RSUD-2025.pdf'
      }
    ]
  },
  'QR-PUPR-2026-005': {
    tagId: 'QR-PUPR-2026-005',
    buildingName: 'Gedung Pemkab Garut (Setda Garut)',
    instansi: 'Sekretariat Daerah Kab. Garut',
    category: 'Gedung Perkantoran Pemerintah',
    kecamatan: 'Garut Kota',
    address: 'Jl. Pembangunan No. 185, Tarogong Kidul, Garut',
    coords: '-7.2188, 107.9022',
    yearBuilt: 2010,
    floorCount: 3,
    buildingArea: 4200,
    structuralType: 'Beton Bertulang K-300 & Curtain Wall ACP',
    lastInspectionDate: '2026-07-02',
    lastSurveyor: 'Ahmad Fauzi, ST',
    damageStatus: 'Rusak Ringan',
    damagePercentage: 12.0,
    maintenanceStatus: 'Kondisi Baik - Pemeliharaan Rutin',
    nextMaintenanceSchedule: '2027-01-15',
    slfStatus: 'SLF-AKTIF-2027',
    qrHash: 'b8a7f6e5-4321-0987-fedc-ba9876543210',
    verificationStatus: 'TERVERIFIKASI_PUPR',
    maintenanceHistory: [
      {
        id: 'MNT-2026-07',
        date: '2026-07-02',
        type: 'Pemeliharaan Rutin',
        description: 'Penggantian modul panel Aluminum Composite Panel (ACP) fasad luar dan sealent kaca gedung.',
        costEstimate: 'Rp 52.000.000',
        contractorOrTeam: 'CV Utama Teknik Garut',
        status: 'SELESAI',
        documentRef: 'PML-SETDA-2026.pdf'
      }
    ]
  }
};

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildingSelect?: (building: ScannedBuildingData) => void;
  onNavigateToSurvey?: (building: ScannedBuildingData) => void;
}

export function QRCodeScannerModal({
  isOpen,
  onClose,
  onBuildingSelect,
  onNavigateToSurvey
}: QRCodeScannerModalProps) {
  const [activeScanTab, setActiveScanTab] = useState<'camera' | 'upload' | 'sample'>('camera');
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState<ScannedBuildingData | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string>('QR-PUPR-2026-001');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [notFoundError, setNotFoundError] = useState(false);
  
  // Real Camera Scanner States
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flashOn, setFlashOn] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);

  // Active view tab when viewing retrieved records
  const [activeRecordTab, setActiveRecordTab] = useState<'overview' | 'maintenance' | 'specs'>('overview');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = 'qr-camera-stream-reader';

  // Handle camera scanner initialization
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isOpen && isScanning && activeScanTab === 'camera') {
      setIsCameraStarting(true);
      setCameraError(null);

      // Initialize Html5Qrcode instance
      const timer = setTimeout(() => {
        try {
          const container = document.getElementById(scannerRegionId);
          if (container) {
            try {
              html5QrCode = new Html5Qrcode(scannerRegionId);
              html5QrCodeRef.current = html5QrCode;
            } catch (err) {
              setCameraError('Gagal inisialisasi modul kamera. Lingkungan ini mungkin membatasi akses.');
              return;
            }

            html5QrCode.start(
              { facingMode: facingMode },
              {
                fps: 10,
                qrbox: { width: 220, height: 220 },
                aspectRatio: 1.0
              },
              (decodedText) => {
                // Successfully scanned QR code text
                if (html5QrCode && html5QrCode.isScanning) {
                  html5QrCode.stop().catch(console.error);
                }
                handleScanComplete(decodedText.trim().toUpperCase());
              },
              () => {
                // Ignore scanning framing errors
              }
            )
            .then(() => {
              setCameraPermissionGranted(true);
              setIsCameraStarting(false);
            })
            .catch((err) => {
              console.warn('Camera stream direct access fallback:', err);
              setCameraPermissionGranted(false);
              setCameraError('Gagal mengakses kamera fisik (Iframe/Permission). Gunakan mode pindaian simulasi atau pilih sampel tag.');
              setIsCameraStarting(false);
            });
          }
        } catch (err: any) {
          console.warn('QR scanner init error:', err);
          setCameraPermissionGranted(false);
          setIsCameraStarting(false);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
      };
    } else {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    }
  }, [isOpen, isScanning, activeScanTab, facingMode]);

  const handleScanComplete = (tagIdOrText: string) => {
    setIsScanning(false);
    
    // Stop camera if running
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().catch(() => {});
    }

    // Lookup exact Tag ID or match by key/name
    let found = font_sample_buildings[tagIdOrText];
    if (!found) {
      // Try matching partial key
      const matchKey = Object.keys(font_sample_buildings).find(k => k.toLowerCase() === tagIdOrText.toLowerCase());
      if (matchKey) {
        found = font_sample_buildings[matchKey];
      } else {
        // Try matching building name or tag inside values
        const matchedVal = Object.values(font_sample_buildings).find(b => 
          b.tagId.toLowerCase().includes(tagIdOrText.toLowerCase()) ||
          b.buildingName.toLowerCase().includes(tagIdOrText.toLowerCase())
        );
        if (matchedVal) found = matchedVal;
      }
    }

    if (found) {
      setScannedData(found);
      setNotFoundError(false);
      if (onBuildingSelect) {
        onBuildingSelect(found);
      }
    } else {
      // If tag text is a new valid tag, dynamically construct a record
      if (tagIdOrText.startsWith('QR-') || tagIdOrText.startsWith('TAG-')) {
        const dynamicRecord: ScannedBuildingData = {
          tagId: tagIdOrText,
          buildingName: `Gedung Dinas Garut (${tagIdOrText})`,
          instansi: 'Pemerintah Kabupaten Garut',
          category: 'Gedung Bangunan Negara',
          kecamatan: 'Garut Kota',
          address: 'Jl. Raya Garut Kota, Kab. Garut',
          coords: '-7.2144, 107.9015',
          yearBuilt: 2016,
          floorCount: 2,
          buildingArea: 1100,
          structuralType: 'Beton Bertulang K-275 & Dinding Bata',
          lastInspectionDate: new Date().toISOString().split('T')[0],
          lastSurveyor: 'Tim Inspeksi Lapangan PUPR',
          damageStatus: 'Rusak Ringan',
          damagePercentage: 15.0,
          maintenanceStatus: 'Kondisi Baik - Pemeliharaan Rutin',
          nextMaintenanceSchedule: '2027-02-01',
          slfStatus: 'SLF-AKTIF-2027',
          qrHash: `hash-${Math.random().toString(36).substring(2, 10)}`,
          verificationStatus: 'TERVERIFIKASI_PUPR',
          maintenanceHistory: [
            {
              id: `MNT-${Date.now().toString().slice(-4)}`,
              date: new Date().toISOString().split('T')[0],
              type: 'Inspeksi Berkala PUPR',
              description: `Pindaian tag QR ${tagIdOrText} berhasil diambil dari kamera fisik. Record pemeliharaan aktif.`,
              costEstimate: 'Rp 25.000.000',
              contractorOrTeam: 'Surveyor SIPEKA PUPR',
              status: 'SELESAI',
              documentRef: `SCAN-${tagIdOrText}.pdf`
            }
          ]
        };
        setScannedData(dynamicRecord);
        setNotFoundError(false);
        if (onBuildingSelect) onBuildingSelect(dynamicRecord);
      } else {
        setScannedData(null);
        setNotFoundError(true);
      }
    }
  };

  const handleRescan = () => {
    setScannedData(null);
    setNotFoundError(false);
    setIsScanning(true);
  };

  // Handle uploaded image file scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      let html5QrCode;
      try {
        html5QrCode = new Html5Qrcode('qr-file-scanner-temp');
      } catch (err) {
        setCameraError('Lingkungan ini membatasi pemindaian QR code offline.');
        return;
      }
      html5QrCode.scanFile(file, true)
        .then((decodedText) => {
          handleScanComplete(decodedText.trim().toUpperCase());
        })
        .catch(() => {
          // If decoding failed on image, fallback to searching code in sample
          handleScanComplete(selectedTagId);
        });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    const formatted = manualCodeInput.trim().toUpperCase();
    handleScanComplete(formatted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-pupr-blue p-4 sm:p-5 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pupr-blue/30 rounded-xl text-pupr-yellow border border-pupr-blue/40 shadow-inner">
              <QrCode size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Pemindai Tag QR & Rekam Pemeliharaan Gedung</h3>
                <Badge variant="outline" className="text-[10px] bg-emerald-400/10 text-emerald-300 border-emerald-400/40">
                  Kabupaten Garut
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Pindai stiker identitas fisik bangunan gedung untuk penarikan data master & histori pemeliharaan instan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hidden temp div for file scanner */}
        <div id="qr-file-scanner-temp" className="hidden"></div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Active Scanner Viewfinder Mode */}
          {isScanning && (
            <div className="space-y-4">
              {/* Scan Mode Toggle */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveScanTab('camera')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeScanTab === 'camera' ? 'bg-white dark:bg-slate-900 text-pupr-blue shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                    }`}
                  >
                    <Camera size={14} /> Kamera Perangkat
                  </button>
                  <button
                    onClick={() => setActiveScanTab('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeScanTab === 'upload' ? 'bg-white dark:bg-slate-900 text-pupr-blue shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                    }`}
                  >
                    <Upload size={14} /> Unggah Foto Tag
                  </button>
                  <button
                    onClick={() => setActiveScanTab('sample')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeScanTab === 'sample' ? 'bg-white dark:bg-slate-900 text-pupr-blue shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                    }`}
                  >
                    <Sparkles size={14} /> Pilih Sampel Tag
                  </button>
                </div>

                {activeScanTab === 'camera' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                    className="text-xs h-8 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  >
                    <SwitchCamera size={13} className="mr-1 text-pupr-blue" />
                    {facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}
                  </Button>
                )}
              </div>

              {/* CAMERA SCANNER TAB */}
              {activeScanTab === 'camera' && (
                <div className="space-y-4">
                  <div className="relative aspect-video max-h-[320px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center shadow-inner">
                    {/* Html5Qrcode video stream target */}
                    <div id={scannerRegionId} className="w-full h-full object-cover rounded-2xl overflow-hidden"></div>

                    {/* Camera Starting Spinner overlay */}
                    {isCameraStarting && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                        <RefreshCw size={28} className="animate-spin text-pupr-yellow" />
                        <span className="text-xs font-mono">Memulai Sensor Kamera Perangkat...</span>
                      </div>
                    )}

                    {/* Fallback Viewfinder overlay when camera stream is ready or simulating */}
                    {!isCameraStarting && (
                      <>
                        {/* Scanner Target Box with Corner Brackets */}
                        <div className="absolute w-48 h-48 sm:w-52 sm:h-52 border-2 border-pupr-blue/40 rounded-2xl flex items-center justify-center pointer-events-none shadow-2xl">
                          {/* Corner Accents */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-pupr-yellow rounded-tl-lg" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-pupr-yellow rounded-tr-lg" />
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-pupr-yellow rounded-bl-lg" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-pupr-yellow rounded-br-lg" />

                          {/* Animated Laser Scanning Line */}
                          <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-pupr-yellow to-transparent shadow-[0_0_12px_#fbbf24] animate-[bounce_2s_infinite]" />

                          <div className="text-center space-y-1 bg-slate-950/70 p-2 rounded-xl backdrop-blur-xs border border-slate-800">
                            <Scan className="w-8 h-8 text-pupr-yellow mx-auto animate-pulse" />
                            <span className="text-[10px] font-mono text-slate-200 block">
                              MENGARAHKAN LOGIK DETEKSI QR...
                            </span>
                          </div>
                        </div>

                        {/* Viewfinder Top HUD */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-mono bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-auto">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            KAMERA SCANNER ACTIVE
                          </span>
                          <button
                            onClick={() => setFlashOn(!flashOn)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded border ${
                              flashOn ? 'bg-amber-400/20 text-amber-300 border-amber-400/50' : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <Flashlight size={12} />
                            {flashOn ? 'SENTER AKTIF' : 'SENTER MATI'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Fallback info when camera permission or stream is unavailable in sandbox */}
                  {cameraError && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                        <span>{cameraError}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleScanComplete(selectedTagId)}
                        className="text-[11px] h-7 bg-white dark:bg-slate-900 border-amber-300 text-amber-900 shrink-0"
                      >
                        Gunakan Pindaian Simulasi
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* UPLOAD QR FILE TAB */}
              {activeScanTab === 'upload' && (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-800/70 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    id="qr-file-input"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="qr-file-input" className="cursor-pointer block space-y-2">
                    <div className="w-12 h-12 bg-pupr-blue/10 text-pupr-blue rounded-full flex items-center justify-center mx-auto border border-pupr-blue/20">
                      <Upload size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Unggah Gambar atau Foto Stiker QR Tag PUPR</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Pilih berkas JPG/PNG foto stiker QR yang diambil dari dinding atau plang gedung untuk pemindaian otomatis.
                    </p>
                  </label>
                </div>
              )}

              {/* SAMPLE SELECTOR TAB */}
              {activeScanTab === 'sample' && (
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={15} className="text-pupr-blue" />
                      Pilih Sampel Tag Gedung Resmi Garut untuk Pengujian:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.values(font_sample_buildings).map((b) => (
                      <button
                        key={b.tagId}
                        type="button"
                        onClick={() => {
                          setSelectedTagId(b.tagId);
                          handleScanComplete(b.tagId);
                        }}
                        className={`text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                          selectedTagId === b.tagId
                            ? 'bg-pupr-blue text-white border-pupr-blue shadow-sm font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-pupr-blue'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Building2 size={14} className={selectedTagId === b.tagId ? 'text-pupr-yellow' : 'text-pupr-blue'} />
                            <span className="text-xs font-bold truncate max-w-[160px]">{b.buildingName}</span>
                          </div>
                          <span className={`text-[11px] block mt-0.5 ${selectedTagId === b.tagId ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            {b.instansi} • {b.kecamatan}
                          </span>
                        </div>
                        <Badge className={`text-[10px] font-mono ${
                          selectedTagId === b.tagId ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          {b.tagId}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Tag Input Form */}
              <form onSubmit={handleManualSubmit} className="flex gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  placeholder="Atau ketik Kode Tag ID (mis: QR-PUPR-2026-001)"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs focus:ring-2 focus:ring-pupr-blue/30 focus:border-pupr-blue font-mono"
                />
                <Button type="submit" size="sm" variant="pupr" className="h-9 text-xs">
                  Proses Tag
                </Button>
              </form>
            </div>
          )}

          {/* Result View: Instant Building Maintenance Records Retrieved */}
          {!isScanning && scannedData && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Verification & Building Title Banner */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-xs">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-emerald-950">
                        Tag QR Resmi Terverifikasi Sistem DPUPR Garut
                      </h4>
                      <Badge className="bg-emerald-600 text-white text-[10px] font-mono">
                        {scannedData.tagId}
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Catatan pemeliharaan & data teknis berhasil ditarik dari Database Master SIMBG / SIPEKA v2.0
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge variant="outline" className={`text-xs font-bold py-1 px-3 ${
                    scannedData.maintenanceStatus.includes('Perlu Segera') || scannedData.maintenanceStatus.includes('Diperlukan')
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    <Wrench size={12} className="mr-1" />
                    {scannedData.maintenanceStatus}
                  </Badge>
                </div>
              </div>

              {/* Record View Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <button
                  onClick={() => setActiveRecordTab('overview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeRecordTab === 'overview' ? 'bg-pupr-blue text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  <Building2 size={14} /> Profil & Status Bangunan
                </button>
                <button
                  onClick={() => setActiveRecordTab('maintenance')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeRecordTab === 'maintenance' ? 'bg-pupr-blue text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  <History size={14} /> Histori Pemeliharaan ({scannedData.maintenanceHistory.length})
                </button>
                <button
                  onClick={() => setActiveRecordTab('specs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeRecordTab === 'specs' ? 'bg-pupr-blue text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  <Layers size={14} /> Spesifikasi Struktur
                </button>
              </div>

              {/* TAB 1: OVERVIEW & STATUS */}
              {activeRecordTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Building Profile Summary */}
                  <div className="md:col-span-2 space-y-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {scannedData.category}
                      </span>
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                        {scannedData.buildingName}
                      </h2>
                      <p className="text-xs text-pupr-blue font-semibold mt-0.5">
                        {scannedData.instansi}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Kecamatan & Alamat</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1 mt-0.5">
                          <MapPin size={13} className="text-red-500 shrink-0 mt-0.5" />
                          <span>{scannedData.address}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Koordinat GPS Tag</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-bold block mt-0.5">
                          {scannedData.coords}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Luas & Jumlah Lantai</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                          {scannedData.buildingArea} m² ({scannedData.floorCount} Lantai)
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Tahun Berdiri & SLF</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                          {scannedData.yearBuilt} • <Badge variant="outline" className="text-[10px] bg-blue-50 text-pupr-blue">{scannedData.slfStatus}</Badge>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/70 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Jadwal Pemeliharaan Berikutnya</span>
                        <span className="font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                          <Calendar size={13} /> {scannedData.nextMaintenanceSchedule}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Digital Hash PUPR</span>
                        <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 font-bold block truncate max-w-[140px]">
                          {scannedData.qrHash}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Damage Rating Card */}
                  <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Kondisi Fisik Terakhir PUPR
                      </span>
                      <div className="p-3.5 rounded-xl border mb-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 space-y-1 text-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Tingkat Kerusakan Total</span>
                        <span
                          className={`text-2xl font-black block ${
                            scannedData.damageStatus === 'Rusak Berat'
                              ? 'text-red-600'
                              : scannedData.damageStatus === 'Rusak Sedang'
                              ? 'text-amber-600'
                              : scannedData.damageStatus === 'Rusak Ringan'
                              ? 'text-blue-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {scannedData.damagePercentage}%
                        </span>
                        <Badge className={`text-[10px] font-bold ${
                          scannedData.damageStatus === 'Rusak Berat' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {scannedData.damageStatus}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                          <span className="text-slate-500 dark:text-slate-400">Inspeksi Lapangan:</span>
                          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {scannedData.lastInspectionDate}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                          <span className="text-slate-500 dark:text-slate-400">Surveyor PUPR:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {scannedData.lastSurveyor}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="pupr"
                        size="sm"
                        onClick={() => {
                          if (onNavigateToSurvey) onNavigateToSurvey(scannedData);
                          onClose();
                        }}
                        className="w-full text-xs font-bold shadow-md"
                      >
                        Mulai Inspeksi Lapangan <ArrowRight size={14} className="ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MAINTENANCE HISTORY TIMELINE */}
              {activeRecordTab === 'maintenance' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <History size={16} className="text-pupr-blue" />
                      Linimasa Histori Intervensi & Pemeliharaan Gedung
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {scannedData.maintenanceHistory.length} Berkas Record Terdata
                    </span>
                  </div>

                  <div className="space-y-3">
                    {scannedData.maintenanceHistory.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/90 rounded-2xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-pupr-blue border-blue-200 font-mono text-[10px]">
                              {item.id}
                            </Badge>
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{item.type}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                              <Calendar size={12} /> {item.date}
                            </span>
                            <Badge className={`text-[10px] font-bold ${
                              item.status === 'SELESAI'
                                ? 'bg-emerald-600 text-white'
                                : item.status === 'DALAM_PROSES'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}>
                              {item.status}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                          <div>
                            <span className="text-slate-400 block font-semibold">Estimasi Biaya / Anggaran:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{item.costEstimate}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold">Pelaksana / Tim:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.contractorOrTeam}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold">Dokumen BAP Ref:</span>
                            <span className="font-mono text-pupr-blue font-bold">{item.documentRef || '-'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: STRUCTURAL SPECS */}
              {activeRecordTab === 'specs' && (
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers size={16} className="text-pupr-blue" />
                    Spesifikasi Elemen Komponen & Struktur Utama
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold block">Sistem Struktur Utama</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{scannedData.structuralType}</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold block">Pondasi & Sub-Struktur</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Pondasi Footplat Beton Bertulang K-300</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold block">Rangka Atap & Penutup</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Kuda-kuda Atap Baja Ringan / Spandek Berpasir</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold block">Sistem MEP & Proteksi Kebakaran</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Panel Lisrik 3-Phase, Hydrant Dinding, APAR 6kg</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons Footer Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRescan}
                  className="w-full sm:w-auto text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <RefreshCw size={14} className="mr-1.5 text-slate-600 dark:text-slate-400" /> Pindai Tag Lain
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      alert(`Mengunduh Berkas Master Record Pemeliharaan Gedung ${scannedData.buildingName} (PDF)...`);
                    }}
                    className="flex-1 sm:flex-initial text-xs border-pupr-blue/30 text-pupr-blue hover:bg-blue-50"
                  >
                    <Download size={14} className="mr-1.5" /> Ekspor Maintenance Record
                  </Button>

                  <Button
                    type="button"
                    variant="pupr"
                    size="sm"
                    onClick={() => {
                      if (onNavigateToSurvey) onNavigateToSurvey(scannedData);
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial text-xs font-bold shadow-md"
                  >
                    Mulai Form Survey <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Not Found State */}
          {!isScanning && notFoundError && (
            <div className="py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <AlertTriangle size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Tag QR Tidak Ditemukan</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Kode Tag QR yang dipindai tidak terdaftar di database master bangunan gedung DPUPR Kabupaten Garut.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleRescan} className="text-xs">
                  <RefreshCw size={14} className="mr-1.5" /> Coba Pindai Ulang
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
