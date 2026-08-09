import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Camera, Upload, 
  Layers, 
  MapPin, 
  Calendar, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  EyeOff, 
  Compass, 
  Maximize2, 
  Filter, 
  ShieldCheck, 
  FileText, 
  SlidersHorizontal, 
  RefreshCw, 
  Share2, 
  Tag, 
  Activity, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Building2, 
  Grid, 
  List, 
  Info,
  Scan,
  Ruler,
  Clock,
  UserCheck,
  Hash,
  Share,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export interface CrackAnnotation {
  id: string;
  type: 'retak_struktural' | 'spalling_beton' | 'rembesan_air' | 'retak_rambut' | 'korosi_tulangan';
  severity: 'Kritis' | 'Sedang' | 'Ringan';
  widthMm: number; // e.g. 2.5 mm
  lengthCm: number; // e.g. 45 cm
  depthMm?: number;
  confidence: number; // percentage e.g. 96.8
  label: string;
  bbox: { x: number; y: number; width: number; height: number }; // Percentage 0-100
  vectorPath?: Array<{ x: number; y: number }>; // Normalized path for canvas vector crack trace
}

export interface SurveyEvidencePhoto {
  id: string;
  buildingName: string;
  tagId: string;
  instansi: string;
  elementName: string; // e.g., 'Kolom Utama K-01 Teras'
  componentType: 'Kolom' | 'Balok' | 'Dinding' | 'Plafon' | 'Atap' | 'Pondasi' | 'Lantai';
  imageUrl: string;
  timestamp: string;
  surveyorName: string;
  surveyorNip: string;
  gpsCoords: { lat: number; lng: number; acc: number; alt: number; heading: number };
  damageSeverity: 'Rusak Berat' | 'Rusak Sedang' | 'Rusak Ringan' | 'Tidak Rusak';
  notes: string;
  hashIntegrity: string;
  aiAnalyzed: boolean;
  aiConfidence: number;
  cracks: CrackAnnotation[];
}

// Sample Rich Survey Evidence Dataset from Garut Regency Inspections
export const sampleEvidencePhotos: SurveyEvidencePhoto[] = [
  {
    id: 'EV-2026-0801-01',
    buildingName: 'Puskesmas DTP Cikajang',
    tagId: 'QR-PUPR-2026-001',
    instansi: 'Dinas Kesehatan Kab. Garut',
    elementName: 'Kolom K-01 Kantilever Teras Utama',
    componentType: 'Kolom',
    imageUrl: 'https://images.unsplash.com/photo-1518557984649-7b161c230cfa?q=80&w=1200&auto=format&fit=crop',
    timestamp: '2026-08-01 10:42:18 WIB',
    surveyorName: 'Ir. Hendra Pratama',
    surveyorNip: '19850412 201001 1 008',
    gpsCoords: { lat: -7.324512, lng: 107.789104, acc: 2.1, alt: 1215.4, heading: 184 },
    damageSeverity: 'Rusak Sedang',
    notes: 'Ditemukan retak diagonal 45° akibat pergeseran beban geser pada teras utama. Perlu injeksi semen epoksi dan jacketing beton bertulang.',
    hashIntegrity: 'e7f8b90a421398efcdab1234567890ab',
    aiAnalyzed: true,
    aiConfidence: 96.8,
    cracks: [
      {
        id: 'crk-1',
        type: 'retak_struktural',
        severity: 'Kritis',
        widthMm: 2.5,
        lengthCm: 68,
        depthMm: 12,
        confidence: 97.4,
        label: 'Retak Geser Diagonal 45°',
        bbox: { x: 28, y: 25, width: 42, height: 48 },
        vectorPath: [{ x: 30, y: 28 }, { x: 42, y: 45 }, { x: 55, y: 58 }, { x: 68, y: 70 }]
      },
      {
        id: 'crk-2',
        type: 'retak_rambut',
        severity: 'Ringan',
        widthMm: 0.6,
        lengthCm: 22,
        confidence: 91.2,
        label: 'Retak Rambut Plesteran',
        bbox: { x: 15, y: 18, width: 22, height: 25 },
        vectorPath: [{ x: 18, y: 20 }, { x: 25, y: 32 }, { x: 32, y: 40 }]
      }
    ]
  },
  {
    id: 'EV-2026-0801-02',
    buildingName: 'SDN 1 Tarogong Kidul',
    tagId: 'QR-PUPR-2026-002',
    instansi: 'Dinas Pendidikan Kab. Garut',
    elementName: 'Balok Induk B-02 Koridor Lantai 2',
    componentType: 'Balok',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1200&auto=format&fit=crop',
    timestamp: '2026-08-01 09:15:42 WIB',
    surveyorName: 'Budi Santoso, ST',
    surveyorNip: '19890215 201402 1 003',
    gpsCoords: { lat: -7.202814, lng: 107.882410, acc: 3.4, alt: 724.8, heading: 92 },
    damageSeverity: 'Rusak Ringan',
    notes: 'Rembesan air dari talang atap menyebabkan lendutan mikroskopis dan retak halus lentur pada permukaan balok bawah.',
    hashIntegrity: 'a1b2c3d4567890abcdef1234567890ab',
    aiAnalyzed: true,
    aiConfidence: 94.2,
    cracks: [
      {
        id: 'crk-3',
        type: 'retak_struktural',
        severity: 'Sedang',
        widthMm: 1.2,
        lengthCm: 35,
        depthMm: 5,
        confidence: 95.1,
        label: 'Retak Lentur Balok B-02',
        bbox: { x: 35, y: 40, width: 38, height: 30 },
        vectorPath: [{ x: 38, y: 42 }, { x: 50, y: 52 }, { x: 68, y: 65 }]
      },
      {
        id: 'crk-4',
        type: 'rembesan_air',
        severity: 'Ringan',
        widthMm: 0,
        lengthCm: 80,
        confidence: 88.5,
        label: 'Bercak Rembesan & Efflorescence',
        bbox: { x: 10, y: 15, width: 45, height: 35 }
      }
    ]
  },
  {
    id: 'EV-2026-0801-03',
    buildingName: 'Pasar Rakyat Wanaraja',
    tagId: 'QR-PUPR-2026-003',
    instansi: 'Disperindag Kab. Garut',
    elementName: 'Kolom Baja WF-250 & Sambungan Las',
    componentType: 'Kolom',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=1200&auto=format&fit=crop',
    timestamp: '2026-08-01 11:05:00 WIB',
    surveyorName: 'Dedin Kusnadi, A.Md',
    surveyorNip: '19910722 201801 1 005',
    gpsCoords: { lat: -7.185203, lng: 107.971215, acc: 1.8, alt: 680.2, heading: 275 },
    damageSeverity: 'Rusak Berat',
    notes: 'Korosi tingkat lanjut pada pelat buhul sambungan baja dan retak pada spalling beton pedestal pondasi.',
    hashIntegrity: 'f9e8d7c6543210fedcba9876543210fe',
    aiAnalyzed: true,
    aiConfidence: 98.6,
    cracks: [
      {
        id: 'crk-5',
        type: 'spalling_beton',
        severity: 'Kritis',
        widthMm: 4.2,
        lengthCm: 110,
        depthMm: 28,
        confidence: 99.1,
        label: 'Spalling Beton Pedestal & Rebar Korosi',
        bbox: { x: 20, y: 20, width: 55, height: 60 },
        vectorPath: [{ x: 22, y: 25 }, { x: 38, y: 48 }, { x: 52, y: 62 }, { x: 72, y: 75 }]
      }
    ]
  },
  {
    id: 'EV-2026-0801-04',
    buildingName: 'RSUD Dr. Slamet Garut',
    tagId: 'QR-PUPR-2026-004',
    instansi: 'Dinas Kesehatan Kab. Garut',
    elementName: 'Dinding Bata Ruang Radiologi Lt 1',
    componentType: 'Dinding',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
    timestamp: '2026-07-30 14:22:10 WIB',
    surveyorName: 'Ir. Hendra Pratama',
    surveyorNip: '19850412 201001 1 008',
    gpsCoords: { lat: -7.214402, lng: 107.901522, acc: 2.8, alt: 712.0, heading: 45 },
    damageSeverity: 'Tidak Rusak',
    notes: 'Pemeriksaan rutin dinding pelindung timbal radiologi. Tidak ditemukan retak struktural.',
    hashIntegrity: 'c3d4e5f6789012abcdef34567890abcd',
    aiAnalyzed: true,
    aiConfidence: 99.0,
    cracks: []
  },
  {
    id: 'EV-2026-0801-05',
    buildingName: 'Gedung Pemkab Garut (Setda)',
    tagId: 'QR-PUPR-2026-005',
    instansi: 'Sekretariat Daerah Kab. Garut',
    elementName: 'Plafon Beton Kantilever Fasad Depan',
    componentType: 'Plafon',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop',
    timestamp: '2026-07-29 16:10:00 WIB',
    surveyorName: 'Ahmad Fauzi, ST',
    surveyorNip: '19870311 201201 1 004',
    gpsCoords: { lat: -7.218811, lng: 107.902230, acc: 3.1, alt: 720.5, heading: 310 },
    damageSeverity: 'Rusak Sedang',
    notes: 'Retak melintang pada plafon kanopi beton akibat akumulasi beban genangan air di dak atas.',
    hashIntegrity: 'b8a7f6e543210987fedcba9876543210',
    aiAnalyzed: true,
    aiConfidence: 93.5,
    cracks: [
      {
        id: 'crk-6',
        type: 'retak_struktural',
        severity: 'Sedang',
        widthMm: 1.8,
        lengthCm: 52,
        depthMm: 8,
        confidence: 94.0,
        label: 'Retak Lentur Kanopi Dak',
        bbox: { x: 25, y: 35, width: 50, height: 35 },
        vectorPath: [{ x: 28, y: 38 }, { x: 45, y: 50 }, { x: 70, y: 62 }]
      }
    ]
  }
];

interface EvidenceGalleryProps {
  initialBuildingFilter?: string;
  onSelectPhotoForSurvey?: (photo: SurveyEvidencePhoto) => void;
}

export function EvidenceGallery({ initialBuildingFilter, onSelectPhotoForSurvey }: EvidenceGalleryProps) {
  const [photos, setPhotos] = useState<SurveyEvidencePhoto[]>(sampleEvidencePhotos);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>(initialBuildingFilter || 'ALL');
  const [selectedComponent, setSelectedComponent] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Selected Photo for Interactive Lightbox Overlay Inspector
  const [activePhoto, setActivePhoto] = useState<SurveyEvidencePhoto | null>(null);

  // Lightbox Interactive Overlay States
  const [showAiOverlay, setShowAiOverlay] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showVectorTrace, setShowVectorTrace] = useState<boolean>(true);
  const [showWidthLabels, setShowWidthLabels] = useState<boolean>(true);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.85);
  const [imageFilter, setImageFilter] = useState<'normal' | 'contrast' | 'xray' | 'thermal'>('normal');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isAiReanalyzing, setIsAiReanalyzing] = useState<boolean>(false);
  const [customNote, setCustomNote] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { setIsUploading(true); setTimeout(() => setIsUploading(false), 2000); };


  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial building filter if passed
  useEffect(() => {
    if (initialBuildingFilter) {
      setSelectedBuilding(initialBuildingFilter);
    }
  }, [initialBuildingFilter]);

  // Open Lightbox with selected photo
  const handleOpenPhoto = (photo: SurveyEvidencePhoto) => {
    setActivePhoto(photo);
    setCustomNote(photo.notes);
    setZoomLevel(1);
    setImageFilter('normal');
    setShowAiOverlay(true);
  };

  // Filter Photos List
  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = 
      photo.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.elementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.surveyorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBuilding = selectedBuilding === 'ALL' || photo.buildingName.toLowerCase().includes(selectedBuilding.toLowerCase()) || photo.tagId === selectedBuilding;
    const matchesComponent = selectedComponent === 'ALL' || photo.componentType === selectedComponent;
    const matchesSeverity = selectedSeverity === 'ALL' || photo.damageSeverity === selectedSeverity;

    return matchesSearch && matchesBuilding && matchesComponent && matchesSeverity;
  });

  // Re-run AI Analysis Simulation
  const handleReanalyzeAi = () => {
    if (!activePhoto) return;
    setIsAiReanalyzing(true);

    setTimeout(() => {
      const updatedCracks = activePhoto.cracks.map(c => ({
        ...c,
        confidence: Math.min(99.8, Number((c.confidence + (Math.random() * 2)).toFixed(1))),
        widthMm: Number((c.widthMm + (Math.random() * 0.2 - 0.1)).toFixed(1))
      }));

      const updatedPhoto: SurveyEvidencePhoto = {
        ...activePhoto,
        aiConfidence: Math.min(99.5, Number((activePhoto.aiConfidence + 0.8).toFixed(1))),
        cracks: updatedCracks,
        notes: customNote
      };

      setActivePhoto(updatedPhoto);
      setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
      setIsAiReanalyzing(false);
    }, 1800);
  };

  // Draw AI Crack Vectors and Bounding Boxes on Canvas Overlay
  useEffect(() => {
    if (!activePhoto || !canvasRef.current || !showAiOverlay) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions to match canvas container
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (activePhoto.cracks.length === 0) return;

    ctx.globalAlpha = overlayOpacity;

    activePhoto.cracks.forEach((crack) => {
      const bx = (crack.bbox.x / 100) * width;
      const by = (crack.bbox.y / 100) * height;
      const bw = (crack.bbox.width / 100) * width;
      const bh = (crack.bbox.height / 100) * height;

      // Color coding by severity
      let strokeColor = '#ef4444'; // Red for Kritis
      let fillColor = 'rgba(239, 68, 68, 0.15)';
      if (crack.severity === 'Sedang') {
        strokeColor = '#f59e0b'; // Amber
        fillColor = 'rgba(245, 158, 11, 0.15)';
      } else if (crack.severity === 'Ringan') {
        strokeColor = '#3b82f6'; // Blue
        fillColor = 'rgba(59, 130, 246, 0.12)';
      }

      // 1. Draw Bounding Box if enabled
      if (showBoundingBoxes) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.fillStyle = fillColor;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
      }

      // 2. Draw Precise Vector Crack Path if enabled
      if (showVectorTrace && crack.vectorPath && crack.vectorPath.length > 1) {
        ctx.beginPath();
        crack.vectorPath.forEach((pt, index) => {
          const px = (pt.x / 100) * width;
          const py = (pt.y / 100) * height;
          if (index === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = crack.severity === 'Kritis' ? '#facc15' : '#ffffff';
        ctx.lineWidth = Math.max(3, crack.widthMm * 1.8);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Glowing outer stroke
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(5, crack.widthMm * 3);
        ctx.globalAlpha = overlayOpacity * 0.5;
        ctx.stroke();
        ctx.globalAlpha = overlayOpacity;
      }

      // 3. Draw Measurement Badge & Label
      if (showWidthLabels) {
        const labelText = `${crack.label} | Lebar: ${crack.widthMm} mm (${crack.severity})`;
        ctx.font = 'bold 11px system-ui, sans-serif';
        const textWidth = ctx.measureText(labelText).width;

        // Label Background Pill
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        const ly = Math.max(20, by - 8);
        ctx.beginPath();
        ctx.roundRect(bx, ly - 16, textWidth + 16, 22, 6);
        ctx.fill();
        ctx.stroke();

        // Label Text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, bx + 8, ly - 1);
      }
    });

  }, [activePhoto, showAiOverlay, showBoundingBoxes, showVectorTrace, showWidthLabels, overlayOpacity, zoomLevel]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-pupr-blue text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-pupr-yellow text-slate-950 font-bold text-[10px] uppercase">
              PUPR Vision Analytics
            </Badge>
            <Badge variant="outline" className="text-emerald-300 border-emerald-400/40 text-[10px] font-mono">
              GPS Geotag Validated
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Galeri Bukti Visual & Deteksi AI Retak Struktur
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Arsip foto dokumentasi lapangan tergeotagging presisi tinggi dengan layer overlay AI untuk kuantifikasi lebar retak, spalling, dan tingkat kerusakan fisik.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center cursor-pointer hover:bg-slate-700/80 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <span className="text-xs text-slate-400 block mb-1">Upload & Analisis</span>
            <div className="flex justify-center items-center h-7 text-emerald-400">
              {isUploading ? <RefreshCw className="animate-spin" size={24} /> : <Upload size={24} />}
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
            <span className="text-xs text-slate-400 block">Total Berkas Bukti</span>
            <span className="text-xl font-black text-white font-mono">{photos.length} Foto</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
            <span className="text-xs text-slate-400 block">Terdeteksi AI</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {photos.filter(p => p.cracks.length > 0).length} Defek
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              type="text"
              placeholder="Cari gedung, komponen, tag QR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 rounded-xl border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Component Filter */}
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-pupr-blue"
            >
              <option value="ALL">Semua Elemen Stuktur</option>
              <option value="Kolom">Kolom Utama</option>
              <option value="Balok">Balok Induk</option>
              <option value="Dinding">Dinding Bata</option>
              <option value="Plafon">Plafon & Kanopi</option>
              <option value="Atap">Rangka Atap</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-pupr-blue"
            >
              <option value="ALL">Semua Tingkat Kerusakan</option>
              <option value="Rusak Berat">Rusak Berat</option>
              <option value="Rusak Sedang">Rusak Sedang</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Tidak Rusak">Kondisi Baik</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-400 transition-all ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-pupr-blue shadow-xs font-bold' : 'hover:text-slate-900 dark:text-white'
                }`}
                title="Tampilan Kisi / Grid"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-400 transition-all ${
                  viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-pupr-blue shadow-xs font-bold' : 'hover:text-slate-900 dark:text-white'
                }`}
                title="Tampilan Daftar Detail"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Building Filter Pill if Active */}
        {selectedBuilding !== 'ALL' && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Filter Gedung Aktif:</span>
            <Badge variant="outline" className="bg-blue-50 text-pupr-blue border-blue-300 font-bold py-1 px-2.5 flex items-center gap-1.5">
              <Building2 size={13} /> {selectedBuilding}
              <button onClick={() => setSelectedBuilding('ALL')} className="ml-1 text-slate-400 hover:text-red-500">
                <X size={12} />
              </button>
            </Badge>
          </div>
        )}
      </div>

      {/* Main Evidence Grid / List View */}
      {filteredPhotos.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900">
          <ImageIcon size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Tidak Ada Foto Bukti yang Cocok</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan filter elemen struktur dan tingkat kerusakan.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedBuilding('ALL');
              setSelectedComponent('ALL');
              setSelectedSeverity('ALL');
            }}
            className="mt-4 text-xs"
          >
            Reset Semua Filter
          </Button>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => handleOpenPhoto(photo)}
              className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-2xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex ${
                viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row'
              }`}
            >
              {/* Image Preview Container */}
              <div className={`relative overflow-hidden bg-slate-950 shrink-0 ${
                viewMode === 'grid' ? 'aspect-4/3 w-full' : 'sm:w-64 aspect-4/3 sm:aspect-auto'
              }`}>
                <img
                  src={photo.imageUrl}
                  alt={photo.elementName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Badges Overlay */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                  <Badge variant="outline" className="bg-slate-950/80 backdrop-blur-md text-amber-300 border-slate-700 text-[10px] font-mono">
                    {photo.tagId}
                  </Badge>
                  <Badge className={`text-[10px] font-bold shadow-md ${
                    photo.damageSeverity === 'Rusak Berat'
                      ? 'bg-red-600 text-white'
                      : photo.damageSeverity === 'Rusak Sedang'
                      ? 'bg-amber-600 text-white'
                      : photo.damageSeverity === 'Rusak Ringan'
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {photo.damageSeverity}
                  </Badge>
                </div>

                {/* AI Detection Overlay Preview Tag */}
                {photo.cracks.length > 0 && (
                  <div className="absolute bottom-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-pupr-blue/50 text-white text-[10px] font-mono flex items-center gap-1.5 shadow-lg">
                    <BrainCircuit size={13} className="text-pupr-yellow animate-pulse" />
                    <span>AI: {photo.cracks.length} Retak ({photo.cracks[0].widthMm}mm)</span>
                  </div>
                )}

                <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={14} />
                </div>
              </div>

              {/* Photo Metadata Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Building2 size={12} className="text-pupr-blue" />
                      {photo.buildingName}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                      {photo.componentType}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-pupr-blue transition-colors line-clamp-1">
                    {photo.elementName}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {photo.notes}
                  </p>
                </div>

                {/* Bottom Geotag Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span className="flex items-center gap-1 truncate max-w-[170px]">
                    <MapPin size={12} className="text-red-500 shrink-0" />
                    {photo.gpsCoords.lat.toFixed(4)}, {photo.gpsCoords.lng.toFixed(4)}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock size={11} />
                    {photo.timestamp.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL: INTERACTIVE AI OVERLAY & GEOTAG INSPECTOR */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Top Control Header */}
            <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pupr-blue/30 text-pupr-yellow rounded-xl border border-pupr-blue/40">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                      {activePhoto.elementName}
                    </h3>
                    <Badge className="bg-amber-400 text-slate-950 text-[10px] font-mono font-bold">
                      {activePhoto.tagId}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activePhoto.buildingName} • Inspector: {activePhoto.surveyorName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReanalyzeAi}
                  disabled={isAiReanalyzing}
                  className="text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 h-8"
                >
                  <RefreshCw size={13} className={`mr-1.5 text-pupr-yellow ${isAiReanalyzing ? 'animate-spin' : ''}`} />
                  {isAiReanalyzing ? 'Proses AI Vision...' : 'Ulang Analisis AI'}
                </Button>

                <button
                  onClick={() => setActivePhoto(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Split Image Canvas & Metadata Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-y-auto">
              {/* LEFT 2 COLS: High-Res Interactive Canvas Container */}
              <div className="lg:col-span-2 bg-slate-950 p-4 flex flex-col justify-between relative min-h-[380px] lg:min-h-[520px]">
                {/* Filter & Canvas Controls Overlay Toolbar */}
                <div className="absolute top-6 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 text-white text-xs">
                  {/* Layer Toggles */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setShowAiOverlay(!showAiOverlay)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                        showAiOverlay ? 'bg-pupr-blue text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {showAiOverlay ? <Eye size={13} /> : <EyeOff size={13} />} Layer AI
                    </button>

                    <button
                      onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        showBoundingBoxes ? 'bg-slate-800 text-amber-300 border border-amber-400/40' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      BBox Defek
                    </button>

                    <button
                      onClick={() => setShowVectorTrace(!showVectorTrace)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        showVectorTrace ? 'bg-slate-800 text-emerald-300 border border-emerald-400/40' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Vektor Retak
                    </button>

                    <button
                      onClick={() => setShowWidthLabels(!showWidthLabels)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        showWidthLabels ? 'bg-slate-800 text-blue-300 border border-blue-400/40' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Label mm
                    </button>
                  </div>

                  {/* Filter View & Zoom */}
                  <div className="flex items-center gap-2">
                    <select
                      value={imageFilter}
                      onChange={(e: any) => setImageFilter(e.target.value)}
                      className="h-7 px-2 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-200 font-mono"
                    >
                      <option value="normal">Normal Color</option>
                      <option value="contrast">High Contrast (Cracks)</option>
                      <option value="xray">X-Ray Edge Detection</option>
                      <option value="thermal">Thermal Heatmap</option>
                    </select>

                    <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                      <button
                        onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.25))}
                        className="p-1 hover:text-pupr-yellow"
                      >
                        <ZoomOut size={13} />
                      </button>
                      <span className="text-[10px] font-mono px-1.5">{Math.round(zoomLevel * 100)}%</span>
                      <button
                        onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                        className="p-1 hover:text-pupr-yellow"
                      >
                        <ZoomIn size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image & Canvas Overlay Workspace */}
                <div className="relative flex-1 flex items-center justify-center my-12 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-inner">
                  <div
                    className="relative transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    {/* Underlying Photo */}
                    <img
                      src={activePhoto.imageUrl}
                      alt={activePhoto.elementName}
                      className={`max-h-[460px] w-auto object-contain rounded-xl transition-all duration-300 ${
                        imageFilter === 'contrast'
                          ? 'contrast-200 brightness-90 saturate-50'
                          : imageFilter === 'xray'
                          ? 'invert contrast-200 hue-rotate-180 grayscale'
                          : imageFilter === 'thermal'
                          ? 'hue-rotate-90 contrast-150 saturate-200'
                          : ''
                      }`}
                    />

                    {/* Canvas Overlay for AI Vectors */}
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      className="absolute inset-0 w-full h-full pointer-events-none rounded-xl"
                    />
                  </div>
                </div>

                {/* Opacity Slider Control */}
                <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Sliders size={14} className="text-pupr-yellow" />
                    <span>Opasitas Layer AI:</span>
                    <span className="font-mono font-bold text-white">{Math.round(overlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="w-36 accent-pupr-blue cursor-pointer"
                  />
                </div>
              </div>

              {/* RIGHT COL: Geotag Metadata & AI Inspection Analysis Sidebar */}
              <div className="bg-slate-900 p-5 border-l border-slate-800 space-y-5 text-slate-200 overflow-y-auto">
                {/* AI Confidence & Summary Box */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} className="text-pupr-yellow" /> Gemini Structural Vision
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-[10px] font-mono">
                      {activePhoto.aiConfidence}% Skor Kepercayaan
                    </Badge>
                  </div>

                  <div className="text-xs pt-1 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Retak Teridentifikasi:</span>
                      <span className="font-bold text-white font-mono">{activePhoto.cracks.length} Titik Defek</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lebar Maksimum Terukur:</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {activePhoto.cracks.length > 0 ? `${Math.max(...activePhoto.cracks.map(c => c.widthMm))} mm` : '0 mm'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Klasifikasi Risiko Fisik:</span>
                      <Badge className={`text-[10px] font-bold ${
                        activePhoto.damageSeverity === 'Rusak Berat' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {activePhoto.damageSeverity}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Detected Crack List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler size={14} className="text-pupr-blue" />
                    Daftar Pengukuran Lebar Retak
                  </h4>

                  {activePhoto.cracks.length === 0 ? (
                    <div className="p-3 bg-slate-950 rounded-xl text-center text-xs text-slate-400 border border-slate-800">
                      Tidak terdeteksi retak struktural signifikan.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activePhoto.cracks.map((crack) => (
                        <div key={crack.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{crack.label}</span>
                            <Badge className={`text-[10px] ${
                              crack.severity === 'Kritis' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                            }`}>
                              {crack.severity}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 font-mono">
                            <div>Lebar: <strong className="text-white">{crack.widthMm} mm</strong></div>
                            <div>Panjang: <strong className="text-white">{crack.lengthCm} cm</strong></div>
                            <div>Kedalaman Est: <strong className="text-white">{crack.depthMm || 0} mm</strong></div>
                            <div>Akurasi: <strong className="text-emerald-400">{crack.confidence}%</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Geotagged Metadata Panel */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-red-400" />
                    Metadata Geotagging & Telemetri
                  </h4>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Koordinat GPS:</span>
                      <span className="text-emerald-300 font-bold">{activePhoto.gpsCoords.lat}, {activePhoto.gpsCoords.lng}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Presisi / Radius Error:</span>
                      <span className="text-white">± {activePhoto.gpsCoords.acc} meter</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Altitude / Ketinggian:</span>
                      <span className="text-white">{activePhoto.gpsCoords.alt} mdpl</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Arah Kompas Bearing:</span>
                      <span className="text-white">{activePhoto.gpsCoords.heading}° SSW</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Waktu Pengambilan:</span>
                      <span className="text-slate-300">{activePhoto.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Surveyor PUPR:</span>
                      <span className="text-white font-sans font-semibold">{activePhoto.surveyorName}</span>
                    </div>
                  </div>
                </div>

                {/* Digital Hash Verification */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <span className="text-slate-400 block font-semibold">Integritas Berkas Digital (SHA-256):</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-amber-300 truncate">{activePhoto.hashIntegrity}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyHash(activePhoto.hashIntegrity)}
                      className="h-6 px-2 text-[10px] text-slate-300 hover:text-white"
                    >
                      {copiedHash ? 'Tersalin' : 'Salin'}
                    </Button>
                  </div>
                </div>

                {/* Field Notes Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Catatan Pengamatan Surveyor Lapangan
                  </label>
                  <textarea
                    rows={3}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-pupr-blue focus:outline-hidden"
                  />
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button
                    type="button"
                    variant="pupr"
                    size="sm"
                    onClick={() => {
                      alert(`Mengunduh Berkas Foto Geotagged dengan AI Layer [${activePhoto.id}] dalam format BAP PDF...`);
                    }}
                    className="w-full text-xs font-bold"
                  >
                    <Download size={14} className="mr-1.5" /> Ekspor BAP Bukti Geotag (PDF)
                  </Button>

                  {onSelectPhotoForSurvey && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onSelectPhotoForSurvey(activePhoto);
                        setActivePhoto(null);
                      }}
                      className="w-full text-xs border-pupr-blue/40 text-pupr-blue hover:bg-slate-800"
                    >
                      Lampirkan ke Form Survey Aktif
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
