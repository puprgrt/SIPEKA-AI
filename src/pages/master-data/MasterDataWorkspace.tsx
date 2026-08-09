import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Plus, Filter, Map, Building2, Hammer, AlertTriangle, FileText, 
  Database, Settings, Activity, LayoutDashboard, FileCode2, BookOpen, Edit, 
  Check, ChevronDown, Trash2, RefreshCw, Sliders, Tag, ShieldCheck, Eye, 
  Download, Upload, Save, X, Layers, Sparkles, Copy, Code, FileCheck, CheckCircle2, AlertCircle
} from 'lucide-react';
import { COMPONENT_GROUPS, WEIGHTS_BY_FLOOR, DAMAGE_LEVELS, COMPONENT_DAMAGE_GUIDES } from '@/lib/assessmentRules';

// Interfaces for Master Data
export interface WilayahItem {
  id: string;
  jenis: 'Kecamatan' | 'Desa / Kelurahan' | 'Kabupaten';
  nama: string;
  parent: string;
  kodePos?: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface InstansiItem {
  id: string;
  jenis: 'Dinas Daerah' | 'Kementerian' | 'Badan / LPD' | 'Kecamatan';
  nama: string;
  singkatan: string;
  kontak: string;
  penanggungJawab: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface BangunanAttrItem {
  id: string;
  jenis: 'Fungsi' | 'Struktur Utama' | 'Klasifikasi' | 'Material';
  nama: string;
  deskripsi: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface KomponenBobotItem {
  id: string;
  kelompok: string;
  nama: string;
  bobot1: number;
  bobot2: number;
  bobot3: number;
  satuan: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface KerusakanItem {
  id: string;
  kategori: 'Aman' | 'Ringan' | 'Sedang' | 'Berat' | 'Sangat Berat';
  nama: string;
  minPercent: number;
  maxPercent: number;
  prioritas: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
  tindakan: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface TemplateItem {
  id: string;
  jenis: 'Form Survey' | 'Laporan BAP' | 'Surat Rekomendasi' | 'Berita Acara' | 'Sertifikat' | 'Formulir perhitungan';
  nama: string;
  versi: string;
  konten: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface PlaceholderItem {
  id: string;
  token: string;
  kategori: 'Bangunan' | 'Surveyor' | 'Assessment' | 'Instansi' | 'Sistem';
  deskripsi: string;
  contohValue: string;
}

export interface AIKnowledgeItem {
  id: string;
  kategori: 'Regulasi' | 'SNI / Standar' | 'SOP Lapangan' | 'Pedoman PUPR';
  judul: string;
  deskripsi: string;
  fileSource?: string;
  diindeks: string;
  status: 'Terindeks' | 'Perlu Sync' | 'Draft';
}

export interface WorkflowStageItem {
  id: string;
  stageNumber: number;
  nama: string;
  roleAkses: string[];
  slaHours: number;
  deskripsi: string;
  status: 'Aktif' | 'Non-Aktif';
}

// Default initial datasets
const INITIAL_WILAYAH: WilayahItem[] = [
  { id: '320501', jenis: 'Kecamatan', nama: 'Garut Kota', parent: 'Kab. Garut', kodePos: '44111', status: 'Aktif' },
  { id: '320502', jenis: 'Kecamatan', nama: 'Karangpawitan', parent: 'Kab. Garut', kodePos: '44182', status: 'Aktif' },
  { id: '320503', jenis: 'Kecamatan', nama: 'Wanaraja', parent: 'Kab. Garut', kodePos: '44183', status: 'Aktif' },
  { id: '320504', jenis: 'Kecamatan', nama: 'Tarogong Kaler', parent: 'Kab. Garut', kodePos: '44151', status: 'Aktif' },
  { id: '320505', jenis: 'Kecamatan', nama: 'Tarogong Kidul', parent: 'Kab. Garut', kodePos: '44151', status: 'Aktif' },
  { id: '320506', jenis: 'Kecamatan', nama: 'Cikajang', parent: 'Kab. Garut', kodePos: '44171', status: 'Aktif' },
  { id: '320507', jenis: 'Kecamatan', nama: 'Bayongbong', parent: 'Kab. Garut', kodePos: '44162', status: 'Aktif' },
];

const INITIAL_INSTANSI: InstansiItem[] = [
  { id: 'ins-1', jenis: 'Dinas Daerah', nama: 'Dinas Pekerjaan Umum dan Penataan Ruang', singkatan: 'PUPR', kontak: 'pupr@garutkab.go.id', penanggungJawab: 'Ir. H. Luna Setiadi, M.T.', status: 'Aktif' },
  { id: 'ins-2', jenis: 'Dinas Daerah', nama: 'Dinas Pendidikan Kabupaten Garut', singkatan: 'DISDIK', kontak: 'disdik@garutkab.go.id', penanggungJawab: 'Dr. Ade Sumarna, M.Pd.', status: 'Aktif' },
  { id: 'ins-3', jenis: 'Dinas Daerah', nama: 'Dinas Kesehatan Kabupaten Garut', singkatan: 'DINKES', kontak: 'dinkes@garutkab.go.id', penanggungJawab: 'dr. H. Leli Yuliani', status: 'Aktif' },
  { id: 'ins-4', jenis: 'Badan / LPD', nama: 'Badan Penanggulangan Bencana Daerah', singkatan: 'BPBD', kontak: 'bpbd@garutkab.go.id', penanggungJawab: 'Drs. Aah Anwar', status: 'Aktif' },
  { id: 'ins-5', jenis: 'Dinas Daerah', nama: 'Dinas Perumahan dan Kawasan Permukiman', singkatan: 'DISKIMRUM', kontak: 'diskimrum@garutkab.go.id', penanggungJawab: 'Ahmad Mulyana, S.T.', status: 'Aktif' },
];

const INITIAL_BANGUNAN_ATTR: BangunanAttrItem[] = [
  { id: 'bgn-1', jenis: 'Fungsi', nama: 'Fasilitas Pendidikan', deskripsi: 'Gedung Sekolah SD, SMP, SMA, Gedung Rektorat & Laboratorium', status: 'Aktif' },
  { id: 'bgn-2', jenis: 'Fungsi', nama: 'Fasilitas Kesehatan', deskripsi: 'Rumah Sakit Umum/Daerah, Puskesmas Pembantu, Klinik', status: 'Aktif' },
  { id: 'bgn-3', jenis: 'Fungsi', nama: 'Gedung Pemerintahan & Perkantoran', deskripsi: 'Kantor Dinas, Kantor Kecamatan, Kantor Desa, Gedung OPD', status: 'Aktif' },
  { id: 'bgn-4', jenis: 'Struktur Utama', nama: 'Beton Bertulang (RC Frame)', deskripsi: 'Rangka beton bertulang cor di tempat atau pracetak', status: 'Aktif' },
  { id: 'bgn-5', jenis: 'Struktur Utama', nama: 'Baja Profil (Steel Structural)', deskripsi: 'Struktur rangka baja I-Beam/WF dengan landasan beton', status: 'Aktif' },
  { id: 'bgn-6', jenis: 'Klasifikasi', nama: 'Bangunan Gedung Tidak Sederhana', deskripsi: 'Bertingkat > 2 lantai atau luas > 500 m2 dengan spesifikasi khusus', status: 'Aktif' },
];

const INITIAL_KOMPONEN: KomponenBobotItem[] = COMPONENT_GROUPS.flatMap(group => 
  group.items.map(item => ({
    id: item.id,
    kelompok: group.title,
    nama: item.name,
    satuan: item.unit,
    bobot1: WEIGHTS_BY_FLOOR[1][item.id] || 0,
    bobot2: WEIGHTS_BY_FLOOR[2][item.id] || 0,
    bobot3: WEIGHTS_BY_FLOOR[3][item.id] || 0,
    status: 'Aktif' as const
  }))
);

const INITIAL_KERUSAKAN: KerusakanItem[] = [
  { id: 'kr-1', kategori: 'Aman', nama: 'Kondisi Baik / Pemeliharaan Rutin', minPercent: 0, maxPercent: 0, prioritas: 'Rendah', tindakan: 'Pemeliharaan kebersihan dan pengecatan rutin tahunan', status: 'Aktif' },
  { id: 'kr-2', kategori: 'Ringan', nama: 'Kerusakan Ringan (PUPR < 30%)', minPercent: 0.1, maxPercent: 30, prioritas: 'Rendah', tindakan: 'Perbaikan non-struktural (plafon, penutup atap, cat, engsel)', status: 'Aktif' },
  { id: 'kr-3', kategori: 'Sedang', nama: 'Kerusakan Sedang (PUPR 30% - 45%)', minPercent: 30.1, maxPercent: 45, prioritas: 'Sedang', tindakan: 'Perbaikan sebagian komponen struktur & arsitektur, waterproofing', status: 'Aktif' },
  { id: 'kr-4', kategori: 'Berat', nama: 'Kerusakan Berat (PUPR 45.1% - 65%)', minPercent: 45.1, maxPercent: 65, prioritas: 'Tinggi', tindakan: 'Perkuatan struktur (retrofitting), perbaikan balok/kolom utama', status: 'Aktif' },
  { id: 'kr-5', kategori: 'Sangat Berat', nama: 'Sangat Berat / Hancur Total (> 65%)', minPercent: 65.1, maxPercent: 100, prioritas: 'Sangat Tinggi', tindakan: 'Pengosongan bangunan, perobohan, dan rekonstruksi ulang total', status: 'Aktif' },
];

const INITIAL_TEMPLATES: TemplateItem[] = [
  { id: 'tmp-1', jenis: 'Formulir perhitungan', nama: 'Formulir Asesmen Kerusakan Lapangan Form A/B/C', versi: 'v2.1', konten: `FORMULIR PERHITUNGAN TINGKAT KERUSAKAN BANGUNAN GEDUNG (Form A/B/C)
Berdasarkan Panduan Kementerian PUPR

I. IDENTITAS BANGUNAN
Nama Bangunan : {{NAMA_BANGUNAN}}
Lokasi        : {{KECAMATAN}}, Kabupaten Garut
Surveyor      : {{SURVEYOR_NAMA}}
Tanggal       : {{TANGGAL_SURVEY}}

II. TABEL PERHITUNGAN KERUSAKAN
===================================================================================
| NO | KOMPONEN / SUB-KOMPONEN | TINGKAT KERUSAKAN (%) | BOBOT (%) | HASIL (%)  |
===================================================================================
| 1  | STRUKTUR                |                       |           |            |
|    | a. Pondasi              |                       |           |            |
|    | b. Kolom                |                       |           |            |
|    | c. Balok                |                       |           |            |
|    | d. Pelat Lantai         |                       |           |            |
|    | e. Atap                 |                       |           |            |
|----|-------------------------|-----------------------|-----------|------------|
| 2  | ARSITEKTUR              |                       |           |            |
|    | a. Dinding              |                       |           |            |
|    | b. Plafon               |                       |           |            |
|    | c. Lantai               |                       |           |            |
|    | d. Pintu & Jendela      |                       |           |            |
|    | e. Finishing            |                       |           |            |
|----|-------------------------|-----------------------|-----------|------------|
| 3  | UTILITAS (MEP)          |                       |           |            |
|    | a. Instalasi Listrik    |                       |           |            |
|    | b. Instalasi Air        |                       |           |            |
|    | c. Tata Udara (HVAC)    |                       |           |            |
|    | d. Sanitasi             |                       |           |            |
===================================================================================

III. KESIMPULAN
TOTAL TINGKAT KERUSAKAN : {{PERSEN_KERUSAKAN}} %
KATEGORI KERUSAKAN      : {{KATEGORI_KERUSAKAN}}
ESTIMASI BIAYA          : Rp {{ESTIMASI_BIAYA}}

IV. CATATAN TEKNIS SURVEYOR
{{CATATAN_SURVEYOR}}`, status: 'Aktif' },
  { id: 'tmp-2', jenis: 'Laporan BAP', nama: 'Berita Acara Penilaian & Verifikasi (BAP PUPR)', versi: 'v1.4', konten: 'PEMERINTAH KABUPATEN GARUT\nDINAS PEKERJAAN UMUM DAN PENATAAN RUANG\n\nBERITA ACARA PENILAIAN KERUSAKAN\nNomor: BAP/PUPR/{{ID_ASSESSMENT}}\n\nTelah diverifikasi bahwa {{NAMA_BANGUNAN}} mengalami tingkat kerusakan sebesar {{PERSEN_KERUSAKAN}}% dengan kategori {{KATEGORI_KERUSAKAN}}.\n\nDisetujui oleh Reviewer: {{REVIEWER_NAMA}}', status: 'Aktif' },
  { id: 'tmp-3', jenis: 'Surat Rekomendasi', nama: 'Surat Rekomendasi Alokasi Anggaran Rehabilitasi', versi: 'v1.0', konten: 'SURAT REKOMENDASI PERBAIKAN\nKepada Yth. Kepala Dinas PUPR / Bupati Garut\n\nBerdasarkan penilaian tim teknis, Bangunan {{NAMA_BANGUNAN}} direkomendasikan mendapat alokasi anggaran perbaikan sebesar Rp {{ESTIMASI_BIAYA}}.', status: 'Aktif' },
];

const INITIAL_PLACEHOLDERS: PlaceholderItem[] = [
  { id: 'ph-1', token: '{{NAMA_BANGUNAN}}', kategori: 'Bangunan', deskripsi: 'Nama resmi gedung/sekolah/puskesmas', contohValue: 'SDN 1 Tarogong Kidul' },
  { id: 'ph-2', token: '{{ID_ASSESSMENT}}', kategori: 'Assessment', deskripsi: 'Kode unik identifikasi assessment SIPEKA', contohValue: 'ASM-2026-001' },
  { id: 'ph-3', token: '{{PERSEN_KERUSAKAN}}', kategori: 'Assessment', deskripsi: 'Nilai persentase total kerusakan hasil bobot PUPR', contohValue: '28.5' },
  { id: 'ph-4', token: '{{KATEGORI_KERUSAKAN}}', kategori: 'Assessment', deskripsi: 'Kategori risiko (Ringan, Sedang, Berat)', contohValue: 'Sedang' },
  { id: 'ph-5', token: '{{SURVEYOR_NAMA}}', kategori: 'Surveyor', deskripsi: 'Nama lengkap surveyor yang bertugas di lapangan', contohValue: 'Budi Santoso, S.T.' },
  { id: 'ph-6', token: '{{KECAMATAN}}', kategori: 'Bangunan', deskripsi: 'Nama wilayah kecamatan lokasi bangunan', contohValue: 'Tarogong Kidul' },
  { id: 'ph-7', token: '{{TANGGAL_SURVEY}}', kategori: 'Assessment', deskripsi: 'Tanggal pelaksanaan inspeksi fisik', contohValue: '01 Agustus 2026' },
  { id: 'ph-8', token: '{{ESTIMASI_BIAYA}}', kategori: 'Assessment', deskripsi: 'Estimasi nilai biaya perbaikan indikatif (Rp)', contohValue: '185.000.000' },
];

const INITIAL_AI_KNOWLEDGE: AIKnowledgeItem[] = [
  { id: 'kb-1', kategori: 'Regulasi', judul: 'Permen PUPR No. 22/PRT/M/2018', deskripsi: 'Pedoman Pembangunan Bangunan Gedung Negara (Tabel Bobot Persentase Komponen & Sub-Komponen)', fileSource: 'Permen_PUPR_22_2018.pdf', diindeks: '2 Jam lalu', status: 'Terindeks' },
  { id: 'kb-2', kategori: 'SNI / Standar', judul: 'SNI 2847:2019', deskripsi: 'Persyaratan Beton Struktural Untuk Bangunan Gedung & Evaluasi Retak Kolom/Balok', fileSource: 'SNI_2847_2019_Beton.pdf', diindeks: '1 Hari lalu', status: 'Terindeks' },
  { id: 'kb-3', kategori: 'Regulasi', judul: 'PP No. 16 Tahun 2021', deskripsi: 'Peraturan Pelaksanaan UU No. 28/2002 tentang Bangunan Gedung (SLF, SIMBG, Tolok Ukur Keandalan)', fileSource: 'PP_16_2021_BangunanGedung.pdf', diindeks: '3 Hari lalu', status: 'Terindeks' },
  { id: 'kb-4', kategori: 'SOP Lapangan', judul: 'SOP Visual Assessment Kerusakan Fisik Dinas PUPR Garut', deskripsi: 'Panduan teknis inspeksi cepat kaji cepat paska bencana atau permohonan dinas', fileSource: 'SOP_PUPR_Garut_VisualCheck.pdf', diindeks: '5 Hari lalu', status: 'Terindeks' },
];

const INITIAL_WORKFLOW_STAGES: WorkflowStageItem[] = [
  { id: 'wf-1', stageNumber: 1, nama: 'Permohonan & Registrasi', roleAkses: ['Pengelola', 'Super Administrator'], slaHours: 24, deskripsi: 'Penerimaan permohonan verifikasi dari OPD/Sekolah dan kelengkapan dokumen administratif.', status: 'Aktif' },
  { id: 'wf-2', stageNumber: 2, nama: 'Penugasan Surveyor', roleAkses: ['Kepala Bidang', 'Super Administrator'], slaHours: 12, deskripsi: 'Penerbitan Surat Tugas dan penunjukan surveyor teknis ke lokasi bangunan.', status: 'Aktif' },
  { id: 'wf-3', stageNumber: 3, nama: 'Survey & Pengujian Fisik', roleAkses: ['Surveyor', 'Super Administrator'], slaHours: 48, deskripsi: 'Pengisian Form A/B/C, dokumentasi foto kerusakan, dan tagging koordinat GPS.', status: 'Aktif' },
  { id: 'wf-4', stageNumber: 4, nama: 'Kalkulasi Assessment & AI', roleAkses: ['Reviewer Teknis', 'Surveyor', 'Super Administrator'], slaHours: 12, deskripsi: 'Kalkulasi otomatis bobot PUPR dan rekomendasi analisis AI Engine.', status: 'Aktif' },
  { id: 'wf-5', stageNumber: 5, nama: 'Review & BAP Verifikasi', roleAkses: ['Reviewer Teknis', 'Kepala Bidang', 'Super Administrator'], slaHours: 24, deskripsi: 'Verifikasi teknis, koreksi catatan, dan penandatanganan Berita Acara Penilaian (BAP).', status: 'Aktif' },
  { id: 'wf-6', stageNumber: 6, nama: 'Persetujuan Final & Laporan', roleAkses: ['Kepala Dinas', 'Super Administrator'], slaHours: 24, deskripsi: 'Persetujuan akhir alokasi anggaran dan pengarsipan sertifikat keandalan.', status: 'Aktif' },
];

const PANDUAN_DAMAGE_LEVELS = [
  { key: '0', label: 'Tingkat 1 - Tidak Rusak (0%)', bg: 'bg-slate-50', border: 'border-slate-200', titleColor: 'text-slate-800' },
  { key: '0.2', label: 'Tingkat 2 - Sangat Ringan (1-20%)', bg: 'bg-emerald-50', border: 'border-emerald-200', titleColor: 'text-emerald-800' },
  { key: '0.35', label: 'Tingkat 3 - Ringan (21-35%)', bg: 'bg-teal-50', border: 'border-teal-200', titleColor: 'text-teal-800' },
  { key: '0.5', label: 'Tingkat 4 - Sedang (36-50%)', bg: 'bg-yellow-50', border: 'border-yellow-200', titleColor: 'text-yellow-800' },
  { key: '0.7', label: 'Tingkat 5 - Berat (51-70%)', bg: 'bg-orange-50', border: 'border-orange-200', titleColor: 'text-orange-800' },
  { key: '0.85', label: 'Tingkat 6 - Sangat Berat (71-85%)', bg: 'bg-red-50', border: 'border-red-200', titleColor: 'text-red-800' },
  { key: '1', label: 'Tingkat 7 - Hancur / Tidak Sesuai', bg: 'bg-rose-50', border: 'border-rose-200', titleColor: 'text-rose-800' },
];

export function MasterDataWorkspace() {
  // LocalStorage persisted states
  const [dataWilayah, setDataWilayah] = useState<WilayahItem[]>(() => {
    const s = localStorage.getItem('sipeka_master_wilayah');
    return s ? JSON.parse(s) : INITIAL_WILAYAH;
  });

  const [dataInstansi, setDataInstansi] = useState<InstansiItem[]>(() => {
    const s = localStorage.getItem('sipeka_master_instansi');
    return s ? JSON.parse(s) : INITIAL_INSTANSI;
  });

  const [dataBangunan, setDataBangunan] = useState<BangunanAttrItem[]>(() => {
    const s = localStorage.getItem('sipeka_master_bangunan');
    return s ? JSON.parse(s) : INITIAL_BANGUNAN_ATTR;
  });

  const [dataKomponen, setDataKomponen] = useState<KomponenBobotItem[]>(() => {
    const s = localStorage.getItem('sipeka_master_komponen');
    return s ? JSON.parse(s) : INITIAL_KOMPONEN;
  });

  const [dataKerusakan, setDataKerusakan] = useState<KerusakanItem[]>(() => {
    const s = localStorage.getItem('sipeka_master_kerusakan');
    return s ? JSON.parse(s) : INITIAL_KERUSAKAN;
  });

  
  const [dataPanduan, setDataPanduan] = useState<Record<string, any>>(() => {
    const s = localStorage.getItem('sipeka_master_panduan');
    return s ? JSON.parse(s) : COMPONENT_DAMAGE_GUIDES;
  });

  useEffect(() => { localStorage.setItem('sipeka_master_panduan', JSON.stringify(dataPanduan)); }, [dataPanduan]);

  const [dataTemplate, setDataTemplate] = useState<TemplateItem[]>(() => {
    const s = localStorage.getItem('sipeka_master_template');
    return s ? JSON.parse(s) : INITIAL_TEMPLATES;
  });

  const [dataPlaceholders, setDataPlaceholders] = useState<PlaceholderItem[]>(() => {
    const s = localStorage.getItem('sipeka_master_placeholders');
    return s ? JSON.parse(s) : INITIAL_PLACEHOLDERS;
  });

  const [dataKnowledge, setDataKnowledge] = useState<AIKnowledgeItem[]>(() => {
    const s = localStorage.getItem('sipeka_master_knowledge');
    return s ? JSON.parse(s) : INITIAL_AI_KNOWLEDGE;
  });

  const [dataWorkflow, setDataWorkflow] = useState<WorkflowStageItem[]>(() => {
    const s = localStorage.getItem('sipeka_master_workflow');
    return s ? JSON.parse(s) : INITIAL_WORKFLOW_STAGES;
  });

  const [sysSettings, setSysSettings] = useState(() => {
    const s = localStorage.getItem('sipeka_sys_settings');
    return s ? JSON.parse(s) : {
      namaAplikasi: 'SIPEKA PUPR Kabupaten Garut',
      versiApp: 'v2.5.0-Release',
      tahunAnggaran: '2026',
      defaultGisMap: 'OpenStreetMap Standard',
      aiModelDefault: 'gemini-3.1-pro-preview',
      autoIndexKnowledge: true,
      maxFileUploadMb: 15,
      kopSuratHeader: 'PEMERINTAH KABUPATEN GARUT - DINAS PEKERJAAN UMUM DAN PENATAAN RUANG'
    };
  });

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('sipeka_master_wilayah', JSON.stringify(dataWilayah)); }, [dataWilayah]);
  useEffect(() => { localStorage.setItem('sipeka_master_instansi', JSON.stringify(dataInstansi)); }, [dataInstansi]);
  useEffect(() => { localStorage.setItem('sipeka_master_bangunan', JSON.stringify(dataBangunan)); }, [dataBangunan]);
  useEffect(() => { localStorage.setItem('sipeka_master_komponen', JSON.stringify(dataKomponen)); }, [dataKomponen]);
  useEffect(() => { localStorage.setItem('sipeka_master_kerusakan', JSON.stringify(dataKerusakan)); }, [dataKerusakan]);
  useEffect(() => { localStorage.setItem('sipeka_master_template', JSON.stringify(dataTemplate)); }, [dataTemplate]);
  useEffect(() => { localStorage.setItem('sipeka_master_placeholders', JSON.stringify(dataPlaceholders)); }, [dataPlaceholders]);
  useEffect(() => { localStorage.setItem('sipeka_master_knowledge', JSON.stringify(dataKnowledge)); }, [dataKnowledge]);
  useEffect(() => { localStorage.setItem('sipeka_master_workflow', JSON.stringify(dataWorkflow)); }, [dataWorkflow]);
  useEffect(() => { localStorage.setItem('sipeka_sys_settings', JSON.stringify(sysSettings)); }, [sysSettings]);

  const [activeTab, setActiveTab] = useState<string>('komponen');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT' | 'PREVIEW'>('ADD');
  const [modalCategory, setModalCategory] = useState<string>('');
  const [editingItem, setEditingItem] = useState<any>({});
  const [confirmDialog, setConfirmDialog] = useState<{message: string, onConfirm: () => void} | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = (cat: string) => {
    setModalCategory(cat);
    setModalMode('ADD');
    setEditingItem({ status: 'Aktif' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: string, item: any) => {
    setModalCategory(cat);
    setModalMode('EDIT');
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleOpenPreviewModal = (cat: string, item: any) => {
    setModalCategory(cat);
    setModalMode('PREVIEW');
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (cat: string, id: string) => {
    setConfirmDialog({
      message: 'Apakah Anda yakin ingin menghapus data master ini?',
      onConfirm: () => {
        if (cat === 'wilayah') setDataWilayah(prev => prev.filter(i => i.id !== id));
        if (cat === 'instansi') setDataInstansi(prev => prev.filter(i => i.id !== id));
        if (cat === 'bangunan') setDataBangunan(prev => prev.filter(i => i.id !== id));
        if (cat === 'komponen') setDataKomponen(prev => prev.filter(i => i.id !== id));
        if (cat === 'kerusakan') setDataKerusakan(prev => prev.filter(i => i.id !== id));
        if (cat === 'template') setDataTemplate(prev => prev.filter(i => i.id !== id));
        if (cat === 'placeholder') setDataPlaceholders(prev => prev.filter(i => i.id !== id));
        if (cat === 'knowledge') setDataKnowledge(prev => prev.filter(i => i.id !== id));
        if (cat === 'workflow') setDataWorkflow(prev => prev.filter(i => i.id !== id));

        showToast('Data berhasil dihapus dari Master Data.');
      }
    });
  };

  
  const handleImageUpload = (level, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingItem(prev => ({ ...prev, [`${level}_img`]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveModal = () => {
    if (modalCategory === 'wilayah') {
      if (modalMode === 'ADD') {
        const newItem: WilayahItem = {
          id: editingItem.id || '3205' + Math.floor(10 + Math.random() * 90),
          jenis: editingItem.jenis || 'Kecamatan',
          nama: editingItem.nama || 'Kecamatan Baru',
          parent: editingItem.parent || 'Kab. Garut',
          kodePos: editingItem.kodePos || '44100',
          status: editingItem.status || 'Aktif'
        };
        setDataWilayah(prev => [...prev, newItem]);
      } else {
        setDataWilayah(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...editingItem } : i));
      }
    }

    if (modalCategory === 'instansi') {
      if (modalMode === 'ADD') {
        const newItem: InstansiItem = {
          id: 'ins-' + Date.now(),
          jenis: editingItem.jenis || 'Dinas Daerah',
          nama: editingItem.nama || 'Dinas Baru',
          singkatan: editingItem.singkatan || 'DINAS',
          kontak: editingItem.kontak || 'kontak@garutkab.go.id',
          penanggungJawab: editingItem.penanggungJawab || 'Kepala Dinas',
          status: editingItem.status || 'Aktif'
        };
        setDataInstansi(prev => [...prev, newItem]);
      } else {
        setDataInstansi(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...editingItem } : i));
      }
    }

    if (modalCategory === 'bangunan') {
      if (modalMode === 'ADD') {
        const newItem: BangunanAttrItem = {
          id: 'bgn-' + Date.now(),
          jenis: editingItem.jenis || 'Fungsi',
          nama: editingItem.nama || 'Atribut Bangunan',
          deskripsi: editingItem.deskripsi || 'Deskripsi singkat atribut',
          status: editingItem.status || 'Aktif'
        };
        setDataBangunan(prev => [...prev, newItem]);
      } else {
        setDataBangunan(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...editingItem } : i));
      }
    }

    if (modalCategory === 'komponen') {
      if (modalMode === 'ADD') {
        const newItem: KomponenBobotItem = {
          id: 'kmp-' + Date.now(),
          kelompok: editingItem.kelompok || 'Struktur',
          nama: editingItem.nama || 'Komponen Baru',
          satuan: editingItem.satuan || 'm2',
          bobot1: Number(editingItem.bobot1) || 0,
          bobot2: Number(editingItem.bobot2) || 0,
          bobot3: Number(editingItem.bobot3) || 0,
          status: editingItem.status || 'Aktif'
        };
        setDataKomponen(prev => [...prev, newItem]);
      } else {
        setDataKomponen(prev => prev.map(i => i.id === editingItem.id ? { 
          ...i, 
          ...editingItem,
          bobot1: Number(editingItem.bobot1),
          bobot2: Number(editingItem.bobot2),
          bobot3: Number(editingItem.bobot3)
        } : i));
      }
    }

    if (modalCategory === 'kerusakan') {
      if (modalMode === 'ADD') {
        const newItem: KerusakanItem = {
          id: 'kr-' + Date.now(),
          kategori: editingItem.kategori || 'Ringan',
          nama: editingItem.nama || 'Tingkat Kerusakan Baru',
          minPercent: Number(editingItem.minPercent) || 0,
          maxPercent: Number(editingItem.maxPercent) || 20,
          prioritas: editingItem.prioritas || 'Sedang',
          tindakan: editingItem.tindakan || 'Tindakan usulan perbaikan',
          status: editingItem.status || 'Aktif'
        };
        setDataKerusakan(prev => [...prev, newItem]);
      } else {
        setDataKerusakan(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...editingItem } : i));
      }
    }

    if (modalCategory === 'template') {
      if (modalMode === 'ADD') {
        const newItem: TemplateItem = {
          id: 'tmp-' + Date.now(),
          jenis: editingItem.jenis || 'Form Survey',
          nama: editingItem.nama || 'Template Dokumen Baru',
          versi: editingItem.versi || 'v1.0',
          konten: editingItem.konten || 'Isi template dokumen dengan {{NAMA_BANGUNAN}}...',
          status: editingItem.status || 'Aktif'
        };
        setDataTemplate(prev => [...prev, newItem]);
      } else {
        setDataTemplate(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...editingItem } : i));
      }
    }

    if (modalCategory === 'placeholder') {
      if (modalMode === 'ADD') {
        const newItem: PlaceholderItem = {
          id: 'ph-' + Date.now(),
          token: editingItem.token?.startsWith('{{') ? editingItem.token : `{{${editingItem.token || 'TOKEN'}}`,
          kategori: editingItem.kategori || 'Assessment',
          deskripsi: editingItem.deskripsi || 'Deskripsi variabel token',
          contohValue: editingItem.contohValue || 'Contoh Nilai'
        };
        setDataPlaceholders(prev => [...prev, newItem]);
      } else {
        setDataPlaceholders(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...editingItem } : i));
      }
    }

    if (modalCategory === 'knowledge') {
      if (modalMode === 'ADD') {
        const newItem: AIKnowledgeItem = {
          id: 'kb-' + Date.now(),
          kategori: editingItem.kategori || 'Regulasi',
          judul: editingItem.judul || 'Judul Referensi Regulasi',
          deskripsi: editingItem.deskripsi || 'Deskripsi acuan hukum/SNI',
          fileSource: editingItem.fileSource || 'Dokumen_Acuan.pdf',
          diindeks: 'Baru saja',
          status: 'Terindeks'
        };
        setDataKnowledge(prev => [...prev, newItem]);
      } else {
        setDataKnowledge(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...editingItem } : i));
      }
    }

    
    if (modalCategory === 'panduan') {
      setDataPanduan(prev => ({
        ...prev,
        [editingItem.itemId]: {
          ...(prev[editingItem.itemId] || {}),
          '0': editingItem['0'],
          '0.2': editingItem['0.2'],
          '0.35': editingItem['0.35'],
          '0.5': editingItem['0.5'],
          '0.7': editingItem['0.7'],
          '0.85': editingItem['0.85'],
          '1': editingItem['1'],
          '0_img': editingItem['0_img'],
          '0.2_img': editingItem['0.2_img'],
          '0.35_img': editingItem['0.35_img'],
          '0.5_img': editingItem['0.5_img'],
          '0.7_img': editingItem['0.7_img'],
          '0.85_img': editingItem['0.85_img'],
          '1_img': editingItem['1_img'],
        }
      }));
    }

    if (modalCategory === 'workflow') {
      if (modalMode === 'ADD') {
        const newItem: WorkflowStageItem = {
          id: 'wf-' + Date.now(),
          stageNumber: dataWorkflow.length + 1,
          nama: editingItem.nama || 'Tahap Workflow Baru',
          roleAkses: editingItem.roleAkses || ['Super Administrator'],
          slaHours: Number(editingItem.slaHours) || 24,
          deskripsi: editingItem.deskripsi || 'Deskripsi prosedur workflow',
          status: editingItem.status || 'Aktif'
        };
        setDataWorkflow(prev => [...prev, newItem]);
      } else {
        setDataWorkflow(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...editingItem } : i));
      }
    }

    setIsModalOpen(false);
    showToast('Perubahan Master Data berhasil disimpan!');
  };

  // Reset to default
  const handleResetDefaults = () => {
    setConfirmDialog({
      message: 'Apakah Anda ingin mengembalikan seluruh Master Data ke pengaturan standar PUPR?',
      onConfirm: () => {
        setDataWilayah(INITIAL_WILAYAH);
        setDataInstansi(INITIAL_INSTANSI);
        setDataBangunan(INITIAL_BANGUNAN_ATTR);
        setDataKomponen(INITIAL_KOMPONEN);
        setDataKerusakan(INITIAL_KERUSAKAN);
        setDataTemplate(INITIAL_TEMPLATES);
        setDataPlaceholders(INITIAL_PLACEHOLDERS);
        setDataKnowledge(INITIAL_AI_KNOWLEDGE);
        setDataWorkflow(INITIAL_WORKFLOW_STAGES);
        showToast('Seluruh Master Data berhasil direset ke standar PUPR.');
      }
    });
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupObj = {
      dataWilayah, dataInstansi, dataBangunan, dataKomponen, 
      dataKerusakan, dataTemplate, dataPlaceholders, dataKnowledge, 
      dataWorkflow, sysSettings, timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIPEKA_MasterData_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('File backup master data JSON berhasil diunduh.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 border border-slate-700">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Master Data & Konfigurasi SIPEKA</h1>
            <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/5 font-semibold">Tahap 5</Badge>
          </div>
          <p className="text-slate-500">
            Pusat pengelolaan acuan referensi wilayah, instansi, komponen bobot PUPR, template dokumen, AI Knowledge Base, dan workflow bisnis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportBackup} className="bg-white">
            <Download size={15} className="mr-1.5" /> Backup JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetDefaults} className="bg-white text-slate-600 hover:text-red-600">
            <RefreshCw size={15} className="mr-1.5" /> Reset Default
          </Button>
        </div>
      </div>

      {/* Grid Layout Tabs & Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1.5 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm h-fit">
          <p className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kategori Master Data</p>
          
          {[
            { key: 'komponen', icon: Hammer, label: 'Komponen & Bobot PUPR', count: dataKomponen.length },
            { key: 'wilayah', icon: Map, label: 'Master Wilayah (Kecamatan)', count: dataWilayah.length },
            { key: 'instansi', icon: Building2, label: 'Master Instansi & OPD', count: dataInstansi.length },
            { key: 'bangunan', icon: Layers, label: 'Master Atribut Bangunan', count: dataBangunan.length },
            { key: 'kerusakan', icon: AlertTriangle, label: 'Kategori & Tingkat Kerusakan', count: dataKerusakan.length },
            { key: 'panduan', icon: BookOpen, label: 'Panduan Assessment Rubrik', count: 12 },
            { key: 'template', icon: FileText, label: 'Template Dokumen BAP', count: dataTemplate.length },
            { key: 'placeholder', icon: FileCode2, label: 'Placeholder Token Manager', count: dataPlaceholders.length },
            { key: 'database', icon: Database, label: 'AI Knowledge Base (RAG)', count: dataKnowledge.length },
            { key: 'workflow', icon: Activity, label: 'Workflow & Matriks Akses', count: dataWorkflow.length },
            { key: 'system', icon: Settings, label: 'Pengaturan Sistem PUPR' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearchTerm(''); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                  isActive 
                    ? 'bg-pupr-blue text-white shadow-md shadow-pupr-blue/20' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon size={16} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panel Content Area */}
        <div className="lg:col-span-3">

          {/* TAB 1: KOMPONEN & BOBOT PUPR */}
          {activeTab === 'komponen' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Master Komponen & Bobot PUPR (Form A, B, C)</CardTitle>
                    <CardDescription>Standar bobot persentase komponen untuk kaji cepat kerusakan bangunan 1, 2, dan 3+ lantai</CardDescription>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => handleOpenAddModal('komponen')}>
                    <Plus size={16} className="mr-1.5" /> Tambah Komponen
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      placeholder="Cari komponen, kelompok..." 
                      className="pl-9 h-9 bg-white"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Kelompok</th>
                        <th className="px-4 py-3">Nama Komponen</th>
                        <th className="px-4 py-3 text-center">Satuan</th>
                        <th className="px-4 py-3 text-center text-pupr-blue font-bold">1 Lantai</th>
                        <th className="px-4 py-3 text-center text-pupr-blue font-bold">2 Lantai</th>
                        <th className="px-4 py-3 text-center text-pupr-blue font-bold">3+ Lantai</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataKomponen.filter(k => 
                        k.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        k.kelompok.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-600">
                            <Badge variant="outline" className="bg-slate-50 text-slate-700">{item.kelompok}</Badge>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">{item.nama}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{item.satuan}</td>
                          <td className="px-4 py-3 text-center font-bold text-pupr-blue">{item.bobot1}%</td>
                          <td className="px-4 py-3 text-center font-bold text-pupr-blue">{item.bobot2}%</td>
                          <td className="px-4 py-3 text-center font-bold text-pupr-blue">{item.bobot3}%</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={item.status === 'Aktif' ? 'success' : 'secondary'} className="font-normal">
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-pupr-blue" onClick={() => handleOpenEditModal('komponen', item)}>
                                <Edit size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem('komponen', item.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: MASTER WILAYAH */}
          {activeTab === 'wilayah' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Master Wilayah Kecamatan Kabupaten Garut</CardTitle>
                    <CardDescription>Daftar wilayah administratif lokasi pemetaan survey gedung publik</CardDescription>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => handleOpenAddModal('wilayah')}>
                    <Plus size={16} className="mr-1.5" /> Tambah Kecamatan
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      placeholder="Cari kecamatan, kode pos..." 
                      className="pl-9 h-9 bg-white"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Kode Kemendagri</th>
                        <th className="px-4 py-3">Jenis</th>
                        <th className="px-4 py-3">Nama Wilayah</th>
                        <th className="px-4 py-3">Kabupaten Induk</th>
                        <th className="px-4 py-3 text-center">Kode Pos</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataWilayah.filter(w => 
                        w.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        w.id.includes(searchTerm)
                      ).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-pupr-blue">{item.id}</td>
                          <td className="px-4 py-3"><Badge variant="outline">{item.jenis}</Badge></td>
                          <td className="px-4 py-3 font-bold text-slate-900">{item.nama}</td>
                          <td className="px-4 py-3 text-slate-600">{item.parent}</td>
                          <td className="px-4 py-3 text-center font-mono text-slate-500">{item.kodePos || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={item.status === 'Aktif' ? 'success' : 'secondary'} className="font-normal">{item.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-pupr-blue" onClick={() => handleOpenEditModal('wilayah', item)}>
                                <Edit size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem('wilayah', item.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: INSTANSI & OPD */}
          {activeTab === 'instansi' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Master Instansi Pemohon & OPD Pengelola</CardTitle>
                    <CardDescription>Direktori Organisasi Perangkat Daerah dan Instansi Pemilik Gedung Publik</CardDescription>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => handleOpenAddModal('instansi')}>
                    <Plus size={16} className="mr-1.5" /> Tambah Instansi
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      placeholder="Cari nama dinas, singkatan, penanggung jawab..." 
                      className="pl-9 h-9 bg-white"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Singkatan</th>
                        <th className="px-4 py-3">Nama Lengkap Instansi</th>
                        <th className="px-4 py-3">Jenis OPD</th>
                        <th className="px-4 py-3">Penanggung Jawab</th>
                        <th className="px-4 py-3">Kontak Email</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataInstansi.filter(i => 
                        i.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        i.singkatan.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold text-pupr-blue">{item.singkatan}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.nama}</td>
                          <td className="px-4 py-3"><Badge variant="outline">{item.jenis}</Badge></td>
                          <td className="px-4 py-3 text-slate-700">{item.penanggungJawab}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono">{item.kontak}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={item.status === 'Aktif' ? 'success' : 'secondary'} className="font-normal">{item.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-pupr-blue" onClick={() => handleOpenEditModal('instansi', item)}>
                                <Edit size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem('instansi', item.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: BANGUNAN ATTR */}
          {activeTab === 'bangunan' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Master Atribut & Spesifikasi Bangunan Gedung</CardTitle>
                    <CardDescription>Klasifikasi fungsi, jenis struktur, dan tingkat keandalan gedung publik</CardDescription>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => handleOpenAddModal('bangunan')}>
                    <Plus size={16} className="mr-1.5" /> Tambah Atribut
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Jenis Atribut</th>
                        <th className="px-4 py-3">Nama Atribut / Klasifikasi</th>
                        <th className="px-4 py-3">Deskripsi Parameter</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataBangunan.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3"><Badge variant="outline" className="bg-slate-50">{item.jenis}</Badge></td>
                          <td className="px-4 py-3 font-bold text-slate-900">{item.nama}</td>
                          <td className="px-4 py-3 text-slate-600">{item.deskripsi}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={item.status === 'Aktif' ? 'success' : 'secondary'} className="font-normal">{item.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-pupr-blue" onClick={() => handleOpenEditModal('bangunan', item)}>
                                <Edit size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem('bangunan', item.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 5: KERUSAKAN */}
          {activeTab === 'kerusakan' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Kategori & Ambang Rentang Kerusakan PUPR</CardTitle>
                    <CardDescription>Klasifikasi tingkat keparahan fisik dan usulan tindakan penanganan teknis</CardDescription>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => handleOpenAddModal('kerusakan')}>
                    <Plus size={16} className="mr-1.5" /> Tambah Kategori
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">Rentang Kerusakan (%)</th>
                        <th className="px-4 py-3">Nama Tingkat Kerusakan</th>
                        <th className="px-4 py-3 text-center">Prioritas</th>
                        <th className="px-4 py-3">Tindakan Disarankan</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataKerusakan.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold">
                            {item.kategori === 'Sangat Berat' && <Badge variant="destructive">{item.kategori}</Badge>}
                            {item.kategori === 'Berat' && <Badge className="bg-orange-500 text-white">{item.kategori}</Badge>}
                            {item.kategori === 'Sedang' && <Badge className="bg-amber-500 text-white">{item.kategori}</Badge>}
                            {item.kategori === 'Ringan' && <Badge variant="success">{item.kategori}</Badge>}
                            {item.kategori === 'Aman' && <Badge variant="outline">{item.kategori}</Badge>}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-pupr-blue">
                            {item.minPercent}% - {item.maxPercent}%
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.nama}</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-700">{item.prioritas}</td>
                          <td className="px-4 py-3 text-slate-600 leading-snug max-w-xs">{item.tindakan}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-pupr-blue" onClick={() => handleOpenEditModal('kerusakan', item)}>
                                <Edit size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem('kerusakan', item.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 6: PANDUAN ASSESSMENT RUBRIK */}
          {activeTab === 'panduan' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Panduan Rubrik Evaluasi Fisik PUPR</CardTitle>
                    <CardDescription>Pedoman visual dan indikator verifikasi untuk setiap komponen bangunan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {COMPONENT_GROUPS.map(group => (
                  <div key={group.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <div className="bg-slate-900 text-white px-5 py-3 font-bold text-sm flex items-center justify-between">
                      <span>{group.title}</span>
                      <span className="text-xs font-normal text-slate-400">{group.items.length} Komponen</span>
                    </div>

                    <div className="p-4 space-y-4">
                      {group.items.map(item => (
                        <div key={item.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                            <Badge variant="outline" className="bg-white text-slate-600">Satuan: {item.unit}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {PANDUAN_DAMAGE_LEVELS.map(level => (
                              <div key={level.key} className={`p-3 ${level.bg} border ${level.border} rounded-xl space-y-1`}>
                                <span className={`text-[10px] font-bold ${level.titleColor} uppercase`}>{level.label}</span>
                                <p className="text-xs text-slate-700">
                                  {dataPanduan[item.id]?.[`${level.key}_img`] && <img src={dataPanduan[item.id][`${level.key}_img`]} className="mt-2 w-full h-24 rounded-md border border-slate-200 object-cover" alt="Contoh" />}
                                  {dataPanduan[item.id]?.[level.key] || 'Belum ada narasi kerusakan.'}
                                </p>
                              </div>
                            ))}
                          </div>

                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => {
                                setEditingItem({ 
                                  groupId: group.id, 
                                  itemId: item.id, 
                                  '0': dataPanduan[item.id]?.['0'] || '',
                                  '0.2': dataPanduan[item.id]?.['0.2'] || '',
                                  '0.35': dataPanduan[item.id]?.['0.35'] || '',
                                  '0.5': dataPanduan[item.id]?.['0.5'] || '',
                                  '0.7': dataPanduan[item.id]?.['0.7'] || '',
                                  '0.85': dataPanduan[item.id]?.['0.85'] || '',
                                  '1': dataPanduan[item.id]?.['1'] || '',
                                  '0_img': dataPanduan[item.id]?.['0_img'] || '',
                                  '0.2_img': dataPanduan[item.id]?.['0.2_img'] || '',
                                  '0.35_img': dataPanduan[item.id]?.['0.35_img'] || '',
                                  '0.5_img': dataPanduan[item.id]?.['0.5_img'] || '',
                                  '0.7_img': dataPanduan[item.id]?.['0.7_img'] || '',
                                  '0.85_img': dataPanduan[item.id]?.['0.85_img'] || '',
                                  '1_img': dataPanduan[item.id]?.['1_img'] || ''
                                });
                                setModalCategory('panduan');
                                setModalMode('EDIT');
                                setIsModalOpen(true);
                              }} className="bg-white">
                                Edit Narasi & Gambar
                              </Button>
                            </div>

                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* TAB 7: TEMPLATE DOKUMEN */}
          {activeTab === 'template' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Template Dokumen BAP & Surat Rekomendasi</CardTitle>
                    <CardDescription>Kelola format otomatis Berita Acara Penilaian dan surat dinas resmi PUPR</CardDescription>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => handleOpenAddModal('template')}>
                    <Plus size={16} className="mr-1.5" /> Tambah Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Jenis Dokumen</th>
                        <th className="px-4 py-3">Nama Template</th>
                        <th className="px-4 py-3 text-center">Versi</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataTemplate.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3"><Badge variant="outline">{item.jenis}</Badge></td>
                          <td className="px-4 py-3 font-bold text-slate-900">{item.nama}</td>
                          <td className="px-4 py-3 text-center font-mono text-slate-500">{item.versi}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={item.status === 'Aktif' ? 'success' : 'secondary'} className="font-normal">{item.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-pupr-blue hover:bg-blue-50" onClick={() => handleOpenPreviewModal('template', item)}>
                                <Eye size={14} className="mr-1" /> Pratinjau
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-pupr-blue" onClick={() => handleOpenEditModal('template', item)}>
                                <Edit size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem('template', item.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 8: PLACEHOLDER MANAGER */}
          {activeTab === 'placeholder' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Placeholder Token Manager</CardTitle>
                    <CardDescription>Variabel dinas otomatis yang dapat digunakan pada template PDF, BAP, dan AI prompts</CardDescription>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => handleOpenAddModal('placeholder')}>
                    <Plus size={16} className="mr-1.5" /> Tambah Token
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Token Variable</th>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">Deskripsi Variabel</th>
                        <th className="px-4 py-3">Contoh Output (Simulasi)</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataPlaceholders.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-pupr-blue">{item.token}</td>
                          <td className="px-4 py-3"><Badge variant="outline">{item.kategori}</Badge></td>
                          <td className="px-4 py-3 text-slate-700">{item.deskripsi}</td>
                          <td className="px-4 py-3 text-emerald-700 font-medium bg-emerald-50/50 rounded-md">{item.contohValue}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-slate-500 hover:text-pupr-blue"
                                title="Salin Token"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.token);
                                  showToast(`Token ${item.token} berhasil disalin!`);
                                }}
                              >
                                <Copy size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem('placeholder', item.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 9: AI KNOWLEDGE BASE */}
          {activeTab === 'database' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">AI Knowledge Base & RAG Indexer</CardTitle>
                    <CardDescription>Dokumen regulasi, SNI, dan SOP sebagai basis pengetahuan SIPEKA AI Engine</CardDescription>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => handleOpenAddModal('knowledge')}>
                    <Plus size={16} className="mr-1.5" /> Tambah Referensi PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pupr-blue text-white rounded-xl">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">SIPEKA RAG Vector Indexer</p>
                      <p className="text-[11px] text-slate-500">4 Dokumen regulasi terindeks untuk penarikan kesimpulan AI otomatis</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white"
                    onClick={() => showToast('Index AI Knowledge Base berhasil diperbarui secara menyeluruh!')}
                  >
                    <RefreshCw size={14} className="mr-1.5" /> Re-index Vektor
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">Judul Regulasi / SNI</th>
                        <th className="px-4 py-3">Deskripsi Singkat</th>
                        <th className="px-4 py-3">File Sumber</th>
                        <th className="px-4 py-3 text-center">Status Vektor</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataKnowledge.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3"><Badge variant="outline">{item.kategori}</Badge></td>
                          <td className="px-4 py-3 font-bold text-slate-900">{item.judul}</td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs leading-snug">{item.deskripsi}</td>
                          <td className="px-4 py-3 text-pupr-blue font-mono">{item.fileSource}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="success" className="font-normal">{item.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem('knowledge', item.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 10: WORKFLOW & STATUS */}
          {activeTab === 'workflow' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Konfigurasi Workflow & Matriks Akses Peran</CardTitle>
                    <CardDescription>Pengaturan 6 tahap alur kerja SIPEKA dan SLA (Service Level Agreement) penanganan</CardDescription>
                  </div>
                  <Button variant="pupr" size="sm" onClick={() => handleOpenAddModal('workflow')}>
                    <Plus size={16} className="mr-1.5" /> Tambah Tahap
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {dataWorkflow.map((stage) => (
                  <div key={stage.id} className="p-4 border border-slate-200 rounded-2xl bg-white hover:border-pupr-blue transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pupr-blue text-white font-bold flex items-center justify-center text-xs">
                          {stage.stageNumber}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{stage.nama}</h4>
                          <p className="text-xs text-slate-500">{stage.deskripsi}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50">
                          SLA: {stage.slaHours} Jam
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-pupr-blue" onClick={() => handleOpenEditModal('workflow', stage)}>
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem('workflow', stage.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Peran Otomatis Akses:</span>
                      {stage.roleAkses.map(role => (
                        <span key={role}>
                          <Badge variant="secondary" className="text-[10px]">
                            {role}
                          </Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* TAB 11: SYSTEM SETTINGS */}
          {activeTab === 'system' && (
            <Card className="border-0 shadow-sm animate-in fade-in duration-300">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Pengaturan Sistem PUPR SIPEKA</CardTitle>
                <CardDescription>Parameter global identitas aplikasi, model AI, dan sertifikat laporan</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Nama Aplikasi</label>
                    <Input 
                      value={sysSettings.namaAplikasi} 
                      onChange={e => setSysSettings({...sysSettings, namaAplikasi: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Tahun Anggaran Berjalan</label>
                    <Input 
                      value={sysSettings.tahunAnggaran} 
                      onChange={e => setSysSettings({...sysSettings, tahunAnggaran: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Model AI Default (Gemini Engine)</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-slate-200 text-xs font-medium bg-white"
                      value={sysSettings.aiModelDefault}
                      onChange={e => setSysSettings({...sysSettings, aiModelDefault: e.target.value})}
                    >
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Analisis Sangat Kompleks & Teknis)</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Rekomendasi Cepat)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Analisis Kompleks)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Gis Basemap Layer Default</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-slate-200 text-xs font-medium bg-white"
                      value={sysSettings.defaultGisMap}
                      onChange={e => setSysSettings({...sysSettings, defaultGisMap: e.target.value})}
                    >
                      <option value="OpenStreetMap Standard">OpenStreetMap Standard</option>
                      <option value="Esri Satellite World">Esri Satellite Imagery</option>
                      <option value="CartoDB Positron">CartoDB Light Clean</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Kop Surat & Banner Resmi Dinas</label>
                    <Input 
                      value={sysSettings.kopSuratHeader} 
                      onChange={e => setSysSettings({...sysSettings, kopSuratHeader: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button variant="pupr" onClick={() => showToast('Pengaturan sistem berhasil diperbarui!')}>
                    <Save size={15} className="mr-1.5" /> Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Global Add/Edit/Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sliders size={18} className="text-pupr-blue" />
                {modalMode === 'ADD' ? 'Tambah Data Master Baru' : modalMode === 'EDIT' ? 'Edit Data Master' : 'Pratinjau Master Data'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* WILAYAH FORM */}
              {modalCategory === 'wilayah' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nama Kecamatan</label>
                    <Input value={editingItem.nama || ''} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} placeholder="Contoh: Tarogong Kaler" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Kode Pos</label>
                    <Input value={editingItem.kodePos || ''} onChange={e => setEditingItem({...editingItem, kodePos: e.target.value})} placeholder="44151" />
                  </div>
                </>
              )}

              {/* INSTANSI FORM */}
              {modalCategory === 'instansi' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nama Lengkap Instansi</label>
                    <Input value={editingItem.nama || ''} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} placeholder="Dinas Pendidikan Garut" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Singkatan / Akronim</label>
                    <Input value={editingItem.singkatan || ''} onChange={e => setEditingItem({...editingItem, singkatan: e.target.value})} placeholder="DISDIK" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Penanggung Jawab</label>
                    <Input value={editingItem.penanggungJawab || ''} onChange={e => setEditingItem({...editingItem, penanggungJawab: e.target.value})} placeholder="Nama Kepala Dinas" />
                  </div>
                </>
              )}

              {/* KOMPONEN FORM */}
              {modalCategory === 'komponen' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Kelompok Komponen</label>
                    <select 
                      className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs bg-white"
                      value={editingItem.kelompok || 'Struktur Utama'}
                      onChange={e => setEditingItem({...editingItem, kelompok: e.target.value})}
                    >
                      <option value="Struktur Utama">Struktur Utama</option>
                      <option value="Arsitektur">Arsitektur</option>
                      <option value="Utilitas">Utilitas</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nama Komponen</label>
                    <Input value={editingItem.nama || ''} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} placeholder="Nama Elemen (e.g. Kolom Cor)" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Bobot 1 Lt (%)</label>
                      <Input type="number" value={editingItem.bobot1 || 0} onChange={e => setEditingItem({...editingItem, bobot1: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Bobot 2 Lt (%)</label>
                      <Input type="number" value={editingItem.bobot2 || 0} onChange={e => setEditingItem({...editingItem, bobot2: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Bobot 3+ Lt (%)</label>
                      <Input type="number" value={editingItem.bobot3 || 0} onChange={e => setEditingItem({...editingItem, bobot3: e.target.value})} />
                    </div>
                  </div>
                </>
              )}

              {/* TEMPLATE / PLACEHOLDER PREVIEW */}
              {modalMode === 'PREVIEW' && modalCategory === 'template' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900">{editingItem.nama} ({editingItem.versi})</h4>
                  <pre className="p-4 bg-slate-900 text-amber-300 font-mono text-xs rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {editingItem.konten}
                  </pre>
                </div>
              )}

              {/* PANDUAN FORM */}
              {modalCategory === 'panduan' && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {PANDUAN_DAMAGE_LEVELS.map(level => (
                    <div key={level.key} className={`p-4 ${level.bg} border ${level.border} rounded-xl space-y-3`}>
                      <h4 className={`text-sm font-bold ${level.titleColor}`}>{level.label}</h4>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">Narasi Kerusakan</label>
                        <textarea
                          rows={3}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                          value={editingItem[level.key] || ''}
                          onChange={e => setEditingItem({...editingItem, [level.key]: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">URL Gambar Referensi</label>
                        <Input 
                          value={editingItem[`${level.key}_img`] || ''} 
                          onChange={e => setEditingItem({...editingItem, [`${level.key}_img`]: e.target.value})} 
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* GENERAL TEMPLATE / PLACEHOLDER INPUT */}
              {['template', 'placeholder', 'knowledge', 'workflow', 'kerusakan', 'bangunan'].includes(modalCategory) && modalMode !== 'PREVIEW' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nama / Judul</label>
                    <Input value={editingItem.nama || editingItem.judul || editingItem.token || ''} onChange={e => setEditingItem({...editingItem, nama: e.target.value, judul: e.target.value, token: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Deskripsi / Konten</label>
                    <textarea 
                      rows={4}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-pupr-blue"
                      value={editingItem.deskripsi || editingItem.konten || ''} 
                      onChange={e => setEditingItem({...editingItem, deskripsi: e.target.value, konten: e.target.value})} 
                    />
                  </div>
                  {modalCategory === 'workflow' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">SLA (Jam)</label>
                        <Input type="number" value={editingItem.slaHours || 0} onChange={e => setEditingItem({...editingItem, slaHours: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">Peran Otomatis Akses</label>
                        <div className="flex flex-col gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50">
                          {['Super Administrator', 'Kepala Bidang', 'Reviewer Teknis', 'Surveyor', 'Pengelola'].map(role => {
                            const currentRoles = editingItem.roleAkses || [];
                            const isChecked = currentRoles.includes(role);
                            return (
                              <label key={role} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditingItem({ ...editingItem, roleAkses: [...currentRoles, role] });
                                    } else {
                                      setEditingItem({ ...editingItem, roleAkses: currentRoles.filter((r: string) => r !== role) });
                                    }
                                  }}
                                  className="rounded border-slate-300 text-pupr-blue focus:ring-pupr-blue"
                                />
                                <span className="text-xs text-slate-700">{role}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Batal</Button>
              {modalMode !== 'PREVIEW' && (
                <Button variant="pupr" size="sm" onClick={handleSaveModal}>
                  <Save size={15} className="mr-1.5" /> Simpan Perubahan
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Global Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-lg">Konfirmasi</h3>
                <p className="text-sm text-slate-500">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmDialog(null)}>Batal</Button>
              <Button variant="pupr" size="sm" onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}>
                Ya, Lanjutkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
