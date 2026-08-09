import React, { useState, useEffect } from 'react';
import { Card, CardGlass, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Cuboid, Layers, Eye, Play, Pause, Settings, AlertTriangle, Info, Box, 
  Maximize, UploadCloud, CheckCircle2, RotateCw, ZoomIn, ZoomOut, X, Check
} from 'lucide-react';

export function BIMWorkspace() {
  const [activeTab, setActiveTab] = useState('viewer');

  // Interactive 3D Viewer State
  const [wireframeMode, setWireframeMode] = useState(false);
  const [xrayMode, setXrayMode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(12);
  const [selectedElement, setSelectedElement] = useState<'K-01' | 'B-02' | 'Wall' | 'Slab'>('K-01');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [uploadedIfcFile, setUploadedIfcFile] = useState<string | null>(null);

  // Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [simWeek, setSimWeek] = useState(3);

  // Clashes State
  const [clashes, setClashes] = useState([
    { id: 'CL-0042', type: 'Hard Clash', elements: 'IfcBeam x IfcDuctSegment', priority: 'High', status: 'Unresolved' },
    { id: 'CL-0015', type: 'Soft Clash', elements: 'IfcColumn x IfcWallStandardCase', priority: 'Medium', status: 'Reviewed' },
    { id: 'CL-0012', type: 'Clearance', elements: 'IfcDoor x IfcStair', priority: 'Low', status: 'Ignored' }
  ]);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View presets
  const [viewPreset, setViewPreset] = useState<'3d' | 'front' | 'top' | 'heatmap'>('3d');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCOBie = () => {
    const cobieData = [
      { GlobalId: '1zG_$uVvX1P...', Entity: 'IfcColumn', Name: 'Kolom Utama K-01', Material: 'Beton K-250', Damage: '38.5%', Status: 'Rusak Sedang' },
      { GlobalId: '2aT_!wPpY2R...', Entity: 'IfcBeam', Name: 'Balok Induk B-02', Material: 'Beton K-250', Damage: '18.2%', Status: 'Rusak Ringan' },
      { GlobalId: '3cM_#qNnZ3S...', Entity: 'IfcSlab', Name: 'Pelat Dak Lantai 2', Material: 'Beton K-250', Damage: '12.0%', Status: 'Baik' },
      { GlobalId: '4dX_@bMmW4T...', Entity: 'IfcWallStandardCase', Name: 'Dinding D-01', Material: 'Bata Ringan', Damage: '25.0%', Status: 'Rusak Ringan' },
      { GlobalId: '5eY_$cNnW5U...', Entity: 'IfcRoof', Name: 'Atap Kuda-Kuda R-01', Material: 'Baja Ringan', Damage: '48.0%', Status: 'Rusak Sedang' },
    ];
    const blob = new Blob([JSON.stringify(cobieData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `COBie_PUPR_Export_Puskesmas_Cikajang.json`;
    a.click();
    showToast('Berkas COBie & Psets PUPR berhasil diekspor (JSON)!');
  };

  // 4D/5D Simulation Timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimWeek(prev => (prev >= 8 ? 1 : prev + 1));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleResolveClash = (id: string) => {
    setClashes(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c));
    showToast(`Clash ${id} telah ditandai Selesai (Resolved)!`);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 pb-10">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">BIM & Digital Twin</h1>
            <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/5 font-semibold">Tahap 10</Badge>
          </div>
          <p className="text-slate-500 mt-1">Integrasi Model 3D (IFC LOD 300) dengan Data Inspeksi Lapangan & Audit Kerusakan Bangunan.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsConfigModalOpen(true)} className="bg-white">
            <Settings size={16} className="mr-2" />
            Konfigurasi Viewer
          </Button>
          <Button variant="pupr" onClick={() => setIsUploadModalOpen(true)}>
            <Cuboid size={16} className="mr-2" />
            Upload Model IFC
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar shrink-0">
        {[
          { id: 'viewer', label: '3D Viewer (BIM Model)', icon: Cuboid },
          { id: 'clash', label: 'Clash Detection', icon: AlertTriangle },
          { id: 'properties', label: 'BIM Properties & COBie', icon: Info },
          { id: 'simulation', label: 'Simulasi 4D/5D (Biaya & Jadwal)', icon: Play },
        ].map(tab => (
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

      <div className="flex-1 min-h-0">
        
        {/* TAB 1: 3D VIEWER */}
        {activeTab === 'viewer' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="col-span-1 lg:col-span-3 h-full pb-6">
              <Card className="h-full border-0 shadow-sm ring-1 ring-slate-200/50 bg-slate-950 overflow-hidden relative flex flex-col min-h-[450px]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-25 mix-blend-luminosity"></div>
                
                <div className="absolute top-4 left-4 z-10 flex gap-2 items-center">
                  <Badge variant="outline" className="bg-black/70 backdrop-blur-md text-white border-white/20 font-mono">
                    Puskesmas Cikajang (Gedung Utama)
                  </Badge>
                  {uploadedIfcFile && (
                    <Badge className="bg-emerald-600 text-white border-none text-[10px]">
                      Loaded: {uploadedIfcFile}
                    </Badge>
                  )}
                </div>

                {/* Interactive Controls Overlay */}
                <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-20">
                  <Button 
                    size="icon" 
                    variant={wireframeMode ? 'pupr' : 'outline'} 
                    onClick={() => {
                      setWireframeMode(!wireframeMode);
                      showToast(wireframeMode ? 'Mode Shaded Aktif' : 'Mode Wireframe Aktif');
                    }}
                    className="bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800"
                    title="Toggle Wireframe"
                  >
                    <Eye size={18} />
                  </Button>
                  <Button 
                    size="icon" 
                    variant={xrayMode ? 'pupr' : 'outline'} 
                    onClick={() => {
                      setXrayMode(!xrayMode);
                      showToast(xrayMode ? 'Mode Solid Aktif' : 'Mode X-Ray Transparan Aktif');
                    }}
                    className="bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800"
                    title="Toggle X-Ray"
                  >
                    <Layers size={18} />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={() => setRotationAngle(prev => (prev + 45) % 360)}
                    className="bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800"
                    title="Putar Model"
                  >
                    <RotateCw size={18} />
                  </Button>
                </div>

                <div className="relative z-10 flex-1 flex items-center justify-center p-8">
                  {/* Interactive 3D Model Render */}
                  <div 
                    style={{ transform: `rotateX(15deg) rotateY(${rotationAngle}deg)` }}
                    className={`w-72 h-72 border transition-all duration-500 rounded-xl flex items-center justify-center relative cursor-grab active:cursor-grabbing shadow-2xl ${
                      wireframeMode 
                        ? 'border-cyan-400 bg-cyan-950/20 text-cyan-300' 
                        : xrayMode 
                        ? 'border-blue-400/50 bg-blue-900/20 backdrop-blur-md' 
                        : 'border-blue-500/40 bg-blue-900/40 shadow-blue-900/50'
                    }`}
                  >
                    <Box size={110} className={`${wireframeMode ? 'text-cyan-400' : 'text-blue-400'} opacity-90`} strokeWidth={1} />
                    
                    {/* Defect Highlight Marker on Column K-01 */}
                    <div 
                      onClick={() => setSelectedElement('K-01')}
                      className="absolute top-1/4 right-1/4 w-5 h-5 bg-red-600 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-pulse cursor-pointer flex items-center justify-center text-[10px] text-white font-bold"
                    >
                      !
                      <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur border border-red-500/50 text-white text-[10px] px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg">
                        IfcColumn K-01 (Kerusakan 38.5%)
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Model Tree Side Panel */}
            <div className="h-full pb-6 overflow-y-auto">
              <Card className="border-0 shadow-sm ring-1 ring-slate-200/50 min-h-full">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Struktur Pohon Model (IFC Tree)</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2 py-1 text-slate-800 font-bold">
                      <Eye size={14} className="text-pupr-blue" />
                      <span>IfcProject (Puskesmas Cikajang)</span>
                    </div>
                    <div className="pl-4 border-l border-slate-200 ml-1.5 space-y-1">
                      <div className="flex items-center gap-2 py-1 text-slate-700 font-medium">
                        <Eye size={14} className="text-pupr-blue" />
                        <span>IfcBuilding (Gedung Utama)</span>
                      </div>
                      <div className="pl-4 border-l border-slate-200 ml-1.5 space-y-1">
                        <div 
                          onClick={() => setSelectedElement('K-01')}
                          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-all ${
                            selectedElement === 'K-01' ? 'bg-red-50 text-red-700 font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <Eye size={14} className="text-red-600" />
                          <span>IfcColumn (K-01)</span>
                          <Badge variant="destructive" className="ml-auto text-[8px] py-0 h-4">Kritis</Badge>
                        </div>
                        <div 
                          onClick={() => setSelectedElement('B-02')}
                          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-all ${
                            selectedElement === 'B-02' ? 'bg-blue-50 text-pupr-blue font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <Eye size={14} className="text-pupr-blue" />
                          <span>IfcBeam (B-02)</span>
                        </div>
                        <div 
                          onClick={() => setSelectedElement('Wall')}
                          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-all ${
                            selectedElement === 'Wall' ? 'bg-blue-50 text-pupr-blue font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <Eye size={14} className="text-pupr-blue" />
                          <span>IfcWallStandardCase</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Properties Box */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold uppercase text-slate-500 mb-2">PUPR Property Inspection ({selectedElement})</h4>
                    <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Global ID:</span>
                        <span className="font-mono text-slate-900 font-bold">1zG_$uVvX1P...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Material:</span>
                        <span className="font-semibold">Beton Bertulang K-250</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dimensi:</span>
                        <span className="font-semibold">400 x 400 mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tingkat Kerusakan:</span>
                        <span className="font-bold text-red-600">38.5% (Rusak Sedang)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: CLASH DETECTION */}
        {activeTab === 'clash' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-6">
            <Card className="col-span-1 lg:col-span-2 border-0 shadow-sm ring-1 ring-slate-200/50 flex flex-col overflow-hidden bg-slate-950 text-white min-h-[400px]">
              <CardHeader className="border-b border-white/10 bg-black/40 backdrop-blur-md">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-400" />
                  Visualisasi Deteksi Bentrokan Elemen (Clash Matrix)
                </CardTitle>
                <CardDescription className="text-slate-400">Deteksi konflik antar elemen BIM Struktur vs Arsitektur vs Utilitas</CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
                 <div className="w-64 h-64 border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm rounded-xl flex items-center justify-center relative">
                    <Box size={90} className="text-blue-400 opacity-50" strokeWidth={1} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Box size={90} className="text-amber-400 opacity-80" strokeWidth={1} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse -translate-x-1/2 -translate-y-1/2"></div>
                 </div>
                 <p className="text-xs text-slate-300 mt-4 font-mono">Clash Terpilih: CL-0042 (IfcBeam vs IfcDuctSegment)</p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold">Daftar Clash Terdeteksi</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100">
                  {clashes.map((clash) => (
                    <div key={clash.id} className="p-4 hover:bg-slate-50 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-900">{clash.id}</span>
                        <Badge variant={clash.status === 'Resolved' ? 'success' : clash.priority === 'High' ? 'destructive' : 'secondary'} className={clash.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border-none' : ''}>
                          {clash.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{clash.type}: {clash.elements}</p>
                      <div className="flex gap-2 pt-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs bg-white"
                          onClick={() => showToast(`Sorotan elemen ${clash.id} diaktifkan!`)}
                        >
                          Highlight
                        </Button>
                        {clash.status !== 'Resolved' && (
                          <Button 
                            size="sm" 
                            variant="pupr" 
                            className="h-7 text-xs"
                            onClick={() => handleResolveClash(clash.id)}
                          >
                            Resolve Clash
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: PROPERTIES & COBie */}
        {activeTab === 'properties' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardGlass className="border-0 shadow-sm md:col-span-1 border-emerald-200/50 bg-emerald-50/30">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">Database Elemen BIM COBie</CardTitle>
                  <CardDescription className="text-xs">Data standar spesifikasi teknis dan aset fasilitas PUPR</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportCOBie} className="bg-white text-xs">
                  <UploadCloud size={14} className="mr-1.5 text-pupr-blue rotate-180" /> Export COBie (JSON)
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-3">Global ID</th>
                      <th className="p-3">Entity</th>
                      <th className="p-3">Nama Elemen</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { id: '1zG_$uVvX1P...', entity: 'IfcColumn', name: 'Kolom Utama K-01' },
                      { id: '2aT_!wPpY2R...', entity: 'IfcBeam', name: 'Balok Induk B-02' },
                      { id: '3cM_#qNnZ3S...', entity: 'IfcSlab', name: 'Pelat Dak Lantai 2' },
                      { id: '4dX_@bMmW4T...', entity: 'IfcWallStandardCase', name: 'Dinding D-01' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-500">{row.id}</td>
                        <td className="p-3 font-semibold text-slate-800">{row.entity}</td>
                        <td className="p-3 text-slate-700">{row.name}</td>
                        <td className="p-3 text-center">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-2 text-[10px] bg-white"
                            onClick={() => showToast(`Detail COBie untuk ${row.name} ditampilkan!`)}
                          >
                            Inspeksi
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </CardGlass>
            <CardGlass className="border-0 shadow-sm md:col-span-3">
              <CardHeader className="pb-3 border-b border-slate-200 bg-white">
                <CardTitle className="text-sm font-bold">Property Sets (Psets PUPR)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <p className="font-bold uppercase text-pupr-blue">Pset_ColumnCommon (K-01)</p>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Mutu Beton</span>
                    <span className="font-bold">K-250 (f'c = 20.7 MPa)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Dimensi Utama</span>
                    <span className="font-bold">400 x 400 mm</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <p className="font-bold uppercase text-red-600">PUPR_AssessmentData</p>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Kondisi Kerusakan</span>
                    <span className="font-bold text-red-600">38.5% (Rusak Sedang)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Temuan Lapangan</span>
                    <span className="font-bold">Retak Struktur & Spalling</span>
                  </div>
                </div>
              </CardContent>
            </CardGlass>
          </div>
        )}

        {/* TAB 4: SIMULASI 4D/5D */}
        {activeTab === 'simulation' && (
          <div className="pb-6 h-full">
            <Card className="border-0 shadow-sm ring-1 ring-slate-200/50 h-full min-h-[420px] flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative">
              <CardHeader className="border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Play size={18} className="text-emerald-400" />
                      Simulasi Pentahapan Rehabilitasi Bangunan (4D / 5D)
                    </CardTitle>
                    <CardDescription className="text-slate-400">Estimasi Biaya & Jadwal Pekerjaan Perbaikan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 flex flex-col justify-end">
                <div className="bg-black/80 border border-white/10 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="pupr" 
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause size={18} className="mr-1" /> : <Play size={18} className="mr-1" />}
                      {isPlaying ? 'Jeda Simulasi' : 'Mulai Simulasi 4D'}
                    </Button>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs text-slate-300 font-mono">
                        <span>Minggu 1</span>
                        <span className="text-emerald-400 font-bold">Minggu {simWeek} (Aktif)</span>
                        <span>Minggu 8</span>
                      </div>
                      <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300" 
                          style={{ width: `${(simWeek / 8) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4 text-xs">
                    <div>
                      <p className="text-slate-400">Tahap Pekerjaan</p>
                      <p className="text-sm font-bold text-white">
                        {simWeek <= 2 ? 'Persiapan & Pembongkaran Atap' : simWeek <= 5 ? 'Perkuatan Kolom & Retrofitting' : 'Finishing & Serah Terima'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Estimasi Biaya Alokasi (5D)</p>
                      <p className="text-sm font-bold text-emerald-400">
                        Rp {(simWeek * 22500000).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Elemen BIM Terpengaruh</p>
                      <p className="text-sm font-bold text-blue-400">IfcRoof, IfcColumn K-01</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>

      {/* MODAL: UPLOAD IFC MODEL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Cuboid size={18} className="text-pupr-blue" />
                <h3 className="font-bold text-base">Upload Model BIM (IFC)</h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                <UploadCloud size={40} className="mx-auto text-pupr-blue" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Klik atau Tarik Berkas Model IFC Ke Sini</p>
                  <p className="text-[10px] text-slate-500">Mendukung format .ifc, .bim, .obj (Max 150MB)</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setUploadedIfcFile('PUSKESMAS_CIKAJANG_REV2.ifc');
                    setIsUploadModalOpen(false);
                    showToast('Model IFC PUSKESMAS_CIKAJANG_REV2.ifc berhasil dimuat!');
                  }}
                  className="bg-white text-xs font-bold"
                >
                  Pilih File Demo IFC
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIGURASI VIEWER */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-amber-400" />
                <h3 className="font-bold text-base">Konfigurasi Viewer 3D</h3>
              </div>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Renderer Engine</label>
                <select className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white font-semibold">
                  <option>WebGL 2.0 (Three.js Engine)</option>
                  <option>WebGPU (Hardware Accelerated)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tingkat Detail (LOD)</label>
                <select className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white font-semibold">
                  <option>LOD 300 (Komponen Arsitektur + Struktur)</option>
                  <option>LOD 400 (Detail Fabrication & Rebar)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button variant="pupr" size="sm" onClick={() => {
                  setIsConfigModalOpen(false);
                  showToast('Pengaturan viewer disimpan!');
                }}>
                  Simpan Konfigurasi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
