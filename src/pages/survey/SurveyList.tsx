import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardGlass } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, Filter, Eye, Trash2, MapPin, 
  Building2, Clock, X, Download, ArrowUpRight
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/contexts/ToastContext';
import jsPDF from 'jspdf';
import { addFooterWithQRCode } from '../../lib/pdf-utils';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';
import { ApplicantDashboard } from '../request/ApplicantDashboard';
import { RequestValidation } from '../admin/RequestValidation';

export interface SurveyItem {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'Selesai' | 'Berjalan' | 'Menunggu Verifikasi' | 'Draft';
  risk: 'Ringan' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi' | '-';
  instansi?: string;
  kodeOpd?: string;
  nup?: string;
  jumlahLantai?: string;
  luas?: string;
  alamat?: string;
  kecamatan?: string;
  desa?: string;
  koordinat?: string;
  deskripsi?: string;
}

const DEFAULT_SURVEYS: SurveyItem[] = [
  { 
    id: 'SRV-001', 
    name: 'SDN 1 Tarogong Kidul', 
    type: 'Sekolah', 
    date: '2026-08-01', 
    status: 'Selesai', 
    risk: 'Ringan',
    instansi: 'Dinas Pendidikan Garut',
    kodeOpd: 'OPD-DISDIK-01',
    nup: 'NUP-2021-001',
    jumlahLantai: '2',
    luas: '450',
    alamat: 'Jl. Raya Garut - Bandung No. 12',
    kecamatan: 'Tarogong Kidul',
    desa: 'Sukagalih',
    koordinat: '-7.2028, 107.8824',
    deskripsi: 'Kerusakan ringan pada genteng dan plesteran dinding retak rambut akibat usia bangunan.'
  },
  { 
    id: 'SRV-002', 
    name: 'Puskesmas Cikajang', 
    type: 'Fasilitas Kesehatan', 
    date: '2026-08-01', 
    status: 'Berjalan', 
    risk: 'Sedang',
    instansi: 'Dinas Kesehatan Garut',
    kodeOpd: 'OPD-DINKES-04',
    nup: 'NUP-2019-088',
    jumlahLantai: '1',
    luas: '320',
    alamat: 'Jl. Stasion Cikajang No. 45',
    kecamatan: 'Cikajang',
    desa: 'Cikajang',
    koordinat: '-7.3512, 107.7910',
    deskripsi: 'Retak pada kolom struktur utama dan kebocoran atap dak beton area selasar IGD.'
  },
  { 
    id: 'SRV-003', 
    name: 'Kantor Kecamatan Bayongbong', 
    type: 'Gedung Pemerintah', 
    date: '2026-07-30', 
    status: 'Menunggu Verifikasi', 
    risk: 'Tinggi',
    instansi: 'Kecamatan Bayongbong',
    kodeOpd: 'OPD-KEC-08',
    nup: 'NUP-2018-012',
    jumlahLantai: '2',
    luas: '600',
    alamat: 'Jl. Raya Bayongbong No. 100',
    kecamatan: 'Bayongbong',
    desa: 'Mulyasari',
    koordinat: '-7.2650, 107.8633',
    deskripsi: 'Lendutan signifikan pada balok lantai 2 dan penurunan pondasi di sisi timur bangunan.'
  },
  { 
    id: 'SRV-004', 
    name: 'SMPN 2 Garut', 
    type: 'Sekolah', 
    date: '2026-07-28', 
    status: 'Draft', 
    risk: '-',
    instansi: 'Dinas Pendidikan Garut',
    kodeOpd: 'OPD-DISDIK-02',
    nup: 'NUP-2022-045',
    jumlahLantai: '2',
    luas: '800',
    alamat: 'Jl. Ahmad Yani No. 88',
    kecamatan: 'Garut Kota',
    desa: 'Pakuwon',
    koordinat: '-7.2144, 107.9022',
    deskripsi: 'Draft awal permohonan penilaian kerusakan laboratorium IPA.'
  },
  { 
    id: 'SRV-005', 
    name: 'RSUD dr. Slamet', 
    type: 'Fasilitas Kesehatan', 
    date: '2026-07-25', 
    status: 'Selesai', 
    risk: 'Sangat Tinggi',
    instansi: 'RSUD dr. Slamet Garut',
    kodeOpd: 'OPD-RSUD-01',
    nup: 'NUP-2015-003',
    jumlahLantai: '3',
    luas: '1200',
    alamat: 'Jl. Rumah Sakit No. 12',
    kecamatan: 'Tarogong Kidul',
    desa: 'Sukakarya',
    koordinat: '-7.2189, 107.8967',
    deskripsi: 'Kerusakan struktur berat pada gedung rawat inap lama pascalempa bumi.'
  },
];

import { useQuery } from '@tanstack/react-query';

export function SurveyList() {
  const navigate = useNavigate();
  const { activeRole } = useRole();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [activeTab, setActiveTab] = useState<'surveys' | 'dashboard' | 'validation'>(
    activeRole === 'Pengelola' ? 'dashboard' : (activeRole === 'Super Administrator' ? 'validation' : 'surveys')
  );

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyItem | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: queryData, isLoading, refetch } = useQuery({
    queryKey: ['surveys', page, limit, debouncedSearch, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(debouncedSearch && { q: debouncedSearch }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(typeFilter !== 'ALL' && { type: typeFilter }),
      });
      const res = await fetch(`/api/surveys?${params}`);
      if (!res.ok) throw new Error('Failed to fetch surveys');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Local state for optimistic updates / offline fallback
  const [localSurveys, setLocalSurveys] = useState<SurveyItem[]>(() => {
    const saved = localStorage.getItem('sipeka_surveys');
    return saved ? JSON.parse(saved) : DEFAULT_SURVEYS;
  });

  const apiSurveys = queryData?.data || [];
  
  // Use API data if available, otherwise fallback to local/mock data filtered
  const isApiActive = apiSurveys.length > 0;
  
  let filteredData = isApiActive ? apiSurveys : localSurveys.filter((item: SurveyItem) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.kecamatan && item.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus data permohonan ${id}?`)) {
      try {
        if (isApiActive) {
          await fetch(`/api/surveys/${id}`, { method: 'DELETE' });
          refetch();
        } else {
          const updated = localSurveys.filter((s: SurveyItem) => s.id !== id);
          setLocalSurveys(updated);
          localStorage.setItem('sipeka_surveys', JSON.stringify(updated));
        }
        if (selectedSurvey?.id === id) {
          setSelectedSurvey(null);
        }
        showToast('Permohonan berhasil dihapus', 'success');
      } catch (err) {
        showToast('Gagal menghapus permohonan', 'error');
      }
    }
  };

  const exportSinglePDF = async (survey: SurveyItem) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SURAT PERMOHONAN PENILAIAN KERUSAKAN BANGUNAN GEDUNG", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Garut, ${survey.date}`, 20, 35);
    doc.text(`ID Permohonan: ${survey.id}`, 20, 42);
    
    doc.setFont("helvetica", "bold");
    doc.text("Kepada Yth.", 20, 52);
    doc.text("Kepala Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Garut", 20, 58);
    
    autoTable(doc, {
      startY: 68,
      theme: 'grid',
      headStyles: { fillColor: [15, 76, 129] },
      body: [
        ['Nama Bangunan', survey.name],
        ['Jenis / Kategori', survey.type],
        ['Instansi / OPD', survey.instansi || '-'],
        ['Kode OPD / NPSN', survey.kodeOpd || '-'],
        ['Jumlah Lantai', `${survey.jumlahLantai || '1'} Lantai`],
        ['Luas Bangunan', `${survey.luas || '-'} m²`],
        ['Alamat', survey.alamat || '-'],
        ['Kecamatan / Desa', `${survey.kecamatan || '-'} / ${survey.desa || '-'}`],
        ['Koordinat GPS', survey.koordinat || '-'],
        ['Status Permohonan', survey.status],
        ['Tingkat Risiko Initial', survey.risk],
      ]
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Deskripsi Indikasi Kerusakan:", 20, finalY);
    doc.setFont("helvetica", "normal");
    const splitDesc = doc.splitTextToSize(survey.deskripsi || 'Tidak ada deskripsi.', pageWidth - 40);
    doc.text(splitDesc, 20, finalY + 7);

    const pageHeight = doc.internal.pageSize.getHeight();
    await addFooterWithQRCode(doc, survey.id, "PENDING", pageHeight, pageWidth);
    doc.save(`Berkas_Permohonan_${survey.id}.pdf`);
  };

  const handleScheduleSurvey = async (survey: SurveyItem) => {
    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+6281234567890',
          type: 'survey_schedule',
          message: `[PURI - PUPR GARUT]\nHalo Pengelola Gedung,\n\nIni adalah PENGINGAT JADWAL SURVEI LAPANGAN untuk bangunan ${survey.name}.\nTim Surveyor Dinas PUPR Kab. Garut akan mengunjungi lokasi dalam waktu dekat.\n\nMohon persiapkan dokumen terkait (DED, As-Built Drawing) jika ada.\n\nSalam, Dinas PUPR Kab. Garut.`
        })
      });
      showToast(`Pengingat jadwal survei berhasil dikirim ke WhatsApp Pengelola (Instansi: ${survey.instansi}) via PURI.`, 'success');
    } catch (error) {
      console.error('Error sending survey reminder:', error);
      showToast('Gagal mengirim pengingat jadwal survei WA.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-6">
        {activeRole === 'Pengelola' && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2",
              activeTab === 'dashboard' ? "border-pupr-blue text-pupr-blue bg-blue-50 dark:bg-pupr-blue/10" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            Dashboard Permohonan
          </button>
        )}
        {activeRole === 'Super Administrator' && (
          <button
            onClick={() => setActiveTab('validation')}
            className={cn(
              "px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2",
              activeTab === 'validation' ? "border-pupr-blue text-pupr-blue bg-blue-50 dark:bg-pupr-blue/10" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            Validasi Permohonan Baru
          </button>
        )}
        <button
          onClick={() => setActiveTab('surveys')}
          className={cn(
            "px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2",
            activeTab === 'surveys' ? "border-pupr-blue text-pupr-blue bg-blue-50 dark:bg-pupr-blue/10" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          Data Survey Lapangan
        </button>
      </div>

      {activeTab === 'dashboard' && <div className="-m-6"><ApplicantDashboard /></div>}
      {activeTab === 'validation' && <div className="-m-6"><RequestValidation /></div>}

      {activeTab === 'surveys' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeRole === 'Pengelola' ? 'Riwayat Permohonan' : 'Data Survey & Permohonan'}
            </h1>
            <Badge variant="pupr" className="text-xs">Tahap 3</Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {activeRole === 'Pengelola' 
              ? 'Kelola permohonan penilaian kerusakan bangunan instansi Anda.'
              : 'Kelola data permohonan penilaian kerusakan bangunan dan hasil survey lapangan.'}
          </p>
        </div>
        {['Super Administrator', 'Pengelola', 'Surveyor'].includes(activeRole) && (
          <Button variant="pupr" onClick={() => navigate('/survey/new')} className="shadow-md shadow-pupr-blue/20">
            <Plus size={18} className="mr-2" />
            Permohonan Baru
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { key: 'ALL', label: 'Semua Status' },
          { key: 'Berjalan', label: 'Berjalan' },
          { key: 'Menunggu Verifikasi', label: 'Menunggu Verifikasi' },
          { key: 'Selesai', label: 'Selesai' },
          { key: 'Draft', label: 'Draft' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
              statusFilter === tab.key 
                ? "bg-pupr-blue text-white shadow-sm shadow-pupr-blue/20" 
                : "bg-white dark:bg-card text-slate-500 dark:text-slate-400 hover:bg-muted dark:hover:bg-slate-800 border border-border/60"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <CardGlass>
        <div className="p-5 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Bangunan Gedung</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total {filteredData.length} entri ditemukan</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pupr-blue transition-colors" size={16} />
                <Input 
                  placeholder="Cari bangunan, ID, kecamatan..." 
                  className="pl-10 bg-muted dark:bg-slate-800 border-transparent focus-visible:border-pupr-blue/40 transition-all rounded-xl" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className={cn(
                  "gap-2 rounded-xl bg-white dark:bg-card border-border/60",
                  typeFilter !== 'ALL' && "border-pupr-blue text-pupr-blue bg-pupr-blue-50 dark:bg-pupr-blue/10"
                )}
                onClick={() => setShowFilterModal(!showFilterModal)}
              >
                <Filter size={16} /> <span className="hidden sm:inline">Filter Kategori</span>
              </Button>
            </div>
          </div>

          {/* Expanded Filter Dropdown */}
          {showFilterModal && (
            <div className="mt-4 p-4 bg-muted/50 dark:bg-slate-800/50 rounded-xl border border-border/60 flex items-center gap-4 animate-fade-in">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filter Kategori Bangunan:</span>
              <div className="flex gap-2 flex-wrap">
                {['ALL', 'Sekolah', 'Fasilitas Kesehatan', 'Gedung Pemerintah'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      typeFilter === t 
                        ? "bg-pupr-blue text-white shadow-sm shadow-pupr-blue/20" 
                        : "bg-white dark:bg-card text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-border/60"
                    )}
                  >
                    {t === 'ALL' ? 'Semua Kategori' : t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 dark:bg-slate-800/30 hover:bg-muted/30 dark:hover:bg-slate-800/30">
                  <TableHead className="w-28 font-semibold text-slate-700 dark:text-slate-300">ID Survey</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Nama Bangunan</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Kategori</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Tanggal</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Tingkat Risiko</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300 px-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      Tidak ada data survey atau permohonan yang sesuai filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="cursor-pointer group transition-colors"
                      onClick={() => setSelectedSurvey(item)}
                    >
                      <TableCell className="font-bold text-pupr-blue dark:text-pupr-blue-light">{item.id}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.kecamatan || 'Kab. Garut'}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 text-xs font-medium">{item.type}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 text-xs">{item.date}</TableCell>
                      <TableCell className="text-center">
                        {item.risk === 'Sangat Tinggi' && <Badge variant="destructive">{item.risk}</Badge>}
                        {item.risk === 'Tinggi' && <Badge variant="warning">{item.risk}</Badge>}
                        {item.risk === 'Sedang' && <Badge variant="info">{item.risk}</Badge>}
                        {item.risk === 'Ringan' && <Badge variant="success">{item.risk}</Badge>}
                        {item.risk === '-' && <span className="text-slate-400 text-xs">-</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.status === 'Selesai' && <Badge variant="success">{item.status}</Badge>}
                        {item.status === 'Berjalan' && <Badge variant="pupr">{item.status}</Badge>}
                        {item.status === 'Menunggu Verifikasi' && <Badge variant="warning">{item.status}</Badge>}
                        {item.status === 'Draft' && <Badge variant="outline">{item.status}</Badge>}
                      </TableCell>
                      <TableCell className="text-right px-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 rounded-lg text-pupr-blue hover:text-pupr-blue hover:bg-pupr-blue-50 dark:hover:bg-pupr-blue/15"
                            onClick={() => setSelectedSurvey(item)}
                          >
                            <Eye size={15} className="mr-1.5" />
                            Detail
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-400 hover:bg-muted dark:hover:bg-slate-800"
                            title="Unduh Berkas PDF"
                            onClick={() => exportSinglePDF(item)}
                          >
                            <Download size={15} />
                          </Button>

                          {['Super Administrator', 'Pengelola'].includes(activeRole) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10"
                              title="Hapus Permohonan"
                              onClick={(e) => handleDelete(item.id, e)}
                            >
                              <Trash2 size={15} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardGlass>

      {/* Detail Modal - Glassmorphism variant */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedSurvey(null)}>
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border/40 bg-muted/30 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pupr-blue to-sky-blue rounded-xl flex items-center justify-center text-white shadow-sm border border-white/20">
                  <Building2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-none">{selectedSurvey.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono border-pupr-blue/30 text-pupr-blue dark:text-pupr-blue-light bg-pupr-blue/5">{selectedSurvey.id}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{selectedSurvey.type} • Diajukan: {selectedSurvey.date}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSurvey(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-muted dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Workflow Stepper Progress */}
              <div className="bg-muted/30 dark:bg-slate-800/30 border border-border/40 rounded-2xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                  <Clock size={14} className="text-pupr-blue" /> Status Workflow Verifikasi
                </h4>
                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                  <div className={cn("p-3 rounded-xl border font-medium transition-colors", selectedSurvey.status !== 'Draft' ? 'bg-pupr-blue/5 border-pupr-blue/30 text-pupr-blue dark:text-pupr-blue-light' : 'bg-white dark:bg-card border-border/60 text-slate-400')}>
                    1. Permohonan
                  </div>
                  <div className={cn("p-3 rounded-xl border font-medium transition-colors", ['Menunggu Verifikasi', 'Berjalan', 'Selesai'].includes(selectedSurvey.status) ? 'bg-pupr-blue/5 border-pupr-blue/30 text-pupr-blue dark:text-pupr-blue-light' : 'bg-white dark:bg-card border-border/60 text-slate-400')}>
                    2. Verifikasi Berkas
                  </div>
                  <div className={cn("p-3 rounded-xl border font-medium transition-colors", ['Berjalan', 'Selesai'].includes(selectedSurvey.status) ? 'bg-pupr-blue/5 border-pupr-blue/30 text-pupr-blue dark:text-pupr-blue-light' : 'bg-white dark:bg-card border-border/60 text-slate-400')}>
                    3. Assessment Lapangan
                  </div>
                  <div className={cn("p-3 rounded-xl border font-medium transition-colors", selectedSurvey.status === 'Selesai' ? 'bg-success/10 border-success/30 text-success' : 'bg-white dark:bg-card border-border/60 text-slate-400')}>
                    4. Laporan Final
                  </div>
                </div>
              </div>

              {/* Data Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="space-y-3 p-5 bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-pupr-blue border-b pb-3 border-border/40">
                    Informasi Instansi
                  </h5>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-slate-500">Instansi / OPD</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedSurvey.instansi || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-slate-500">Kode OPD / NPSN</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{selectedSurvey.kodeOpd || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">NUP Barang</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{selectedSurvey.nup || '-'}</span>
                  </div>
                </div>

                <div className="space-y-3 p-5 bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-pupr-blue border-b pb-3 border-border/40">
                    Spesifikasi Fisik
                  </h5>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-slate-500">Jumlah Lantai</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedSurvey.jumlahLantai || '1'} Lantai</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-slate-500">Luas Bangunan</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedSurvey.luas || '-'} m²</span>
                  </div>
                  <div className="flex justify-between py-1 items-center">
                    <span className="text-slate-500">Tingkat Risiko Initial</span>
                    <Badge variant="outline" className="font-semibold">{selectedSurvey.risk}</Badge>
                  </div>
                </div>
              </div>

              {/* Lokasi & Koordinat */}
              <div className="p-5 bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm space-y-3">
                <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-pupr-blue flex items-center gap-2">
                  <MapPin size={16} /> Lokasi & Koordinat GPS
                </h5>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedSurvey.alamat || 'Alamat tidak diisi'}, Kec. {selectedSurvey.kecamatan || 'Garut'}, Desa {selectedSurvey.desa || '-'}</p>
                {selectedSurvey.koordinat && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted dark:bg-slate-800 border border-border/60 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400">
                    <span>GPS: {selectedSurvey.koordinat}</span>
                  </div>
                )}
              </div>

              {/* Indikasi Kerusakan */}
              <div className="space-y-2">
                <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Catatan Indikasi Kerusakan</h5>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-warning/10 border border-warning/30 p-4 rounded-xl">
                  {selectedSurvey.deskripsi || 'Belum ada catatan deskripsi kerusakan.'}
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-border/40 bg-muted/30 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportSinglePDF(selectedSurvey)}>
                  <Download size={16} className="mr-2" /> Unduh PDF
                </Button>
                {['Super Administrator', 'Kepala Bidang', 'Pengelola'].includes(activeRole) && (
                  <Button variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950" onClick={() => handleScheduleSurvey(selectedSurvey)}>
                    <Clock size={16} className="mr-2" /> Jadwalkan Survei (WA)
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {['Super Administrator', 'Reviewer Teknis', 'Surveyor', 'Kepala Bidang'].includes(activeRole) && (
                  <Button 
                    variant="pupr" 
                    onClick={() => {
                      setSelectedSurvey(null);
                      navigate('/assessment');
                    }}
                  >
                    Lanjutkan Assessment
                    <ArrowUpRight size={16} className="ml-1.5" />
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedSurvey(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* End of Surveys Tab */}
      </div>
      )}
    </div>
  );
}
