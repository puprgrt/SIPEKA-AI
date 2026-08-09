import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, Download, Printer, QrCode, FileSignature, FileSpreadsheet, Send, 
  CheckCircle2, Sparkles, Building2, UserCheck, ShieldCheck, RefreshCw, 
  KeyRound, Lock, ExternalLink, Share2, AlertCircle, Copy, FileCheck, Check,
  Database, Search, Zap, Layers, Filter, ShieldAlert, Award
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import jsPDF from 'jspdf';
import { addFooterWithQRCode } from '../../lib/pdf-utils';
import autoTable from 'jspdf-autotable';
import { AssessmentReviewItem } from '../assessment/AssessmentReviewList';
import { LaporanTeknisGenerator, LaporanData } from '../../lib/pdf-generator/LaporanTeknisLengkap';

const DEFAULT_BUILDINGS: AssessmentReviewItem[] = [
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
    ]
  },
  {
    id: 'ASM-2026-002',
    surveyId: 'SRV-002',
    buildingName: 'Puskesmas Cikajang (Gedung Utama)',
    category: 'Fasilitas Kesehatan',
    instansi: 'Dinas Kesehatan Garut',
    kecamatan: 'Cikajang',
    surveyor: 'Ahmad Ridwan, S.T.',
    reviewer: 'Siti Aminah, S.T.',
    dateSubmitted: '2026-08-01',
    damagePercentage: 38.5,
    riskLevel: 'Sedang',
    status: 'Disetujui',
    structuralScore: 18.5,
    architecturalScore: 32.0,
    utilityScore: 21.0,
    aiRecommendation: 'Kerusakan Sedang (38.5%). Disarankan perkuatan kolom teras depan & waterproofing dak lantai atas.',
    reviewerNotes: 'Verifikasi laboratorium PUPR selesai. Disetujui untuk perbaikan sedang.',
    reviewDate: '2026-08-01',
    componentsBreakdown: [
      { id: 'c1', name: 'Pondasi & Sloof', category: 'Struktur', weight: 12, surveyorDamagePct: 10, reviewerDamagePct: 10, notes: 'Penurunan tipis pada sudut timur.' },
      { id: 'c2', name: 'Kolom & Balok Beton', category: 'Struktur', weight: 28, surveyorDamagePct: 22, reviewerDamagePct: 22, notes: 'Retak diagonal lebar 1.2mm pada kolom teras.' },
      { id: 'c3', name: 'Dinding & Plesteran', category: 'Arsitektur', weight: 20, surveyorDamagePct: 35, reviewerDamagePct: 35, notes: 'Dinding retak dan terkelupas akibat kelembaban.' },
      { id: 'c4', name: 'Penutup Atap & Rangka', category: 'Arsitektur', weight: 18, surveyorDamagePct: 30, reviewerDamagePct: 30, notes: 'Kebocoran pada sambungan jurai atap.' },
      { id: 'c5', name: 'Plafon & Gantungan', category: 'Arsitektur', weight: 10, surveyorDamagePct: 28, reviewerDamagePct: 28, notes: 'Plafon kalsiboard lapuk seluas 15m2.' },
      { id: 'c6', name: 'Instalasi Listrik & Sanitasi', category: 'Utilitas', weight: 12, surveyorDamagePct: 21, reviewerDamagePct: 21, notes: 'Pipa pembuangan air kotor tersumbat.' },
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
      { id: 'c1', name: 'Pondasi & Sloof', category: 'Struktur', weight: 12, surveyorDamagePct: 25, reviewerDamagePct: 25, notes: 'Pondasi retak geser.' },
      { id: 'c2', name: 'Kolom & Balok Beton', category: 'Struktur', weight: 28, surveyorDamagePct: 45, reviewerDamagePct: 42, notes: 'Retak lentur signifikan.' },
      { id: 'c3', name: 'Dinding & Plesteran', category: 'Arsitektur', weight: 20, surveyorDamagePct: 50, reviewerDamagePct: 50, notes: 'Retak tembus seluas 40%.' },
      { id: 'c4', name: 'Penutup Atap & Rangka', category: 'Arsitektur', weight: 18, surveyorDamagePct: 45, reviewerDamagePct: 45, notes: 'Kuda-kuda kayu melengkung.' },
      { id: 'c5', name: 'Plafon & Gantungan', category: 'Arsitektur', weight: 10, surveyorDamagePct: 50, reviewerDamagePct: 50, notes: 'Plafon ambruk.' },
      { id: 'c6', name: 'Instalasi Listrik & Sanitasi', category: 'Utilitas', weight: 12, surveyorDamagePct: 35, reviewerDamagePct: 35, notes: 'Panel listrik korslet.' },
    ]
  }
];

export function ReportWorkspace() {
  const { activeRole } = useRole();

  // Load buildings from localStorage or fallback
  const [buildings, setBuildings] = useState<AssessmentReviewItem[]>(() => {
    const saved = localStorage.getItem('sipeka_assessment_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing sipeka_assessment_reviews', e);
      }
    }
    return DEFAULT_BUILDINGS;
  });

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[1]?.id || buildings[0]?.id || 'ASM-2026-002');
  const activeBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0] || DEFAULT_BUILDINGS[1];

  const [activeTab, setActiveTab] = useState<'preview' | 'ai' | 'tte'>('preview');
  const [activeTemplate, setActiveTemplate] = useState<'lengkap' | 'formA' | 'ba' | 'sertifikat' | 'rekap'>('lengkap');

  // Signatures and TTE states
  const [isSigned, setIsSigned] = useState(activeBuilding.status === 'Disetujui');
  const [isTteModalOpen, setIsTteModalOpen] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [passphraseError, setPassphraseError] = useState('');
  const [signingProgress, setSigningProgress] = useState(0);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureCert, setSignatureCert] = useState<string>(
    activeBuilding.digitalSignature?.certNumber || `CERT-BSRE-PUPR-2026-${Math.floor(100000 + Math.random() * 900000)}`
  );

  // Distribution Drawer / Modal state
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('6285117211173');

  // Watermark state
  const [watermarkText, setWatermarkText] = useState<'SALINAN SAH PUPR' | 'TTE VALID BSRE' | 'DRAFT EVALUASI' | 'ASLI DOKUMEN PUPR'>('SALINAN SAH PUPR');

  // Verification Inspector Modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifySearchInput, setVerifySearchInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // SIMBANGDA & SIMBG Sync state
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('2026-08-01 19:30 WIB');

  // AI Narrative states
  const [aiTone, setAiTone] = useState<'formal' | 'brief' | 'technical'>('formal');
  const [customNarrative, setCustomNarrative] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsSigned(activeBuilding.status === 'Disetujui' || activeBuilding.digitalSignature?.qrCodeGenerated === true);
    setCustomNarrative(
      activeBuilding.aiRecommendation || 
      `Berdasarkan hasil inspeksi visual dan perhitungan matematis sesuai pedoman Kementerian PUPR, bangunan ${activeBuilding.buildingName} mengalami tingkat kerusakan sebesar ${activeBuilding.damagePercentage}% (${activeBuilding.riskLevel}). Kerusakan didominasi oleh elemen struktur dan arsitektur.`
    );
  }, [selectedBuildingId, activeBuilding]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Perform BSrE Digital Signature Flow
  const handleStartTteProcess = () => {
    if (!passphraseInput.trim()) {
      setPassphraseError('Harap masukkan Passphrase BSrE Anda.');
      return;
    }
    setPassphraseError('');
    setIsSigning(true);
    setSigningProgress(15);

    setTimeout(() => setSigningProgress(45), 400);
    setTimeout(() => setSigningProgress(75), 900);
    setTimeout(() => {
      setSigningProgress(100);
      setIsSigning(false);
      setIsSigned(true);
      setIsTteModalOpen(false);

      const certNumber = `CERT-BSRE-PUPR-${Date.now().toString().slice(-6)}`;
      setSignatureCert(certNumber);

      // Update building status locally
      const today = new Date().toISOString().split('T')[0];
      const updated = buildings.map(b => b.id === activeBuilding.id ? {
        ...b,
        status: 'Disetujui' as const,
        reviewDate: today,
        digitalSignature: {
          signedBy: `H. Budi Mulyana, ST., M.Si (NIP 197502122001121002)`,
          timestamp: `${today} ${new Date().toLocaleTimeString()}`,
          certNumber,
          qrCodeGenerated: true
        }
      } : b);

      setBuildings(updated);
      localStorage.setItem('sipeka_assessment_reviews', JSON.stringify(updated));

      showToast('Tanda Tangan Elektronik (TTE BSrE BSSN) Berhasil Diterbitkan!');
    }, 1500);
  };

  // Export PDF using jsPDF + autoTable with Multi-Template Support
  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    if (activeTemplate === 'formA') {
      // FORM A - Permen PUPR 22/2018
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("KEMENTERIAN PEKERJAAN UMUM DAN PERUMAHAN RAKYAT", pageWidth / 2, 14, { align: 'center' });
      doc.setFontSize(12);
      doc.text("DINAS PEKERJAAN UMUM DAN PENATAAN RUANG KABUPATEN GARUT", pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("STANDAR EVALUASI TEKNIS BANGUNAN GEDUNG NEGARA (PERMEN PUPR NO. 22/PRT/M/2018)", pageWidth / 2, 25, { align: 'center' });
      doc.line(15, 28, pageWidth - 15, 28);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("FORM A: LEMBAR KERJA PENILAIAN TINGKAT KERUSAKAN BANGUNAN GEDUNG", pageWidth / 2, 35, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`ID Survey: ${activeBuilding.surveyId} | No. Assessment: ${activeBuilding.id}`, pageWidth / 2, 40, { align: 'center' });

      autoTable(doc, {
        startY: 44,
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 1.5 },
        body: [
          ['Nama Bangunan:', activeBuilding.buildingName, 'Tanggal Evaluasi:', activeBuilding.dateSubmitted],
          ['Instansi Pengelola:', activeBuilding.instansi, 'Kecamatan / Lokasi:', activeBuilding.kecamatan],
          ['Evaluator Lapangan:', activeBuilding.surveyor, 'Tipe Struktur Utama:', 'Beton Bertulang / Rangka'],
        ]
      });

      let yPos = (doc as any).lastAutoTable.finalY + 4;

      const formABody = [
        [{ content: 'I. KERANGKA STRUKTUR (BOBOT MAKS 40%)', colSpan: 6, styles: { fillColor: [240, 244, 248], fontStyle: 'bold' } }],
        ['1', 'Pondasi & Sloof Beton', '7.00%', `${(activeBuilding.structuralScore * 0.18).toFixed(1)}%`, `${((7 * activeBuilding.structuralScore * 0.18) / 100).toFixed(2)}%`, 'Keretakan / pergeseran tanah'],
        ['2', 'Kolom / Pillar Utama', '12.00%', `${(activeBuilding.structuralScore * 0.30).toFixed(1)}%`, `${((12 * activeBuilding.structuralScore * 0.30) / 100).toFixed(2)}%`, 'Retak geser / retak lentur'],
        ['3', 'Balok & Ring Balk', '11.00%', `${(activeBuilding.structuralScore * 0.28).toFixed(1)}%`, `${((11 * activeBuilding.structuralScore * 0.28) / 100).toFixed(2)}%`, 'Lenturan / defleksi balok'],
        ['4', 'Pelat Lantai / Str. Tangga', '5.00%', `${(activeBuilding.structuralScore * 0.12).toFixed(1)}%`, `${((5 * activeBuilding.structuralScore * 0.12) / 100).toFixed(2)}%`, 'Retak rambut permukaan'],
        ['5', 'Rangka Atap / Truss', '5.00%', `${(activeBuilding.structuralScore * 0.12).toFixed(1)}%`, `${((5 * activeBuilding.structuralScore * 0.12) / 100).toFixed(2)}%`, 'Korosi / lendutan truss'],
        [{ content: `SUBTOTAL STRUKTUR: ${activeBuilding.structuralScore}%`, colSpan: 6, styles: { fontStyle: 'bold', halign: 'right' } }],

        [{ content: 'II. PENGISI ARSITEKTUR (BOBOT MAKS 38%)', colSpan: 6, styles: { fillColor: [240, 244, 248], fontStyle: 'bold' } }],
        ['1', 'Dinding Pengisi & Plasteran', '10.00%', `${(activeBuilding.architecturalScore * 0.26).toFixed(1)}%`, `${((10 * activeBuilding.architecturalScore * 0.26) / 100).toFixed(2)}%`, 'Retak plaster / plester lepas'],
        ['2', 'Plafon & Rangka Ceiling', '8.00%', `${(activeBuilding.architecturalScore * 0.21).toFixed(1)}%`, `${((8 * activeBuilding.architecturalScore * 0.21) / 100).toFixed(2)}%`, 'Plafon ambruk / bocor'],
        ['3', 'Penutup Atap / Genteng', '7.00%', `${(activeBuilding.architecturalScore * 0.18).toFixed(1)}%`, `${((7 * activeBuilding.architecturalScore * 0.18) / 100).toFixed(2)}%`, 'Genteng bergeser / pecah'],
        ['4', 'Penutup Lantai / Keramik', '5.00%', `${(activeBuilding.architecturalScore * 0.13).toFixed(1)}%`, `${((5 * activeBuilding.architecturalScore * 0.13) / 100).toFixed(2)}%`, 'Keramik terangkat / pecah'],
        ['5', 'Kusen, Pintu & Jendela', '5.00%', `${(activeBuilding.architecturalScore * 0.13).toFixed(1)}%`, `${((5 * activeBuilding.architecturalScore * 0.13) / 100).toFixed(2)}%`, 'Kusen muai / tidak presisi'],
        ['6', 'Finishing & Pengecatan', '3.00%', `${(activeBuilding.architecturalScore * 0.09).toFixed(1)}%`, `${((3 * activeBuilding.architecturalScore * 0.09) / 100).toFixed(2)}%`, 'Cat mengelupas / jamur'],
        [{ content: `SUBTOTAL ARSITEKTUR: ${activeBuilding.architecturalScore}%`, colSpan: 6, styles: { fontStyle: 'bold', halign: 'right' } }],

        [{ content: 'III. UTILITAS & SANITASI (BOBOT MAKS 22%)', colSpan: 6, styles: { fillColor: [240, 244, 248], fontStyle: 'bold' } }],
        ['1', 'Instalasi Air Bersih & Kotor', '7.00%', `${(activeBuilding.utilityScore * 0.32).toFixed(1)}%`, `${((7 * activeBuilding.utilityScore * 0.32) / 100).toFixed(2)}%`, 'Pipa bocor / mampet'],
        ['2', 'Instalasi Kelistrikan & Panel', '7.00%', `${(activeBuilding.utilityScore * 0.32).toFixed(1)}%`, `${((7 * activeBuilding.utilityScore * 0.32) / 100).toFixed(2)}%`, 'Kabel kendor / korsleting'],
        ['3', 'Drainage & Saluran Air Rain', '5.00%', `${(activeBuilding.utilityScore * 0.23).toFixed(1)}%`, `${((5 * activeBuilding.utilityScore * 0.23) / 100).toFixed(2)}%`, 'Drainase tersumbat'],
        ['4', 'Proteksi Kebakaran & APAR', '3.00%', `${(activeBuilding.utilityScore * 0.13).toFixed(1)}%`, `${((3 * activeBuilding.utilityScore * 0.13) / 100).toFixed(2)}%`, 'Kadaluarsa / rusak'],
        [{ content: `SUBTOTAL UTILITAS: ${activeBuilding.utilityScore}%`, colSpan: 6, styles: { fontStyle: 'bold', halign: 'right' } }],

        [{ content: `TOTAL TINGKAT KERUSAKAN FORM A: ${activeBuilding.damagePercentage}% (${activeBuilding.damagePercentage > 45 ? 'RUSAK BERAT' : activeBuilding.damagePercentage >= 30 ? 'RUSAK SEDANG' : 'RUSAK RINGAN'})`, colSpan: 6, styles: { fillColor: [15, 76, 129], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 9 } }]
      ];

      autoTable(doc, {
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [15, 76, 129], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        head: [['No', 'Komponen / Elemen Bangunan', 'Bobot (%)', 'Kerusakan (%)', 'Skor Nilai (%)', 'Keterangan Defek']],
        body: formABody as any
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PENGESAHAN EVALUASI FORM A PUPR:", 15, yPos);

      doc.setFont("helvetica", "normal");
      doc.text("Evaluator Lapangan PUPR,", 25, yPos + 6);
      doc.text("Kabid Bangunan Gedung PUPR,", pageWidth - 85, yPos + 6);

      doc.text(activeBuilding.surveyor, 25, yPos + 22);
      doc.text("H. Budi Mulyana, ST., M.Si", pageWidth - 85, yPos + 22);
      doc.text("NIP. 197502122001121002", pageWidth - 85, yPos + 26);

      if (isSigned) {
        doc.setFont("helvetica", "bold");
        doc.text(`[TTE BSrE VALID: ${signatureCert}]`, pageWidth - 85, yPos + 31);
      }
    } else if (activeTemplate === 'ba') {
      // BERITA ACARA PENILAIAN (BAP)
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("PEMERINTAH KABUPATEN GARUT", pageWidth / 2, 14, { align: 'center' });
      doc.setFontSize(15);
      doc.text("DINAS PEKERJAAN UMUM DAN PENATAAN RUANG", pageWidth / 2, 21, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Jl. Raya Samarang No. 115, Tarogong Kidul, Garut | Email: pupr@garutkab.go.id", pageWidth / 2, 26, { align: 'center' });
      doc.line(15, 29, pageWidth - 15, 29);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BERITA ACARA PENILAIAN DAN VERIFIKASI KERUSAKAN (BAP)", pageWidth / 2, 38, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Nomor BAP: 600/BAP-PUPR-BG/VIII/2026/${activeBuilding.id}`, pageWidth / 2, 44, { align: 'center' });

      let y = 52;
      doc.setFontSize(8.5);
      const preamble = `Pada hari ini, ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, bertempat di Kantor Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Garut, telah dilaksanakan rapat pleno verifikasi dan penandatanganan Berita Acara Penilaian Kerusakan Bangunan Gedung Negara antara:`;
      const splitPreamble = doc.splitTextToSize(preamble, pageWidth - 30);
      doc.text(splitPreamble, 15, y);
      y += (splitPreamble.length * 4) + 6;

      autoTable(doc, {
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [15, 76, 129], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        head: [['Pihak', 'Nama / Instansi', 'Jabatan / Peran', 'Alamat Dinas']],
        body: [
          ['PIHAK PERTAMA', 'H. Budi Mulyana, ST., M.Si / Tim PUPR', 'Kepala Bidang Bangunan Gedung PUPR Kab. Garut', 'Jl. Raya Samarang No. 115, Garut'],
          ['PIHAK KEDUA', activeBuilding.instansi, 'Pengelola / Penanggung Jawab Aset', `Kec. ${activeBuilding.kecamatan}, Garut`]
        ]
      });

      y = (doc as any).lastAutoTable.finalY + 8;

      doc.setFont("helvetica", "bold");
      doc.text("OBJEK VERIFIKASI DAN PENILAIAN TEKNIS:", 15, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 1.5 },
        body: [
          ['Nama Bangunan:', activeBuilding.buildingName, 'ID Assessment:', activeBuilding.id],
          ['Fungsi / Kategori:', activeBuilding.category, 'Tanggal Survey:', activeBuilding.dateSubmitted],
          ['Lokasi Kecamatan:', activeBuilding.kecamatan, 'Tingkat Kerusakan:', `${activeBuilding.damagePercentage}% (${activeBuilding.riskLevel})`],
        ]
      });

      y = (doc as any).lastAutoTable.finalY + 8;

      doc.setFont("helvetica", "bold");
      doc.text("PASAL-PASAL KESEPAKATAN BAP:", 15, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const pasal1 = `PASAL 1 (VALIDASI FISIK): PIHAK PERTAMA dan PIHAK KEDUA menyatakan bahwa hasil pemeriksaan fisik kondisi bangunan gedung sebesar ${activeBuilding.damagePercentage}% sesuai Permen PUPR No. 22/2018 adalah SAH dan BENAR.`;
      const pasal2 = `PASAL 2 (REKOMENDASI PENANGANAN): Aset dikategorikan mengalami ${activeBuilding.damagePercentage > 45 ? 'RUSAK BERAT' : activeBuilding.damagePercentage >= 30 ? 'RUSAK SEDANG' : 'RUSAK RINGAN'} dan direkomendasikan untuk pelaksanaan pekerjaan penanganan teknis/rehabilitasi.`;
      const pasal3 = `PASAL 3 (LEGALITAS PENGANGGARAN): Berita Acara ini menjadi acuan legal formal pengajuan alokasi anggaran APBD/APBN/DAK Bencana serta pemutakhiran data KIB BMD.`;

      [pasal1, pasal2, pasal3].forEach(p => {
        const sp = doc.splitTextToSize(p, pageWidth - 30);
        doc.text(sp, 15, y);
        y += (sp.length * 4) + 3;
      });

      y += 8;
      doc.setFont("helvetica", "bold");
      doc.text("PIHAK KEDUA (Pengelola Aset),", 20, y);
      doc.text("PIHAK PERTAMA (Kepala Bidang PUPR),", pageWidth - 85, y);

      doc.setFont("helvetica", "normal");
      doc.text(activeBuilding.instansi, 20, y + 22);
      doc.text("H. Budi Mulyana, ST., M.Si", pageWidth - 85, y + 22);
      doc.text("NIP. 197502122001121002", pageWidth - 85, y + 26);

      if (isSigned) {
        doc.setFont("helvetica", "bold");
        doc.text(`[TTE BSrE VALID: ${signatureCert}]`, pageWidth - 85, y + 31);
      }
    } else if (activeTemplate === 'sertifikat') {
      // SERTIFIKAT KELAIKAN (SKK)
      doc.setLineWidth(1);
      doc.setDrawColor(15, 76, 129);
      doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.getHeight() - 20);
      doc.rect(12, 12, pageWidth - 24, doc.internal.pageSize.getHeight() - 24);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PEMERINTAH KABUPATEN GARUT - DINAS PUPR", pageWidth / 2, 25, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text("SERTIFIKAT HASIL EVALUASI KELAIKAN & KERUSAKAN", pageWidth / 2, 36, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Nomor Registrasi SKK: SKK.PUPR/2026/GARUT/${activeBuilding.id}`, pageWidth / 2, 43, { align: 'center' });

      let y = 60;
      doc.setFontSize(10);
      doc.text("Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Garut menerbitkan Sertifikat ini kepada:", pageWidth / 2, y, { align: 'center' });
      
      y += 12;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(activeBuilding.buildingName.toUpperCase(), pageWidth / 2, y, { align: 'center' });

      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Instansi: ${activeBuilding.instansi} | Kecamatan: ${activeBuilding.kecamatan}`, pageWidth / 2, y, { align: 'center' });

      y += 15;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`HASIL EVALUASI KONDISI FISIK: ${activeBuilding.damagePercentage}% KERUSAKAN`, pageWidth / 2, y, { align: 'center' });

      y += 12;
      doc.setFillColor(15, 76, 129);
      doc.rect(20, y - 6, pageWidth - 40, 16, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      const statusText = activeBuilding.damagePercentage > 45 
        ? 'STATUS: TIDAK LAIK FUNGSI SEMENTARA (PERLU REKONSTRUKSI)'
        : activeBuilding.damagePercentage >= 30
        ? 'STATUS: LAIK FUNGSI DENGAN CATATAN REHABILITASI SEDANG'
        : 'STATUS: LAIK FUNGSI (PEMELIHARAAN RUTIN)';
      doc.text(statusText, pageWidth / 2, y + 2, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      y += 28;
      doc.setFontSize(8);
      doc.text(`Sertifikat ini diterbitkan berdasarkan hasil survey lapangan SIPEKA PUPR pada tanggal ${activeBuilding.dateSubmitted}.`, pageWidth / 2, y, { align: 'center' });

      y += 20;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Disahkan Secara Elektronik oleh:", pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text("Kepala Bidang Bangunan Gedung PUPR Kab. Garut", pageWidth / 2, y, { align: 'center' });

      y += 18;
      doc.text("H. Budi Mulyana, ST., M.Si", pageWidth / 2, y, { align: 'center' });
      doc.setFont("helvetica", "normal");
      doc.text("NIP. 197502122001121002", pageWidth / 2, y + 5, { align: 'center' });

      if (isSigned) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`[SEALED BSRE BSSN CERT: ${signatureCert}]`, pageWidth / 2, y + 11, { align: 'center' });
      }
    } else {
      // LAPORAN TEKNIS LENGKAP (Using LaporanTeknisGenerator)
      const generator = new LaporanTeknisGenerator();
      
      const mockLaporanData: LaporanData = {
        documentId: activeBuilding.id,
        baseUrl: window.location.origin,
        reportNumber: `B.02/PUPR-BG/VIII/2026/${activeBuilding.id}`,
        buildingName: activeBuilding.buildingName,
        location: `${activeBuilding.kecamatan}, Kab. Garut`,
        date: activeBuilding.dateSubmitted,
        signers: {
          surveyor: { name: activeBuilding.surveyor, nip: '198001012005011001', position: 'Surveyor Lapangan', organization: 'PUPR', status: 'SIGNED' },
          reviewer: { name: activeBuilding.reviewer || 'Siti Aminah, S.T.', nip: '197802022005012002', position: 'Reviewer Teknis', organization: 'PUPR', status: 'SIGNED' },
          kepalaBidang: { name: 'H. Budi Mulyana, ST., M.Si', nip: '197502122001121002', position: 'Kepala Bidang Bangunan Gedung', organization: 'PUPR Garut', status: isSigned ? 'SIGNED' : 'PENDING' }
        },
        content: {
          executiveSummary: `RINGKASAN EKSEKUTIF\nBerdasarkan hasil inspeksi visual dan evaluasi teknis yang dilakukan pada tanggal ${activeBuilding.dateSubmitted}, bangunan gedung ${activeBuilding.buildingName} yang dikelola oleh ${activeBuilding.instansi} diidentifikasi memiliki tingkat kerusakan sebesar ${activeBuilding.damagePercentage}% (${activeBuilding.riskLevel}). Evaluasi ini mencakup aspek struktural, arsitektural, dan utilitas (MEP). Oleh karena itu, diperlukan langkah mitigasi dan perbaikan struktural sesuai rekomendasi (terlampir) guna memastikan kelaikan fungsi bangunan di masa mendatang.`,
          bab1Pendahuluan: `1.1 Latar Belakang\nSistem Informasi Penilaian Keandalan Bangunan (SIPEKA) mencatat adanya kebutuhan evaluasi kelayakan pada aset pemerintah: ${activeBuilding.buildingName}. Penilaian ini dipicu oleh inspeksi rutin dan/atau laporan kerusakan dari pihak pengelola. Evaluasi mengacu pada pedoman teknis yang berlaku.\n\n1.2 Tujuan Penilaian\nTujuan utama penilaian ini adalah untuk mengetahui tingkat kerusakan eksisting, memberikan rekomendasi teknis penanganan berbasis data inspeksi, dan menghasilkan estimasi awal untuk tindakan preventif maupun rehabilitasi.`,
          bab2Metodologi: 'Pemeriksaan dilakukan secara Visual Assessment (Non-Destructive) mengacu pada pedoman teknis:\n1. Permen PUPR No. 22/PRT/M/2018 tentang Pedoman Pembangunan Bangunan Gedung Negara.\n2. Standar Nasional Indonesia (SNI) terkait keandalan struktur dan utilitas bangunan gedung.\n3. Analisis skoring dibantu oleh AI Engine SIPEKA untuk kalibrasi objektivitas.',
          bab3HasilPemeriksaan: `Pemeriksaan fisik menunjukkan bahwa tingkat kerusakan total mencapai ${activeBuilding.damagePercentage}%. Rincian akumulasi kerusakan per komponen:\n- Komponen Struktur Utama: ${activeBuilding.structuralScore}%\n- Komponen Arsitektural: ${activeBuilding.architecturalScore}%\n- Komponen Utilitas (MEP): ${activeBuilding.utilityScore}%\n\nDistribusi bobot telah disesuaikan dengan form standar PUPR.`,
          bab4AnalisisStruktur: `Skor struktur tercatat sebesar ${activeBuilding.structuralScore}%. Pengamatan lapangan pada kolom, balok, dan fondasi menunjukkan kondisi yang sesuai dengan nilai tersebut. Beberapa elemen struktural pada kategori ini mungkin memerlukan perhatian khusus atau pengujian lanjutan (seperti Hammer Test atau UPV) apabila direkomendasikan pada bagian kesimpulan.`,
          bab5AnalisisUtilitas: `Skor utilitas (Mekanikal, Elektrikal, dan Plumbing) tercatat sebesar ${activeBuilding.utilityScore}%. Secara umum, sistem utilitas berfungsi, namun terdapat beberapa catatan teknis terkait instalasi listrik maupun saluran perpipaan yang memengaruhi nilai keandalan secara keseluruhan.`,
          bab6EstimasiBiaya: 'Estimasi biaya perbaikan belum dapat dipastikan secara definitif tanpa penyusunan Rencana Anggaran Biaya (RAB) detail. Namun, dengan tingkat kerusakan kategori ' + activeBuilding.riskLevel + ', pihak pengelola disarankan untuk mulai mengalokasikan pagu anggaran pemeliharaan preventif atau rehabilitasi melalui APBD/DAK tahun berikutnya.',
          bab7Kesimpulan: customNarrative
        }
      };

      const blob = await generator.generateLaporan(mockLaporanData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_Teknis_Lengkap_${activeBuilding.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Dokumen PDF LTL berhasil diunduh!`);
      return; // Exit early since generator handles save
    }


    const pageHeight = doc.internal.pageSize.getHeight();
    await addFooterWithQRCode(doc, activeBuilding.id, signatureCert || "PENDING", pageHeight, pageWidth);
    doc.save(`Dokumen_PUPR_${activeBuilding.id}_${activeTemplate}.pdf`);
    showToast(`Dokumen PDF (${activeTemplate.toUpperCase()}) berhasil diunduh!`);
  };

  // Export CSV/Excel Rekapitulasi
  const handleExportCSV = () => {
    const headers = ['ID Assessment', 'ID Survey', 'Nama Bangunan', 'Kategori', 'Instansi', 'Kecamatan', 'Surveyor', '% Kerusakan', 'Tingkat Risiko', 'Status Review', 'Reviewer', 'Tanggal Review'];
    const rows = buildings.map(b => [
      b.id, b.surveyId, `"${b.buildingName}"`, `"${b.category}"`, `"${b.instansi}"`, `"${b.kecamatan}"`,
      `"${b.surveyor}"`, b.damagePercentage, b.riskLevel, b.status, `"${b.reviewer || '-'}"`, b.reviewDate || '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REKAPITULASI_BANGUNAN_PUPR_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File Excel/CSV Rekapitulasi berhasil diunduh!');
  };

  // Export Batch PDF (All Buildings Executive Report)
  const handleBatchExportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Cover Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DINAS PEKERJAAN UMUM DAN PENATAAN RUANG KAB. GARUT", pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.text("DOKUMEN KONSOLIDASI BAP & REKAPITULASI KERUSAKAN BANGUNAN GEDUNG", pageWidth / 2, 27, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} | Total Dokumen Terkumpul: ${buildings.length} Bangunan`, pageWidth / 2, 33, { align: 'center' });
    doc.line(20, 36, pageWidth - 20, 36);

    autoTable(doc, {
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [15, 76, 129] },
      head: [['ID Assessment', 'Nama Bangunan', 'Instansi', 'Kecamatan', '% Kerusakan', 'Risiko', 'Status TTE']],
      body: buildings.map(b => [
        b.id,
        b.buildingName,
        b.instansi,
        b.kecamatan,
        `${b.damagePercentage}%`,
        b.riskLevel,
        b.status === 'Disetujui' ? 'TTE VALID BSRE' : 'DRAFT / MENUNGGU'
      ])
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PENGESAHAN DOKUMEN MASAL:", 20, finalY);
    doc.setFont("helvetica", "normal");
    doc.text("Kepala Dinas Pekerjaan Umum dan Penataan Ruang Kab. Garut,", 20, finalY + 6);
    doc.text("H. Budi Mulyana, ST., M.Si (NIP. 197502122001121002)", 20, finalY + 22);

    const pageHeight = doc.internal.pageSize.getHeight();
    await addFooterWithQRCode(doc, "BATCH_REPORT_" + new Date().getTime(), signatureCert || "PENDING", pageHeight, pageWidth);
    doc.save(`KONSOLIDASI_BAP_PUPR_GARUT_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Laporan Konsolidasi BAP Semua Bangunan berhasil diunduh!');
  };

  // Verify Certificate or QR Code
  const handleVerifyCertificate = (query?: string) => {
    const searchTerm = (query || verifySearchInput || signatureCert).trim().toUpperCase();
    if (!searchTerm) return;

    const matchedBuilding = buildings.find(b => 
      b.id.toUpperCase().includes(searchTerm) || 
      (b.digitalSignature?.certNumber && b.digitalSignature.certNumber.toUpperCase().includes(searchTerm))
    ) || activeBuilding;

    setVerifyResult({
      certNumber: matchedBuilding.digitalSignature?.certNumber || signatureCert,
      isValid: true,
      buildingName: matchedBuilding.buildingName,
      damagePercentage: matchedBuilding.damagePercentage,
      riskLevel: matchedBuilding.riskLevel,
      signedBy: 'H. Budi Mulyana, ST., M.Si',
      signerNip: '197502122001121002',
      signerTitle: 'Kepala Dinas Pekerjaan Umum dan Penataan Ruang',
      timestamp: matchedBuilding.digitalSignature?.timestamp || `${new Date().toLocaleDateString('id-ID')} 10:15:22 WIB`,
      bsreCaAuthority: 'Balai Sertifikasi Elektronik (BSrE) - Badan Siber dan Sandi Negara (BSSN)',
      sha256Hash: 'a9f8b7c6d5e4f3a2b1c09876543210fedcba9876543210123456789abcdef012',
      securityStatus: 'SEALED & UNTAMPERED (PASSTHROUGH RFC 3161 TIMESTAMP)'
    });
    setIsVerifyModalOpen(true);
  };

  // Perform SIMBANGDA Sync
  const handleSyncSimbangda = () => {
    setIsSyncing(true);
    setSyncStep(1);

    setTimeout(() => setSyncStep(2), 600);
    setTimeout(() => setSyncStep(3), 1200);
    setTimeout(() => setSyncStep(4), 1800);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(`${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')} WIB`);
      showToast('Sinkronisasi SIMBANGDA Garut & SIMBG PUPR Berhasil (HTTP 200 OK)!');
    }, 2400);
  };

  // Print Document
  const handlePrintDocument = () => {
    window.print();
  };

  // Regenerate AI Narrative
  const handleRegenerateNarrative = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);

      if (aiTone === 'formal') {
        setCustomNarrative(
          `Berdasarkan hasil verifikasi teknis Permen PUPR No. 22/2018, bangunan ${activeBuilding.buildingName} diklasifikasikan ke dalam kategori ${activeBuilding.riskLevel} dengan persentase kerusakan sebesar ${activeBuilding.damagePercentage}%. Rincian kerusakan mencakup sektor Struktur (${activeBuilding.structuralScore}%), Arsitektur (${activeBuilding.architecturalScore}%), dan Utilitas (${activeBuilding.utilityScore}%). Rekomendasi: Segera lakukan tindakan pemeliharaan/perbaikan terencana sesuai petunjuk teknis dinas.`
        );
      } else if (aiTone === 'brief') {
        setCustomNarrative(
          `RINGKASAN EKSEKUTIF: ${activeBuilding.buildingName} mengalami kerusakan ${activeBuilding.damagePercentage}% (${activeBuilding.riskLevel}). Disarankan alokasi anggaran pemeliharaan rutin/sedang pada APBD Garut TA 2026.`
        );
      } else {
        setCustomNarrative(
          `AUDIT TEKNIS: Komponen kritis ${activeBuilding.buildingName} teridentifikasi pada ${activeBuilding.componentsBreakdown?.map(c => c.name).slice(0, 3).join(', ')}. Indeks kerusakan total ${activeBuilding.damagePercentage}%. Diperlukan perkuatan struktural dan perbaikan elemen arsitektural sekunder.`
        );
      }

      showToast('Narasi laporan AI berhasil diperbarui!');
    }, 1000);
  };

  // Send WhatsApp Link
  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `Pemberitahuan Laporan Penilaian Kerusakan Bangunan Dinas PUPR Garut:\n\n- ID: ${activeBuilding.id}\n- Bangunan: ${activeBuilding.buildingName}\n- Kerusakan: ${activeBuilding.damagePercentage}% (${activeBuilding.riskLevel})\n- Status TTE: ${isSigned ? 'SELESAI / VALID' : 'MENUNGGU VERIFIKASI'}\n\nLaporan resmi dapat diakses melalui portal SIPEKA PUPR.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phoneInput}&text=${text}`, '_blank');
    showToast('Membuka tautan WhatsApp...');
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {activeRole === 'Pengelola' ? 'Laporan Penilaian Kerusakan' : 'Report Engine & TTE BSrE'}
            </h1>
            <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/5 font-semibold">Tahap 7</Badge>
          </div>
          <p className="text-slate-500 mt-1">
            {activeRole === 'Pengelola' 
              ? 'Unduh laporan hasil penilaian resmi kondisi bangunan gedung instansi Anda.' 
              : 'Otomatisasi Dokumen Laporan Resmi PUPR, Form A, BAP, & Sertifikasi Tanda Tangan Elektronik (TTE BSrE BSSN).'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedBuildingId}
            onChange={e => setSelectedBuildingId(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-pupr-blue focus:outline-none focus:ring-2 focus:ring-pupr-blue shadow-sm"
          >
            {buildings.map(b => (
              <option key={b.id} value={b.id}>
                {b.id} - {b.buildingName} ({b.damagePercentage}%)
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={() => handleVerifyCertificate()} className="bg-white text-slate-700">
            <QrCode size={15} className="mr-1.5 text-pupr-blue" /> Verifikasi QR
          </Button>

          <Button variant="outline" size="sm" onClick={() => setIsSyncModalOpen(true)} className="bg-white text-slate-700">
            <Database size={15} className="mr-1.5 text-emerald-600" /> SIMBANGDA
          </Button>

          <Button variant="outline" size="sm" onClick={handleBatchExportPDF} className="bg-white text-slate-700">
            <FileSpreadsheet size={15} className="mr-1.5 text-pupr-blue" /> Konsolidasi PDF
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrintDocument} className="bg-white">
            <Printer size={15} className="mr-1.5" /> Cetak
          </Button>

          <Button variant="pupr" size="sm" onClick={handleExportPDF}>
            <Download size={15} className="mr-1.5" /> Unduh PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Left Sidebar: Controls, Templates & Data */}
        <div className="lg:col-span-1 space-y-6 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-1">
          
          {/* Active Building Quick Card */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-pupr-blue text-white overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <Badge className="bg-white/20 text-white border-none text-[10px]">{activeBuilding.category}</Badge>
                <span className="text-xs font-mono text-blue-200">{activeBuilding.id}</span>
              </div>
              <div>
                <h3 className="font-bold text-base leading-snug">{activeBuilding.buildingName}</h3>
                <p className="text-xs text-blue-200 mt-0.5">{activeBuilding.instansi} • {activeBuilding.kecamatan}</p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Tingkat Kerusakan</p>
                  <p className="text-xl font-extrabold">{activeBuilding.damagePercentage}%</p>
                </div>
                <Badge variant={activeBuilding.riskLevel === 'Sangat Tinggi' ? 'destructive' : 'secondary'} className="bg-white/15 text-white">
                  {activeBuilding.riskLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
            <CardHeader className="pb-3 border-b border-slate-100 mb-2">
              <CardTitle className="text-sm">Template Dokumen Resmi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { id: 'lengkap', label: 'Laporan Teknis Lengkap', desc: 'Rincian lengkap, foto bukti & AI', icon: FileText },
                { id: 'formA', label: 'Form A (Permen PUPR 22/2018)', desc: 'Lembar kerja evaluasi standar PUPR', icon: FileCheck },
                { id: 'ba', label: 'Berita Acara Penilaian (BAP)', desc: 'Dokumen pengesahan legalitas & hukum', icon: FileSignature },
                { id: 'sertifikat', label: 'Sertifikat Kondisi Fisik (SKK)', desc: 'Surat Keterangan Kelaikan Bangunan', icon: Award },
                { id: 'rekap', label: 'Rekapitulasi Konsolidasi CSV', desc: 'Ekspor dataset masal ke Excel/CSV', icon: FileSpreadsheet },
              ].map(tmpl => (
                <button 
                  key={tmpl.id}
                  onClick={() => {
                    if (tmpl.id === 'rekap') handleExportCSV();
                    else setActiveTemplate(tmpl.id as any);
                  }}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                    activeTemplate === tmpl.id 
                      ? 'border-pupr-blue bg-blue-50 text-pupr-blue shadow-sm' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <tmpl.icon size={18} className={activeTemplate === tmpl.id ? 'text-pupr-blue' : 'text-slate-400'} />
                    <div>
                      <p className="text-xs font-bold">{tmpl.label}</p>
                      <p className="text-[10px] text-slate-400">{tmpl.desc}</p>
                    </div>
                  </div>
                  {activeTemplate === tmpl.id && <Check size={16} className="text-pupr-blue" />}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Watermark Selector Card */}
          <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Stempel & Watermark Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2 text-xs">
              <select
                value={watermarkText}
                onChange={e => setWatermarkText(e.target.value as any)}
                className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-pupr-blue text-xs"
              >
                <option value="SALINAN SAH PUPR">SALINAN SAH PUPR</option>
                <option value="TTE VALID BSRE">TTE VALID BSRE (BSSN)</option>
                <option value="DRAFT EVALUASI">DRAFT EVALUASI TEKNIS</option>
                <option value="ASLI DOKUMEN PUPR">ASLI DOKUMEN PUPR</option>
              </select>
            </CardContent>
          </Card>

          {/* SIMBANGDA & SIMBG Sync Card */}
          <Card className="border-0 shadow-sm ring-1 ring-slate-200/50 bg-slate-900 text-white">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Database size={12} /> Integrasi SIMBANGDA Garut
                </span>
                <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-300 bg-emerald-500/10">Connected</Badge>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Dokumen BAP otomatis tersinkronisasi ke SIMBANGDA Kab. Garut dan SIMBG Kementerian PUPR.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>Sync Terakhir:</span>
                <span className="font-mono text-slate-200">{lastSyncTime}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSyncSimbangda} 
                disabled={isSyncing}
                className="w-full h-7 text-xs bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <RefreshCw size={12} className={`mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Menyingkronkan...' : 'Sinkronkan Sekarang'}
              </Button>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
            <CardHeader className="pb-3 border-b border-slate-100 mb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Status Pengesahan TTE</span>
                <ShieldCheck size={16} className="text-pupr-blue" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Nomor Registrasi</span>
                <span className="font-mono font-bold text-slate-900">BAP/PUPR/{activeBuilding.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Otorisasi BSrE BSSN</span>
                {isSigned ? (
                  <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-none font-bold">
                    TERVERIFIKASI
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 font-bold">
                    MENUNGGU TTE
                  </Badge>
                )}
              </div>

              {isSigned && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-mono space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>No. Sertifikat:</span>
                    <span className="font-bold text-slate-900">{signatureCert}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penandatangan:</span>
                    <span className="text-slate-800">Kabid PUPR Garut</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                {!isSigned ? (
                  <Button 
                    variant="pupr" 
                    className="w-full text-xs font-bold" 
                    onClick={() => setIsTteModalOpen(true)}
                  >
                    <KeyRound size={14} className="mr-1.5" /> Terbitkan TTE BSrE
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" 
                    onClick={() => setIsTteModalOpen(true)}
                  >
                    <CheckCircle2 size={14} className="mr-1.5" /> TTE Selesai (Detail BSrE)
                  </Button>
                )}
              </div>

              <div className="pt-1 text-center">
                <button 
                  onClick={() => setIsDistributeModalOpen(true)}
                  className="text-xs text-pupr-blue hover:underline flex items-center justify-center w-full gap-1 font-semibold"
                >
                  <Send size={12} /> Distribusi Laporan via WA / Email
                </button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Area: Interactive Document Workspace */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-xl rounded-[20px] border border-slate-200/80 shadow-sm flex flex-col overflow-hidden relative">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50/80">
            <button 
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'preview' 
                  ? 'border-pupr-blue text-pupr-blue bg-white shadow-sm' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              <FileText size={15} className="inline mr-2 -mt-0.5" />
              Preview Dokumen Resmi
            </button>
            <button 
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'ai' 
                  ? 'border-pupr-blue text-pupr-blue bg-white shadow-sm' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab('ai')}
            >
              <Sparkles size={15} className="inline mr-2 -mt-0.5 text-amber-500" />
              AI Narrative Engine
            </button>
            <button 
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'tte' 
                  ? 'border-pupr-blue text-pupr-blue bg-white shadow-sm' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab('tte')}
            >
              <ShieldCheck size={15} className="inline mr-2 -mt-0.5 text-emerald-600" />
              TTE & Log Distribusi
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar flex justify-center bg-slate-100/60">
            
            {/* TAB 1: PREVIEW DOKUMEN RESMI */}
            {activeTab === 'preview' && (
              <div className="bg-white w-full max-w-[794px] min-h-[1123px] shadow-xl border border-slate-300 p-8 md:p-12 text-slate-900 space-y-6 origin-top animate-in zoom-in-95 duration-300 relative print:p-0 print:shadow-none print:border-none overflow-hidden">
                
                {/* Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none opacity-5 z-0">
                  <div className="rotate-[-35deg] border-8 border-slate-900 px-10 py-6 text-5xl font-black uppercase tracking-widest text-slate-900 whitespace-nowrap">
                    {watermarkText}
                  </div>
                </div>
                
                {/* Official Kop Surat Dinas PUPR Garut */}
                <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-4">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-full bg-amber-400 border-2 border-slate-900 flex items-center justify-center font-bold text-slate-900 text-xs shadow-sm">
                       PUPR
                     </div>
                     <div>
                       <h2 className="text-base md:text-lg font-bold uppercase tracking-wider text-slate-900">PEMERINTAH KABUPATEN GARUT</h2>
                       <h3 className="text-sm md:text-base font-extrabold uppercase text-slate-900">DINAS PEKERJAAN UMUM DAN PENATAAN RUANG</h3>
                       <p className="text-[11px] text-slate-600">Jl. Raya Samarang No. 115 Tarogong Kidul Garut | Email: pupr@garutkab.go.id</p>
                     </div>
                  </div>
                </div>

                {/* Document Header Title */}
                <div className="text-center space-y-1 pt-2">
                  <h1 className="text-base md:text-lg font-black uppercase underline tracking-wide">
                    {activeTemplate === 'formA' ? 'FORM A - PENILAIAN KERUSAKAN BANGUNAN GEDUNG' :
                     activeTemplate === 'ba' ? 'BERITA ACARA PENILAIAN & VERIFIKASI KERUSAKAN' :
                     'LAPORAN TEKNIS HASIL PENILAIAN KERUSAKAN BANGUNAN'}
                  </h1>
                  <p className="text-xs font-mono font-semibold text-slate-600">
                    Nomor: B.02/PUPR-BG/VIII/2026/{activeBuilding.id}
                  </p>
                </div>

                {/* Section A: Identitas Bangunan */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider bg-slate-100 p-2 rounded border-l-4 border-pupr-blue">
                    A. IDENTITAS BANGUNAN GEDUNG
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Nama Bangunan:</span>
                      <span className="font-bold text-slate-900">{activeBuilding.buildingName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">ID Permohonan / Survey:</span>
                      <span className="font-mono font-bold">{activeBuilding.surveyId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Kategori / Fungsi:</span>
                      <span className="font-semibold">{activeBuilding.category}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Instansi Pengelola:</span>
                      <span className="font-semibold">{activeBuilding.instansi}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Lokasi / Kecamatan:</span>
                      <span className="font-semibold">{activeBuilding.kecamatan}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Tanggal Survey:</span>
                      <span className="font-semibold">{activeBuilding.dateSubmitted}</span>
                    </div>
                  </div>
                </div>

                {activeTemplate !== 'lengkap' ? (
                  <>
                    {/* Section B: Hasil Evaluasi Kerusakan PUPR */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider bg-slate-100 p-2 rounded border-l-4 border-pupr-blue">
                        B. RINGKASAN PERSENTASE KERUSAKAN (PERMEN PUPR NO. 22/2018)
                      </h4>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Struktur (Max 40%)</p>
                          <p className="text-lg font-bold text-slate-900">{activeBuilding.structuralScore}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Arsitektur (Max 38%)</p>
                          <p className="text-lg font-bold text-slate-900">{activeBuilding.architecturalScore}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Utilitas (Max 22%)</p>
                          <p className="text-lg font-bold text-slate-900">{activeBuilding.utilityScore}%</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Kerusakan Total</p>
                          <p className="text-xl font-extrabold text-pupr-blue">{activeBuilding.damagePercentage}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Section C: Rincian Komponen Breakdown */}
                    {activeBuilding.componentsBreakdown && activeBuilding.componentsBreakdown.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider bg-slate-100 p-2 rounded border-l-4 border-pupr-blue">
                          C. RINCIAN BOBOT PENILAIAN PER KOMPONEN
                        </h4>
                        <table className="w-full text-xs text-left border border-slate-200">
                          <thead className="bg-slate-100 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2 border-r border-slate-200">Komponen Bangunan</th>
                              <th className="p-2 border-r border-slate-200">Kategori</th>
                              <th className="p-2 text-center border-r border-slate-200">Bobot (%)</th>
                              <th className="p-2 text-center border-r border-slate-200">Kerusakan (%)</th>
                              <th className="p-2 text-center border-r border-slate-200">Skor (%)</th>
                              <th className="p-2">Catatan Verifikasi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {activeBuilding.componentsBreakdown.map((c) => (
                              <tr key={c.id}>
                                <td className="p-2 font-semibold border-r border-slate-200">{c.name}</td>
                                <td className="p-2 border-r border-slate-200">{c.category}</td>
                                <td className="p-2 text-center border-r border-slate-200">{c.weight}%</td>
                                <td className="p-2 text-center font-bold border-r border-slate-200">{c.reviewerDamagePct}%</td>
                                <td className="p-2 text-center font-bold text-pupr-blue border-r border-slate-200">
                                  {((c.weight * c.reviewerDamagePct) / 100).toFixed(2)}%
                                </td>
                                <td className="p-2 text-slate-600">{c.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Section D: AI Narrative & Conclusion */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider bg-slate-100 p-2 rounded border-l-4 border-pupr-blue flex items-center justify-between">
                        <span>D. KESIMPULAN DAN REKOMENDASI TEKNIS</span>
                        <Badge variant="outline" className="text-[10px] font-mono bg-white text-slate-600">Terverifikasi AI</Badge>
                      </h4>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-justify space-y-2">
                        <p>{customNarrative}</p>
                        <p className="font-semibold text-slate-800">
                          Rekomendasi Tambahan: {activeBuilding.reviewerNotes || 'Segera diterbitkan instruksi pemeliharaan/pengerjaan teknis.'}
                        </p>
                      </div>
                    </div>

                    {/* Section E: Formal Signatures & TTE BSrE Stamp */}
                    <div className="pt-8 flex items-start justify-between px-2">
                      {/* Left: Kepala Bidang (Tertinggi) */}
                      <div className="text-center space-y-3 relative w-1/3">
                        <p className="text-xs font-semibold">
                          Diketahui Oleh,<br/>
                          Kepala Bidang Bangunan Gedung PUPR
                        </p>

                        <div className="flex justify-center relative my-2">
                          <div className={`p-2 border-2 rounded-xl flex items-center justify-center transition-all ${
                            isSigned ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-md' : 'border-dashed border-slate-300 text-slate-300'
                          }`}>
                            <QrCode size={56} className={isSigned ? 'text-emerald-800' : 'text-slate-300'} />
                          </div>

                          {isSigned && (
                            <div className="absolute -bottom-2 bg-emerald-600 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow">
                              TTE BSrE VALID
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-bold underline text-xs">H. Budi Mulyana, ST., M.Si</p>
                          <p className="text-[10px] text-slate-500">NIP. 197502122001121002</p>
                          {isSigned && (
                            <p className="text-[9px] font-mono text-emerald-700 mt-0.5">Cert: {signatureCert}</p>
                          )}
                        </div>
                      </div>

                      {/* Center: Reviewer (Menengah) */}
                      <div className="text-center space-y-16 w-1/3">
                        <p className="text-xs font-semibold">Diperiksa Oleh,<br/>Reviewer Teknis PUPR</p>
                        <div>
                          <p className="font-bold underline text-xs">{activeBuilding.reviewer || 'Siti Aminah, S.T.'}</p>
                          <p className="text-[10px] text-slate-500">NIP. 197802022005012002</p>
                        </div>
                      </div>

                      {/* Right: Surveyor (Terendah) */}
                      <div className="text-center space-y-16 w-1/3">
                        <p className="text-xs font-semibold">Disusun Oleh,<br/>Surveyor Lapangan PUPR</p>
                        <div>
                          <p className="font-bold underline text-xs">{activeBuilding.surveyor}</p>
                          <p className="text-[10px] text-slate-500">NIP. 198001012005011001</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* PREVIEW 7 BAB LAPORAN TEKNIS LENGKAP */}
                    <div className="space-y-6 pt-4">
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-inner">
                        <h3 className="text-center font-bold text-sm uppercase tracking-widest text-slate-800">Daftar Isi (Struktur Laporan 7 Bab)</h3>
                        
                        <div className="text-xs space-y-3 font-medium text-slate-700">
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>RINGKASAN EKSEKUTIF</span><span>i</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>BAB 1. PENDAHULUAN</span><span>1</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="pl-4 font-normal text-slate-500">1.1 Latar Belakang</span><span>1</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="pl-4 font-normal text-slate-500">1.2 Tujuan Penilaian</span><span>2</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>BAB 2. METODOLOGI PENILAIAN</span><span>4</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>BAB 3. HASIL PEMERIKSAAN FISIK</span><span>7</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>BAB 4. ANALISIS STRUKTUR & ARSITEKTUR</span><span>12</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>BAB 5. ANALISIS UTILITAS (MEP)</span><span>18</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>BAB 6. ESTIMASI BIAYA & REKOMENDASI PENANGANAN</span><span>22</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>BAB 7. KESIMPULAN</span><span>25</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>LAMPIRAN DOKUMENTASI & QR VERIFIKASI</span><span>26</span>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center p-3 bg-pupr-blue/10 rounded-lg text-pupr-blue font-semibold text-xs border border-pupr-blue/20">
                          <FileText size={16} className="mr-2" />
                          Gunakan tombol "Unduh PDF" untuk men-generate dokumen lengkap 7 Bab beserta TTE.
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>
            )}

            {/* TAB 2: AI NARRATIVE ENGINE */}
            {activeTab === 'ai' && (
              <div className="w-full max-w-3xl space-y-6 animate-in fade-in duration-300">
                <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="text-amber-500" size={18} />
                      AI Laporan & Recommendation Generator
                    </CardTitle>
                    <CardDescription>
                      Menghasilkan narasi resmi berbasis LLM dari data inspeksi komponen PUPR.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Gaya & Tone Narasi Laporan</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'formal', label: 'Permen PUPR No. 22/2018 (Formal)' },
                          { id: 'brief', label: 'Ringkasan Eksekutif Bupati' },
                          { id: 'technical', label: 'Audit Teknis Lab Struktur' },
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setAiTone(t.id as any)}
                            className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                              aiTone === t.id 
                                ? 'bg-pupr-blue text-white border-pupr-blue shadow-sm' 
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase text-slate-500">Draft Narasi Hasil Generasi AI</label>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleRegenerateNarrative}
                          disabled={isRegenerating}
                          className="h-7 text-xs bg-white"
                        >
                          <RefreshCw size={12} className={`mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                          Regenerate Narasi
                        </Button>
                      </div>
                      <textarea
                        value={customNarrative}
                        onChange={e => setCustomNarrative(e.target.value)}
                        rows={6}
                        className="w-full p-3 text-xs font-sans rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-pupr-blue focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button 
                        variant="pupr" 
                        size="sm"
                        onClick={() => {
                          setActiveTab('preview');
                          showToast('Narasi AI berhasil diterapkan ke Dokumen Laporan!');
                        }}
                      >
                        <CheckCircle2 size={14} className="mr-1.5" /> Terapkan ke Dokumen Laporan
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 3: TTE & DISTRIBUSI LOG */}
            {activeTab === 'tte' && (
              <div className="w-full max-w-3xl space-y-6 animate-in fade-in duration-300">
                <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-600" size={18} />
                        Status Tanda Tangan Elektronik BSrE (BSSN)
                      </span>
                      {isSigned ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold">TERDAFTAR BSSN</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">BELUM DITANDATANGANI</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${
                        isSigned ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isSigned ? <FileCheck size={24} /> : <KeyRound size={24} />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-sm text-slate-900">
                          {isSigned ? 'Dokumen BAP Sah Secara Hukum' : 'Membutuhkan Otorisasi TTE BSrE'}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {isSigned 
                            ? `Sertifikat TTE ${signatureCert} telah divalidasi oleh Balai Sertifikasi Elektronik BSSN dengan timestamp RFC 3161.`
                            : 'Laporan telah disetujui reviewer teknis. Harap lakukan verifikasi passphrase untuk menerbitkan stempel TTE resmi.'}
                        </p>
                      </div>
                      {!isSigned && (
                        <Button variant="pupr" size="sm" onClick={() => setIsTteModalOpen(true)}>
                          TTE Sekarang
                        </Button>
                      )}
                    </div>

                    {/* Timeline pengesahan */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Alur Otorisasi & Riwayat TTE</h4>
                      <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                        <div className="relative pl-6">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                          <p className="text-xs font-bold text-slate-900">Surveyor Lapangan ({activeBuilding.surveyor})</p>
                          <p className="text-[11px] text-slate-500">Submit data penilaian • {activeBuilding.dateSubmitted}</p>
                        </div>
                        <div className="relative pl-6">
                          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                            isSigned ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                          }`}></div>
                          <p className="text-xs font-bold text-slate-900">Kepala Bidang PUPR (H. Budi Mulyana, ST., M.Si)</p>
                          <p className="text-[11px] text-slate-500">
                            {isSigned ? `TTE BSrE Diterbitkan (${activeBuilding.reviewDate || '2026-08-01'})` : 'Menunggu Otorisasi Passphrase'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <Button variant="outline" size="sm" onClick={() => setIsDistributeModalOpen(true)} className="bg-white">
                        <Share2 size={14} className="mr-1.5" /> Bagikan Laporan
                      </Button>
                      <Button variant="pupr" size="sm" onClick={handleExportPDF}>
                        <Download size={14} className="mr-1.5" /> Unduh PDF Resmi
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* MODAL: VERIFIKASI TTE BSRE */}
      {isTteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="p-5 bg-gradient-to-r from-slate-900 to-pupr-blue text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <KeyRound size={20} className="text-amber-400" />
                <h3 className="font-bold text-base">Otorisasi TTE BSrE BSSN</h3>
              </div>
              <button onClick={() => setIsTteModalOpen(false)} className="text-white/80 hover:text-white text-lg">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs space-y-1">
                <p className="font-bold text-pupr-blue">Penandatangan Resmi:</p>
                <p className="text-slate-800">H. Budi Mulyana, ST., M.Si (NIP 197502122001121002)</p>
                <p className="text-slate-500 text-[11px]">Sertifikat: Hardware Security Module (HSM) Dinas PUPR Garut</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Masukkan Passphrase BSrE</label>
                <Input 
                  type="password" 
                  placeholder="• • • • • • • •" 
                  value={passphraseInput}
                  onChange={e => setPassphraseInput(e.target.value)}
                  className="h-10 text-sm font-mono"
                />
                {passphraseError && <p className="text-xs text-red-600 font-semibold">{passphraseError}</p>}
              </div>

              {isSigning && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Proses Verifikasi Kunci BSrE...</span>
                    <span>{signingProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${signingProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsTteModalOpen(false)} disabled={isSigning}>
                  Batal
                </Button>
                <Button variant="pupr" size="sm" onClick={handleStartTteProcess} disabled={isSigning}>
                  {isSigning ? 'Memproses...' : 'Proses & Terbitkan TTE'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DISTRIBUSI LAPORAN VIA EMAIL / WHATSAPP */}
      {isDistributeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Send size={18} className="text-pupr-blue" />
                <h3 className="font-bold text-base">Distribusi Laporan Resmi</h3>
              </div>
              <button onClick={() => setIsDistributeModalOpen(false)} className="text-white/80 hover:text-white text-lg">✕</button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-700">Kirim Notifikasi via WhatsApp</label>
                <div className="flex gap-2">
                  <Input 
                    value={phoneInput} 
                    onChange={e => setPhoneInput(e.target.value)} 
                    placeholder="628123456789" 
                    className="h-9 font-mono"
                  />
                  <Button className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" onClick={handleSendWhatsApp}>
                    Kirim WA
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700">Kirim Dokumen via Email Official</label>
                <div className="flex gap-2">
                  <Input 
                    value={emailInput} 
                    onChange={e => setEmailInput(e.target.value)} 
                    placeholder="disdik@garutkab.go.id" 
                    className="h-9 font-sans"
                  />
                  <Button 
                    variant="pupr" 
                    size="sm" 
                    onClick={() => {
                      if (!emailInput) {
                        alert('Masukkan email penerima.');
                        return;
                      }
                      showToast(`Email terkirim ke ${emailInput}`);
                      setEmailInput('');
                    }} 
                    className="shrink-0"
                  >
                    Kirim Email
                  </Button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="font-bold text-slate-700">Daftar Penerima Otomatis (SIMBG & OPD)</label>
                <div className="space-y-1.5">
                  {[
                    { name: 'Dinas Pendidikan Kab. Garut', role: 'Pemilik Aset Sekolah' },
                    { name: 'BAPPEDA Kab. Garut', role: 'Perencana Anggaran APBD' },
                    { name: 'Kementerian PUPR Pusat', role: 'Integrasi SIMBG' }
                  ].map((rec, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{rec.name}</p>
                        <p className="text-[10px] text-slate-500">{rec.role}</p>
                      </div>
                      <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px]">Terhubung</Badge>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: VERIFIKASI QR & SERTIFIKAT BSRE */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="p-5 bg-gradient-to-r from-slate-900 to-pupr-blue text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <QrCode size={20} className="text-emerald-400" />
                <h3 className="font-bold text-base">Inspector Keaslian Dokumen & BSrE</h3>
              </div>
              <button onClick={() => setIsVerifyModalOpen(false)} className="text-white/80 hover:text-white text-lg">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex gap-2">
                <Input 
                  placeholder="Cari ID Assessment atau No. Sertifikat (e.g. ASM-2026-002)..." 
                  value={verifySearchInput}
                  onChange={e => setVerifySearchInput(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
                <Button variant="pupr" size="sm" onClick={() => handleVerifyCertificate(verifySearchInput)}>
                  <Search size={14} className="mr-1" /> Periksa
                </Button>
              </div>

              {verifyResult && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <ShieldCheck size={28} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-900 text-sm">DOKUMEN VALID & TERAUTHENTIKASI</p>
                      <p className="text-[11px] text-emerald-700">Tanda Tangan Elektronik terdaftar di CA BSrE BSSN. Segel digital utuh tanpa modifikasi.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Bangunan:</span>
                      <span className="font-bold text-slate-900">{verifyResult.buildingName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">No. Sertifikat BSrE:</span>
                      <span className="font-bold text-pupr-blue">{verifyResult.certNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Penandatangan:</span>
                      <span className="text-slate-800">{verifyResult.signedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">NIP Pengesah:</span>
                      <span className="text-slate-800">{verifyResult.signerNip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timestamp Resmi:</span>
                      <span className="text-slate-800">{verifyResult.timestamp}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex flex-col gap-0.5">
                      <span className="text-slate-500 text-[10px]">SHA-256 Checksum Hash:</span>
                      <span className="text-[9px] text-slate-600 break-all bg-white p-1 rounded border border-slate-200">{verifyResult.sha256Hash}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsVerifyModalOpen(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SINKRONISASI SIMBANGDA & SIMBG */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Database size={20} className="text-emerald-400" />
                <h3 className="font-bold text-base">Sinkronisasi SIMBANGDA & SIMBG PUPR</h3>
              </div>
              <button onClick={() => setIsSyncModalOpen(false)} className="text-white/80 hover:text-white text-lg">✕</button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                <p className="font-bold text-pupr-blue">Target Server SIMBANGDA Kab. Garut:</p>
                <p className="text-slate-700 font-mono text-[11px]">https://simbangda.garutkab.go.id/api/v2/bap-sync</p>
                <p className="text-slate-500 text-[10px]">Token Bearer OAuth2: ACTIVE (Expiry: 2026-12-31)</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Status Tahapan Sinkronisasi API</h4>
                
                <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">1. Otentikasi Handshake API</span>
                    {syncStep >= 1 ? <CheckCircle2 size={16} className="text-emerald-600" /> : <span className="text-slate-400 text-[10px]">Menunggu</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">2. Validasi Skema JSON BAP Permen 22/2018</span>
                    {syncStep >= 2 ? <CheckCircle2 size={16} className="text-emerald-600" /> : <span className="text-slate-400 text-[10px]">Menunggu</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">3. Transmisi Payload & Dokumen TTE</span>
                    {syncStep >= 3 ? <CheckCircle2 size={16} className="text-emerald-600" /> : <span className="text-slate-400 text-[10px]">Menunggu</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">4. Commit Database SIMBANGDA (Aset BMD)</span>
                    {syncStep >= 4 ? <CheckCircle2 size={16} className="text-emerald-600" /> : <span className="text-slate-400 text-[10px]">Menunggu</span>}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] text-slate-500">
                  Status Terakhir: <strong className="text-slate-800">{lastSyncTime}</strong>
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsSyncModalOpen(false)}>
                    Tutup
                  </Button>
                  <Button variant="pupr" size="sm" onClick={handleSyncSimbangda} disabled={isSyncing}>
                    <RefreshCw size={14} className={`mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Proses Sync...' : 'Jalankan Sync API'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
