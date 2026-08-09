import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardGlass, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ClipboardCheck, Search, Filter, Eye, CheckCircle2, AlertTriangle, 
  Clock, XCircle, ArrowUpRight, Download, FileText, UserCheck, Sparkles, 
  MessageSquare, ShieldCheck, X, Check, Save, FileCheck, Layers, RefreshCw,
  Plus, Camera, MapPin, CheckSquare, Square, FileSpreadsheet, History, 
  QrCode, Scale, Sliders, Edit3, Image as ImageIcon, CornerDownRight, Send, LayoutDashboard
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { EvidenceGallery } from '@/components/survey/EvidenceGallery';
import jsPDF from 'jspdf';
import { addFooterWithQRCode } from '../../lib/pdf-utils';
import autoTable from 'jspdf-autotable';
import { SigningModal, DocumentForSigning } from '../../components/tte/SigningModal';

// Extended Assessment Interfaces
export interface ComponentBreakdown {
  id: string;
  name: string;
  category: 'Struktur' | 'Arsitektur' | 'Utilitas';
  weight: number; // percentage in PUPR standard
  surveyorDamagePct: number;
  reviewerDamagePct: number;
  notes: string;
}

export interface PhotoEvidence {
  id: string;
  url: string;
  title: string;
  defectTag: string;
  aiConfidence: number;
  gps: string;
  timestamp: string;
}

export interface AssessmentReviewItem {
  id: string; // e.g. ASM-2026-001
  surveyId: string; // e.g. SRV-001
  buildingName: string;
  category: string;
  instansi: string;
  kecamatan: string;
  surveyor: string;
  reviewer: string;
  dateSubmitted: string;
  damagePercentage: number;
  riskLevel: 'Ringan' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';
  status: 'Menunggu Review' | 'Dalam Review' | 'Disetujui' | 'Perlu Perbaikan' | 'Ditolak';
  structuralScore: number;
  architecturalScore: number;
  utilityScore: number;
  aiRecommendation?: string;
  reviewerNotes?: string;
  reviewDate?: string;
  
  // Extended fields for Tahap 6
  componentsBreakdown?: ComponentBreakdown[];
  photoGallery?: PhotoEvidence[];
  complianceCheck?: {
    photosValid: boolean;
    gpsValid: boolean;
    sniCompliant: boolean;
    signedBySurveyor: boolean;
    notes: string;
  };
  digitalSignature?: {
    signedBy: string;
    timestamp: string;
    certNumber: string;
    qrCodeGenerated: boolean;
  };
  reviewHistory?: Array<{
    date: string;
    user: string;
    action: string;
    note: string;
  }>;
}

const DEFAULT_REVIEWS: AssessmentReviewItem[] = [
  {
    id: 'ASM-2026-001',
    surveyId: 'SRV-001',
    buildingName: 'SDN 1 Tarogong Kidul',
    category: 'Sekolah',
    instansi: 'Dinas Pendidikan Garut',
    kecamatan: 'Tarogong Kidul',
    surveyor: 'Budi Santoso, S.T.',
    reviewer: 'Siti Aminah, S.T.',
    dateSubmitted: '2026-08-01',
    damagePercentage: 12.4,
    riskLevel: 'Ringan',
    status: 'Disetujui',
    structuralScore: 4.2,
    architecturalScore: 16.8,
    utilityScore: 8.0,
    aiRecommendation: 'Kerusakan Ringan (PUPR 12.4%). Pemeliharaan rutin atap & pengecatan ulang dinding exterior.',
    reviewerNotes: 'Laporan dan dokumen foto lengkap. Tingkat kerusakan sesuai hasil pemeriksaan fisik.',
    reviewDate: '2026-08-01',
    componentsBreakdown: [
      { id: 'c1', name: 'Pondasi & Sloof', category: 'Struktur', weight: 12, surveyorDamagePct: 0, reviewerDamagePct: 0, notes: 'Struktur pondasi utuh tanpa retak landasan.' },
      { id: 'c2', name: 'Kolom & Balok Beton', category: 'Struktur', weight: 28, surveyorDamagePct: 5, reviewerDamagePct: 5, notes: 'Retak rambut kecil pada plesteran kolom teras.' },
      { id: 'c3', name: 'Dinding & Plesteran', category: 'Arsitektur', weight: 20, surveyorDamagePct: 15, reviewerDamagePct: 15, notes: 'Cat mengelupas akibat kelembaban.' },
      { id: 'c4', name: 'Penutup Atap & Rangka', category: 'Arsitektur', weight: 18, surveyorDamagePct: 20, reviewerDamagePct: 20, notes: 'Genteng pergeseran lokal 3 lembar.' },
      { id: 'c5', name: 'Plafon & Gantungan', category: 'Arsitektur', weight: 10, surveyorDamagePct: 10, reviewerDamagePct: 10, notes: 'Plafon kotor dan bercak bekas air.' },
      { id: 'c6', name: 'Instalasi Listrik & Sanitasi', category: 'Utilitas', weight: 12, surveyorDamagePct: 8, reviewerDamagePct: 8, notes: 'Lampu & kran air berfungsi normal.' },
    ],
    photoGallery: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', title: 'Fasad Depan SDN 1 Tarogong Kidul', defectTag: 'Kondisi Fasad Baik', aiConfidence: 98, gps: '-7.2154, 107.9012', timestamp: '2026-08-01 09:15' },
      { id: 'p2', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', title: 'Kondisi Plafon Koridor', defectTag: 'Bercak Lembab Plafon', aiConfidence: 92, gps: '-7.2155, 107.9014', timestamp: '2026-08-01 09:30' }
    ],
    complianceCheck: {
      photosValid: true,
      gpsValid: true,
      sniCompliant: true,
      signedBySurveyor: true,
      notes: 'Dokumen memenuhi standar teknis Permen PUPR No. 22/2018.'
    },
    digitalSignature: {
      signedBy: 'Siti Aminah, S.T. (NIP 19850412 201001 2 004)',
      timestamp: '2026-08-01 14:22:10',
      certNumber: 'CERT-PUPR-2026-88192',
      qrCodeGenerated: true
    },
    reviewHistory: [
      { date: '2026-08-01 09:45', user: 'Budi Santoso', action: 'Submit Survey', note: 'Data survey fisik lapangan dikirim.' },
      { date: '2026-08-01 14:22', user: 'Siti Aminah', action: 'Approve Assessment', note: 'Verifikasi selesai. BAP diterbitkan.' }
    ]
  },
  {
    id: 'ASM-2026-002',
    surveyId: 'SRV-002',
    buildingName: 'Puskesmas Cikajang',
    category: 'Fasilitas Kesehatan',
    instansi: 'Dinas Kesehatan Garut',
    kecamatan: 'Cikajang',
    surveyor: 'Ahmad Ridwan, S.T.',
    reviewer: 'Siti Aminah, S.T.',
    dateSubmitted: '2026-08-01',
    damagePercentage: 28.5,
    riskLevel: 'Sedang',
    status: 'Menunggu Review',
    structuralScore: 18.5,
    architecturalScore: 32.0,
    utilityScore: 21.0,
    aiRecommendation: 'Kerusakan Sedang (28.5%). Disarankan perkuatan kolom teras depan & waterproofing dak lantai atas.',
    reviewerNotes: '',
    componentsBreakdown: [
      { id: 'c1', name: 'Pondasi & Sloof', category: 'Struktur', weight: 12, surveyorDamagePct: 10, reviewerDamagePct: 10, notes: 'Penurunan tipis pada sudut timur.' },
      { id: 'c2', name: 'Kolom & Balok Beton', category: 'Struktur', weight: 28, surveyorDamagePct: 22, reviewerDamagePct: 22, notes: 'Retak diagonal lebar 1.2mm pada kolom teras.' },
      { id: 'c3', name: 'Dinding & Plesteran', category: 'Arsitektur', weight: 20, surveyorDamagePct: 35, reviewerDamagePct: 35, notes: 'Dinding retak dan terkelupas akibat kelembaban.' },
      { id: 'c4', name: 'Penutup Atap & Rangka', category: 'Arsitektur', weight: 18, surveyorDamagePct: 30, reviewerDamagePct: 30, notes: 'Kebocoran pada sambungan jurai atap.' },
      { id: 'c5', name: 'Plafon & Gantungan', category: 'Arsitektur', weight: 10, surveyorDamagePct: 28, reviewerDamagePct: 28, notes: 'Plafon kalsiboard lapuk seluas 15m2.' },
      { id: 'c6', name: 'Instalasi Listrik & Sanitasi', category: 'Utilitas', weight: 12, surveyorDamagePct: 21, reviewerDamagePct: 21, notes: 'Pipa pembuangan air kotor tersumbat.' },
    ],
    photoGallery: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', title: 'Retak Kolom Teras Depan', defectTag: 'Retak Structural 1.2mm', aiConfidence: 94, gps: '-7.3421, 107.8102', timestamp: '2026-08-01 11:20' }
    ],
    complianceCheck: {
      photosValid: true,
      gpsValid: true,
      sniCompliant: true,
      signedBySurveyor: true,
      notes: 'Memerlukan review verifikasi ukuran retak kolom oleh Reviewer Teknis.'
    },
    digitalSignature: {
      signedBy: '-',
      timestamp: '-',
      certNumber: '-',
      qrCodeGenerated: false
    },
    reviewHistory: [
      { date: '2026-08-01 11:45', user: 'Ahmad Ridwan', action: 'Submit Survey', note: 'Survey fisik Puskesmas dikirim ke antrean review.' }
    ]
  },
  {
    id: 'ASM-2026-003',
    surveyId: 'SRV-003',
    buildingName: 'Kantor Kecamatan Bayongbong',
    category: 'Gedung Pemerintah',
    instansi: 'Kecamatan Bayongbong',
    kecamatan: 'Bayongbong',
    surveyor: 'Ahmad Ridwan, S.T.',
    reviewer: 'Siti Aminah, S.T.',
    dateSubmitted: '2026-07-30',
    damagePercentage: 44.2,
    riskLevel: 'Tinggi',
    status: 'Dalam Review',
    structuralScore: 38.0,
    architecturalScore: 48.5,
    utilityScore: 35.0,
    aiRecommendation: 'Kerusakan Tinggi (44.2%). Diperlukan pengujian non-destruktif (Hammer Test / UPV) pada struktur rangka lantai 2.',
    reviewerNotes: 'Sedang dilakukan verifikasi ulang foto kerusakan balok lantai 2 bersama tim teknis laboratorium PUPR.',
    reviewDate: '2026-07-31',
    componentsBreakdown: [
      { id: 'c1', name: 'Pondasi & Sloof', category: 'Struktur', weight: 12, surveyorDamagePct: 25, reviewerDamagePct: 25, notes: 'Pondasi retak geser akibat pergeseran tanah.' },
      { id: 'c2', name: 'Kolom & Balok Beton', category: 'Struktur', weight: 28, surveyorDamagePct: 45, reviewerDamagePct: 42, notes: 'Retak lentur signifikan pada balok induk lantai 2.' },
      { id: 'c3', name: 'Dinding & Plesteran', category: 'Arsitektur', weight: 20, surveyorDamagePct: 50, reviewerDamagePct: 50, notes: 'Retak tembus seluas 40% dinding aula.' },
      { id: 'c4', name: 'Penutup Atap & Rangka', category: 'Arsitektur', weight: 18, surveyorDamagePct: 45, reviewerDamagePct: 45, notes: 'Kuda-kuda kayu melengkung & dimakan rayap.' },
      { id: 'c5', name: 'Plafon & Gantungan', category: 'Arsitektur', weight: 10, surveyorDamagePct: 50, reviewerDamagePct: 50, notes: 'Sebagian besar plafon ambruk.' },
      { id: 'c6', name: 'Instalasi Listrik & Sanitasi', category: 'Utilitas', weight: 12, surveyorDamagePct: 35, reviewerDamagePct: 35, notes: 'Panel listrik korslet akibat resapan air.' },
    ],
    photoGallery: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80', title: 'Retak Balok Induk Aula', defectTag: 'Retak Structural Utama', aiConfidence: 96, gps: '-7.2891, 107.8821', timestamp: '2026-07-30 14:10' }
    ],
    complianceCheck: {
      photosValid: true,
      gpsValid: true,
      sniCompliant: false,
      signedBySurveyor: true,
      notes: 'Disarankan uji lab struktur tambahan sebelum persetujuan final.'
    },
    digitalSignature: {
      signedBy: '-',
      timestamp: '-',
      certNumber: '-',
      qrCodeGenerated: false
    },
    reviewHistory: [
      { date: '2026-07-30 15:00', user: 'Ahmad Ridwan', action: 'Submit Survey', note: 'Assessment dikirim.' },
      { date: '2026-07-31 08:30', user: 'Siti Aminah', action: 'Start Review', note: 'Status diubah ke Dalam Review.' }
    ]
  },
  {
    id: 'ASM-2026-004',
    surveyId: 'SRV-004',
    buildingName: 'SMPN 2 Garut',
    category: 'Sekolah',
    instansi: 'Dinas Pendidikan Garut',
    kecamatan: 'Garut Kota',
    surveyor: 'Dewi Lestari, S.T.',
    reviewer: 'Siti Aminah, S.T.',
    dateSubmitted: '2026-07-28',
    damagePercentage: 8.5,
    riskLevel: 'Ringan',
    status: 'Perlu Perbaikan',
    structuralScore: 0.0,
    architecturalScore: 12.0,
    utilityScore: 5.0,
    aiRecommendation: 'Kerusakan Sangat Ringan (8.5%). Pemeliharaan minor cat dinding dan engsel jendela.',
    reviewerNotes: 'Foto bukti kerusakan komponen dinding laboratorium IPA kurang jelas & buram. Harap unggah ulang foto yang jernih.',
    reviewDate: '2026-07-29',
    componentsBreakdown: [
      { id: 'c1', name: 'Pondasi & Sloof', category: 'Struktur', weight: 12, surveyorDamagePct: 0, reviewerDamagePct: 0, notes: 'Baik.' },
      { id: 'c2', name: 'Kolom & Balok Beton', category: 'Struktur', weight: 28, surveyorDamagePct: 0, reviewerDamagePct: 0, notes: 'Baik.' },
      { id: 'c3', name: 'Dinding & Plesteran', category: 'Arsitektur', weight: 20, surveyorDamagePct: 10, reviewerDamagePct: 10, notes: 'Foto tidak jelas.' },
      { id: 'c4', name: 'Penutup Atap & Rangka', category: 'Arsitektur', weight: 18, surveyorDamagePct: 15, reviewerDamagePct: 15, notes: 'Ganti 2 genteng.' },
      { id: 'c5', name: 'Plafon & Gantungan', category: 'Arsitektur', weight: 10, surveyorDamagePct: 10, reviewerDamagePct: 10, notes: 'Plafon terlepas.' },
      { id: 'c6', name: 'Instalasi Listrik & Sanitasi', category: 'Utilitas', weight: 12, surveyorDamagePct: 5, reviewerDamagePct: 5, notes: 'Kran air bocor.' },
    ],
    photoGallery: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80', title: 'Foto Dinding Lab IPA', defectTag: 'Kualitas Foto Buram', aiConfidence: 65, gps: '-7.2120, 107.9040', timestamp: '2026-07-28 10:15' }
    ],
    complianceCheck: {
      photosValid: false,
      gpsValid: true,
      sniCompliant: true,
      signedBySurveyor: true,
      notes: 'Ditolak sementara: Foto dinding buram, tidak dapat memvalidasi retak.'
    },
    digitalSignature: {
      signedBy: '-',
      timestamp: '-',
      certNumber: '-',
      qrCodeGenerated: false
    },
    reviewHistory: [
      { date: '2026-07-28 11:00', user: 'Dewi Lestari', action: 'Submit Survey', note: 'Survey dikirim.' },
      { date: '2026-07-29 09:20', user: 'Siti Aminah', action: 'Request Revision', note: 'Diminta unggah ulang foto dinding.' }
    ]
  },
  {
    id: 'ASM-2026-005',
    surveyId: 'SRV-005',
    buildingName: 'RSUD dr. Slamet (Gedung Rawat Inap)',
    category: 'Fasilitas Kesehatan',
    instansi: 'RSUD dr. Slamet Garut',
    kecamatan: 'Tarogong Kidul',
    surveyor: 'Budi Santoso, S.T.',
    reviewer: 'Dewi Lestari, S.T.',
    dateSubmitted: '2026-07-25',
    damagePercentage: 68.9,
    riskLevel: 'Sangat Tinggi',
    status: 'Menunggu Review',
    structuralScore: 62.0,
    architecturalScore: 75.4,
    utilityScore: 58.0,
    aiRecommendation: 'Kerusakan Sangat Berat (> 65%). MEREKOMENDASIKAN PENGOSONGAN AREA & REHABILITASI / REKONSTRUKSI TOTAL.',
    reviewerNotes: '',
    componentsBreakdown: [
      { id: 'c1', name: 'Pondasi & Sloof', category: 'Struktur', weight: 12, surveyorDamagePct: 55, reviewerDamagePct: 55, notes: 'Penurunan pondasi mendalam.' },
      { id: 'c2', name: 'Kolom & Balok Beton', category: 'Struktur', weight: 28, surveyorDamagePct: 65, reviewerDamagePct: 65, notes: 'Spalling beton parah, tulangan baja terekspos.' },
      { id: 'c3', name: 'Dinding & Plesteran', category: 'Arsitektur', weight: 20, surveyorDamagePct: 80, reviewerDamagePct: 80, notes: 'Dinding retak membelah.' },
      { id: 'c4', name: 'Penutup Atap & Rangka', category: 'Arsitektur', weight: 18, surveyorDamagePct: 70, reviewerDamagePct: 70, notes: 'Atap ambruk sebagian.' },
      { id: 'c5', name: 'Plafon & Gantungan', category: 'Arsitektur', weight: 10, surveyorDamagePct: 75, reviewerDamagePct: 75, notes: 'Plafon hancur total.' },
      { id: 'c6', name: 'Instalasi Listrik & Sanitasi', category: 'Utilitas', weight: 12, surveyorDamagePct: 58, reviewerDamagePct: 58, notes: 'Jaringan listrik putus.' },
    ],
    photoGallery: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80', title: 'Spalling Beton Kolom Rawat Inap', defectTag: 'Beton Pecah & Baja Ekspos', aiConfidence: 99, gps: '-7.2188, 107.9001', timestamp: '2026-07-25 15:30' }
    ],
    complianceCheck: {
      photosValid: true,
      gpsValid: true,
      sniCompliant: true,
      signedBySurveyor: true,
      notes: 'Kondisi darurat kebencanaan. Perlu persetujuan prioritas Bupati Garut.'
    },
    digitalSignature: {
      signedBy: '-',
      timestamp: '-',
      certNumber: '-',
      qrCodeGenerated: false
    },
    reviewHistory: [
      { date: '2026-07-25 16:00', user: 'Budi Santoso', action: 'Submit Critical Assessment', note: 'Gedung rawat inap berisiko tinggi dikirim.' }
    ]
  }
];

export function AssessmentReviewList() {
  const navigate = useNavigate();
  const { activeRole } = useRole();

  const [reviews, setReviews] = useState<AssessmentReviewItem[]>(() => {
    const saved = localStorage.getItem('sipeka_assessment_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sipeka_assessment_reviews', e);
      }
    }
    return DEFAULT_REVIEWS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Multi-selection batch items
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Selected item modal & tabs
  const [selectedReview, setSelectedReview] = useState<AssessmentReviewItem | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'components' | 'photos' | 'compliance' | 'signature'>('overview');

  // Form states inside modal
  const [newStatus, setNewStatus] = useState<'Menunggu Review' | 'Dalam Review' | 'Disetujui' | 'Perlu Perbaikan' | 'Ditolak'>('Disetujui');
  const [notesInput, setNotesInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [zoomPhotoUrl, setZoomPhotoUrl] = useState<string | null>(null);

  // New assessment modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBuildingName, setNewBuildingName] = useState('');
  const [newInstansi, setNewInstansi] = useState('');
  const [newKecamatan, setNewKecamatan] = useState('Garut Kota');
  const [newCategory, setNewCategory] = useState('Sekolah');
  const [newSurveyor, setNewSurveyor] = useState('Budi Santoso, S.T.');

  // TTE Signing Modal State
  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
  const [signingDocuments, setSigningDocuments] = useState<DocumentForSigning[]>([]);
  const [pendingAction, setPendingAction] = useState<'SINGLE' | 'BATCH' | null>(null);

  useEffect(() => {
    localStorage.setItem('sipeka_assessment_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    if (selectedReview) {
      setNewStatus(selectedReview.status);
      setNotesInput(selectedReview.reviewerNotes || '');
    }
  }, [selectedReview]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Statistics
  const totalCount = reviews.length;
  const pendingCount = reviews.filter(r => r.status === 'Menunggu Review').length;
  const inReviewCount = reviews.filter(r => r.status === 'Dalam Review').length;
  const approvedCount = reviews.filter(r => r.status === 'Disetujui').length;
  const revisionCount = reviews.filter(r => r.status === 'Perlu Perbaikan').length;

  const filteredReviews = reviews.filter(item => {
    const matchesSearch = 
      item.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.surveyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.surveyor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kecamatan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesRisk = riskFilter === 'ALL' || item.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesRisk;
  });

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReviews.map(f => f.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Batch actions
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    
    // Wire to SigningModal
    const docsToSign = reviews
      .filter(r => selectedIds.includes(r.id))
      .map(r => ({
        id: r.id,
        title: r.buildingName,
        hash: `mock-hash-batch-${r.id}`,
        version: '1.0'
      }));
      
    setSigningDocuments(docsToSign);
    setPendingAction('BATCH');
    setIsSigningModalOpen(true);
  };

  const finalizeBatchApprove = async (signatures?: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    const reviewerName = activeRole === 'Super Administrator' ? 'Super Administrator' : 'Siti Aminah, S.T.';

    setReviews(prev => prev.map(r => {
      if (selectedIds.includes(r.id)) {
        const sigResponse = signatures?.find(s => s.requestId === r.id);
        return {
          ...r,
          status: 'Disetujui',
          reviewer: reviewerName,
          reviewDate: today,
          reviewerNotes: r.reviewerNotes || 'Disetujui secara masal via Batch Approval.',
          digitalSignature: {
            signedBy: `${reviewerName} (SIPEKA Digital Cert)`,
            timestamp: new Date().toLocaleString(),
            certNumber: sigResponse?.signatureValue ? `PAdES-${sigResponse.signatureValue.substring(0,8)}` : `CERT-PUPR-BATCH-${Math.floor(100000 + Math.random() * 900000)}`,
            qrCodeGenerated: true
          }
        };
      }
      return r;
    }));

    showToast(`${selectedIds.length} Assessment berhasil disetujui. Memproses pengiriman Notifikasi WhatsApp...`);
    
    // Send WA notifications for each approved assessment
    try {
      const selectedReviews = reviews.filter(r => selectedIds.includes(r.id) && r.status !== 'Disetujui');
      
      await Promise.all(selectedReviews.map(r => 
        fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: '+6281234567890',
            type: 'assessment_approval',
            message: `[PURI - PUPR GARUT]\nHalo Pengelola Gedung,\n\nLaporan Asesmen untuk bangunan ${r.buildingName} telah DISETUJUI oleh Reviewer Teknis.\n\nTingkat Risiko: ${r.riskLevel}\nTotal Kerusakan: ${r.damagePercentage}%\n\nSilakan cek Portal Stakeholder untuk rencana perbaikan selanjutnya.\n\nSalam, Dinas PUPR Kab. Garut.`
          })
        })
      ));
      
      showToast(`${selectedIds.length} Assessment disetujui & WA Notifikasi PURI terkirim!`);
    } catch (e) {
      console.error('Failed to send WA batch notification', e);
      showToast(`${selectedIds.length} Assessment disetujui, tapi ada kendala pada WA Notifikasi.`);
    }

    setSelectedIds([]);
  };

  const handleBatchRevision = () => {
    if (selectedIds.length === 0) return;
    setReviews(prev => prev.map(r => {
      if (selectedIds.includes(r.id)) {
        return {
          ...r,
          status: 'Perlu Perbaikan',
          reviewerNotes: 'Diminta revisi & verifikasi kelengkapan dokumen foto dari batch review.'
        };
      }
      return r;
    }));
    showToast(`${selectedIds.length} Assessment dikembalikan untuk revisi.`);
    setSelectedIds([]);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID Assessment', 'ID Survey', 'Nama Bangunan', 'Kategori', 'Instansi', 'Kecamatan', 'Surveyor', '% Kerusakan', 'Tingkat Risiko', 'Status', 'Reviewer', 'Tanggal Review'];
    const rows = filteredReviews.map(r => [
      r.id, r.surveyId, `"${r.buildingName}"`, `"${r.category}"`, `"${r.instansi}"`, `"${r.kecamatan}"`,
      `"${r.surveyor}"`, r.damagePercentage, r.riskLevel, r.status, `"${r.reviewer || '-'}"`, r.reviewDate || '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SIPEKA_Review_Penilaian_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV data review berhasil diunduh.');
  };

  // Save single review
  const handleSaveReview = async () => {
    if (!selectedReview) return;

    if (newStatus === 'Disetujui') {
      setSigningDocuments([{
        id: selectedReview.id,
        title: selectedReview.buildingName,
        hash: `mock-hash-${selectedReview.id}`,
        version: '1.0'
      }]);
      setPendingAction('SINGLE');
      setIsSigningModalOpen(true);
    } else {
      finalizeSingleReview();
    }
  };

  const finalizeSingleReview = async (signatureResponse?: any) => {
    if (!selectedReview) return;
    const today = new Date().toISOString().split('T')[0];
    const reviewerName = activeRole === 'Super Administrator' ? 'Super Administrator' : 'Siti Aminah, S.T.';

    // Recalculate total damage if components exist
    let updatedDamagePct = selectedReview.damagePercentage;
    let updatedStructural = selectedReview.structuralScore;
    let updatedArchitectural = selectedReview.architecturalScore;
    let updatedUtility = selectedReview.utilityScore;

    if (selectedReview.componentsBreakdown && selectedReview.componentsBreakdown.length > 0) {
      let strTotal = 0;
      let archTotal = 0;
      let utilTotal = 0;

      selectedReview.componentsBreakdown.forEach(c => {
        const score = (c.weight * c.reviewerDamagePct) / 100;
        if (c.category === 'Struktur') strTotal += score;
        if (c.category === 'Arsitektur') archTotal += score;
        if (c.category === 'Utilitas') utilTotal += score;
      });

      updatedStructural = Number(strTotal.toFixed(1));
      updatedArchitectural = Number(archTotal.toFixed(1));
      updatedUtility = Number(utilTotal.toFixed(1));
      updatedDamagePct = Number((updatedStructural + updatedArchitectural + updatedUtility).toFixed(1));
    }

    let updatedRisk = selectedReview.riskLevel;
    if (updatedDamagePct > 65) updatedRisk = 'Sangat Tinggi';
    else if (updatedDamagePct > 45) updatedRisk = 'Tinggi';
    else if (updatedDamagePct > 30) updatedRisk = 'Sedang';
    else updatedRisk = 'Ringan';

    const updatedItem: AssessmentReviewItem = {
      ...selectedReview,
      status: newStatus,
      reviewerNotes: notesInput,
      reviewDate: today,
      reviewer: reviewerName,
      damagePercentage: updatedDamagePct,
      structuralScore: updatedStructural,
      architecturalScore: updatedArchitectural,
      utilityScore: updatedUtility,
      riskLevel: updatedRisk,
      digitalSignature: newStatus === 'Disetujui' ? {
        signedBy: `${reviewerName} (NIP 19850412 201001 2 004)`,
        timestamp: `${today} ${new Date().toLocaleTimeString()}`,
        certNumber: signatureResponse?.signatureValue ? `PAdES-${signatureResponse.signatureValue.substring(0,8)}` : `CERT-PUPR-${Date.now().toString().slice(-6)}`,
        qrCodeGenerated: true
      } : selectedReview.digitalSignature,
      reviewHistory: [
        ...(selectedReview.reviewHistory || []),
        {
          date: `${today} ${new Date().toLocaleTimeString()}`,
          user: reviewerName,
          action: `Perbarui Status ke ${newStatus}`,
          note: notesInput || 'Perubahan keputusan review verifikator.'
        }
      ]
    };

    setReviews(prev => prev.map(r => r.id === selectedReview.id ? updatedItem : r));
    setSelectedReview(updatedItem);
    
    // WA API Gateway Integration (PURI)
    if (newStatus === 'Disetujui' && selectedReview.status !== 'Disetujui') {
      try {
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: '+6281234567890', // Default dummy number
            type: 'assessment_approval',
            message: `[PURI - PUPR GARUT]\nHalo Pengelola Gedung,\n\nLaporan Asesmen untuk bangunan ${selectedReview.buildingName} telah DISETUJUI oleh Reviewer Teknis.\n\nTingkat Risiko: ${updatedRisk}\nTotal Kerusakan: ${updatedDamagePct}%\n\nSilakan cek Portal Stakeholder untuk melihat estimasi biaya dan rencana perbaikan.\n\nSalam, Dinas PUPR Kab. Garut.`
          })
        });
        showToast('Keputusan disetujui, Notifikasi WhatsApp via PURI berhasil dikirim!');
      } catch (e) {
        console.error('Failed to send WA notification', e);
        showToast('Keputusan disetujui, namun gagal mengirim Notifikasi WA.');
      }
    } else {
      showToast('Keputusan review & kalkulasi komponen berhasil disimpan!');
    }
  };

  const handleSignComplete = (responses: any[]) => {
    if (pendingAction === 'BATCH') {
      finalizeBatchApprove(responses);
    } else if (pendingAction === 'SINGLE') {
      finalizeSingleReview(responses[0]);
    }
  };

  // Update component damage pct by reviewer
  const handleComponentChange = (compId: string, newPct: number) => {
    if (!selectedReview || !selectedReview.componentsBreakdown) return;
    const updatedComps = selectedReview.componentsBreakdown.map(c => 
      c.id === compId ? { ...c, reviewerDamagePct: Math.min(100, Math.max(0, newPct)) } : c
    );
    setSelectedReview({ ...selectedReview, componentsBreakdown: updatedComps });
  };

  // Create new assessment item
  const handleCreateNewAssessment = () => {
    if (!newBuildingName.trim()) {
      alert('Nama bangunan tidak boleh kosong');
      return;
    }

    const newId = `ASM-2026-00${reviews.length + 1}`;
    const newSurveyId = `SRV-00${reviews.length + 1}`;
    const today = new Date().toISOString().split('T')[0];

    const newItem: AssessmentReviewItem = {
      id: newId,
      surveyId: newSurveyId,
      buildingName: newBuildingName,
      category: newCategory,
      instansi: newInstansi || 'Dinas Terkait',
      kecamatan: newKecamatan,
      surveyor: newSurveyor,
      reviewer: 'Siti Aminah, S.T.',
      dateSubmitted: today,
      damagePercentage: 24.5,
      riskLevel: 'Ringan',
      status: 'Menunggu Review',
      structuralScore: 8.0,
      architecturalScore: 12.5,
      utilityScore: 4.0,
      aiRecommendation: 'Assessment baru terdaftar. Menunggu verifikasi fisik & dokumen foto oleh reviewer.',
      reviewerNotes: '',
      componentsBreakdown: [
        { id: 'c1', name: 'Pondasi & Sloof', category: 'Struktur', weight: 12, surveyorDamagePct: 0, reviewerDamagePct: 0, notes: 'Aman' },
        { id: 'c2', name: 'Kolom & Balok Beton', category: 'Struktur', weight: 28, surveyorDamagePct: 10, reviewerDamagePct: 10, notes: 'Retak kecil' },
        { id: 'c3', name: 'Dinding & Plesteran', category: 'Arsitektur', weight: 20, surveyorDamagePct: 20, reviewerDamagePct: 20, notes: 'Plester retak' },
        { id: 'c4', name: 'Penutup Atap', category: 'Arsitektur', weight: 18, surveyorDamagePct: 15, reviewerDamagePct: 15, notes: 'Bocor lokal' },
        { id: 'c5', name: 'Plafon', category: 'Arsitektur', weight: 10, surveyorDamagePct: 10, reviewerDamagePct: 10, notes: 'Lembab' },
        { id: 'c6', name: 'Utilitas Listrik', category: 'Utilitas', weight: 12, surveyorDamagePct: 5, reviewerDamagePct: 5, notes: 'Normal' },
      ],
      photoGallery: [],
      complianceCheck: {
        photosValid: true,
        gpsValid: true,
        sniCompliant: true,
        signedBySurveyor: true,
        notes: 'Permohonan baru siap direview.'
      },
      digitalSignature: {
        signedBy: '-',
        timestamp: '-',
        certNumber: '-',
        qrCodeGenerated: false
      },
      reviewHistory: [
        { date: today, user: newSurveyor, action: 'Submit New Assessment', note: 'Pengajuan permohonan assessment baru.' }
      ]
    };

    setReviews(prev => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setNewBuildingName('');
    setNewInstansi('');
    showToast(`Assessment baru ${newId} berhasil didaftarkan ke antrean review!`);
  };

  // Export BAP PDF
  const exportBapPDF = async (item: AssessmentReviewItem) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Kop Surat PUPR
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("PEMERINTAH KABUPATEN GARUT", pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(15);
    doc.text("DINAS PEKERJAAN UMUM DAN PENATAAN RUANG", pageWidth / 2, 22, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Jl. Raya Samarang No. 115 Garut - Jawa Barat | Telp: (0262) 233-123", pageWidth / 2, 28, { align: 'center' });
    doc.line(20, 31, pageWidth - 20, 31);

    // Title
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("BERITA ACARA PENILAIAN & VERIFIKASI (BAP)", pageWidth / 2, 42, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nomor Dokumen: BAP/PUPR/${item.id}`, pageWidth / 2, 48, { align: 'center' });

    doc.text(`Pada hari ini, tanggal ${item.reviewDate || item.dateSubmitted}, telah dilakukan evaluasi dan verifikasi teknis atas hasil survey kerusakan bangunan gedung dengan rincian berikut:`, 20, 58, { maxWidth: pageWidth - 40 });

    autoTable(doc, {
      startY: 68,
      theme: 'grid',
      headStyles: { fillColor: [15, 76, 129] },
      body: [
        ['ID Assessment', item.id],
        ['ID Permohonan / Survey', item.surveyId],
        ['Nama Bangunan', item.buildingName],
        ['Kategori Bangunan', item.category],
        ['Instansi / Pengelola', item.instansi],
        ['Lokasi / Kecamatan', item.kecamatan],
        ['Surveyor Lapangan', item.surveyor],
        ['Tanggal Survey Submitted', item.dateSubmitted],
        ['Tingkat Kerusakan Total', `${item.damagePercentage}% (${item.riskLevel})`],
        ['Skor Kerusakan Struktur', `${item.structuralScore}%`],
        ['Skor Kerusakan Arsitektur', `${item.architecturalScore}%`],
        ['Skor Kerusakan Utilitas', `${item.utilityScore}%`],
        ['Status Verifikasi Final', item.status],
        ['Reviewer Teknis PUPR', item.reviewer || 'Siti Aminah, S.T.'],
      ]
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.text("Rekomendasi AI Engine & Catatan Verifikator:", 20, finalY);
    doc.setFont("helvetica", "normal");
    const notesText = doc.splitTextToSize(
      `[Analisis AI]: ${item.aiRecommendation || '-'}\n[Catatan Verifikator]: ${item.reviewerNotes || 'Tidak ada catatan tambahan.'}`, 
      pageWidth - 40
    );
    doc.text(notesText, 20, finalY + 7);

    const sigY = finalY + 7 + (notesText.length * 5) + 15;
    
    // Signatures
    doc.setFont("helvetica", "bold");
    doc.text("Surveyor Lapangan,", 30, sigY);
    doc.text("Reviewer Teknis PUPR,", pageWidth - 75, sigY);

    doc.setFont("helvetica", "normal");
    doc.text(item.surveyor, 30, sigY + 25);
    doc.text(item.reviewer || 'Siti Aminah, S.T.', pageWidth - 75, sigY + 25);

    const pageHeight = doc.internal.pageSize.getHeight();
    await addFooterWithQRCode(doc, item.id, "PENDING", pageHeight, pageWidth);
    doc.save(`BAP_Penilaian_${item.id}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 border border-slate-700">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {activeRole === 'Pengelola' ? 'Status Penilaian & Review' : 'Review Penilaian & Verifikasi BAP'}
            </h1>
            <Badge variant="pupr" className="text-xs">Tahap 4</Badge>
          </div>
          <p className="text-slate-500 mt-1">
            {activeRole === 'Pengelola'
              ? 'Pantau status dan hasil review teknis kerusakan bangunan Anda.'
              : 'Daftar hasil penilaian fisik bangunan dari surveyor yang memerlukan pengujian, evaluasi, dan verifikasi persetujuan teknis PUPR.'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="bg-white">
            <FileSpreadsheet size={15} className="mr-1.5" /> Ekspor CSV
          </Button>
          {!['Pengelola'].includes(activeRole) && (
            <Button variant="pupr" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} className="mr-1.5" /> Tambah Review Baru
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const saved = localStorage.getItem('sipeka_assessment_reviews');
              if (saved) setReviews(JSON.parse(saved));
              else setReviews(DEFAULT_REVIEWS);
              showToast('Data review disinkronisasi ulang.');
            }}
            className="bg-white hover:bg-slate-50 text-slate-700"
          >
            <RefreshCw size={15} className="mr-1.5" /> Sync Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <CardGlass className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assessment</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</h3>
              </div>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
                <Layers size={20} />
              </div>
            </div>
          </CardContent>
        </CardGlass>

        <CardGlass className="border-0 shadow-sm bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider">Menunggu Review</p>
                <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-400 mt-1">{pendingCount}</h3>
              </div>
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl">
                <Clock size={20} />
              </div>
            </div>
          </CardContent>
        </CardGlass>

        <CardGlass className="border-0 shadow-sm bg-pupr-blue-50/50 dark:bg-pupr-blue-950/20 border-pupr-blue-200/60 dark:border-pupr-blue-900/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-pupr-blue dark:text-pupr-blue-light uppercase tracking-wider">Dalam Review</p>
                <h3 className="text-2xl font-bold text-pupr-blue dark:text-pupr-blue-light mt-1">{inReviewCount}</h3>
              </div>
              <div className="p-2.5 bg-pupr-blue-100 dark:bg-pupr-blue-900/50 text-pupr-blue dark:text-pupr-blue-light rounded-xl">
                <ClipboardCheck size={20} />
              </div>
            </div>
          </CardContent>
        </CardGlass>

        <CardGlass className="border-0 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">Disetujui</p>
                <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mt-1">{approvedCount}</h3>
              </div>
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </CardContent>
        </CardGlass>

        <CardGlass className="border-0 shadow-sm bg-red-50/50 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/40 col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-red-700 dark:text-red-500 uppercase tracking-wider">Perlu Perbaikan</p>
                <h3 className="text-2xl font-bold text-red-900 dark:text-red-400 mt-1">{revisionCount}</h3>
              </div>
              <div className="p-2.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 rounded-xl">
                <AlertTriangle size={20} />
              </div>
            </div>
          </CardContent>
        </CardGlass>
      </div>

      {/* Batch Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-pupr-blue text-white rounded-2xl shadow-md flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckSquare size={18} />
            <span>{selectedIds.length} Assessment Dipilih untuk Aksi Masal:</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleBatchApprove}>
              <CheckCircle2 size={14} className="mr-1" /> Setujui Terpilih ({selectedIds.length})
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={handleBatchRevision}>
              <AlertTriangle size={14} className="mr-1" /> Perlu Perbaikan ({selectedIds.length})
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-white/80 hover:text-white" onClick={() => setSelectedIds([])}>
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Filters & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'ALL', label: 'Semua Status' },
            { key: 'Menunggu Review', label: 'Menunggu Review' },
            { key: 'Dalam Review', label: 'Dalam Review' },
            { key: 'Disetujui', label: 'Disetujui' },
            { key: 'Perlu Perbaikan', label: 'Perlu Perbaikan' },
            { key: 'Ditolak', label: 'Ditolak' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.key 
                  ? 'bg-pupr-blue text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Cari bangunan, ID, surveyor..." 
              className="pl-9 h-9 bg-white" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-pupr-blue"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Sekolah">Sekolah</option>
            <option value="Fasilitas Kesehatan">Fasilitas Kesehatan</option>
            <option value="Gedung Pemerintah">Gedung Pemerintah</option>
          </select>
          <select
            className="h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-pupr-blue"
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
          >
            <option value="ALL">Semua Risiko</option>
            <option value="Ringan">Risiko Ringan</option>
            <option value="Sedang">Risiko Sedang</option>
            <option value="Tinggi">Risiko Tinggi</option>
            <option value="Sangat Tinggi">Risiko Sangat Tinggi</option>
          </select>
        </div>
      </div>

      {/* Main Review Table */}
      <CardGlass className="border-0 shadow-sm">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Daftar Hasil Penilaian Survey Lapangan</CardTitle>
              <CardDescription>Menampilkan {filteredReviews.length} dari {totalCount} hasil survey</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="w-10 text-center">
                    <button onClick={toggleSelectAll} className="text-slate-500 hover:text-slate-900">
                      {selectedIds.length === filteredReviews.length && filteredReviews.length > 0 ? (
                        <CheckSquare size={16} className="text-pupr-blue" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-32 font-semibold">ID Assessment</TableHead>
                  <TableHead className="font-semibold">Nama Bangunan & Instansi</TableHead>
                  <TableHead className="font-semibold">Surveyor & Tanggal</TableHead>
                  <TableHead className="font-semibold text-center">% Kerusakan Total</TableHead>
                  <TableHead className="font-semibold text-center">Tingkat Risiko</TableHead>
                  <TableHead className="font-semibold text-center">Status Review</TableHead>
                  <TableHead className="text-right font-semibold px-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                      Tidak ada data penilaian yang sesuai dengan kriteria pencarian/filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <TableRow 
                        key={item.id} 
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/40' : ''}`}
                        onClick={() => {
                          setSelectedReview(item);
                          setModalTab('overview');
                        }}
                      >
                        <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleSelectRow(item.id)} className="text-slate-400 hover:text-pupr-blue">
                            {isSelected ? <CheckSquare size={16} className="text-pupr-blue" /> : <Square size={16} />}
                          </button>
                        </TableCell>

                        <TableCell>
                          <div className="font-bold text-pupr-blue">{item.id}</div>
                          <div className="text-[11px] font-mono text-slate-400">{item.surveyId}</div>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-slate-900">{item.buildingName}</div>
                          <div className="text-xs text-slate-500">{item.instansi} • {item.kecamatan}</div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium text-slate-800">{item.surveyor}</div>
                          <div className="text-[11px] text-slate-400">{item.dateSubmitted}</div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="font-bold text-slate-900 text-sm">{item.damagePercentage}%</div>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                            <div 
                              className={`h-full ${
                                item.damagePercentage >= 50 ? 'bg-red-500' :
                                item.damagePercentage >= 30 ? 'bg-amber-500' :
                                item.damagePercentage >= 20 ? 'bg-yellow-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(item.damagePercentage, 100)}%` }}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          {item.riskLevel === 'Sangat Tinggi' && <Badge variant="destructive">{item.riskLevel}</Badge>}
                          {item.riskLevel === 'Tinggi' && <Badge className="bg-orange-500 text-white hover:bg-orange-600">{item.riskLevel}</Badge>}
                          {item.riskLevel === 'Sedang' && <Badge className="bg-amber-500 text-white hover:bg-amber-600">{item.riskLevel}</Badge>}
                          {item.riskLevel === 'Ringan' && <Badge variant="success">{item.riskLevel}</Badge>}
                        </TableCell>

                        <TableCell className="text-center">
                          {item.status === 'Disetujui' && <Badge variant="outline" className="border-success text-success bg-success/10 font-medium">Disetujui</Badge>}
                          {item.status === 'Menunggu Review' && <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 font-medium">Menunggu Review</Badge>}
                          {item.status === 'Dalam Review' && <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/10 font-medium">Dalam Review</Badge>}
                          {item.status === 'Perlu Perbaikan' && <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 font-medium">Perlu Perbaikan</Badge>}
                          {item.status === 'Ditolak' && <Badge variant="secondary" className="font-normal text-slate-500">Ditolak</Badge>}
                        </TableCell>

                        <TableCell className="text-right px-6" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="pupr" 
                              size="sm" 
                              className="h-8 text-xs shadow-sm"
                              onClick={() => {
                                setSelectedReview(item);
                                setModalTab('overview');
                              }}
                            >
                              {activeRole === 'Pengelola' ? <Eye size={14} className="mr-1" /> : <ClipboardCheck size={14} className="mr-1" />}
                              {activeRole === 'Pengelola' ? 'Detail' : 'Review'}
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-400 hover:text-slate-700"
                              title="Unduh BAP PDF"
                              onClick={() => exportBapPDF(item)}
                            >
                              <Download size={15} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </CardGlass>
      {/* Modal Review Detail */}
      {selectedReview && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedReview(null)}>
          <div className="w-full max-w-5xl max-h-full flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex items-start justify-between shrink-0">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shadow-sm border ${
                  selectedReview.damagePercentage >= 50 ? 'bg-red-50 text-red-600 border-red-100' :
                  selectedReview.damagePercentage >= 30 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 leading-none">Review: {selectedReview.buildingName}</h2>
                    <Badge variant="outline" className="border-pupr-blue text-pupr-blue text-[10px] uppercase font-bold">{selectedReview.category}</Badge>
                    <Badge className={
                      selectedReview.status === 'Disetujui' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                      selectedReview.status === 'Menunggu Review' ? 'bg-amber-500 hover:bg-amber-600' : 
                      selectedReview.status === 'Ditolak' ? 'bg-red-500 hover:bg-red-600' :
                      'bg-pupr-blue hover:bg-blue-700'
                    }>{selectedReview.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Permohonan: <span className="text-pupr-blue">{selectedReview.surveyId}</span> • Pengelola: <span className="font-semibold text-slate-700">{selectedReview.instansi}</span></p>
                </div>
              </div>
              <button onClick={() => setSelectedReview(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1 overflow-x-auto hide-scrollbar shrink-0">
              {[
                { id: 'overview', label: 'Ikhtisar Review', icon: LayoutDashboard },
                { id: 'components', label: 'Audit Komponen', icon: Layers },
                { id: 'photos', label: 'Bukti Visual & AI', icon: Camera },
                { id: 'compliance', label: 'Kepatuhan Standar', icon: ShieldCheck },
                { id: 'signature', label: 'Verifikasi BAP', icon: QrCode },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                    modalTab === tab.id 
                      ? 'border-pupr-blue text-pupr-blue bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body content - keeping it simple for now to restore functionality */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
                <p className="text-sm text-slate-500 mb-4">Menampilkan detail dan review untuk {selectedReview.buildingName}. Lihat tab untuk informasi lebih detail.</p>
                
                {modalTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-white border border-slate-200 rounded-xl">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Kerusakan</span>
                        <p className="text-2xl font-bold text-slate-800">{selectedReview.damagePercentage}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'photos' && (
                  <div className="space-y-4">
                    <EvidenceGallery initialBuildingFilter={selectedReview.buildingName} />
                  </div>
                )}
            </div>

            {/* Modal Bottom Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportBapPDF(selectedReview)}>
                  <Download size={15} className="mr-2" /> Unduh BAP (PDF)
                </Button>
                <Button variant="outline" size="sm" className="border-pupr-blue text-pupr-blue hover:bg-blue-50" onClick={() => window.open(`/api/documents/${selectedReview.id}/preview-ltl`, '_blank')}>
                  <FileText size={15} className="mr-2" /> Pratinjau LTL
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {activeRole !== 'Pengelola' ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedReview(null);
                        navigate('/assessment');
                      }}
                    >
                      Buka Kalkulator Assessment
                      <ArrowUpRight size={15} className="ml-1.5" />
                    </Button>
                    <Button variant="pupr" size="sm" onClick={handleSaveReview}>
                      <Save size={15} className="mr-1.5" />
                      Simpan Keputusan Review
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setSelectedReview(null)}>
                    Tutup
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setZoomPhotoUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <button className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors" onClick={() => setZoomPhotoUrl(null)}>
              <X size={20} />
            </button>
            <img src={zoomPhotoUrl} alt="Zoomed defect" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
      {/* Signing Modal Integration */}
      <SigningModal
        isOpen={isSigningModalOpen}
        onClose={() => setIsSigningModalOpen(false)}
        documents={signingDocuments}
        signer={{
          id: 'mock-user-123',
          name: activeRole === 'Super Administrator' ? 'Super Administrator' : 'Siti Aminah, S.T.',
          role: activeRole === 'Super Administrator' ? 'Sistem Administrator' : 'Reviewer Teknis / Pejabat Penandatangan'
        }}
        onSignComplete={handleSignComplete}
      />
    </div>
  );
}
