import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardGlass, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeafletMap } from '@/components/ui/LeafletMap';
import { 
  Search, 
  Map as MapIcon, 
  Layers, 
  Maximize, 
  AlertCircle, 
  Building, 
  LocateFixed, 
  Activity, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Download, 
  Filter, 
  Eye, 
  FileText, 
  Box, 
  ShieldAlert, 
  Navigation, 
  Compass, 
  X, 
  Check, 
  Sliders, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import { addFooterWithQRCode } from '../../lib/pdf-utils';
import autoTable from 'jspdf-autotable';

// GIS Building Asset Type Definition
export type BuildingGISItem = {
  id: string;
  srvId: string;
  name: string;
  category: 'Fasilitas Kesehatan' | 'Fasilitas Pendidikan' | 'Perkantoran' | 'Fasilitas Umum' | 'Komersial';
  instansi: string;
  kecamatan: string;
  address: string;
  lat: number;
  lng: number;
  xPercent: number; // For map SVG layout
  yPercent: number; // For map SVG layout
  damagePercentage: number;
  severity: 'Rusak Berat' | 'Rusak Sedang' | 'Rusak Ringan';
  assetValue: string;
  faultDistanceKm: number;
  yearBuilt: number;
  floors: number;
  structuralType: string;
  photoUrl: string;
  primaryDefect: string;
  recommendedAction: string;
};

// Initial Garut Regency Spatial Data
const initialBuildingsData: BuildingGISItem[] = [
  {
    id: 'GIS-GAR-001',
    srvId: 'SRV-002',
    name: 'Puskesmas Cikajang (Bangunan Utama)',
    category: 'Fasilitas Kesehatan',
    instansi: 'Dinas Kesehatan Kabupaten Garut',
    kecamatan: 'Cikajang',
    address: 'Jl. Raya Cikajang No. 42, Cikajang, Garut',
    lat: -7.3481,
    lng: 107.8214,
    xPercent: 42,
    yPercent: 68,
    damagePercentage: 42.5,
    severity: 'Rusak Sedang',
    assetValue: 'Rp 4.2 Miliar',
    faultDistanceKm: 2.4,
    yearBuilt: 2012,
    floors: 2,
    structuralType: 'Beton Bertulang (RC Frame)',
    photoUrl: 'https://images.unsplash.com/photo-1518557984649-7b161c230cfa?q=80&w=400&auto=format&fit=crop',
    primaryDefect: 'Retak geser diagonal pada Kolom K-01 & spalling balok cantilever',
    recommendedAction: 'Perkuatan FRP Jacketing Kolom & Injeksi Epoxy Resin'
  },
  {
    id: 'GIS-GAR-002',
    srvId: 'SRV-001',
    name: 'SDN 1 Tarogong Kidul',
    category: 'Fasilitas Pendidikan',
    instansi: 'Dinas Pendidikan Kabupaten Garut',
    kecamatan: 'Tarogong Kidul',
    address: 'Jl. Pembangunan No. 18, Tarogong Kidul, Garut',
    lat: -7.2185,
    lng: 107.8921,
    xPercent: 54,
    yPercent: 38,
    damagePercentage: 68.4,
    severity: 'Rusak Berat',
    assetValue: 'Rp 2.8 Miliar',
    faultDistanceKm: 1.8,
    yearBuilt: 1998,
    floors: 1,
    structuralType: 'Rangka Kayu & Pasangan Batu Bata',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=400&auto=format&fit=crop',
    primaryDefect: 'Atap truss kayu mengalami pergeseran nodal utama & dinding retak tembus',
    recommendedAction: 'Pembongkaran Total Atap & Rekonstruksi Struktur Rangka'
  },
  {
    id: 'GIS-GAR-003',
    srvId: 'SRV-003',
    name: 'RSUD dr. Slamet Garut (Gedung Melati)',
    category: 'Fasilitas Kesehatan',
    instansi: 'Dinas Kesehatan Kabupaten Garut',
    kecamatan: 'Garut Kota',
    address: 'Jl. Rumah Sakit No. 12, Garut Kota, Garut',
    lat: -7.2278,
    lng: 107.9086,
    xPercent: 58,
    yPercent: 42,
    damagePercentage: 18.2,
    severity: 'Rusak Ringan',
    assetValue: 'Rp 18.5 Miliar',
    faultDistanceKm: 4.1,
    yearBuilt: 2018,
    floors: 4,
    structuralType: 'Dinding Geser Beton (RC Shear Wall)',
    photoUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=400&auto=format&fit=crop',
    primaryDefect: 'Retak rambut plasteran arsitektural selasar & bocor plafon gypsum',
    recommendedAction: 'Perbaikan Pasangan Plasteran & Plafon'
  },
  {
    id: 'GIS-GAR-004',
    srvId: 'SRV-004',
    name: 'Kantor Camat Malangbong',
    category: 'Perkantoran',
    instansi: 'Kecamatan Malangbong',
    kecamatan: 'Malangbong',
    address: 'Jl. Raya Malangbong No. 85, Malangbong, Garut',
    lat: -7.0543,
    lng: 108.0931,
    xPercent: 82,
    yPercent: 18,
    damagePercentage: 34.2,
    severity: 'Rusak Sedang',
    assetValue: 'Rp 3.1 Miliar',
    faultDistanceKm: 6.5,
    yearBuilt: 2008,
    floors: 2,
    structuralType: 'Beton Bertulang',
    photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop',
    primaryDefect: 'Defleksi pelat lantai 2 melebihi ambang batas servis SNI',
    recommendedAction: 'Penambahan Support Gelagar Baja I-Beam'
  },
  {
    id: 'GIS-GAR-005',
    srvId: 'SRV-005',
    name: 'SMPN 2 Cilawu',
    category: 'Fasilitas Pendidikan',
    instansi: 'Dinas Pendidikan Kabupaten Garut',
    kecamatan: 'Cilawu',
    address: 'Jl. Raya Garut-Tasik No. 102, Cilawu, Garut',
    lat: -7.2842,
    lng: 107.9412,
    xPercent: 65,
    yPercent: 55,
    damagePercentage: 52.6,
    severity: 'Rusak Berat',
    assetValue: 'Rp 1.9 Miliar',
    faultDistanceKm: 1.2,
    yearBuilt: 2002,
    floors: 1,
    structuralType: 'Pasangan Dinding Mikul Beban',
    photoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400&auto=format&fit=crop',
    primaryDefect: 'Dinding geser retak tembus > 5mm akibat pergerakan tanah',
    recommendedAction: 'Pemasangan Tie-Beam Ring & Tie-Column Baru'
  },
  {
    id: 'GIS-GAR-006',
    srvId: 'SRV-006',
    name: 'Gedung Balai Desa Bayongbong',
    category: 'Fasilitas Umum',
    instansi: 'Pemerintah Desa Bayongbong',
    kecamatan: 'Bayongbong',
    address: 'Jl. Simpang Bayongbong No. 4, Garut',
    lat: -7.2715,
    lng: 107.8654,
    xPercent: 48,
    yPercent: 50,
    damagePercentage: 14.0,
    severity: 'Rusak Ringan',
    assetValue: 'Rp 1.2 Miliar',
    faultDistanceKm: 3.8,
    yearBuilt: 2015,
    floors: 1,
    structuralType: 'Beton Bertulang',
    photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop',
    primaryDefect: 'Kerusakan keramik lantai & rembesan talang air atap',
    recommendedAction: 'Perbaikan Lapisan Waterproofing & Replacement Keramik'
  },
  {
    id: 'GIS-GAR-007',
    srvId: 'SRV-007',
    name: 'Pasar Tradisional Wanaraja',
    category: 'Komersial',
    instansi: 'Dinas Perindustrian & Perdagangan Garut',
    kecamatan: 'Wanaraja',
    address: 'Jl. Pasar Wanaraja No. 1, Garut',
    lat: -7.1892,
    lng: 107.9745,
    xPercent: 70,
    yPercent: 32,
    damagePercentage: 36.8,
    severity: 'Rusak Sedang',
    assetValue: 'Rp 6.4 Miliar',
    faultDistanceKm: 5.0,
    yearBuilt: 2010,
    floors: 2,
    structuralType: 'Rangka Baja Profil (Steel Portal Frame)',
    photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400&auto=format&fit=crop',
    primaryDefect: 'Korosi baut sambungan gelagar baja & pelat buhul',
    recommendedAction: 'Pembersihan Sandblasting & Ganti Baut A325 High Strength'
  },
  {
    id: 'GIS-GAR-008',
    srvId: 'SRV-008',
    name: 'Puskesmas Pameungpeuk (Pesisir)',
    category: 'Fasilitas Kesehatan',
    instansi: 'Dinas Kesehatan Kabupaten Garut',
    kecamatan: 'Pameungpeuk',
    address: 'Jl. Raya Laut Pameungpeuk, Garut',
    lat: -7.6492,
    lng: 107.6982,
    xPercent: 28,
    yPercent: 88,
    damagePercentage: 61.5,
    severity: 'Rusak Berat',
    assetValue: 'Rp 3.8 Miliar',
    faultDistanceKm: 12.4,
    yearBuilt: 2005,
    floors: 2,
    structuralType: 'Beton Bertulang Tahan Garam',
    photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400&auto=format&fit=crop',
    primaryDefect: 'Korosi rebar parah & spalling selimut beton akibat paparan klorida air laut',
    recommendedAction: 'Cathodic Protection & Structural Concrete Overlay'
  }
];

const dataKerusakanCategory = [
  { name: 'Pendidikan', ringan: 120, sedang: 45, berat: 12 },
  { name: 'Kesehatan', ringan: 85, sedang: 28, berat: 8 },
  { name: 'Perkantoran', ringan: 150, sedang: 34, berat: 15 },
  { name: 'Fasum', ringan: 45, sedang: 12, berat: 5 },
  { name: 'Komersial', ringan: 65, sedang: 22, berat: 5 },
];

export function GISWorkspace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'map' | 'dashboard'>('map');
  const [buildingsList, setBuildingsList] = useState<BuildingGISItem[]>(initialBuildingsData);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('GIS-GAR-001');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Layer Toggles
  const [showFaultLines, setShowFaultLines] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [baseMapStyle, setBaseMapStyle] = useState<'street' | 'satellite' | 'seismic' | 'dark'>('satellite');
  const [activeDataLayer, setActiveDataLayer] = useState<'severity' | 'building_age' | 'fault_risk' | 'all'>('severity');

  // Map Navigation Control
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Buildings
  const filteredBuildings = useMemo(() => {
    return buildingsList.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.kecamatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.srvId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKec = selectedKecamatan === 'all' || b.kecamatan === selectedKecamatan;
      const matchCat = selectedCategory === 'all' || b.category === selectedCategory;
      const matchSev = selectedSeverity === 'all' || b.severity === selectedSeverity;
      return matchSearch && matchKec && matchCat && matchSev;
    });
  }, [buildingsList, searchQuery, selectedKecamatan, selectedCategory, selectedSeverity]);

  const selectedBuilding = buildingsList.find(b => b.id === selectedBuildingId) || buildingsList[0];

  // Leaflet OpenStreetMap Markers Mapping with extended attributes
  const gisLeafletMarkers = useMemo(() => {
    return filteredBuildings.map(b => ({
      id: b.id,
      lat: b.lat,
      lng: b.lng,
      title: b.name,
      subtitle: b.instansi,
      category: b.category,
      severity: b.severity,
      address: b.address,
      yearBuilt: b.yearBuilt,
      faultDistanceKm: b.faultDistanceKm,
      damagePercentage: b.damagePercentage
    }));
  }, [filteredBuildings]);

  // List of unique Kecamatans for filter dropdown
  const uniqueKecamatans = useMemo(() => {
    return Array.from(new Set(buildingsList.map(b => b.kecamatan)));
  }, [buildingsList]);

  // Export spatial dataset as GeoJSON file
  const exportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      metadata: {
        title: 'SIPEKA PUPR Garut Spatial Building Defect Dataset',
        dateGenerated: new Date().toISOString(),
        totalFeatures: filteredBuildings.length
      },
      features: filteredBuildings.map(b => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [b.lng, b.lat]
        },
        properties: {
          gisId: b.id,
          surveyId: b.srvId,
          buildingName: b.name,
          category: b.category,
          instansi: b.instansi,
          kecamatan: b.kecamatan,
          address: b.address,
          damagePercentage: b.damagePercentage,
          severity: b.severity,
          assetValue: b.assetValue,
          faultDistanceKm: b.faultDistanceKm,
          primaryDefect: b.primaryDefect,
          recommendedAction: b.recommendedAction
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SIPEKA_GIS_Spasial_Garut_${new Date().toISOString().split('T')[0]}.geojson`;
    link.click();
    showToast('Dataset Spasial berhasil diunduh sebagai file GeoJSON!');
  };

  // Export Spatial Assessment Report as PDF
  const exportSpatialReportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    

    // Header Kop Surat
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DINAS PEKERJAAN UMUM DAN PENATAAN RUANG', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('KABUPATEN GARUT - COMMAND CENTER GEOSPASIAL SIPEKA', pageWidth / 2, 21, { align: 'center' });
    doc.line(20, 25, pageWidth - 20, 25);

    doc.setFontSize(13);
    doc.text('LAPORAN PETA KERUSAKAN SPASIAL & PETA RISIKO GEOSPASIAL', pageWidth / 2, 34, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')} | Total Aset Dipetakan: ${filteredBuildings.length}`, pageWidth / 2, 40, { align: 'center' });

    // Table Data
    autoTable(doc, {
      startY: 48,
      theme: 'grid',
      headStyles: { fillColor: [15, 76, 129] },
      head: [['GIS ID', 'Nama Bangunan Gedung', 'Kecamatan', 'Tingkat Kerusakan', 'Jarak Sesar Garsela', 'Rekomendasi Penanganan']],
      body: filteredBuildings.map(b => [
        b.id,
        b.name,
        b.kecamatan,
        `${b.damagePercentage.toFixed(1)}% (${b.severity})`,
        `${b.faultDistanceKm} km`,
        b.recommendedAction
      ])
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan Eksekutif Kerentanan Spasial:', 20, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`- Bangunan dengan tingkat Rusak Berat (>45%): ${filteredBuildings.filter(b => b.damagePercentage > 45).length} Lokasi`, 20, finalY + 6);
    doc.text(`- Bangunan berjarak < 3.0 km dari Sesar Aktif Garsela: ${filteredBuildings.filter(b => b.faultDistanceKm < 3.0).length} Lokasi`, 20, finalY + 12);
    doc.text('- Prioritas Penanganan Darurat: Kecamatan Tarogong Kidul, Cikajang, & Cilawu', 20, finalY + 18);

    doc.setFont('helvetica', 'bold');
    doc.text('Kepala Bidang Bangunan Gedung PUPR,', pageWidth - 90, finalY + 38);
    doc.setFont('helvetica', 'normal');
    doc.text('Ir. H. Agus Supriatna, M.T.', pageWidth - 90, finalY + 58);

    const pageHeight = doc.internal.pageSize.getHeight();
    
    await addFooterWithQRCode(doc, "GIS-" + new Date().getTime(), "PENDING", pageHeight, pageWidth);
    doc.save(`Laporan_GIS_Spasial_Garut_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Laporan Spasial GIS berhasil diunduh sebagai PDF!');
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Filter & Layer Settings Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-pupr-blue" />
                <h3 className="text-sm font-bold">Pengaturan Layer & Filter Geospasial</h3>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              
              {/* Data Layer Overlay Selection */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900">Overlay Data Tematik Map</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'severity', label: 'Tingkat Kerusakan', icon: '⚠️' },
                    { id: 'building_age', label: 'Umur Bangunan (Tahun)', icon: '🏛️' },
                    { id: 'fault_risk', label: 'Risiko Sesar Garsela', icon: '⚡' },
                    { id: 'all', label: 'Semua Layer Data', icon: '🌐' }
                  ].map(d => (
                    <button
                      key={d.id}
                      onClick={() => setActiveDataLayer(d.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        activeDataLayer === d.id
                          ? 'bg-pupr-blue/10 border-pupr-blue text-pupr-blue font-bold ring-1 ring-pupr-blue'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span>{d.icon}</span>
                        <span>{d.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Map Style */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 font-sans">Tampilan Basemap GIS</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'satellite', label: 'Citra Satelit Hybrid' },
                    { id: 'street', label: 'Vektor Jalan PUPR' },
                    { id: 'seismic', label: 'Peta Gempa & Sesar' },
                    { id: 'dark', label: 'Night Command View' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setBaseMapStyle(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        baseMapStyle === m.id
                          ? 'bg-pupr-blue/10 border-pupr-blue text-pupr-blue font-bold ring-1 ring-pupr-blue'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spatial Layer Overlays */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900">Layer Tambahan Spasial</label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-medium text-slate-800">Jalur Sesar Aktif Garsela (Fault Line)</span>
                    <input 
                      type="checkbox" 
                      checked={showFaultLines} 
                      onChange={(e) => setShowFaultLines(e.target.checked)}
                      className="accent-red-600 w-4 h-4 rounded cursor-pointer" 
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer border-t border-slate-200 pt-2">
                    <span className="font-medium text-slate-800">Gradient Defect Density Heatmap</span>
                    <input 
                      type="checkbox" 
                      checked={showHeatmap} 
                      onChange={(e) => setShowHeatmap(e.target.checked)}
                      className="accent-amber-500 w-4 h-4 rounded cursor-pointer" 
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer border-t border-slate-200 pt-2">
                    <span className="font-medium text-slate-800">Batas Administrasi Kecamatan</span>
                    <input 
                      type="checkbox" 
                      checked={showBoundaries} 
                      onChange={(e) => setShowBoundaries(e.target.checked)}
                      className="accent-pupr-blue w-4 h-4 rounded cursor-pointer" 
                    />
                  </label>
                </div>
              </div>

              {/* Filter Parameters */}
              <div className="space-y-3">
                <label className="font-bold text-slate-900">Filter Atribut Bencana & Aset</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-slate-500">Filter Kecamatan:</span>
                    <select 
                      value={selectedKecamatan} 
                      onChange={(e) => setSelectedKecamatan(e.target.value)}
                      className="w-full h-9 px-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="all">Semua Kecamatan</option>
                      {uniqueKecamatans.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500">Filter Kategori:</span>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-9 px-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="Fasilitas Kesehatan">Fasilitas Kesehatan</option>
                      <option value="Fasilitas Pendidikan">Fasilitas Pendidikan</option>
                      <option value="Perkantoran">Perkantoran</option>
                      <option value="Fasilitas Umum">Fasilitas Umum</option>
                      <option value="Komersial">Komersial</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500">Tingkat Kerusakan Fisik:</span>
                  <select 
                    value={selectedSeverity} 
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="w-full h-9 px-2 bg-white border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="all">Semua Kondisi (Ringan - Berat)</option>
                    <option value="Rusak Berat">Rusak Berat (&gt; 45%)</option>
                    <option value="Rusak Sedang">Rusak Sedang (30% - 45%)</option>
                    <option value="Rusak Ringan">Rusak Ringan (&lt; 30%)</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedKecamatan('all');
                setSelectedCategory('all');
                setSelectedSeverity('all');
                setSearchQuery('');
              }}>Reset Filter</Button>
              <Button variant="pupr" size="sm" onClick={() => setIsFilterModalOpen(false)}>Terapkan Filter Map</Button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">GIS & Spatial Analytics Command Center</h1>
            <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/5 font-semibold">Tahap 6</Badge>
            <Badge variant="outline" className="border-emerald-600 text-emerald-600 bg-emerald-50 font-semibold">Geospasial Sesar Garsela</Badge>
          </div>
          <p className="text-slate-500 mt-1">Pemantauan Terpadu Aset Bangunan Gedung Negara, Pemetaan Kerusakan Fisik, & Zona Kerentanan Bencana Spasial.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportGeoJSON} className="bg-white">
            <Download size={15} className="mr-1.5 text-pupr-blue" />
            Export GeoJSON
          </Button>
          <Button variant="pupr" size="sm" onClick={exportSpatialReportPDF}>
            <FileText size={15} className="mr-1.5" />
            Cetak Laporan Spasial (PDF)
          </Button>

          <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-xl ml-2">
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'map' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Peta Geospasial
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Dashboard Eksekutif
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: GEOSPATIAL MAP CANVAS & FLOATING INSPECTOR */}
      {activeTab === 'map' && (
        <div className="flex-1 rounded-2xl border border-slate-200 overflow-hidden relative shadow-md flex flex-col bg-slate-950 text-white min-h-[620px]">
          
          {/* Top Search & Layer Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-col md:flex-row justify-between gap-3 pointer-events-none">
            <div className="relative md:w-80 pointer-events-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama bangunan, kecamatan, ID..." 
                className="pl-9 h-10 bg-slate-900/90 backdrop-blur-md shadow-lg border-white/20 text-white text-xs placeholder:text-slate-400" 
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsFilterModalOpen(true)}
                className="bg-slate-900/90 backdrop-blur border-white/20 text-white text-xs hover:bg-slate-800"
              >
                <Layers size={15} className="mr-1.5 text-pupr-blue" />
                Layer & Filter ({filteredBuildings.length} Aset)
              </Button>
            </div>
          </div>

          {/* OpenStreetMap Leaflet Interactive Map */}
          <div className="absolute inset-0 z-0">
            <LeafletMap
              markers={gisLeafletMarkers}
              center={selectedBuilding ? [selectedBuilding.lat, selectedBuilding.lng] : [-7.2144, 107.9015]}
              zoom={12}
              height="100%"
              tileStyle={baseMapStyle === 'street' ? 'osm' : baseMapStyle === 'seismic' ? 'hot' : baseMapStyle === 'dark' ? 'dark' : 'satellite'}
              onTileStyleChange={(style) => {
                setBaseMapStyle(style === 'osm' ? 'street' : style === 'hot' ? 'seismic' : style === 'dark' ? 'dark' : 'satellite');
              }}
              activeDataLayer={activeDataLayer}
              onDataLayerChange={(layer) => setActiveDataLayer(layer)}
              selectedMarkerId={selectedBuildingId}
              onMarkerSelect={(id) => setSelectedBuildingId(id)}
              showGeofenceRadius={showBoundaries ? 150 : null}
              geofenceCenter={selectedBuilding ? [selectedBuilding.lat, selectedBuilding.lng] : null}
            />
          </div>

          {/* Map Navigation Controls Overlay */}
          <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-20">
            <Button size="sm" variant="outline" onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))} className="bg-slate-900/80 border-white/20 text-white h-9 w-9 p-0">
              <ZoomIn size={18} />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))} className="bg-slate-900/80 border-white/20 text-white h-9 w-9 p-0">
              <ZoomOut size={18} />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setZoomLevel(1.0)} className="bg-slate-900/80 border-white/20 text-white h-9 w-9 p-0">
              <RotateCcw size={16} />
            </Button>
          </div>

          {/* Map Legend Overlay */}
          <div className="absolute left-4 bottom-4 z-20 w-52 hidden lg:block">
            <Card className="bg-slate-900/90 backdrop-blur-md shadow-xl border-white/20 text-white p-3 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Legenda Kondisi GIS PUPR</span>
              <div className="space-y-1.5 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
                  <span>Rusak Berat (&gt; 45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Rusak Sedang (30% - 45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>Rusak Ringan (&lt; 30%)</span>
                </div>
                {showFaultLines && (
                  <div className="flex items-center gap-2 border-t border-slate-800 pt-1.5 text-[10px] text-red-400 font-mono">
                    <div className="w-4 h-0.5 bg-red-500"></div>
                    <span>Garis Sesar Garsela</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Floating Building Inspector Card */}
          <div className="absolute left-4 top-16 z-20 w-80 md:w-96 hidden md:block animate-in fade-in slide-in-from-left-4">
            <Card className="shadow-2xl border-white/20 bg-slate-900/95 backdrop-blur-md text-white overflow-hidden">
              <CardHeader className="pb-2 bg-black/40 border-b border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <Badge variant="outline" className={`text-[10px] ${
                    selectedBuilding.damagePercentage > 45 
                      ? 'border-red-500 text-red-400 bg-red-500/10' 
                      : selectedBuilding.damagePercentage >= 30 
                      ? 'border-amber-500 text-amber-400 bg-amber-500/10' 
                      : 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  }`}>
                    {selectedBuilding.severity} ({selectedBuilding.damagePercentage.toFixed(1)}%)
                  </Badge>
                  <span className="font-mono text-[10px] text-slate-400">{selectedBuilding.id}</span>
                </div>
                <CardTitle className="text-base leading-tight font-bold text-white">{selectedBuilding.name}</CardTitle>
                <CardDescription className="text-xs text-slate-300 font-mono flex items-center gap-1">
                  <MapPin size={12} className="text-pupr-blue" />
                  Kec. {selectedBuilding.kecamatan} ({selectedBuilding.lat}, {selectedBuilding.lng})
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5 text-xs">
                
                {/* Photo & Badge */}
                <div className="h-36 bg-slate-800 rounded-xl overflow-hidden relative border border-white/10 group">
                  <img src={selectedBuilding.photoUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" alt="Bangunan" />
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <Badge className="bg-black/80 backdrop-blur text-white border-none text-[9px]">
                      <Building size={10} className="mr-1 text-pupr-blue" /> {selectedBuilding.floors} Lantai
                    </Badge>
                    <Badge className="bg-black/80 backdrop-blur text-amber-300 border-none text-[9px]">
                      {selectedBuilding.category}
                    </Badge>
                  </div>
                </div>

                {/* Spatial Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-slate-400 text-[9px] uppercase font-bold">Jarak Sesar Garsela</p>
                    <p className="font-bold text-red-400 mt-0.5">{selectedBuilding.faultDistanceKm} km</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-slate-400 text-[9px] uppercase font-bold">Nilai Wajar Aset</p>
                    <p className="font-bold text-emerald-400 mt-0.5">{selectedBuilding.assetValue}</p>
                  </div>
                </div>

                {/* Defect Diagnosis */}
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl space-y-1">
                  <p className="font-bold text-red-300 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={12} /> Temuan Defek Utama:
                  </p>
                  <p className="text-slate-200 leading-snug text-[11px]">{selectedBuilding.primaryDefect}</p>
                </div>

                {/* Action Recommendation */}
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1">
                  <p className="font-bold text-indigo-300 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} /> Rekomendasi Penanganan:
                  </p>
                  <p className="text-slate-200 leading-snug text-[11px]">{selectedBuilding.recommendedAction}</p>
                </div>

                {/* Inter-Module Navigation Action Links */}
                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-1.5">
                  <Button 
                    size="sm" 
                    variant="pupr" 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedBuilding.lat},${selectedBuilding.lng}`, '_blank')}
                    className="text-white text-[10px] h-8 px-1"
                  >
                    <Navigation size={12} className="mr-1 text-white" /> Navigasi Lokasi
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate('/ai-review')}
                    className="bg-white/10 border-white/20 text-white text-[10px] hover:bg-white/20 h-8 px-1"
                  >
                    <Sparkles size={12} className="mr-1 text-amber-400" /> BAP AI
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate('/report')}
                    className="bg-white/10 border-white/20 text-white text-[10px] hover:bg-white/20 h-8 px-1"
                  >
                    <FileText size={12} className="mr-1 text-emerald-400" /> Laporan
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate('/bim')}
                    className="bg-white/10 border-white/20 text-white text-[10px] hover:bg-white/20 h-8 px-1"
                  >
                    <Box size={12} className="mr-1 text-sky-400" /> BIM 3D
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* TAB 2: EXECUTIVE DASHBOARD & SPATIAL RISK MATRIX */}
      {activeTab === 'dashboard' && (
        <div className="flex-1 overflow-y-auto pb-6 space-y-6">
          
          {/* Executive Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardGlass className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Aset Dipetakan</p>
                    <h3 className="text-3xl font-extrabold text-slate-900">{buildingsList.length}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-pupr-blue/10 flex items-center justify-center text-pupr-blue">
                    <Building size={20} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp size={14} /> Terintegrasi Simbangda Garut
                </p>
              </CardContent>
            </CardGlass>

            <CardGlass className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Kondisi Rusak Berat</p>
                    <h3 className="text-3xl font-extrabold text-red-600">
                      {buildingsList.filter(b => b.damagePercentage > 45).length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                    <AlertTriangle size={20} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-red-600 font-semibold flex items-center gap-1">
                  <ShieldAlert size={14} /> Memerlukan Penanganan Segera
                </p>
              </CardContent>
            </CardGlass>

            <CardGlass className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Kawasan Zona Sesar &lt; 3 km</p>
                    <h3 className="text-3xl font-extrabold text-amber-600">
                      {buildingsList.filter(b => b.faultDistanceKm < 3.0).length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Navigation size={20} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-amber-700 font-semibold">
                  Sesar Garsela Buffer Alert
                </p>
              </CardContent>
            </CardGlass>

            <CardGlass className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Estimasi Kebutuhan Rehabilitasi</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Rp 12.8 Miliar</h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Sparkles size={20} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Kalkulasi Berdasarkan Permen PUPR
                </p>
              </CardContent>
            </CardGlass>
          </div>

          {/* Charts & Priority Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart: Damage Category Distribution */}
            <CardGlass className="lg:col-span-2 border-0 shadow-sm ring-1 ring-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Sebaran Kerusakan Fisik Berdasarkan Fungsi Bangunan</CardTitle>
                <CardDescription className="text-xs">Distribusi tingkat kerusakan ringan, sedang, dan berat (PUPR 2026)</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataKerusakanCategory} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: '#f1f5f9' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="ringan" name="Baik / Rusak Ringan" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="sedang" name="Rusak Sedang" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="berat" name="Rusak Berat" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </CardGlass>

            {/* Top Priority Buildings */}
            <CardGlass className="border-0 shadow-sm ring-1 ring-slate-200 bg-white flex flex-col">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Matriks Prioritas Penanganan Spasial</CardTitle>
                <CardDescription className="text-xs">Top bangunan paling kritis terdekat jalur sesar</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3">
                {buildingsList
                  .slice()
                  .sort((a, b) => b.damagePercentage - a.damagePercentage)
                  .map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setSelectedBuildingId(item.id);
                        setActiveTab('map');
                      }}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all flex justify-between items-center group"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-pupr-blue transition-colors">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Kec. {item.kecamatan} • Jarak Sesar: {item.faultDistanceKm} km</p>
                      </div>
                      <Badge variant={item.damagePercentage > 45 ? 'destructive' : 'warning'} className="text-[10px]">
                        {item.damagePercentage.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </CardGlass>

          </div>

          {/* District Risk Heatmap Summary Table */}
          <CardGlass className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Ringkasan Kerentanan Bencana Spasial Per Kecamatan</CardTitle>
              <CardDescription className="text-xs">Pengelompokan aset bangunan gedung berdasarkan wilayah administratif Kabupaten Garut</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-3">Kecamatan</th>
                      <th className="p-3">Jumlah Aset</th>
                      <th className="p-3">Rusak Berat (&gt;45%)</th>
                      <th className="p-3">Rusak Sedang (30-45%)</th>
                      <th className="p-3">Jarak Rata-rata Sesar</th>
                      <th className="p-3">Estimasi Biaya Rehabilitasi</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {uniqueKecamatans.map((kec) => {
                      const kecBuildings = buildingsList.filter(b => b.kecamatan === kec);
                      const heavyCount = kecBuildings.filter(b => b.damagePercentage > 45).length;
                      const medCount = kecBuildings.filter(b => b.damagePercentage >= 30 && b.damagePercentage <= 45).length;
                      const avgFault = (kecBuildings.reduce((acc, b) => acc + b.faultDistanceKm, 0) / kecBuildings.length).toFixed(1);

                      return (
                        <tr key={kec} className="hover:bg-slate-50 font-medium">
                          <td className="p-3 font-bold text-slate-900">{kec}</td>
                          <td className="p-3 font-mono">{kecBuildings.length} Unit</td>
                          <td className="p-3 text-red-600 font-bold">{heavyCount} Unit</td>
                          <td className="p-3 text-amber-600 font-bold">{medCount} Unit</td>
                          <td className="p-3 font-mono text-slate-700">{avgFault} km</td>
                          <td className="p-3 font-bold text-emerald-700">Rp {(kecBuildings.length * 1.4).toFixed(1)} Miliar</td>
                          <td className="p-3 text-right">
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedKecamatan(kec);
                              setActiveTab('map');
                            }} className="h-7 text-[10px]">
                              Filter Map <ExternalLink size={10} className="ml-1" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </CardGlass>

        </div>
      )}

    </div>
  );
}
