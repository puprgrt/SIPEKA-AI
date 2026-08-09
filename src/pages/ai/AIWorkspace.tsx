import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BrainCircuit, 
  MessageSquareWarning, ArrowLeft, Clock, History, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  FileText, 
  Activity, 
  Scale, 
  UserCheck, 
  LineChart,
  Sparkles,
  Send,
  Download,
  Check,
  X,
  RefreshCw,
  Sliders,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  UploadCloud,
  ChevronRight,
  FileSpreadsheet,
  Zap
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import jsPDF from 'jspdf';
import { addFooterWithQRCode } from '../../lib/pdf-utils';
import autoTable from 'jspdf-autotable';

type ReviewItem = {
  id: string;
  surveyId: string;
  buildingName: string;
  category: string;
  instansi: string;
  kecamatan: string;
  surveyor: string;
  reviewer: string;
  dateSubmitted: string;
  damagePercentage: number;
  riskLevel: string;
  status: string;
  structuralScore: number;
  architecturalScore: number;
  utilityScore: number;
  aiRecommendation: string;
  reviewerNotes: string;
  reviewHistory?: Array<{ date: string; user: string; action: string; note: string }>;
};

export function AIWorkspace() {
  const { activeRole } = useRole();
  const [activeTab, setActiveTab] = useState('decision-support');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Assessment Item for AI Decision Support
  const [selectedReviewId, setSelectedReviewId] = useState<string>('ASM-2026-001');
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);

  // Decision Form State
  const [decisionAction, setDecisionAction] = useState<'accept' | 'adjust' | 'reject'>('accept');
  const [adjustedRating, setAdjustedRating] = useState<number>(42.5);
  const [reviewerJustification, setReviewerJustification] = useState<string>(
    'Pemeriksaan verifikasi AI mengonfirmasi adanya retak geser pada kolom K-01 dan defleksi balok B-02. Rekomendasi AI diterima untuk merevisi kategori kerusakan dari 38.5% menjadi 42.5% (Rusak Sedang Kritis).'
  );
  const [isDecisionSubmitted, setIsDecisionSubmitted] = useState<boolean>(false);

  // Vision Inspector State
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isScanningVision, setIsScanningVision] = useState<boolean>(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [uploadedVisionImg, setUploadedVisionImg] = useState<string | null>(null);

  // Retrofitting Simulator State
  const [fRPCount, setFRPCount] = useState<number>(4);
  const [epoxyVolume, setEpoxyVolume] = useState<number>(12);
  const [steelPlateThick, setSteelPlateThick] = useState<number>(6);

  // RAG Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; citation?: string; time: string }>>([
    {
      sender: 'user',
      text: 'Apakah retak diagonal selebar 3mm pada kolom lantai dasar termasuk rusak sedang atau berat menurut Permen PUPR?',
      time: '10:14'
    },
    {
      sender: 'ai',
      text: 'Berdasarkan Permen PUPR No. 22/PRT/M/2018 (Lampiran II - Pedoman Penilaian Kerusakan Komponen Struktur):\n\n1. Retak geser (diagonal) pada kolom beton bertulang dengan lebar > 2 mm diklasifikasikan sebagai RUSAK BERAT.\n2. Nilai koefisien kerusakan komponen individual berada di rentang 0.70 s.d 1.00.\n3. Kegagalan geser mengindikasikan kerapuhan mekanis yang membutuhkan tindakan perkuatan darurat (retrofitting / jacketing) sebelum gedung diizinkan beroperasi kembali.',
      citation: 'Permen PUPR No. 22/PRT/M/2018 Hal 45 & SNI 2847:2019 Pasal 18.4',
      time: '10:14'
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isGeneratingRAG, setIsGeneratingRAG] = useState<boolean>(false);

  // AI Technical Report State
  const [reportTone, setReportTone] = useState<'formal' | 'executive' | 'technical'>('formal');
  const [customReportPrompt, setCustomReportPrompt] = useState<string>('Tambahkan penekanan pada kerentanan struktur terhadap beban gempa Garut dan rekomendasi instalasi FRP layer.');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  const handleGenerateReportWithAI = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      showToast('Naskah BAP & Rekomendasi Teknis AI berhasil diperbarui sesuai petunjuk!');
    }, 1200);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load reviews from localStorage or default
  useEffect(() => {
    const saved = localStorage.getItem('sipeka_assessment_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviewsList(parsed);
          setSelectedReviewId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const defaultData: ReviewItem[] = [
      {
        id: 'ASM-2026-001',
        surveyId: 'SRV-002',
        buildingName: 'Puskesmas Cikajang (Bangunan Utama)',
        category: 'Fasilitas Kesehatan',
        instansi: 'Dinas Kesehatan Kabupaten Garut',
        kecamatan: 'Cikajang',
        surveyor: 'Ahmad Ridwan, S.T.',
        reviewer: 'Siti Aminah, S.T.',
        dateSubmitted: '2026-08-01',
        damagePercentage: 38.5,
        riskLevel: 'Sedang',
        status: 'Menunggu Review',
        structuralScore: 18.2,
        architecturalScore: 14.3,
        utilityScore: 6.0,
        aiRecommendation: 'SIPEKA AI merekomendasikan kenaikan skor kerusakan menjadi 42.5% karena retak geser pada kolom K-01 berpotensi merambat under seismic loading.',
        reviewerNotes: ''
      },
      {
        id: 'ASM-2026-002',
        surveyId: 'SRV-001',
        buildingName: 'SDN 1 Tarogong Kidul',
        category: 'Fasilitas Pendidikan',
        instansi: 'Dinas Pendidikan Kabupaten Garut',
        kecamatan: 'Tarogong Kidul',
        surveyor: 'Budi Santoso, S.T.',
        reviewer: 'Siti Aminah, S.T.',
        dateSubmitted: '2026-07-28',
        damagePercentage: 68.4,
        riskLevel: 'Sangat Tinggi',
        status: 'Disetujui',
        structuralScore: 36.5,
        architecturalScore: 22.1,
        utilityScore: 9.8,
        aiRecommendation: 'Konfirmasi kriteria Rusak Berat (68.4%). Atap trusses kayu mengalami pergeseran nodal utama.',
        reviewerNotes: 'BAP Disetujui. Direkomendasikan rekonstruksi atap total.'
      }
    ];
    setReviewsList(defaultData);
    localStorage.setItem('sipeka_assessment_reviews', JSON.stringify(defaultData));
  }, []);

  const activeReview = reviewsList.find(r => r.id === selectedReviewId) || reviewsList[0];

  // Calculated retrofitting values
  const estimatedCapacityIncrease = Math.min(85, Math.round(fRPCount * 12 + epoxyVolume * 1.5 + steelPlateThick * 3));
  const estimatedRetrofitCost = (fRPCount * 12500000) + (epoxyVolume * 850000) + (steelPlateThick * 4500000);

  // Vision sample photos
  const visionPhotos = [
    {
      title: 'Retak Geser Kolom K-01',
      location: 'Teras Utama Lantai 1',
      url: 'https://images.unsplash.com/photo-1518557984649-7b161c230cfa?q=80&w=800&auto=format&fit=crop',
      crackWidth: '2.8 mm',
      confidence: 96.4,
      category: 'Retak Struktur (Structural Defect)',
      severity: 'Rusak Berat (Permen PUPR 22/2018)'
    },
    {
      title: 'Spalling Balok Cantilever B-02',
      location: 'Selasar Depan',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=800&auto=format&fit=crop',
      crackWidth: 'Area 0.18 m²',
      confidence: 91.2,
      category: 'Beton Mengelupas & Korosi Rebar',
      severity: 'Rusak Sedang'
    },
    {
      title: 'Kebocoran & Lapuk Plafon Kalsiboard',
      location: 'Ruang Tunggu Pasien',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
      crackWidth: 'Luas 12.5 m²',
      confidence: 94.8,
      category: 'Defek Arsitektural (Plenum Water Damage)',
      severity: 'Rusak Ringan - Sedang'
    }
  ];

  const currentVision = visionPhotos[selectedImageIndex];

  // Submit Human Decision & Sync to System Datasets
  const handleSaveDecision = () => {
    if (!activeReview) return;
    const finalRating = decisionAction === 'accept' ? 42.5 : decisionAction === 'adjust' ? adjustedRating : activeReview.damagePercentage;
    const finalRisk = finalRating > 65 ? 'Sangat Tinggi' : finalRating > 45 ? 'Tinggi' : finalRating > 30 ? 'Sedang' : 'Ringan';
    const newStatus = 'Disetujui AI & Verifikator';

    const updated = reviewsList.map(item => {
      if (item.id === activeReview.id) {
        return {
          ...item,
          damagePercentage: finalRating,
          riskLevel: finalRisk,
          status: newStatus,
          reviewerNotes: reviewerJustification,
          reviewHistory: [
            ...(item.reviewHistory || []),
            {
              date: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString()}`,
              user: activeRole || 'Reviewer Teknis PUPR',
              action: `Keputusan AI Decision Engine (${decisionAction.toUpperCase()})`,
              note: reviewerJustification
            }
          ]
        };
      }
      return item;
    });

    setReviewsList(updated);
    localStorage.setItem('sipeka_assessment_reviews', JSON.stringify(updated));

    // Also sync to sipeka_assessments & sipeka_buildings
    try {
      const savedAssessments = localStorage.getItem('sipeka_assessments');
      if (savedAssessments) {
        const parsed = JSON.parse(savedAssessments);
        const updatedAss = parsed.map((a: any) => {
          if (a.id === activeReview.id || a.buildingName === activeReview.buildingName) {
            return {
              ...a,
              damagePercentage: finalRating,
              riskLevel: finalRisk,
              status: 'Disetujui',
              reviewerNotes: reviewerJustification
            };
          }
          return a;
        });
        localStorage.setItem('sipeka_assessments', JSON.stringify(updatedAss));
      }
    } catch (e) {
      console.error(e);
    }

    setIsDecisionSubmitted(true);
    showToast(`Keputusan Verifikator untuk ${activeReview.id} disetujui (${finalRating}%) & disinkronkan ke seluruh sistem!`);
  };

  // Handle RAG Ask
  const handleSendQuery = (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim()) return;

    const newMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setInputQuery('');
    setIsGeneratingRAG(true);

    setTimeout(() => {
      let aiResponseText = '';
      let citationText = '';

      const lower = textToSend.toLowerCase();
      if (lower.includes('ambang') || lower.includes('retak')) {
        aiResponseText = 'Sesuai SNI 2847:2019 dan Permen PUPR No. 22/2018, ambang batas toleransi lebar retak lentur pada struktur beton terlindung adalah 0.4 mm, sedangkan pada area terekspos cuaca adalah 0.3 mm. Retak geser > 2.0 mm pada kolom struktur dikategorikan sebagai kegagalan batas servis yang memerlukan perkuatan struktural segera.';
        citationText = 'SNI 2847:2019 Pasal 24.3.2 & Permen PUPR 22/2018 Lampiran II';
      } else if (lower.includes('rusak berat') || lower.includes('kriteria')) {
        aiResponseText = 'Kriteria Rusak Berat ditetapkan apabila persentase kerusakan total bangunan > 45.0% atau terjadi kerusakan fatal pada > 30% komponen struktur utama (Kolom/Balok/Pondasi). Gedung berstatus Rusak Berat tidak boleh dioperasikan tanpa perkuatan menyeluruh atau rekonstruksi.';
        citationText = 'Permen PUPR No. 22/PRT/M/2018 Bab IV Pasal 12';
      } else if (lower.includes('2 lantai') || lower.includes('bobot')) {
        aiResponseText = 'Untuk bangunan gedung 2 lantai, tabel standar bobot komponen PUPR membagi alokasi: Struktur Total = 45% (Kolom 15%, Balok 12%, Pelat 10%, Pondasi 8%), Arsitektur = 40% (Dinding 15%, Atap 12%, Plafon 8%, Lantai 5%), dan Utilitas = 15%.';
        citationText = 'Permen PUPR No. 22/PRT/M/2018 Lampiran I.B';
      } else {
        aiResponseText = `SIPEKA AI RAG Engine menganalisis basis regulasi teknis PUPR untuk query: "${textToSend}". Berdasarkan Peraturan Menteri PUPR No. 22/PRT/M/2018 dan SNI Gempa 1726:2019, setiap penanganan kerusakan fisik gedung negara harus didukung oleh Berita Acara Pemeriksaan (BAP) dan analisis rasio biaya perbaikan terhadap nilai wajar bangunan baru.`;
        citationText = 'Kompilasi Regulasi Bangunan Gedung Negara PUPR 2026';
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiResponseText,
          citation: citationText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsGeneratingRAG(false);
    }, 1000);
  };

  // Export AI Decision Summary PDF
  const exportAIDecisionPDF = async () => {
    if (!activeReview) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Kop Surat
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DINAS PEKERJAAN UMUM DAN PENATAAN RUANG", pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text("KABUPATEN GARUT - SISTEM SIPEKA AI DECISION ENGINE", pageWidth / 2, 21, { align: 'center' });
    doc.line(20, 25, pageWidth - 20, 25);

    // Title
    doc.setFontSize(13);
    doc.text("REKOMENDASI TEKNIS AI & HUMAN DECISION SIGN-OFF", pageWidth / 2, 34, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Nomor Dokumen: BAP-AI/${activeReview.id}/2026 | Tanggal: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, 40, { align: 'center' });

    // Table Data
    autoTable(doc, {
      startY: 48,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      head: [['Parameter Assessment', 'Nilai Input Surveyor', 'Rekomendasi AI Engine', 'Keputusan Final Verifikator']],
      body: [
        ['Nama Bangunan', activeReview.buildingName, activeReview.buildingName, activeReview.buildingName],
        ['Persentase Kerusakan', `${activeReview.damagePercentage.toFixed(1)}%`, '42.5% (Rusak Sedang Kritis)', `${decisionAction === 'accept' ? '42.5%' : decisionAction === 'adjust' ? `${adjustedRating}%` : `${activeReview.damagePercentage}%`}`],
        ['Tingkat Risiko Structural', activeReview.riskLevel, 'Tinggi (Seismic Shear Concern)', `${decisionAction === 'accept' ? 'Tinggi' : activeReview.riskLevel}`],
        ['Status Verifikasi', activeReview.status, 'Disetujui AI Multi-Agent', 'Disetujui & Tanda Tangan Digital'],
        ['Catatan Justifikasi Teknis', '-', '-', reviewerJustification]
      ]
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Rencana Tindak Lanjut Perkuatan (Retrofitting):", 20, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(`- Pemasangan Carbon FRP Jacketing pada Kolom K-01 (${fRPCount} Layer)`, 20, finalY + 6);
    doc.text(`- Injeksi Epoxy Resin Rendah Tekanan pada Retak Geser (${epoxyVolume} Liter)`, 20, finalY + 12);
    doc.text(`- Estimasi Peningkatan Kapasitas Sisa: +${estimatedCapacityIncrease}% | Biaya Alokasi: Rp ${estimatedRetrofitCost.toLocaleString('id-ID')}`, 20, finalY + 18);

    doc.setFont("helvetica", "bold");
    doc.text("SIPEKA AI Multi-Agent System,", 25, finalY + 35);
    doc.text("Verifikator Teknis PUPR,", pageWidth - 80, finalY + 35);

    doc.setFont("helvetica", "normal");
    doc.text("AI Engine v2.0 (Confidence: 96.4%)", 25, finalY + 55);
    doc.text(activeReview.reviewer || 'Siti Aminah, S.T.', pageWidth - 80, finalY + 55);

    const pageHeight = doc.internal.pageSize.getHeight();
    await addFooterWithQRCode(doc, activeReview.id, "PENDING", pageHeight, pageWidth);
    doc.save(`BAP_AI_Decision_${activeReview.id}.pdf`);
    showToast('Dokumen Rekomendasi AI & Decision Sign-Off berhasil diunduh sebagai PDF!');
  };


  const exportDraftReportPDF = async () => {
    if (!activeReview) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Kop Surat
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DINAS PEKERJAAN UMUM DAN PENATAAN RUANG", pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.text("KABUPATEN GARUT", pageWidth / 2, 26, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(20, 32, pageWidth - 20, 32);
    
    // Judul
    doc.setFontSize(12);
    doc.text("BERITA ACARA EXAMINATION & REKOMENDASI TEKNIS", pageWidth / 2, 45, { align: 'center' });
    doc.text("KERUSAKAN BANGUNAN GEDUNG", pageWidth / 2, 52, { align: 'center' });

    // Body text
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("I. DATA UMUM PENGUJIAN:", 20, 70);
    
    doc.setFont("helvetica", "normal");
    const p1 = "Berdasarkan hasil inspeksi lapangan tanggal " + activeReview.dateSubmitted + " pada sampel bangunan gedung " + activeReview.buildingName + " (" + activeReview.instansi + "), tim penilai menyatakan bahwa tingkat kerusakan total terhitung sebesar " + activeReview.damagePercentage.toFixed(1) + "%.";
    const splitP1 = doc.splitTextToSize(p1, pageWidth - 40);
    doc.text(splitP1, 20, 78);

    const yAfterP1 = 78 + (splitP1.length * 6) + 5;

    doc.setFont("helvetica", "bold");
    doc.text("II. DIAGNOSIS KERUSAKAN ELEMEN KRITIS (SIPEKA AI):", 20, yAfterP1);
    
    doc.setFont("helvetica", "normal");
    const p2 = "1. Struktur Utama: Teridentifikasi retak geser diagonal (lebar ~2.8 mm) pada sendi plastis Kolom K-01 teras depan.\n2. Kapasitas Sisa: FEA Kapasitas Seismik memperkirakan reduksi daya dukung lateral sebesar 42%.\n3. Kepatuhan Regulasi: Sesuai Permen PUPR No. 22/PRT/M/2018, kondisi ini diklasifikasikan sebagai Rusak Sedang Kritis.";
    const splitP2 = doc.splitTextToSize(p2, pageWidth - 40);
    doc.text(splitP2, 20, yAfterP1 + 8);

    const yAfterP2 = yAfterP1 + 8 + (splitP2.length * 6) + 5;

    doc.setFont("helvetica", "bold");
    doc.text("III. REKOMENDASI PENANGANAN (RETROFITTING):", 20, yAfterP2);

    doc.setFont("helvetica", "normal");
    const p3 = "Direkomendasikan pelaksanaan pekerjaan perkuatan struktur berupa: Carbon FRP Jacketing (" + fRPCount + " Layer), Injeksi Epoxy Resin (" + epoxyVolume + " L), dan penggantian penutup atap menjadi baja ringan dengan estimasi biaya alokasi sebesar Rp " + estimatedRetrofitCost.toLocaleString('id-ID') + ".";
    const splitP3 = doc.splitTextToSize(p3, pageWidth - 40);
    doc.text(splitP3, 20, yAfterP2 + 8);

    // Signatures
    const ySignatures = yAfterP2 + 8 + (splitP3.length * 6) + 30;
    doc.setFont("helvetica", "normal");
    doc.text("Garut, " + new Date().toLocaleDateString('id-ID'), pageWidth - 80, ySignatures);
    doc.setFont("helvetica", "bold");
    doc.text("Tim Pemeriksa / Verifikator", pageWidth - 80, ySignatures + 10);
    doc.setFont("helvetica", "normal");
    doc.text(activeReview.reviewer || 'Siti Aminah, S.T.', pageWidth - 80, ySignatures + 35);
    doc.text("Sistem SIPEKA AI", 25, ySignatures + 35);

    const pageHeight = doc.internal.pageSize.getHeight();
    await addFooterWithQRCode(doc, activeReview.id, "PENDING", pageHeight, pageWidth);
    doc.save("Draft_Laporan_Kajian_" + activeReview.id + ".pdf");
    showToast('Draft Laporan Kajian BAP PDF berhasil diunduh!');
  };


  const tabs = [
    { id: 'decision-support', label: 'AI Decision Support', icon: BrainCircuit },
    { id: 'version-history', label: 'Historical Comparison', icon: History },
    { id: 'vision', label: 'AI Vision Inspector', icon: Eye },
    { id: 'structural', label: 'AI Structural Engineer', icon: Activity },
    { id: 'regulation', label: 'AI Regulation Expert (RAG)', icon: Scale },
    { id: 'report', label: 'AI Technical Report Writer', icon: FileText },
    { id: 'human-review', label: 'Human Audit & Log', icon: UserCheck },
    { id: 'analytics', label: 'AI Model Analytics', icon: LineChart },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Engine & Decision Support</h1>
            <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/5 font-semibold">Tahap 5</Badge>
            <Badge variant="outline" className="border-indigo-500 text-indigo-500 bg-indigo-500/5 font-semibold">Explainable AI & RAG</Badge>
          </div>
          <p className="text-slate-500 mt-1">Platform pendukung keputusan rekomendasi teknis dengan Explainable AI, Computer Vision, dan Human-in-the-Loop PUPR.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportAIDecisionPDF} className="bg-white">
            <Download size={15} className="mr-1.5 text-pupr-blue" />
            Export Decision BAP (PDF)
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-slate-900 to-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {React.createElement(tab.icon as React.ElementType, { size: 16 })}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto min-h-0">
        
        {/* TAB 1: AI DECISION SUPPORT */}
        {activeTab === 'decision-support' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-6">
            
            {/* Panel 1: Selected Assessment Context */}
            <Card className="lg:col-span-3 border-0 shadow-sm bg-white border-slate-200 flex flex-col h-[650px]">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Konteks Bangunan Terpilih</span>
                  <select 
                    value={selectedReviewId}
                    onChange={(e) => setSelectedReviewId(e.target.value)}
                    className="w-full h-9 px-2 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-pupr-blue"
                  >
                    {reviewsList.map(r => (
                      <option key={r.id} value={r.id}>{r.id} - {r.buildingName}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Survey ID:</span>
                    <span className="font-mono font-bold text-slate-900">{activeReview?.surveyId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Instansi:</span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[140px]">{activeReview?.instansi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Surveyor:</span>
                    <span className="font-semibold text-slate-800">{activeReview?.surveyor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tanggal Survey:</span>
                    <span className="font-mono text-slate-700">{activeReview?.dateSubmitted}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hasil Input Surveyor (Tahap 3)</span>
                  <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-300">Kerusakan Total:</span>
                    <span className="text-2xl font-extrabold text-amber-400">{activeReview?.damagePercentage}%</span>
                  </div>
                  <div className="grid grid-cols-3 text-center text-[10px] pt-1 gap-1">
                    <div className="bg-slate-800 p-1.5 rounded">
                      <p className="text-slate-400">Struktur</p>
                      <p className="font-bold text-white">{activeReview?.structuralScore}%</p>
                    </div>
                    <div className="bg-slate-800 p-1.5 rounded">
                      <p className="text-slate-400">Arsitektur</p>
                      <p className="font-bold text-white">{activeReview?.architecturalScore}%</p>
                    </div>
                    <div className="bg-slate-800 p-1.5 rounded">
                      <p className="text-slate-400">Utilitas</p>
                      <p className="font-bold text-white">{activeReview?.utilityScore}%</p>
                    </div>
                  </div>
                </div>

                <div className="aspect-video w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1518557984649-7b161c230cfa?q=80&w=400&auto=format&fit=crop" className="object-cover w-full h-full" alt="Foto Defek" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-center justify-center text-white text-[10px] font-bold text-center">
                    Kolom Teras Utama (Defek Retak Geser)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Panel 2: Multi-Agent AI Analysis & Explainability */}
            <Card className="lg:col-span-5 border-0 shadow-sm bg-gradient-to-b from-slate-900 to-indigo-950 text-white flex flex-col h-[650px] overflow-hidden relative">
              <CardHeader className="pb-3 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400 animate-pulse" />
                    Explainable Multi-Agent AI Consensus
                  </CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px]">
                    Confidence: 96.4%
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
                {/* Agent 1: Vision Inspector */}
                <div className="bg-white/10 border border-white/10 rounded-xl p-3.5 space-y-2 backdrop-blur-sm">
                  <div className="flex justify-between items-center text-indigo-300 font-bold">
                    <span className="flex items-center gap-1.5"><Eye size={14} /> 1. Vision Inspector Agent</span>
                    <Badge variant="outline" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 text-[9px]">Computer Vision</Badge>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    Mendeteksi pola retak diagonal memanjang ~2.8 mm pada area sendi plastis Kolom K-01 serta spalling ringan selimut beton.
                  </p>
                </div>

                {/* Agent 2: Structural Engineer Agent */}
                <div className="bg-white/10 border border-white/10 rounded-xl p-3.5 space-y-2 backdrop-blur-sm">
                  <div className="flex justify-between items-center text-amber-300 font-bold">
                    <span className="flex items-center gap-1.5"><Activity size={14} /> 2. Structural Engineering Agent</span>
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-200 border-amber-400/30 text-[9px]">FEA Capacity Model</Badge>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    Retak geser (shear crack) menurunkan kapasitas dukung beban lateral hingga ~42%. Terdapat risiko perambatan retak signifikan saat terjadi guncangan gempa sedang.
                  </p>
                </div>

                {/* Agent 3: Regulation Expert Agent */}
                <div className="bg-white/10 border border-white/10 rounded-xl p-3.5 space-y-2 backdrop-blur-sm">
                  <div className="flex justify-between items-center text-emerald-300 font-bold">
                    <span className="flex items-center gap-1.5"><Scale size={14} /> 3. Regulation RAG Agent</span>
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-[9px]">Permen PUPR 22/2018</Badge>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    "Retak geser pada komponen struktur utama dengan lebar &gt; 2.0 mm direkomendasikan masuk klasifikasi Kritis (Nilai Koefisien: 0.70 - 1.00)."
                  </p>
                </div>

                {/* AI Consolidated Recommendation */}
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-pupr-blue rounded-xl space-y-2 text-white shadow-lg border border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">Rekomendasi Konsensus AI</span>
                    <Badge className="bg-amber-400 text-slate-900 font-bold text-[10px]">Rusak Sedang Kritis (42.5%)</Badge>
                  </div>
                  <p className="text-xs text-slate-100 font-medium">
                    AI merekomendasikan kenaikan estimasi kerusakan dari <strong className="text-amber-300">{activeReview?.damagePercentage}%</strong> menjadi <strong className="text-emerald-300">42.5%</strong> serta alokasi perkuatan Carbon FRP Jacketing.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Panel 3: Human-in-the-Loop Reviewer Sign-Off */}
            <Card className="lg:col-span-4 border-0 shadow-sm bg-white border-slate-200 flex flex-col h-[650px]">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <UserCheck size={16} className="text-emerald-600" />
                  Keputusan Verifikator Teknis PUPR
                </CardTitle>
                <CardDescription className="text-[11px]">Keputusan final tetap sepenuhnya di tangan pejabat/reviewer manusia.</CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
                {isDecisionSubmitted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 my-auto">
                    <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Keputusan Berhasil Disetujui!</h4>
                      <p className="text-slate-600 text-xs mt-1">Data BAP Tahap 4 ({activeReview?.id}) telah diperbarui dengan persentase kerusakan disetujui.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setIsDecisionSubmitted(false)} className="bg-white">
                      Ubah Keputusan Verifikasi
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="font-bold text-slate-700">Tindakan Terhadap Rekomendasi AI</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setDecisionAction('accept')}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            decisionAction === 'accept'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-1 ring-emerald-500'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <CheckCircle2 size={16} className="mx-auto mb-1 text-emerald-600" />
                          <span>Terima AI</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setDecisionAction('adjust')}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            decisionAction === 'adjust'
                              ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold ring-1 ring-amber-500'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Sliders size={16} className="mx-auto mb-1 text-amber-600" />
                          <span>Penyesuaian</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDecisionAction('reject')}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            decisionAction === 'reject'
                              ? 'bg-red-50 border-red-500 text-red-800 font-bold ring-1 ring-red-500'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <X size={16} className="mx-auto mb-1 text-red-600" />
                          <span>Tolak AI</span>
                        </button>
                      </div>
                    </div>

                    {decisionAction === 'adjust' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in">
                        <label className="font-bold text-amber-900">Nilai Persentase Kerusakan Penyesuaian (%)</label>
                        <Input 
                          type="number" 
                          step="0.1" 
                          value={adjustedRating} 
                          onChange={(e) => setAdjustedRating(Number(e.target.value))}
                          className="bg-white font-mono font-bold h-9 border-amber-300"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Justifikasi & Catatan Teknis Verifikator</label>
                      <textarea 
                        value={reviewerJustification}
                        onChange={(e) => setReviewerJustification(e.target.value)}
                        className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-pupr-blue focus:outline-none"
                        placeholder="Tuliskan alasan teknis verifikator PUPR..."
                      ></textarea>
                    </div>

                    <div className="pt-2">
                      <Button variant="pupr" className="w-full" onClick={handleSaveDecision}>
                        <ShieldCheck size={16} className="mr-1.5" /> Simpan & Otorisasi Keputusan BAP
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

          </div>
        )}

        {/* TAB 2: AI VISION INSPECTOR */}
        {activeTab === 'vision' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-6">
            
            {/* Left Column: Image Canvas & Controls */}
            <Card className="lg:col-span-7 border-0 shadow-sm bg-slate-950 text-white flex flex-col h-[650px] overflow-hidden relative">
              <CardHeader className="pb-3 border-b border-white/10 bg-black/40 backdrop-blur-md flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye size={18} className="text-pupr-blue" />
                    Computer Vision Defect Scanning Canvas
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Pemeriksaan visual otomatis berbasis model YOLOv8 Structural Defect</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={showBoundingBoxes ? 'pupr' : 'outline'} 
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className="text-xs h-8 bg-slate-800 border-slate-700"
                  >
                    {showBoundingBoxes ? 'Sembunyikan Bounding Box' : 'Tampilkan Bounding Box'}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 flex-1 flex flex-col items-center justify-center relative">
                {isScanningVision ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <RefreshCw size={36} className="text-pupr-blue animate-spin" />
                    <p className="text-xs font-mono text-cyan-400">Memindai citra dengan model AI Vision...</p>
                  </div>
                ) : (
                  <div className="relative w-full max-w-lg aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                    <img src={uploadedVisionImg || currentVision.url} className="w-full h-full object-cover" alt="Defek" />
                    
                    {/* Bounding Box Annotations */}
                    {showBoundingBoxes && (
                      <>
                        <div className="absolute top-1/4 left-1/3 w-1/3 h-1/2 border-2 border-red-500 bg-red-500/10 backdrop-blur-[1px] rounded animate-pulse">
                          <div className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-t font-mono">
                            {currentVision.title} ({currentVision.confidence}%)
                          </div>
                        </div>

                        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur border border-white/20 p-2.5 rounded-xl text-[10px] text-white font-mono space-y-1">
                          <p className="text-cyan-400 font-bold">Karakteristik Citra:</p>
                          <p>Lebar Retak: {currentVision.crackWidth}</p>
                          <p>Lokasi: {currentVision.location}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>

              {/* Bottom Image Thumbnail Selector */}
              <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  {visionPhotos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedImageIndex(i); setUploadedVisionImg(null); }}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === i && !uploadedVisionImg ? 'border-pupr-blue scale-105' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={photo.url} className="w-full h-full object-cover" alt={photo.title} />
                    </button>
                  ))}
                </div>

                <label className="cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setIsScanningVision(true);
                        setTimeout(() => {
                          setUploadedVisionImg(URL.createObjectURL(e.target.files![0]));
                          setIsScanningVision(false);
                          showToast('Foto baru berhasil dipindai oleh AI Vision Inspector!');
                        }, 1200);
                      }
                    }}
                  />
                  <Button size="sm" variant="pupr" className="h-9 text-xs">
                    <UploadCloud size={14} className="mr-1.5" /> Upload Foto Baru
                  </Button>
                </label>
              </div>
            </Card>

            {/* Right Column: Detection Analysis Details */}
            <Card className="lg:col-span-5 border-0 shadow-sm bg-white border-slate-200 flex flex-col h-[650px]">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-bold text-slate-800">Hasil Analisis Citra & Ekstraksi Metrik</CardTitle>
                <CardDescription className="text-xs">Detail klasifikasi defek fisik bangunan</CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identifikasi Defek Utama</span>
                  <h4 className="text-base font-bold text-slate-900">{currentVision.title}</h4>
                  <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">{currentVision.severity}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Dimensi / Ukuran</p>
                    <p className="font-bold text-slate-900 text-sm mt-1">{currentVision.crackWidth}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">AI Confidence Score</p>
                    <p className="font-bold text-emerald-600 text-sm mt-1">{currentVision.confidence}%</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <BrainCircuit size={14} className="text-pupr-blue" />
                    Rekomendasi Penanganan Teknis
                  </h5>
                  <p className="leading-relaxed text-[11px] text-slate-300">
                    Sistem menyarankan pengisian retak (epoxy injection) serta perkuatan sengkang/selimut beton untuk mengembalikan kekuatan geser nominal elemen.
                  </p>
                </div>

                <Button 
                  variant="pupr" 
                  className="w-full mt-4"
                  onClick={() => showToast('Hasil deteksi vision telah diterapkan ke engine kalkulasi!')}
                >
                  <Check size={16} className="mr-1.5" /> Terapkan Temuan Vision ke Assessment
                </Button>
              </CardContent>
            </Card>

          </div>
        )}

        {/* TAB 3: AI STRUCTURAL ENGINEER */}
        {activeTab === 'structural' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-6">
            
            {/* Structural Capacity Simulation */}
            <Card className="lg:col-span-7 border-0 shadow-sm bg-white border-slate-200 flex flex-col h-[650px]">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Activity size={18} className="text-indigo-600" />
                  Simulasi Kapasitas Sisa & Modul Perkuatan (Retrofitting Builder)
                </CardTitle>
                <CardDescription className="text-xs">Estimasi kapasitas dukung beban sebelum & sesudah perkuatan</CardDescription>
              </CardHeader>

              <CardContent className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
                
                {/* Capacity Gauges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-red-600">Kapasitas Sisa Eksisting</span>
                    <h3 className="text-3xl font-extrabold text-red-700">58.0%</h3>
                    <p className="text-[10px] text-red-600 font-semibold">Berisiko Terhadap Beban Gempa</p>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Estimasi Pasca Retrofitting</span>
                    <h3 className="text-3xl font-extrabold text-emerald-700">
                      {Math.min(100, 58 + estimatedCapacityIncrease)}%
                    </h3>
                    <p className="text-[10px] text-emerald-600 font-semibold">Memenuhi SNI 2847:2019</p>
                  </div>
                </div>

                {/* Retrofitting Controls */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Konfigurasi Perkuatan Struktur</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Jumlah Layer Carbon FRP Jacketing:</span>
                        <span className="font-bold text-pupr-blue">{fRPCount} Layer</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="8" 
                        value={fRPCount}
                        onChange={(e) => setFRPCount(Number(e.target.value))}
                        className="w-full accent-pupr-blue cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Volume Injeksi Epoxy Resin (Liter):</span>
                        <span className="font-bold text-pupr-blue">{epoxyVolume} L</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="30" 
                        value={epoxyVolume}
                        onChange={(e) => setEpoxyVolume(Number(e.target.value))}
                        className="w-full accent-pupr-blue cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Ketebalan Steel Plate Bonding (mm):</span>
                        <span className="font-bold text-pupr-blue">{steelPlateThick} mm</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="16" 
                        value={steelPlateThick}
                        onChange={(e) => setSteelPlateThick(Number(e.target.value))}
                        className="w-full accent-pupr-blue cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Cost Estimation */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Estimasi Biaya Alokasi Perkuatan</span>
                    <h4 className="text-xl font-bold text-emerald-400">Rp {estimatedRetrofitCost.toLocaleString('id-ID')}</h4>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => showToast('Simulasi retrofitting disimpan ke RAB Laporan!')}>
                    Simpan ke RAB
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Finite Element Stress Visualization */}
            <Card className="lg:col-span-5 border-0 shadow-sm bg-slate-950 text-white flex flex-col h-[650px] overflow-hidden">
              <CardHeader className="pb-3 border-b border-white/10 bg-black/40">
                <CardTitle className="text-sm text-white font-bold">FEA Stress Concentration Map</CardTitle>
                <CardDescription className="text-xs text-slate-400">Distribusi tegangan geser pada joint kolom-balok</CardDescription>
              </CardHeader>

              <CardContent className="p-6 flex-1 flex flex-col items-center justify-center relative">
                <div className="w-64 h-64 border border-indigo-500/30 bg-indigo-950/20 rounded-2xl flex items-center justify-center relative shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-amber-500/20 to-red-600/50 mix-blend-screen"></div>
                  
                  {/* Column Beam Wireframe mockup */}
                  <div className="w-32 h-48 border-4 border-indigo-400/60 rounded-sm relative flex items-center justify-center">
                    <div className="w-full h-10 border-t-4 border-b-4 border-indigo-400/80 bg-indigo-900/40 absolute top-12"></div>
                    <div className="w-6 h-6 rounded-full bg-red-600 animate-ping absolute top-12 left-1/2 -translate-x-1/2"></div>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-black/80 p-2 rounded text-[10px] font-mono text-slate-300">
                    Max Stress: <span className="text-red-400 font-bold">18.4 MPa</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-xs text-slate-300 font-mono w-full">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span>Target Kuat Tekan Beton (fc'):</span>
                    <span className="font-bold text-white">20.7 MPa</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span>Faktor Keamanan Seismik:</span>
                    <span className="font-bold text-amber-400">1.12 (Batas Bawah 1.5)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* TAB 4: AI REGULATION EXPERT (RAG) */}
        {activeTab === 'regulation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-6">
            
            {/* Chatbot Interface */}
            <Card className="lg:col-span-8 border-0 shadow-sm bg-white border-slate-200 flex flex-col h-[650px]">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Scale size={18} className="text-emerald-600" />
                    SIPEKA AI Regulation Expert (RAG System)
                  </CardTitle>
                  <CardDescription className="text-xs">Tanya jawab regulasi teknis berbasis Permen PUPR No. 22/2018 & SNI Bangunan</CardDescription>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-none font-mono text-[10px]">Active Knowledge Base: 1,420 Articles</Badge>
              </CardHeader>

              <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 text-xs custom-scrollbar">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div 
                      className={`max-w-2xl p-4 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-pupr-blue text-white rounded-br-none' 
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                      }`}
                    >
                      {msg.text}

                      {msg.citation && (
                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[10px] text-emerald-700 font-semibold font-mono">
                          <FileText size={12} />
                          <span>Citasi Regulasi: {msg.citation}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono px-1">{msg.time}</span>
                  </div>
                ))}

                {isGeneratingRAG && (
                  <div className="flex items-center gap-2 text-slate-500 font-mono text-xs p-3 bg-slate-50 rounded-xl w-fit">
                    <RefreshCw size={14} className="animate-spin text-pupr-blue" />
                    <span>AI sedang mencari pasal regulasi PUPR terkait...</span>
                  </div>
                )}
              </CardContent>

              {/* Chat Input & Suggestions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {[
                    'Berapa ambang batas retak kolom?',
                    'Kriteria bangunan Rusak Berat',
                    'Aturan bobot komponen 2 lantai'
                  ].map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendQuery(chip)}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 transition-colors"
                    >
                      💡 {chip}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input 
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                    placeholder="Tanyakan regulasi Permen PUPR, SNI Gempa, atau standar BAP..."
                    className="bg-white text-xs h-10 border-slate-300"
                  />
                  <Button variant="pupr" onClick={() => handleSendQuery()} className="h-10 px-4">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Knowledge Base Reference Panel */}
            <Card className="lg:col-span-4 border-0 shadow-sm bg-white border-slate-200 flex flex-col h-[650px]">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">Basis Regulasi Terkoneksi</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
                {[
                  { name: 'Permen PUPR No. 22/PRT/M/2018', desc: 'Pedoman Teknis Pembangunan Bangunan Gedung Negara', status: 'Active Index' },
                  { name: 'SNI 2847:2019', desc: 'Persyaratan Beton Struktural untuk Bangunan Gedung', status: 'Active Index' },
                  { name: 'SNI 1726:2019', desc: 'Tata Cara Perencanaan Ketahanan Gempa', status: 'Active Index' },
                  { name: 'Permen PUPR No. 14/PRT/M/2017', desc: 'Persyaratan Kemudahan Bangunan Gedung', status: 'Active Index' },
                ].map((reg, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">{reg.name}</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-none text-[9px]">{reg.status}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600">{reg.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        )}

        {/* TAB 5: AI TECHNICAL REPORT WRITER */}
        {activeTab === 'report' && (
          <div className="space-y-6 pb-6">
            <Card className="border-0 shadow-sm bg-white border-slate-200">
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Otomatisasi Penyusunan Draft Laporan Kajian Teknis AI</CardTitle>
                  <CardDescription>Generasi naskah BAP & kajian teknis otomatis berdasarkan standar format PUPR</CardDescription>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportDraftReportPDF} className="bg-white">
                    <Download size={14} className="mr-1.5 text-pupr-blue" /> Unduh Draft PDF
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6 text-xs">
                {/* Tone Selector & Custom AI Prompt Input */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="font-bold text-slate-700">Gaya Bahasa Naskah:</span>
                    {[
                      { id: 'formal', label: 'Formal Permen PUPR BAP' },
                      { id: 'executive', label: 'Executive Summary Ringkas' },
                      { id: 'technical', label: 'Laporan Audit Inspeksi Teknis' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setReportTone(t.id as any)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                          reportTone === t.id ? 'bg-pupr-blue text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <Input 
                      value={customReportPrompt}
                      onChange={(e) => setCustomReportPrompt(e.target.value)}
                      placeholder="Petunjuk khusus AI (misal: Tambahkan rekomendasi biaya perbaikan dan mitigasi gempa)..."
                      className="bg-white text-xs h-9 border-slate-300"
                    />
                    <Button 
                      variant="pupr" 
                      size="sm" 
                      onClick={handleGenerateReportWithAI}
                      disabled={isGeneratingReport}
                      className="h-9 px-4 shrink-0"
                    >
                      {isGeneratingReport ? (
                        <>
                          <RefreshCw size={14} className="animate-spin mr-1.5" />
                          Menyusun...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="mr-1.5" />
                          Generasi Ulang Naskah AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Draft Preview Box */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl font-serif text-slate-800 leading-relaxed space-y-4 shadow-inner max-w-4xl mx-auto">
                  <h3 className="text-center text-sm font-bold tracking-wider uppercase font-sans border-b border-slate-300 pb-3 text-slate-900">
                    BERITA ACARA EXAMINATION & REKOMENDASI TEKNIS KERUSAKAN BANGUNAN GEDUNG
                  </h3>

                  <p>
                    <strong>I. DATA UMUM PENGUJIAN:</strong><br />
                    Berdasarkan hasil inspeksi lapangan tanggal {activeReview?.dateSubmitted} pada sampel bangunan gedung <strong>{activeReview?.buildingName}</strong> ({activeReview?.instansi}), tim penilai menyatakan bahwa tingkat kerusakan total terhitung sebesar <strong>{activeReview?.damagePercentage}%</strong>.
                  </p>

                  <p>
                    <strong>II. DIAGNOSIS KERUSAKAN ELEMEN KRITIS (SIPEKA AI):</strong><br />
                    1. <em>Struktur Utama:</em> Teridentifikasi retak geser diagonal (lebar ~2.8 mm) pada sendi plastis Kolom K-01 teras depan.<br />
                    2. <em>Kapasitas Sisa:</em> FEA Kapasitas Seismik memperkirakan reduksi daya dukung lateral sebesar 42%.<br />
                    3. <em>Kepatuhan Regulasi:</em> Sesuai Permen PUPR No. 22/PRT/M/2018, kondisi ini diklasifikasikan sebagai Rusak Sedang Kritis.
                  </p>

                  <p>
                    <strong>III. REKOMENDASI PENANGANAN (RETROFITTING):</strong><br />
                    Direkomendasikan pelaksanaan pekerjaan perkuatan struktur berupa: Carbon FRP Jacketing ({fRPCount} Layer), Injeksi Epoxy Resin ({epoxyVolume} L), dan penggantian penutup atap menjadi baja ringan dengan estimasi biaya alokasi sebesar <strong>Rp {estimatedRetrofitCost.toLocaleString('id-ID')}</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 6: HUMAN AUDIT & LOG */}
        {activeTab === 'human-review' && (
          <div className="space-y-6 pb-6">
            <Card className="border-0 shadow-sm bg-white border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-base font-bold">Audit Log Interaksi AI & Verifikator Manusia</CardTitle>
                <CardDescription>Jejak rekam keputusan override & penerimaan rekomendasi AI oleh Pejabat Verifikator PUPR</CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                    <tr>
                      <th className="p-3">Waktu & Timestamp</th>
                      <th className="p-3">Gedung / Survey ID</th>
                      <th className="p-3">Verifikator PUPR</th>
                      <th className="p-3">Rekomendasi AI</th>
                      <th className="p-3">Keputusan Manusia</th>
                      <th className="p-3">Catatan Justifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      {
                        time: '2026-08-01 11:20',
                        building: 'Puskesmas Cikajang (SRV-002)',
                        user: 'Siti Aminah, S.T.',
                        ai: '42.5% (Naik dari 38.5%)',
                        decision: 'TERIMA REKOMENDASI',
                        note: 'Retak geser kolom teras terbukti berisiko. Nilai disesuaikan ke 42.5%.'
                      },
                      {
                        time: '2026-07-28 14:10',
                        building: 'SDN 1 Tarogong (SRV-001)',
                        user: 'Siti Aminah, S.T.',
                        ai: '68.4% (Rusak Berat)',
                        decision: 'DISERTIFIKASI',
                        note: 'Konfirmasi kerusakan atap truss kayu. Pengajuan alokasi rehabilitasi total.'
                      }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-500">{row.time}</td>
                        <td className="p-3 font-semibold text-slate-800">{row.building}</td>
                        <td className="p-3 text-slate-700">{row.user}</td>
                        <td className="p-3 font-bold text-indigo-600">{row.ai}</td>
                        <td className="p-3">
                          <Badge className="bg-emerald-100 text-emerald-800 border-none">{row.decision}</Badge>
                        </td>
                        <td className="p-3 text-slate-600 italic">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        
        {/* TAB 8: VERSION HISTORY */}
        {activeTab === 'version-history' && (
          <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-sm bg-white border-slate-200">
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <History size={18} className="text-pupr-blue" />
                    Komparasi Historis Penilaian Gedung (YoY)
                  </CardTitle>
                  <CardDescription>
                    Menganalisa laju degradasi bangunan dengan membandingkan data penilaian tahun ini dengan tahun sebelumnya.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-pupr-blue border-blue-200 font-bold px-3 py-1">
                    <Clock size={14} className="mr-1.5" /> Data Historis Ditemukan (2024, 2025)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50/50">
                  {/* Last Year Data */}
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-500 text-sm uppercase tracking-wider flex items-center gap-2">
                        Penilaian Tahun Lalu
                      </h4>
                      <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-300 shadow-none border-none">
                        Tahun 2025
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-slate-500">Tingkat Kerusakan Total</span>
                          <span className="font-mono text-sm font-bold text-slate-700">38.5%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full" style={{ width: '38.5%' }}></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-right">Klasifikasi: Rusak Sedang</p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-1">Komponen Kritis (2025)</h5>
                        <ul className="text-xs space-y-2">
                          <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-600">Struktur Atap (Kuda-kuda)</span>
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Rusak Sedang (25%)</Badge>
                          </li>
                          <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-600">Kolom Struktur (K-01)</span>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Rusak Ringan (10%)</Badge>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                         <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rekomendasi 2025:</h5>
                         <p className="text-xs text-slate-600 italic">"Perbaikan minor pada rangka atap yang lapuk dan pengecatan ulang dinding."</p>
                      </div>
                    </div>
                  </div>

                  {/* Current Year Data */}
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-pupr-blue text-sm uppercase tracking-wider flex items-center gap-2">
                        Penilaian Saat Ini
                      </h4>
                      <Badge className="bg-pupr-blue text-white shadow-sm border-none">
                        Tahun 2026
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-slate-700">Tingkat Kerusakan Total</span>
                          <span className="font-mono text-sm font-bold text-red-600 flex items-center gap-1">
                            <Activity size={12} className="text-red-500" />
                            {activeReview?.damagePercentage.toFixed(1)}% <span className="text-[10px] text-red-500 font-normal">(+{(activeReview?.damagePercentage || 0) - 38.5}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${activeReview?.damagePercentage}%` }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-right">Klasifikasi: Rusak Sedang Kritis</p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-1">Komponen Kritis (2026)</h5>
                        <ul className="text-xs space-y-2">
                          <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-red-100 shadow-sm relative">
                            <span className="text-slate-800 font-medium">Struktur Atap (Kuda-kuda)</span>
                            <div className="flex items-center gap-2">
                               <ArrowLeft size={12} className="text-slate-300" />
                               <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rusak Berat (70%)</Badge>
                            </div>
                          </li>
                          <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-amber-100 shadow-sm relative">
                            <span className="text-slate-800 font-medium">Kolom Struktur (K-01)</span>
                            <div className="flex items-center gap-2">
                               <ArrowLeft size={12} className="text-slate-300" />
                               <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Rusak Sedang (42%)</Badge>
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100 shadow-sm">
                         <h5 className="text-[10px] font-bold text-red-500 uppercase mb-1">Rekomendasi 2026 (AI):</h5>
                         <p className="text-xs text-red-800 italic font-medium">"Perkuatan struktur masif FRP Jacketing. Peningkatan kerusakan signifikan pada kolom pasca gempa."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 7: AI MODEL ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
            <Card className="p-4 border-0 shadow-sm bg-white border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Computer Vision mAP@0.5</span>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">94.8%</h3>
              <p className="text-xs text-slate-500 mt-1">Akurasi deteksi retak & spalling beton</p>
            </Card>

            <Card className="p-4 border-0 shadow-sm bg-white border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">RAG Retrieval Precision</span>
              <h3 className="text-3xl font-extrabold text-pupr-blue mt-1">98.2%</h3>
              <p className="text-xs text-slate-500 mt-1">Kesesuaian pasal regulasi Permen PUPR 22/2018</p>
            </Card>

            <Card className="p-4 border-0 shadow-sm bg-white border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Human Acceptance Rate</span>
              <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">89.4%</h3>
              <p className="text-xs text-slate-500 mt-1">Rekomendasi AI yang disetujui verifikator</p>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
