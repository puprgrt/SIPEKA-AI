import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, AlertTriangle, MessageSquareWarning, Image as ImageIcon, 
  Check, Building, Info, LayoutDashboard, Calculator, BrainCircuit, 
  FileSignature, ChevronRight, Camera, Save, Send, Download, Sparkles, 
  ShieldCheck, X, Eye, FileText, ArrowRight, RefreshCw, Layers,
  History, RotateCcw, GitCommit, GitBranch, ArrowLeftRight, Clock, FileDiff, Plus, Search, TrendingDown
} from 'lucide-react';
import { PredictiveMaintenanceDashboard } from './PredictiveMaintenanceDashboard';
import { COMPONENT_GROUPS, WEIGHTS_BY_FLOOR, DAMAGE_LEVELS, getDamageCategory, COMPONENT_DAMAGE_GUIDES } from '@/lib/assessmentRules';
import { useRole } from '@/contexts/RoleContext';
import jsPDF from 'jspdf';
import { addFooterWithQRCode } from '../../lib/pdf-utils';
import autoTable from 'jspdf-autotable';

type AssessmentState = {
  volTotal: number;
  damages: Record<string, number>;
  note: string;
  documents?: Record<string, string>;
};

export interface AssessmentSnapshotItem {
  id: string;
  assessmentId: string;
  buildingId?: string;
  buildingName?: string;
  userName: string;
  userRole: string;
  action: string;
  changedField?: string;
  oldValue?: string;
  newValue?: string;
  snapshotData: Record<string, AssessmentState>;
  totalDamagePercentage: number;
  createdAt: string;
}

const ASSESSMENT_ID = 'ASM-2026-002';

export function AssessmentWorkspace() {
  const navigate = useNavigate();
  const { activeRole } = useRole();
  const canEdit = ['Super Administrator', 'Kepala Bidang', 'Reviewer Teknis', 'Surveyor'].includes(activeRole);

  const [dataPanduan] = useState<Record<string, any>>(() => {
    const s = localStorage.getItem('sipeka_master_panduan');
    return s ? JSON.parse(s) : COMPONENT_DAMAGE_GUIDES;
  });

  const [activeTab, setActiveTab] = useState('assessment');
  const [floorCount, setFloorCount] = useState<1 | 2 | 3>(2);
  const [activeItem, setActiveItem] = useState('str-kolom');
  const [guideModal, setGuideModal] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Snapshot & Activity Modals
  const [diffModalSnapshot, setDiffModalSnapshot] = useState<AssessmentSnapshotItem | null>(null);
  const [revertConfirmModal, setRevertConfirmModal] = useState<AssessmentSnapshotItem | null>(null);
  const [manualSnapshotModal, setManualSnapshotModal] = useState(false);
  const [manualSnapshotNote, setManualSnapshotNote] = useState('');
  const [snapshotsSearchQuery, setSnapshotsSearchQuery] = useState('');

  const showGuide = localStorage.getItem('showComponentGuide') !== 'false';
  const showPhotos = localStorage.getItem('showDamagePhotos') !== 'false';

  // Load existing or default assessments
  const [assessments, setAssessments] = useState<Record<string, AssessmentState>>(() => {
    const saved = localStorage.getItem('sipeka_active_assessment');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      'str-kolom': { volTotal: 10, damages: { '0.5': 3 }, note: 'Retakan terjadi pada sendi plastis kolom teras utama.' },
      'str-balok': { volTotal: 12, damages: { '0.35': 2 }, note: 'Lendutan tipis pada balok kantilever teras.' },
      'ars-dinding': { volTotal: 100, damages: { '0.35': 15, '0.5': 10 }, note: 'Plesteran terkelupas dan retak merambat.' },
      'ars-plafon': { volTotal: 80, damages: { '0.2': 10 }, note: 'Noda bekas bocoran air hujan di plafon kalsiboard.' },
      'ars-atap': { volTotal: 100, damages: { '0.5': 20 }, note: 'Rangka atap kayu sebagian lapuk terkena kelembaban.' },
      'utl-listrik': { volTotal: 20, damages: { '0.2': 2 }, note: 'MCB & saklar beberapa titik perlu penggantian.' }
    };
  });

  // Load snapshots history
  const [snapshots, setSnapshots] = useState<AssessmentSnapshotItem[]>(() => {
    const saved = localStorage.getItem(`sipeka_snapshots_${ASSESSMENT_ID}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'snp-003',
        assessmentId: ASSESSMENT_ID,
        buildingName: 'Puskesmas Cikajang (Bangunan Utama)',
        userName: 'Siti Aminah, S.T.',
        userRole: 'Reviewer Teknis',
        action: 'Reviewer Calibration & Adjustment',
        changedField: 'ars-dinding & str-balok',
        oldValue: 'Draft awal lapangan',
        newValue: 'Verifikasi kerusakan plesteran & balok kantilever',
        snapshotData: {
          'str-kolom': { volTotal: 10, damages: { '0.5': 3 }, note: 'Retakan terjadi pada sendi plastis kolom teras utama.' },
          'str-balok': { volTotal: 12, damages: { '0.35': 2 }, note: 'Lendutan tipis pada balok kantilever teras.' },
          'ars-dinding': { volTotal: 100, damages: { '0.35': 15, '0.5': 10 }, note: 'Plesteran terkelupas dan retak merambat.' },
          'ars-plafon': { volTotal: 80, damages: { '0.2': 10 }, note: 'Noda bekas bocoran air hujan di plafon kalsiboard.' },
          'ars-atap': { volTotal: 100, damages: { '0.5': 20 }, note: 'Rangka atap kayu sebagian lapuk terkena kelembaban.' },
          'utl-listrik': { volTotal: 20, damages: { '0.2': 2 }, note: 'MCB & saklar beberapa titik perlu penggantian.' }
        },
        totalDamagePercentage: 12.4,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'snp-002',
        assessmentId: ASSESSMENT_ID,
        buildingName: 'Puskesmas Cikajang (Bangunan Utama)',
        userName: 'Ahmad Ridwan, S.T.',
        userRole: 'Surveyor Lapangan',
        action: 'Pembaruan Volume Kerusakan Atap',
        changedField: 'ars-atap',
        oldValue: 'volTotal: 80',
        newValue: 'volTotal: 100, damage 50%: 20m²',
        snapshotData: {
          'str-kolom': { volTotal: 10, damages: { '0.5': 3 }, note: 'Retakan terjadi pada sendi plastis kolom teras utama.' },
          'str-balok': { volTotal: 12, damages: { '0.35': 1 }, note: 'Balok kantilever ringan.' },
          'ars-dinding': { volTotal: 100, damages: { '0.35': 10 }, note: 'Dinding retak halus.' },
          'ars-plafon': { volTotal: 80, damages: { '0.2': 5 }, note: 'Plafon bocor.' },
          'ars-atap': { volTotal: 100, damages: { '0.5': 20 }, note: 'Rangka atap kayu lapuk.' },
          'utl-listrik': { volTotal: 20, damages: { '0.2': 2 }, note: 'MCB rusak.' }
        },
        totalDamagePercentage: 10.8,
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        id: 'snp-001',
        assessmentId: ASSESSMENT_ID,
        buildingName: 'Puskesmas Cikajang (Bangunan Utama)',
        userName: 'Ahmad Ridwan, S.T.',
        userRole: 'Surveyor Lapangan',
        action: 'Draft Awal Insitu Assessment',
        changedField: 'Semua Elemen (Inisialisasi)',
        oldValue: 'Kosong',
        newValue: 'Form A Inisialisasi',
        snapshotData: {
          'str-kolom': { volTotal: 10, damages: { '0.5': 1 }, note: 'Surveyor draft pertama.' }
        },
        totalDamagePercentage: 4.5,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ];
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Persist assessment draft in localStorage
  useEffect(() => {
    localStorage.setItem('sipeka_active_assessment', JSON.stringify(assessments));
  }, [assessments]);

  // Persist snapshots history in localStorage
  useEffect(() => {
    localStorage.setItem(`sipeka_snapshots_${ASSESSMENT_ID}`, JSON.stringify(snapshots));
  }, [snapshots]);

  // Fetch snapshots from backend Cloud SQL on load
  const fetchSnapshotsFromBackend = async () => {
    try {
      const res = await fetch(`/api/assessments/snapshots/${ASSESSMENT_ID}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSnapshots(data);
          showToast('Data riwayat activity snapshot berhasil disinkronisasi dengan Database Cloud SQL!');
        }
      }
    } catch (e) {
      console.warn('Backend Cloud SQL snapshot fetch offline fallback:', e);
    }
  };

  useEffect(() => {
    fetchSnapshotsFromBackend();
  }, []);

  // Derived visible components based on floor count
  const visibleGroups = useMemo(() => {
    return COMPONENT_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(item => !item.minFloor || floorCount >= item.minFloor)
    }));
  }, [floorCount]);

  // Active component details
  const activeComponentDetails = useMemo(() => {
    for (const group of visibleGroups) {
      const found = group.items.find(i => i.id === activeItem);
      if (found) return found;
    }
    return null;
  }, [activeItem, visibleGroups]);

  // Handle file uploads for documentation
  const handleFileUpload = (damageValue: number, fileName: string) => {
    setAssessments(prev => {
      const current = prev[activeItem] || { volTotal: 0, damages: {}, note: '', documents: {} };
      const updated = {
        ...prev,
        [activeItem]: {
          ...current,
          documents: {
            ...(current.documents || {}),
            [damageValue.toString()]: fileName
          }
        }
      };

      recordSnapshot(
        'Unggah Bukti Dokumen/Foto',
        activeItem,
        '-',
        fileName,
        updated
      );

      return updated;
    });
    showToast(`Dokumen ${fileName} berhasil dilampirkan.`);
  };

  const handleAssessmentChange = (field: keyof AssessmentState, value: any) => {
    setAssessments(prev => {
      const updated = {
        ...prev,
        [activeItem]: {
          ...(prev[activeItem] || { volTotal: 100, damages: {}, note: '' }),
          [field]: value
        }
      };
      recordSnapshot(
        `Pembaruan Field (${field === 'note' ? 'Catatan' : field})`,
        activeItem,
        prev[activeItem]?.[field] ? String(prev[activeItem][field]) : '-',
        String(value),
        updated
      );
      return updated;
    });
  };

  const handleDamageChange = (damageValue: number, volume: number) => {
    setAssessments(prev => {
      const current = prev[activeItem] || { volTotal: 100, damages: {}, note: '' };
      const newDamages = {
        ...current.damages,
        [damageValue.toString()]: volume
      };
      
      const newVolTotal = Object.values(newDamages).reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0);
      
      const updated = {
        ...prev,
        [activeItem]: {
          ...current,
          volTotal: newVolTotal,
          damages: newDamages
        }
      };

      recordSnapshot(
        `Pembaruan Volume Defek (${damageValue * 100}%)`,
        activeItem,
        `${current.damages[damageValue.toString()] || 0} m²`,
        `${volume} m²`,
        updated
      );

      return updated;
    });
  };

  const activeData = assessments[activeItem] || { volTotal: 0, damages: {}, note: '' };
  const calculatedVolTotal: number = activeData.damages ? (Object.values(activeData.damages).reduce((a: number, b: any) => a + (Number(b) || 0), 0) as number) : 0;
  
  // Calculations
  const bobotKomponen = WEIGHTS_BY_FLOOR[floorCount][activeItem] || 0;
  
  const totalDamageValue = Object.entries(activeData.damages || {}).reduce((sum, [valStr, vol]) => {
    return sum + (Number(vol) * Number(valStr));
  }, 0);
  
  const nilaiKerusakanSub = calculatedVolTotal > 0 ? (totalDamageValue / calculatedVolTotal) : 0;
  const nilaiKerusakanThdMassa = nilaiKerusakanSub * bobotKomponen;

  // Calculate Total Damage for the whole building
  const { totalDamagePercentage, structuralScore, architecturalScore, utilityScore } = useMemo(() => {
    let total = 0;
    let strScore = 0;
    let archScore = 0;
    let utlScore = 0;

    visibleGroups.forEach(group => {
      group.items.forEach(item => {
        const data = assessments[item.id];
        if (data && data.damages) {
          const calcVolTotal: number = Object.values(data.damages).reduce((a: number, b: any) => a + (Number(b) || 0), 0) as number;
          if (calcVolTotal > 0) {
            const w = WEIGHTS_BY_FLOOR[floorCount][item.id] || 0;
            const tDamageValue = Object.entries(data.damages).reduce((s, [vStr, vol]) => s + (Number(vol) * Number(vStr)), 0);
            const sub = tDamageValue / calcVolTotal;
            const itemContribution = sub * w;
            total += itemContribution;

            if (group.id === 'str') strScore += itemContribution;
            if (group.id === 'ars') archScore += itemContribution;
            if (group.id === 'utl') utlScore += itemContribution;
          }
        }
      });
    });
    return {
      totalDamagePercentage: total,
      structuralScore: strScore,
      architecturalScore: archScore,
      utilityScore: utlScore
    };
  }, [assessments, visibleGroups, floorCount]);

  // Helper to record activity snapshot
  const recordSnapshot = async (
    action: string,
    changedField: string,
    oldVal?: string,
    newVal?: string,
    overrideState?: Record<string, AssessmentState>
  ) => {
    const currentState = overrideState || assessments;
    
    let total = 0;
    visibleGroups.forEach(group => {
      group.items.forEach(item => {
        const data = currentState[item.id];
        if (data && data.damages) {
          const calcVolTotal: number = Object.values(data.damages).reduce((a: number, b: any) => a + (Number(b) || 0), 0) as number;
          if (calcVolTotal > 0) {
            const w = WEIGHTS_BY_FLOOR[floorCount][item.id] || 0;
            const tDamageValue = Object.entries(data.damages).reduce((s, [vStr, vol]) => s + (Number(vol) * Number(vStr)), 0);
            const sub = tDamageValue / calcVolTotal;
            total += sub * w;
          }
        }
      });
    });

    const newSnap: AssessmentSnapshotItem = {
      id: `snp-${Date.now().toString().slice(-6)}`,
      assessmentId: ASSESSMENT_ID,
      buildingName: 'Puskesmas Cikajang (Bangunan Utama)',
      userName: activeRole === 'Surveyor' ? 'Ahmad Ridwan, S.T.' : 'Siti Aminah, S.T.',
      userRole: activeRole,
      action,
      changedField,
      oldValue: oldVal || '-',
      newValue: newVal || '-',
      snapshotData: JSON.parse(JSON.stringify(currentState)),
      totalDamagePercentage: Number(total.toFixed(2)),
      createdAt: new Date().toISOString()
    };

    setSnapshots(prev => [newSnap, ...prev]);

    try {
      await fetch('/api/assessments/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: newSnap.assessmentId,
          buildingName: newSnap.buildingName,
          userName: newSnap.userName,
          userRole: newSnap.userRole,
          action: newSnap.action,
          changedField: newSnap.changedField,
          oldValue: newSnap.oldValue,
          newValue: newSnap.newValue,
          snapshotData: newSnap.snapshotData,
          totalDamagePercentage: newSnap.totalDamagePercentage
        })
      });
    } catch (e) {
      console.warn('Backend snapshot insert offline fallback:', e);
    }
  };

  const handleRevertSnapshot = async (targetSnapshot: AssessmentSnapshotItem) => {
    if (!targetSnapshot || !targetSnapshot.snapshotData) return;

    const restoredState = JSON.parse(JSON.stringify(targetSnapshot.snapshotData));
    setAssessments(restoredState);
    localStorage.setItem('sipeka_active_assessment', JSON.stringify(restoredState));

    const dateFormatted = new Date(targetSnapshot.createdAt).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    await recordSnapshot(
      `Revert Versi (${dateFormatted})`,
      'Semua Elemen (Restored)',
      'Versi Terkini',
      `Snapshot #${targetSnapshot.id}`,
      restoredState
    );

    showToast(`Penilaian berhasil dipulihkan ke versi tanggal ${dateFormatted}!`);
    setDiffModalSnapshot(null);
    setRevertConfirmModal(null);
  };

  const handleManualSnapshot = async () => {
    const name = manualSnapshotNote.trim() || 'Snapshot Penilaian Manual';
    await recordSnapshot(
      `Manual: ${name}`,
      'Catatan Manual',
      '-',
      'Versi Disimpan Pengguna'
    );
    showToast(`Snapshot manual "${name}" berhasil dibuat & disimpan!`);
    setManualSnapshotNote('');
    setManualSnapshotModal(false);
  };

  // Filtered snapshots for search
  const filteredSnapshots = useMemo(() => {
    if (!snapshotsSearchQuery.trim()) return snapshots;
    const query = snapshotsSearchQuery.toLowerCase();
    return snapshots.filter(s => 
      s.action.toLowerCase().includes(query) ||
      s.userName.toLowerCase().includes(query) ||
      s.userRole.toLowerCase().includes(query) ||
      (s.changedField && s.changedField.toLowerCase().includes(query))
    );
  }, [snapshots, snapshotsSearchQuery]);

  // Handle Save Draft Action
  const handleSaveDraft = async () => {
    localStorage.setItem('sipeka_active_assessment', JSON.stringify(assessments));
    await recordSnapshot('Simpan Draft Manual', 'Semua Komponen', '-', 'Versi Draft Terkomit');
    showToast('Draft penilaian kerusakan bangunan berhasil disimpan ke sistem lokal & Cloud SQL!');
  };

  // Handle Submit Assessment to Tahap 4 (Review Penilaian)
  const handleSubmitAssessment = () => {
    const existingReviewsStr = localStorage.getItem('sipeka_assessment_reviews');
    let existingReviews: any[] = [];
    if (existingReviewsStr) {
      try { existingReviews = JSON.parse(existingReviewsStr); } catch (e) { console.error(e); }
    }

    const today = new Date().toISOString().split('T')[0];
    const newId = `ASM-2026-00${existingReviews.length + 1}`;
    
    let riskLevel: 'Ringan' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi' = 'Ringan';
    if (totalDamagePercentage > 65) riskLevel = 'Sangat Tinggi';
    else if (totalDamagePercentage > 45) riskLevel = 'Tinggi';
    else if (totalDamagePercentage > 30) riskLevel = 'Sedang';

    const newReviewItem = {
      id: newId,
      surveyId: 'SRV-002',
      buildingName: 'Puskesmas Cikajang (Bangunan Utama)',
      category: 'Fasilitas Kesehatan',
      instansi: 'Dinas Kesehatan Kabupaten Garut',
      kecamatan: 'Cikajang',
      surveyor: 'Ahmad Ridwan, S.T.',
      reviewer: 'Siti Aminah, S.T.',
      dateSubmitted: today,
      damagePercentage: Number(totalDamagePercentage.toFixed(1)),
      riskLevel: riskLevel,
      status: 'Menunggu Review',
      structuralScore: Number(structuralScore.toFixed(1)),
      architecturalScore: Number(architecturalScore.toFixed(1)),
      utilityScore: Number(utilityScore.toFixed(1)),
      aiRecommendation: `Engine AI merekomendasikan penanganan kategori ${riskLevel} (${totalDamagePercentage.toFixed(1)}%). Diperlukan perkuatan elemen kritis dan perbaikan atap.`,
      reviewerNotes: '',
      reviewHistory: [
        { date: `${today} ${new Date().toLocaleTimeString()}`, user: 'Ahmad Ridwan, S.T.', action: 'Submit Assessment Engine (Tahap 3)', note: 'Penilaian dari Engine dikirim ke antrean Verifikator Teknis (Tahap 4).' }
      ]
    };

    const updatedReviews = [newReviewItem, ...existingReviews.filter(r => r.id !== newId)];
    localStorage.setItem('sipeka_assessment_reviews', JSON.stringify(updatedReviews));

    showToast(`Penilaian (${newId}) Berhasil Dikirim ke Tahap 4 (Review Penilaian)!`);
    setTimeout(() => {
      navigate('/assessment/review');
    }, 1200);
  };

  // Export PDF Form A PUPR
  const exportFormAPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Kop Surat PUPR
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PEMERINTAH KABUPATEN GARUT", pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text("DINAS PEKERJAAN UMUM DAN PENATAAN RUANG", pageWidth / 2, 22, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Jl. Raya Samarang No. 115 Garut | Email: pupr@garutkab.go.id", pageWidth / 2, 28, { align: 'center' });
    doc.line(20, 31, pageWidth - 20, 31);

    // Title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FORMULIR A: PENILAIAN TINGKAT KERUSAKAN BANGUNAN GEDUNG", pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Berdasarkan Peraturan Menteri PUPR No. 22/PRT/M/2018", pageWidth / 2, 46, { align: 'center' });

    // Table Data
    const tableBody: any[] = [];
    visibleGroups.forEach(group => {
      group.items.forEach(item => {
        const data = assessments[item.id];
        const isAssessed = !!data && data.volTotal > 0;
        const w = WEIGHTS_BY_FLOOR[floorCount][item.id] || 0;
        
        let subPct = 0;
        if (isAssessed && data.volTotal > 0) {
          const tDamageVal = Object.entries(data.damages).reduce((s, [vStr, vol]) => s + (Number(vol) * Number(vStr)), 0);
          subPct = tDamageVal / data.volTotal;
        }

        const contribution = subPct * w;

        tableBody.push([
          group.title,
          item.name,
          `${w.toFixed(2)}%`,
          isAssessed ? `${(subPct * 100).toFixed(1)}%` : '0%',
          `${contribution.toFixed(2)}%`,
          data?.note || '-'
        ]);
      });
    });

    autoTable(doc, {
      startY: 54,
      theme: 'grid',
      headStyles: { fillColor: [15, 76, 129] },
      head: [['Kelompok', 'Nama Komponen', 'Bobot (W)', 'Kerusakan Sub', 'Nilai Kerusakan', 'Catatan Survey']],
      body: tableBody,
      foot: [
        ['TOTAL', 'KESELURUHAN BANGUNAN', '100%', '-', `${totalDamagePercentage.toFixed(2)}%`, totalDamagePercentage > 45 ? 'RUSAK BERAT' : totalDamagePercentage > 30 ? 'RUSAK SEDANG' : 'RUSAK RINGAN']
      ],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("KESIMPULAN PENILAIAN TEKNIS:", 20, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(`Bangunan dinyatakan mengalami ${totalDamagePercentage > 45 ? 'RUSAK BERAT' : totalDamagePercentage > 30 ? 'RUSAK SEDANG' : 'RUSAK RINGAN'} sebesar ${totalDamagePercentage.toFixed(2)}%.`, 20, finalY + 6);

    // Signatures
    const sigY = finalY + 20;
    doc.setFont("helvetica", "bold");
    doc.text("Surveyor Lapangan,", 30, sigY);
    doc.text("Reviewer Teknis PUPR,", pageWidth - 80, sigY);

    doc.setFont("helvetica", "normal");
    doc.text("Ahmad Ridwan, S.T.", 30, sigY + 25);
    doc.text("Siti Aminah, S.T.", pageWidth - 80, sigY + 25);

    const pageHeight = doc.internal.pageSize.getHeight();
    await addFooterWithQRCode(doc, "SRV-002", "PENDING", pageHeight, pageWidth);
    doc.save(`FormA_PUPR_Assessment_SRV-002.pdf`);
    showToast('Laporan Form A PUPR berhasil diunduh sebagai PDF.');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Penilaian', icon: LayoutDashboard },
    { id: 'assessment', label: 'Engine Perhitungan', icon: Calculator },
    { id: 'ai-review', label: 'AI Review & Rekomendasi', icon: BrainCircuit },
    { id: 'predictive', label: 'Predictive Maintenance', icon: TrendingDown },
    { id: 'approval', label: 'Approval Workflow', icon: FileSignature },
    { id: 'activity-history', label: 'Activity & Version Snapshots', icon: History },
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
      <div className="flex items-center justify-between mb-4 flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center">
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Damage Assessment Engine</h1>
            <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/5 font-semibold">Tahap 3</Badge>
            <Badge variant="outline" className="border-emerald-600 text-emerald-700 bg-emerald-50 font-semibold">Ready for Review</Badge>
          </div>
          <p className="text-slate-500 mt-1">SRV-002: Puskesmas Cikajang (Bangunan Utama - Standar Permen PUPR No. 22/2018)</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Building size={16} className="text-slate-500" />
            <select 
              value={floorCount} 
              onChange={(e) => setFloorCount(Number(e.target.value) as 1 | 2 | 3)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={1}>1 Lantai Bangunan</option>
              <option value={2}>2 Lantai Bangunan</option>
              <option value={3}>3+ Lantai Bangunan</option>
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={handleSaveDraft} className="bg-white">
            <Save size={15} className="mr-1.5" />
            Simpan Draft
          </Button>
          
          <Button variant="pupr" size="sm" onClick={handleSubmitAssessment}>
            <Send size={15} className="mr-1.5" />
            Kirim ke Tahap 4
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-slate-900 to-pupr-blue text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto min-h-0">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-6">
            <Card className="col-span-1 md:col-span-3 border-0 shadow-sm bg-white border-slate-200">
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">Dashboard Hasil Penilaian Kerusakan (PUPR Engine)</CardTitle>
                  <CardDescription>Visualisasi kategori kerusakan bangunan dan matriks komponen kritis.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportFormAPDF} className="bg-slate-50">
                  <Download size={14} className="mr-1.5 text-pupr-blue" /> Export Form A PUPR (PDF)
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Gauge Chart */}
                  <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-48 h-48 relative flex items-center justify-center">
                      <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
                        <path 
                          d="M 10 50 A 40 40 0 0 1 90 50" 
                          fill="none" 
                          stroke={totalDamagePercentage > 45 ? '#ef4444' : totalDamagePercentage > 30 ? '#f59e0b' : '#22c55e'} 
                          strokeWidth="12" 
                          strokeLinecap="round" 
                          strokeDasharray={`${(Math.min(totalDamagePercentage, 100) / 100) * 125} 125`} 
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center bottom-2">
                        <span className={`text-4xl font-extrabold ${totalDamagePercentage > 45 ? 'text-red-600' : totalDamagePercentage > 30 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {totalDamagePercentage.toFixed(1)}%
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                          {totalDamagePercentage > 45 ? 'Rusak Berat' : totalDamagePercentage > 30 ? 'Rusak Sedang' : 'Rusak Ringan'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 w-full grid grid-cols-3 text-center text-[10px] pt-3 border-t border-slate-200">
                      <div>
                        <p className="text-slate-400 font-semibold">Struktur</p>
                        <p className="font-bold text-slate-900">{structuralScore.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold">Arsitektur</p>
                        <p className="font-bold text-slate-900">{architecturalScore.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold">Utilitas</p>
                        <p className="font-bold text-slate-900">{utilityScore.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Heatmap / Matrix */}
                  <div className="lg:col-span-3">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider">Matriks Kerusakan per Komponen</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {visibleGroups.flatMap(g => g.items).map(item => {
                        const data = assessments[item.id];
                        const isAssessed = !!data && data.volTotal > 0;
                        const w = WEIGHTS_BY_FLOOR[floorCount][item.id] || 0;
                        
                        let subPct = 0;
                        if (isAssessed) {
                          const tVal = Object.entries(data.damages).reduce((s, [vStr, vol]) => s + (Number(vol) * Number(vStr)), 0);
                          subPct = tVal / data.volTotal;
                        }

                        const damageContribution = subPct * w;
                        
                        let bgColor = 'bg-slate-50 border-slate-200';
                        let textColor = 'text-slate-400';
                        if (isAssessed) {
                          if (damageContribution > 3) { bgColor = 'bg-red-50 border-red-200'; textColor = 'text-red-600'; }
                          else if (damageContribution > 1) { bgColor = 'bg-amber-50 border-amber-200'; textColor = 'text-amber-600'; }
                          else if (damageContribution > 0) { bgColor = 'bg-emerald-50 border-emerald-200'; textColor = 'text-emerald-700'; }
                        }

                        return (
                          <div 
                            key={item.id} 
                            onClick={() => { setActiveItem(item.id); setActiveTab('assessment'); }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${bgColor}`}
                          >
                            <p className="text-xs font-semibold text-slate-700 truncate">{item.name}</p>
                            <div className="flex justify-between items-end mt-2">
                              <span className={`text-base font-bold ${textColor}`}>
                                {isAssessed ? `${damageContribution.toFixed(2)}%` : '0%'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">w: {w}%</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: CALCULATION ENGINE */}
        {activeTab === 'assessment' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
            
            {/* Panel 1: Tree Komponen */}
            <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px] lg:h-[650px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">Daftar Komponen PUPR</h3>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Kerusakan</span>
                    <p className={`font-bold text-sm ${totalDamagePercentage > 45 ? 'text-red-600' : totalDamagePercentage > 30 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {totalDamagePercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-pupr-blue h-1.5 rounded-full transition-all duration-300" style={{ width: `${Math.min((Object.keys(assessments).length / 16) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-3">
                {visibleGroups.map(group => (
                  <div key={group.id}>
                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-100/60 rounded-md">
                      {group.title}
                    </div>
                    <div className="space-y-1 mt-1">
                      {group.items.map(item => {
                        const isAssessed = !!assessments[item.id] && assessments[item.id].volTotal > 0;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveItem(item.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                              activeItem === item.id 
                                ? 'bg-pupr-blue text-white shadow-sm' 
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {isAssessed ? (
                                <CheckCircle2 size={14} className={activeItem === item.id ? 'text-white' : 'text-emerald-500'} />
                              ) : (
                                <div className={`w-3.5 h-3.5 rounded-full border-2 ${activeItem === item.id ? 'border-white' : 'border-slate-300'}`}></div>
                              )}
                              <span className="truncate">{item.name}</span>
                            </div>
                            {isAssessed && (
                              <span className={`text-[10px] font-mono ${activeItem === item.id ? 'text-white/80' : 'text-slate-400'}`}>
                                {WEIGHTS_BY_FLOOR[floorCount][item.id] || 0}%
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Bukti Visual & Foto Annotation */}
            <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px] lg:h-[650px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">Dokumentasi & Bukti Visual Lapangan</h3>
                <Badge variant="outline" className="bg-white text-[10px]">4 Foto Geotagged</Badge>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div 
                  onClick={() => setPhotoModalOpen(true)}
                  className="aspect-video w-full rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden group cursor-pointer shadow-md"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1518557984649-7b161c230cfa?q=80&w=800&auto=format&fit=crop" 
                    className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-all duration-300" 
                    alt="Kerusakan" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <Badge className="bg-red-600 text-white border-none text-[10px]">
                        Defek: Retak Struktur Kolom K-01
                      </Badge>
                      <Badge variant="outline" className="bg-black/60 text-white border-white/20 text-[10px] font-mono">
                        GPS: -7.3421, 107.8102
                      </Badge>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs font-bold text-white">Kolom Teras Utama (Puskesmas Cikajang)</p>
                        <p className="text-[10px] text-slate-300">Waktu: 2026-08-01 09:15 WIB</p>
                      </div>
                      <Button size="sm" variant="pupr" className="h-7 text-[10px]">
                        <Eye size={12} className="mr-1" /> Perbesar Foto
                      </Button>
                    </div>
                  </div>

                  {/* Pulsing Highlight Rings */}
                  <div className="absolute top-1/3 left-1/3 w-10 h-10 border-2 border-red-500 rounded-full animate-ping pointer-events-none"></div>
                  <div className="absolute top-1/3 left-1/3 w-10 h-10 border-2 border-red-500 rounded-full pointer-events-none"></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { title: 'Kolom K-01', url: 'https://images.unsplash.com/photo-1518557984649-7b161c230cfa?q=80&w=300&auto=format&fit=crop' },
                    { title: 'Balok Teras B-02', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=300&auto=format&fit=crop' },
                    { title: 'Plafon Selasar', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop' }
                  ].map((p, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setPhotoModalOpen(true)}
                      className="aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative cursor-pointer group hover:ring-2 hover:ring-pupr-blue"
                    >
                      <img src={p.url} className="object-cover w-full h-full group-hover:scale-105 transition-transform" alt={p.title} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold text-center p-1">
                        {p.title}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-slate-600">Integrasi Denah Titik Kerusakan (GIS & BIM)</h4>
                  <div className="h-28 bg-slate-900 rounded-lg border border-slate-800 flex flex-col items-center justify-center text-slate-300 text-xs relative overflow-hidden p-3 text-center">
                    <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
                    <Layers size={24} className="text-pupr-blue mb-1" />
                    <p className="font-semibold text-white">Denah Gedung Utama Puskesmas Cikajang</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">3 Titik Kerusakan Terkoneksi dengan Model BIM 3D</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 3: Form Input Kerusakan Komponen */}
            <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-auto">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2 truncate">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 truncate">
                    Input: {activeComponentDetails?.name || 'Komponen'}
                  </h3>
                  {showGuide && (
                    <button onClick={() => setGuideModal(true)} className="text-pupr-blue hover:underline text-xs flex items-center font-semibold">
                      <Info size={14} className="mr-1" /> Panduan
                    </button>
                  )}
                </div>
                <Badge variant="outline" className="bg-white font-mono text-[10px]">{activeComponentDetails?.unit || '-'}</Badge>
              </div>

              <div className="p-4 space-y-5 flex-1 overflow-y-auto">
                {/* AI Review Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 relative overflow-hidden">
                  <div className="flex gap-3">
                    <Sparkles className="text-pupr-blue shrink-0 mt-0.5" size={18} />
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">SIPEKA AI Assessment Assistant</p>
                      <p className="text-slate-600 mt-1">
                        AI mendeteksi pola kerusakan retak memanjang pada <span className="font-semibold">{activeComponentDetails?.name}</span>.
                      </p>
                      <Button 
                        size="sm"
                        variant="link" 
                        className="px-0 h-auto text-xs mt-1.5 text-pupr-blue font-bold"
                        onClick={() => {
                          handleDamageChange(0.50, 3);
                          showToast('Rekomendasi AI diterapkan pada komponen ini!');
                        }}
                      >
                        Terapkan Volume Rusak Sedang (0.50)
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Volume Total Komponen</label>
                    <Input 
                      type="number" 
                      value={calculatedVolTotal}
                      readOnly
                      className="bg-slate-50 cursor-not-allowed font-mono font-bold text-slate-800 h-9" 
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-700">Volume Kerusakan per Tingkat (Permen PUPR 22/2018)</label>
                    {DAMAGE_LEVELS.map(level => {
                      const volume = activeData.damages?.[level.value.toString()] || 0;
                      return (
                        <div key={level.value} className="p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-700">
                              {level.label} <span className="text-slate-400 text-[10px]">({level.value.toFixed(2)})</span>
                            </span>
                            <div className="w-28">
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={volume || ''}
                                onChange={(e) => handleDamageChange(level.value, Number(e.target.value))}
                                className={`h-8 text-right font-mono bg-white text-xs ${volume > 0 ? 'border-pupr-blue ring-1 ring-pupr-blue/20 font-bold' : ''}`}
                              />
                            </div>
                          </div>

                          {volume > 0 && (
                            <label className="border border-dashed border-slate-300 rounded-lg p-2 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFileUpload(level.value, e.target.files[0].name);
                                  }
                                }}
                              />
                              {activeData.documents?.[level.value.toString()] ? (
                                <div className="flex items-center gap-1.5 text-emerald-700">
                                  <CheckCircle2 size={14} />
                                  <span className="text-[10px] font-bold truncate max-w-[180px]">{activeData.documents[level.value.toString()]}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Camera size={14} />
                                  <span className="text-[10px] font-medium">Unggah Bukti Foto / PDF</span>
                                </div>
                              )}
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kerusakan Sub-Komponen:</span>
                    <span className="font-bold text-cyan-400">{(nilaiKerusakanSub * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bobot Komponen (W):</span>
                    <span className="font-bold text-amber-400">{bobotKomponen.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5 text-sm">
                    <span className="text-slate-200 font-sans font-bold">Nilai thd Bangunan:</span>
                    <span className="font-extrabold text-emerald-400">{nilaiKerusakanThdMassa.toFixed(2)}%</span>
                  </div>
                </div>

                {/* Catatan Teknik */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Catatan Hasil Pemeriksaan Physical</label>
                  <textarea 
                    value={activeData.note}
                    onChange={(e) => handleAssessmentChange('note', e.target.value)}
                    className="w-full min-h-[70px] rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pupr-blue"
                    placeholder="Tuliskan detail temuan seperti lebar retak, kedalaman spalling, dll..."
                  ></textarea>
                </div>

                {canEdit && (
                  <Button 
                    className="w-full" 
                    variant="pupr" 
                    onClick={() => {
                      localStorage.setItem('sipeka_active_assessment', JSON.stringify(assessments));
                      showToast(`Data komponen ${activeComponentDetails?.name} berhasil disimpan!`);
                    }}
                  >
                    <Save size={15} className="mr-1.5" /> Simpan Data Komponen
                  </Button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: AI REVIEW & REKOMENDASI */}
        {activeTab === 'ai-review' && (
          <div className="space-y-6 pb-6">
            <Card className="border-0 shadow-sm bg-white border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pupr-blue/10 flex items-center justify-center text-pupr-blue">
                    <BrainCircuit size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Analisis Diagnostik AI & Strategi Penanganan PUPR</CardTitle>
                    <CardDescription>Evaluasi otomatis berdasarkan data masukan Engine Perhitungan Permen PUPR No. 22/2018</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Key Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Skor Kerusakan</p>
                    <h3 className={`text-2xl font-extrabold mt-1 ${totalDamagePercentage > 45 ? 'text-red-600' : totalDamagePercentage > 30 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {totalDamagePercentage.toFixed(2)}%
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-600 mt-1">
                      Kategori: {totalDamagePercentage > 45 ? 'RUSAK BERAT' : totalDamagePercentage > 30 ? 'RUSAK SEDANG' : 'RUSAK RINGAN'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Elemen Kritis Utama</p>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">Kolom (K-01) & Balok</h3>
                    <p className="text-[11px] text-red-600 font-semibold mt-1">Kontribusi Kerusakan: {structuralScore.toFixed(2)}%</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rekomendasi AI</p>
                    <h3 className="text-sm font-bold text-pupr-blue mt-1">Rehabilitasi Sedang & Retrofitting</h3>
                    <p className="text-[11px] text-slate-600 mt-1">Injeksi Epoxy & Perkuatan Selimut Beton</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Biaya Alokasi</p>
                    <h3 className="text-xl font-bold text-emerald-700 mt-1">Rp 180.000.000</h3>
                    <p className="text-[11px] text-slate-500 mt-1">35% dari Nilai Bangunan Baru</p>
                  </div>
                </div>

                {/* AI Detailed Diagnosis */}
                <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-400" />
                      <h4 className="font-bold text-sm">Ringkasan Diagnostik Teknis SIPEKA AI</h4>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-[10px]">Confidence: 96.4%</Badge>
                  </div>

                  <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                    <p>
                      1. <strong className="text-white">Integritas Struktur Utama:</strong> Ditemukan indikasi retak memanjang pada sendi plastis Kolom K-01 teras depan. Meskipun belum terjadi defleksi kritis pada plat lantai, risiko kelelahan bahan perlu ditangani secara cepat melalui perkuatan jacketing atau epoxy.
                    </p>
                    <p>
                      2. <strong className="text-white">Arsitektur & Penutup Atap:</strong> Kerusakan atap kayu lokal memicu rembesan air pada plafon selasar. Disarankan penggantian penutup atap menjadi baja ringan untuk mengurangi beban mati bangunan.
                    </p>
                    <p>
                      3. <strong className="text-white">Kepatuhan Terhadap Permen PUPR 22/2018:</strong> Data pengukuran volume dan dokumen bukti foto dinyatakan konsisten dan memenuhi syarat pengajuan BAP ke Reviewer Teknis.
                    </p>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button 
                      size="sm" 
                      variant="pupr" 
                      onClick={() => showToast('Rekomendasi AI berhasil disalin ke draft laporan.')}
                    >
                      Salin Rekomendasi ke Laporan
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                      onClick={exportFormAPDF}
                    >
                      <Download size={14} className="mr-1.5" /> Unduh Laporan PDF
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: APPROVAL WORKFLOW & QA */}
        {activeTab === 'approval' && (
          <div className="space-y-6 pb-6">
            <Card className="border-0 shadow-sm bg-white border-slate-200">
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Quality Assurance (QA) & Sign-Off Approval Workflow</CardTitle>
                  <CardDescription>Pemeriksaan kepatuhan standar dan verifikasi tanda tangan digital sebelum pengiriman final</CardDescription>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-none font-semibold">QA Checked</Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Audit Checklist Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                      <tr>
                        <th className="p-3">Kriteria Pemeriksaan QA</th>
                        <th className="p-3">Standar Acuan</th>
                        <th className="p-3 text-center">Status QA</th>
                        <th className="p-3">Catatan Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Dokumentasi Foto Geotagged</td>
                        <td className="p-3 text-slate-500">Minimal 3 Foto Tampak & Detail Defek</td>
                        <td className="p-3 text-center">
                          <Badge className="bg-emerald-100 text-emerald-800 border-none">Lengkap (4 Foto)</Badge>
                        </td>
                        <td className="p-3 text-slate-600">Foto jernih dengan koordinat GPS valid.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Kalkulasi Bobot Bangunan</td>
                        <td className="p-3 text-slate-500">Permen PUPR No. 22/2018 (2 Lantai)</td>
                        <td className="p-3 text-center">
                          <Badge className="bg-emerald-100 text-emerald-800 border-none">Sesuai (100%)</Badge>
                        </td>
                        <td className="p-3 text-slate-600">Total bobot komponen lengkap 100.0%.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Kesesuaian SNI Struktur</td>
                        <td className="p-3 text-slate-500">SNI 2847:2019 (Persyaratan Beton)</td>
                        <td className="p-3 text-center">
                          <Badge className="bg-emerald-100 text-emerald-800 border-none">Valid</Badge>
                        </td>
                        <td className="p-3 text-slate-600">Klasifikasi retak beton sesuai pedoman.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Tanda Tangan Digital Surveyor</td>
                        <td className="p-3 text-slate-500">Sertifikat Digital PUPR Garut</td>
                        <td className="p-3 text-center">
                          <Badge className="bg-emerald-100 text-emerald-800 border-none">Terverifikasi</Badge>
                        </td>
                        <td className="p-3 text-slate-600">Ditandatangani oleh Ahmad Ridwan, S.T.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Digital Sign Off Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-700">Pernyataan Surveyor Lapangan</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Saya yang bertanda tangan di bawah ini menyatakan bahwa seluruh pengukuran volume kerusakan fisik bangunan gedung ini dilakukan secara obyektif di lapangan sesuai petunjuk teknis PUPR.
                    </p>
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900">Ahmad Ridwan, S.T.</p>
                        <p className="text-[10px] text-slate-500">Surveyor Teknis (NIP: 19910203 201801 1 002)</p>
                      </div>
                      <Badge className="bg-emerald-600 text-white border-none text-[10px]">Signed via TTE</Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-pupr-blue">Aksi Selanjutnya (Pengajuan ke Tahap 4)</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Kirim data hasil perhitungan kerusakan bangunan ini ke antrean Reviewer Teknis untuk penerbitan Berita Acara Penilaian (BAP) resmi.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={exportFormAPDF} className="bg-white flex-1">
                        <Download size={14} className="mr-1" /> Export Form A
                      </Button>
                      <Button variant="pupr" size="sm" onClick={handleSubmitAssessment} className="flex-1">
                        <Send size={14} className="mr-1" /> Kirim ke Reviewer (Tahap 4)
                      </Button>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB PREDICTIVE MAINTENANCE */}
        {activeTab === 'predictive' && (
          <div className="pb-12 animate-in fade-in duration-300">
            <PredictiveMaintenanceDashboard />
          </div>
        )}

        {/* TAB 5: ACTIVITY TRACKING & VERSION SNAPSHOTS */}
        {activeTab === 'activity-history' && (
          <div className="space-y-6 pb-12 animate-in fade-in duration-300">
            {/* Stats Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Total Versi Snapshots</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{snapshots.length} Snapshot</h3>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Auto-tracked & Cloud SQL
                    </p>
                  </div>
                  <div className="p-3 bg-pupr-blue/10 rounded-2xl text-pupr-blue">
                    <History size={24} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Damage % Saat Ini</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{totalDamagePercentage.toFixed(1)}%</h3>
                    <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                      {totalDamagePercentage > 45 ? 'Rusak Berat' : totalDamagePercentage > 30 ? 'Rusak Sedang' : 'Rusak Ringan'}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                    <Calculator size={24} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Perubahan Terakhir</p>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                      {snapshots[0] ? new Date(snapshots[0].createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      oleh {snapshots[0]?.userName || 'User'}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                    <Clock size={24} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-slate-900 text-white shadow-sm flex flex-col justify-center p-4">
                <Button 
                  onClick={() => setManualSnapshotModal(true)} 
                  className="bg-pupr-amber hover:bg-amber-600 text-slate-950 font-bold w-full rounded-xl shadow-md"
                  size="sm"
                >
                  <GitCommit size={16} className="mr-2" />
                  Buat Snapshot Manual
                </Button>
                <Button 
                  onClick={fetchSnapshotsFromBackend} 
                  variant="outline" 
                  className="mt-2 border-slate-700 text-slate-200 hover:bg-slate-800 text-xs w-full rounded-xl"
                  size="sm"
                >
                  <RefreshCw size={14} className="mr-1.5" /> Sinkronkan Database
                </Button>
              </Card>
            </div>

            {/* Timeline Stream */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <GitBranch size={18} className="text-pupr-blue" />
                    Activity Tracking & Snapshots Log
                  </CardTitle>
                  <CardDescription>
                    Setiap pembaruan data lapangan, volume, catatan, maupun lampiran tersimpan otomatis sebagai versi snapshot yang dapat diinspeksi dan dipulihkan (revert).
                  </CardDescription>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <Input 
                    placeholder="Cari aktivitas/user..." 
                    value={snapshotsSearchQuery} 
                    onChange={(e) => setSnapshotsSearchQuery(e.target.value)}
                    className="pl-9 text-xs rounded-xl"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {filteredSnapshots.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Belum ada riwayat aktivitas yang cocok dengan pencarian.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                    {filteredSnapshots.map((snp, index) => (
                      <div key={snp.id} className="relative pl-6 group">
                        {/* Dot */}
                        <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                          index === 0 ? 'border-pupr-blue bg-pupr-blue text-white ring-4 ring-pupr-blue/10' : 'border-slate-400'
                        }`}>
                          {index === 0 && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                        </div>

                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 hover:border-slate-300 transition-all shadow-2xs">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200/60 pb-3 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={`font-semibold ${
                                snp.action.includes('Revert') || snp.action.includes('Dipulihkan')
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : snp.action.includes('Manual')
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-blue-50 text-pupr-blue border-blue-200'
                              }`}>
                                {snp.action}
                              </Badge>
                              {snp.changedField && (
                                <Badge variant="secondary" className="text-[11px] bg-slate-200/60 font-mono">
                                  Elemen: {snp.changedField}
                                </Badge>
                              )}
                              {index === 0 && (
                                <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                                  Versi Aktif Saat Ini
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                              <Clock size={13} className="text-slate-400" />
                              {new Date(snp.createdAt).toLocaleString('id-ID', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[11px] font-semibold">User & Role:</span>
                              <span className="font-bold text-slate-800">{snp.userName}</span>
                              <span className="text-slate-500 text-[11px] block">({snp.userRole})</span>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[11px] font-semibold">Tingkat Kerusakan Snapshot:</span>
                              <span className="font-extrabold text-slate-900 text-sm">{snp.totalDamagePercentage.toFixed(1)}%</span>
                              <span className="text-[11px] text-slate-500 ml-1">
                                ({snp.totalDamagePercentage > 45 ? 'Rusak Berat' : snp.totalDamagePercentage > 30 ? 'Rusak Sedang' : 'Rusak Ringan'})
                              </span>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setDiffModalSnapshot(snp)}
                                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 text-xs rounded-xl"
                              >
                                <Eye size={14} className="mr-1 text-pupr-blue" />
                                Inspeksi (Diff)
                              </Button>

                              <Button 
                                size="sm" 
                                onClick={() => setRevertConfirmModal(snp)}
                                disabled={index === 0}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-xl disabled:opacity-40"
                              >
                                <RotateCcw size={14} className="mr-1 text-amber-400" />
                                Pulihkan Versi Ini
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </div>

      {/* MODAL: MANUAL SNAPSHOT CREATION */}
      {manualSnapshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setManualSnapshotModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <GitCommit size={18} className="text-pupr-blue" />
                Buat Snapshot Manual
              </h3>
              <button onClick={() => setManualSnapshotModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Simpan titik balik versi kondisi penilaian saat ini sebagai penanda resmi (misalnya sebelum verifikasi dinas atau rapat komisi teknis).
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nama / Catatan Snapshot:</label>
              <Input 
                placeholder="Contoh: Versi Final Sebelum Rapat Verifikasi Tahap 2"
                value={manualSnapshotNote}
                onChange={(e) => setManualSnapshotNote(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setManualSnapshotModal(false)}>Batal</Button>
              <Button variant="pupr" size="sm" onClick={handleManualSnapshot}>
                <Save size={14} className="mr-1.5" /> Simpan Snapshot
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT / DIFF SNAPSHOT VERSION */}
      {diffModalSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDiffModalSnapshot(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-900 text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FileDiff size={18} className="text-amber-400" />
                Inspeksi Data Snapshot #{diffModalSnapshot.id} ({new Date(diffModalSnapshot.createdAt).toLocaleString('id-ID')})
              </h3>
              <button onClick={() => setDiffModalSnapshot(null)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Aktivitas:</span>
                  <span className="font-bold text-slate-900">{diffModalSnapshot.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">User / Role:</span>
                  <span className="font-bold text-slate-900">{diffModalSnapshot.userName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Damage Snapshot:</span>
                  <span className="font-bold text-pupr-blue">{diffModalSnapshot.totalDamagePercentage.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Damage Saat Ini:</span>
                  <span className="font-bold text-emerald-600">{totalDamagePercentage.toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-3 tracking-wider">
                  Rincian Nilai Komponen pada Versi Ini
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">ID Elemen</th>
                        <th className="p-2.5">Volume Snapshot</th>
                        <th className="p-2.5">Volume Saat Ini</th>
                        <th className="p-2.5">Catatan Survei</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(diffModalSnapshot.snapshotData || {}).map(([key, item]) => {
                        const currentVol = assessments[key]?.volTotal || 0;
                        const isDiff = item.volTotal !== currentVol;
                        return (
                          <tr key={key} className={isDiff ? 'bg-amber-50/60 font-semibold' : ''}>
                            <td className="p-2.5 font-mono text-slate-800">{key}</td>
                            <td className="p-2.5">{item.volTotal} m²</td>
                            <td className="p-2.5">{currentVol} m²</td>
                            <td className="p-2.5 text-slate-600 line-clamp-1">{item.note || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setDiffModalSnapshot(null)}>Tutup</Button>
              <Button 
                variant="pupr" 
                size="sm"
                onClick={() => {
                  setRevertConfirmModal(diffModalSnapshot);
                  setDiffModalSnapshot(null);
                }}
              >
                <RotateCcw size={14} className="mr-1.5" /> Pulihkan ke Versi Ini
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVERT CONFIRMATION */}
      {revertConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setRevertConfirmModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-3 bg-amber-50 rounded-2xl">
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Konfirmasi Pemulihan Versi (Revert)</h3>
                <p className="text-xs text-slate-500">Pulihkan seluruh parameter penilaian ke versi snapshot</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <p><b>Aksi Snapshot:</b> {revertConfirmModal.action}</p>
              <p><b>Tanggal Versi:</b> {new Date(revertConfirmModal.createdAt).toLocaleString('id-ID')}</p>
              <p><b>Oleh User:</b> {revertConfirmModal.userName} ({revertConfirmModal.userRole})</p>
              <p><b>Target Kerusakan:</b> {revertConfirmModal.totalDamagePercentage.toFixed(1)}%</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Seluruh field dan volume kerusakan saat ini akan dikembalikan ke keadaan pada tanggal tersebut. Sistem akan menyimpan catatan aktivitas pemulihan versi secara otomatis.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setRevertConfirmModal(null)}>Batal</Button>
              <Button 
                onClick={() => handleRevertSnapshot(revertConfirmModal)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
                size="sm"
              >
                <RotateCcw size={14} className="mr-1.5 text-amber-400" /> Ya, Pulihkan Versi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PANDUAN PENGISIAN */}
      {guideModal && activeComponentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setGuideModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-900 text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Info size={18} className="text-pupr-blue" />
                Panduan PUPR: {activeComponentDetails.name}
              </h3>
              <button onClick={() => setGuideModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Metode Perhitungan Volume</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-pupr-blue/10">
                  Untuk komponen <b>{activeComponentDetails.name}</b>, satuan perhitungannya adalah <b>{activeComponentDetails.unit}</b>. 
                  {activeComponentDetails.unit === '%' ? ' Hitung persentase luasan area yang rusak berbanding dengan total luasan keseluruhan.' : 
                   activeComponentDetails.unit === 'unit' ? ' Hitung jumlah unit (titik/buah) yang mengalami kerusakan berbanding dengan total unit.' : 
                   ' Lakukan estimasi visual atau pengukuran memanjang (m1) terhadap komponen yang terdampak.'}
                </p>
              </div>

              {showPhotos && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Kriteria Damage Level (Permen PUPR 22/2018)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {DAMAGE_LEVELS.filter(l => l.value > 0).map(level => {
                      const description = dataPanduan[activeItem]?.[level.value.toString()] || 'Deskripsi panduan kerusakan.';
                      const imgUrl = dataPanduan[activeItem]?.[`${level.value.toString()}_img`];
                      return (
                        <div key={level.value} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
                          <div className="h-20 bg-slate-100 flex items-center justify-center shrink-0 border-b border-slate-200">
                            {imgUrl ? (
                              <img src={imgUrl} className="w-full h-full object-cover" alt={level.label} />
                            ) : (
                              <Camera className="text-slate-300" size={20} />
                            )}
                          </div>
                          <div className="p-3 space-y-1 flex-1 flex flex-col">
                            <Badge variant="outline" className="text-[10px] bg-white font-bold mb-1 self-start">
                              {level.label} ({level.value})
                            </Badge>
                            <p className="text-[11px] text-slate-600 leading-snug flex-1">{description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button onClick={() => setGuideModal(false)} variant="pupr" size="sm">Tutup Panduan</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PHOTO LIGHTBOX */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setPhotoModalOpen(false)}>
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Inspeksi Foto Visual Geotagged (Kolom K-01 Puskesmas Cikajang)</h3>
              <button onClick={() => setPhotoModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="aspect-video w-full rounded-xl bg-black overflow-hidden relative border border-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1518557984649-7b161c230cfa?q=80&w=1200&auto=format&fit=crop" 
                  className="object-cover w-full h-full" 
                  alt="High Res" 
                />
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs font-mono">
                  GPS Tag: -7.3421, 107.8102 (Akurat 2m)
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-800/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-slate-400">Komponen</p>
                  <p className="font-bold text-white">IfcColumn K-01</p>
                </div>
                <div>
                  <p className="text-slate-400">Tipe Defek</p>
                  <p className="font-bold text-red-400">Retak Struktur 1.2mm</p>
                </div>
                <div>
                  <p className="text-slate-400">Confidence AI</p>
                  <p className="font-bold text-emerald-400">98.5% Valid</p>
                </div>
                <div>
                  <p className="text-slate-400">Waktu Ambil</p>
                  <p className="font-bold text-white">01-08-2026 09:15</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <Button onClick={() => setPhotoModalOpen(false)} variant="pupr" size="sm">Selesai Review Foto</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
