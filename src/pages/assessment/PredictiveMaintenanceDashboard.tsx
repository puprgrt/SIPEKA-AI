import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  Wrench, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Building2, 
  BrainCircuit, 
  Download, 
  SlidersHorizontal, 
  ShieldAlert, 
  ArrowUpRight, 
  RotateCcw, 
  Ruler, 
  Layers, 
  DollarSign, 
  Zap, 
  Info,
  Check,
  ChevronRight,
  RefreshCw,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';

// Historical & Predictive Time Series Datasets for Building Components
export interface BuildingDegradationModel {
  id: string;
  name: string;
  tagId: string;
  yearBuilt: number;
  location: string;
  overallHealth: number; // 0-100%
  rulMonths: number; // Remaining Useful Life in months
  components: Array<{
    name: string;
    type: 'Kolom' | 'Balok' | 'Dinding' | 'Plafon' | 'Pondasi' | 'Atap';
    currentHealth: number;
    decayRatePerYear: number; // % loss per year
    crackGrowthMmPerYear: number;
    recommendedAction: string;
    estimatedCostIdr: number;
    optimalRepairQuarter: string;
    urgency: 'Kritis' | 'Tinggi' | 'Sedang' | 'Preventif';
  }>;
  timeSeriesData: Array<{
    year: string;
    actualScore?: number;
    predictedScore: number;
    postMaintenanceScore: number;
    crackWidthMm: number;
    failureRiskPct: number;
  }>;
}

export const PREDICTIVE_BUILDING_MODELS: BuildingDegradationModel[] = [
  {
    id: 'bld-01',
    name: 'Puskesmas DTP Cikajang',
    tagId: 'QR-PUPR-2026-001',
    yearBuilt: 2018,
    location: 'Kecamatan Cikajang, Kab. Garut',
    overallHealth: 68,
    rulMonths: 18,
    components: [
      {
        name: 'Kolom Utama K-01 Teras',
        type: 'Kolom',
        currentHealth: 62,
        decayRatePerYear: 6.5,
        crackGrowthMmPerYear: 0.8,
        recommendedAction: 'Injeksi Semen Epoksi & Fiber Reinforced Polymer (FRP) Jacketing',
        estimatedCostIdr: 45000000,
        optimalRepairQuarter: 'Q4 2026',
        urgency: 'Kritis'
      },
      {
        name: 'Balok Teras B-02',
        type: 'Balok',
        currentHealth: 72,
        decayRatePerYear: 4.2,
        crackGrowthMmPerYear: 0.4,
        recommendedAction: 'Grouting Retak & Coating Hydrophobic',
        estimatedCostIdr: 22000000,
        optimalRepairQuarter: 'Q1 2027',
        urgency: 'Sedang'
      },
      {
        name: 'Dinding Bata Poli Umum',
        type: 'Dinding',
        currentHealth: 85,
        decayRatePerYear: 2.1,
        crackGrowthMmPerYear: 0.1,
        recommendedAction: 'Pengecatan Ulang Anti-Jamur & Perbaikan Plesteran',
        estimatedCostIdr: 12000000,
        optimalRepairQuarter: 'Q3 2027',
        urgency: 'Preventif'
      }
    ],
    timeSeriesData: [
      { year: '2021', actualScore: 96, predictedScore: 96, postMaintenanceScore: 96, crackWidthMm: 0.2, failureRiskPct: 2 },
      { year: '2022', actualScore: 91, predictedScore: 91, postMaintenanceScore: 91, crackWidthMm: 0.5, failureRiskPct: 5 },
      { year: '2023', actualScore: 84, predictedScore: 84, postMaintenanceScore: 84, crackWidthMm: 0.9, failureRiskPct: 12 },
      { year: '2024', actualScore: 78, predictedScore: 78, postMaintenanceScore: 78, crackWidthMm: 1.4, failureRiskPct: 22 },
      { year: '2025', actualScore: 72, predictedScore: 72, postMaintenanceScore: 72, crackWidthMm: 1.9, failureRiskPct: 35 },
      { year: '2026', actualScore: 68, predictedScore: 68, postMaintenanceScore: 68, crackWidthMm: 2.5, failureRiskPct: 48 },
      { year: '2027 (Prediksi)', predictedScore: 59, postMaintenanceScore: 92, crackWidthMm: 3.2, failureRiskPct: 65 },
      { year: '2028 (Prediksi)', predictedScore: 48, postMaintenanceScore: 88, crackWidthMm: 4.1, failureRiskPct: 82 },
      { year: '2029 (Prediksi)', predictedScore: 36, postMaintenanceScore: 84, crackWidthMm: 5.3, failureRiskPct: 94 },
      { year: '2030 (Prediksi)', predictedScore: 22, postMaintenanceScore: 80, crackWidthMm: 6.8, failureRiskPct: 99 }
    ]
  },
  {
    id: 'bld-02',
    name: 'Pasar Rakyat Wanaraja',
    tagId: 'QR-PUPR-2026-003',
    yearBuilt: 2010,
    location: 'Kecamatan Wanaraja, Kab. Garut',
    overallHealth: 42,
    rulMonths: 5,
    components: [
      {
        name: 'Pedestal Beton & Kolom Baja WF',
        type: 'Kolom',
        currentHealth: 38,
        decayRatePerYear: 9.8,
        crackGrowthMmPerYear: 1.4,
        recommendedAction: 'Perkuatan Sambungan Las, Cat Anti-Korosi & Encasement Beton',
        estimatedCostIdr: 85000000,
        optimalRepairQuarter: 'Q3 2026 (Mendesak)',
        urgency: 'Kritis'
      },
      {
        name: 'Rangka Atap Trusses Baja',
        type: 'Atap',
        currentHealth: 51,
        decayRatePerYear: 7.2,
        crackGrowthMmPerYear: 0.9,
        recommendedAction: 'Pembersihan Korosi & Pengantian Baut Gording',
        estimatedCostIdr: 38000000,
        optimalRepairQuarter: 'Q4 2026',
        urgency: 'Tinggi'
      }
    ],
    timeSeriesData: [
      { year: '2021', actualScore: 82, predictedScore: 82, postMaintenanceScore: 82, crackWidthMm: 1.1, failureRiskPct: 15 },
      { year: '2022', actualScore: 73, predictedScore: 73, postMaintenanceScore: 73, crackWidthMm: 1.8, failureRiskPct: 28 },
      { year: '2023', actualScore: 63, predictedScore: 63, postMaintenanceScore: 63, crackWidthMm: 2.6, failureRiskPct: 45 },
      { year: '2024', actualScore: 54, predictedScore: 54, postMaintenanceScore: 54, crackWidthMm: 3.3, failureRiskPct: 62 },
      { year: '2025', actualScore: 48, predictedScore: 48, postMaintenanceScore: 48, crackWidthMm: 3.8, failureRiskPct: 75 },
      { year: '2026', actualScore: 42, predictedScore: 42, postMaintenanceScore: 42, crackWidthMm: 4.2, failureRiskPct: 88 },
      { year: '2027 (Prediksi)', predictedScore: 30, postMaintenanceScore: 88, crackWidthMm: 5.2, failureRiskPct: 96 },
      { year: '2028 (Prediksi)', predictedScore: 18, postMaintenanceScore: 83, crackWidthMm: 6.5, failureRiskPct: 99 },
      { year: '2029 (Prediksi)', predictedScore: 8, postMaintenanceScore: 78, crackWidthMm: 8.0, failureRiskPct: 100 },
      { year: '2030 (Prediksi)', predictedScore: 0, postMaintenanceScore: 72, crackWidthMm: 9.8, failureRiskPct: 100 }
    ]
  },
  {
    id: 'bld-03',
    name: 'SDN 1 Tarogong Kidul',
    tagId: 'QR-PUPR-2026-002',
    yearBuilt: 2012,
    location: 'Kecamatan Tarogong Kidul, Kab. Garut',
    overallHealth: 74,
    rulMonths: 34,
    components: [
      {
        name: 'Balok Induk B-02 Koridor Lt 2',
        type: 'Balok',
        currentHealth: 74,
        decayRatePerYear: 3.8,
        crackGrowthMmPerYear: 0.3,
        recommendedAction: 'Perbaikan Talang Air Dak & Injeksi Epoksi Low-Viscosity',
        estimatedCostIdr: 28000000,
        optimalRepairQuarter: 'Q2 2027',
        urgency: 'Sedang'
      },
      {
        name: 'Plafon Selasar Koridor',
        type: 'Plafon',
        currentHealth: 71,
        decayRatePerYear: 4.5,
        crackGrowthMmPerYear: 0.2,
        recommendedAction: 'Pengantian Rangka Hollow Galvalum & Plafon GRC',
        estimatedCostIdr: 18000000,
        optimalRepairQuarter: 'Q3 2027',
        urgency: 'Sedang'
      }
    ],
    timeSeriesData: [
      { year: '2021', actualScore: 94, predictedScore: 94, postMaintenanceScore: 94, crackWidthMm: 0.1, failureRiskPct: 1 },
      { year: '2022', actualScore: 89, predictedScore: 89, postMaintenanceScore: 89, crackWidthMm: 0.3, failureRiskPct: 4 },
      { year: '2023', actualScore: 84, predictedScore: 84, postMaintenanceScore: 84, crackWidthMm: 0.6, failureRiskPct: 9 },
      { year: '2024', actualScore: 80, predictedScore: 80, postMaintenanceScore: 80, crackWidthMm: 0.8, failureRiskPct: 14 },
      { year: '2025', actualScore: 77, predictedScore: 77, postMaintenanceScore: 77, crackWidthMm: 1.0, failureRiskPct: 19 },
      { year: '2026', actualScore: 74, predictedScore: 74, postMaintenanceScore: 74, crackWidthMm: 1.2, failureRiskPct: 24 },
      { year: '2027 (Prediksi)', predictedScore: 68, postMaintenanceScore: 94, crackWidthMm: 1.6, failureRiskPct: 38 },
      { year: '2028 (Prediksi)', predictedScore: 61, postMaintenanceScore: 90, crackWidthMm: 2.1, failureRiskPct: 52 },
      { year: '2029 (Prediksi)', predictedScore: 52, postMaintenanceScore: 86, crackWidthMm: 2.8, failureRiskPct: 69 },
      { year: '2030 (Prediksi)', predictedScore: 42, postMaintenanceScore: 81, crackWidthMm: 3.6, failureRiskPct: 84 }
    ]
  }
];

export function PredictiveMaintenanceDashboard() {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('bld-01');
  const [simulateRepair, setSimulateRepair] = useState<boolean>(true);
  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState<string>('ALL');

  const selectedBuilding = PREDICTIVE_BUILDING_MODELS.find(b => b.id === selectedBuildingId) || PREDICTIVE_BUILDING_MODELS[0];

  // Total Estimated Investment needed for preventive repairs
  const totalPreventiveBudget = selectedBuilding.components.reduce((acc, c) => acc + c.estimatedCostIdr, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-pupr-blue text-white p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-pupr-yellow text-slate-950 font-bold text-[10px] uppercase">
              AI Machine Learning Analytics
            </Badge>
            <Badge variant="outline" className="text-emerald-300 border-emerald-400/40 text-[10px] font-mono">
              Degradation Forecasting Engine
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Predictive Maintenance & Degradation Forecast
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Proyeksi laju degradasi elemen struktur bangunan berbasis data histori inspeksi lapangan PUPR, estimasi sisa usia layu (RUL), dan rekomendasi jadwal perbaikan preventif.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <Button
            size="sm"
            onClick={() => {
              alert(`Mencetak Laporan Proyeksi Pemeliharaan Preventif PUPR (${selectedBuilding.name}) dalam format PDF...`);
            }}
            className="bg-pupr-yellow hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
          >
            <Download size={14} className="mr-1.5" /> Ekspor Rencana Pemeliharaan (PDF)
          </Button>
        </div>
      </div>

      {/* Building Selector & Key Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Building Picker Card */}
        <Card className="lg:col-span-1 border-slate-200 shadow-2xs rounded-2xl bg-white p-4 space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Pilih Gedung Inspeksi
          </label>
          <div className="space-y-2">
            {PREDICTIVE_BUILDING_MODELS.map((bld) => (
              <button
                key={bld.id}
                onClick={() => setSelectedBuildingId(bld.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  selectedBuildingId === bld.id
                    ? 'bg-blue-50/80 border-pupr-blue text-pupr-blue shadow-xs font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{bld.name}</span>
                  <Badge className="text-[10px] bg-slate-900 text-white font-mono">
                    {bld.tagId}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>Skor Kesehatan: <strong>{bld.overallHealth}%</strong></span>
                  <span className={bld.rulMonths < 12 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    RUL: {bld.rulMonths} Bln
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* 3 Metric Summary Cards */}
        <Card className="border-slate-200 shadow-2xs rounded-2xl bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Indeks Kesehatan Fisik Saat Ini</span>
            <div className="p-2 bg-blue-50 text-pupr-blue rounded-xl">
              <Activity size={18} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-slate-900 font-mono">
              {selectedBuilding.overallHealth}%
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kondisi riil hasil asesmen kelaikan fungsi
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full ${
                selectedBuilding.overallHealth < 50 ? 'bg-red-500' : selectedBuilding.overallHealth < 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${selectedBuilding.overallHealth}%` }}
            />
          </div>
        </Card>

        <Card className="border-slate-200 shadow-2xs rounded-2xl bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Sisa Usia Layak (RUL) Tanpa Perbaikan</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-amber-600 font-mono">
              {selectedBuilding.rulMonths} Bulan
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hingga mencapai ambang kritis (&lt; 50%)
            </p>
          </div>
          <div className="text-[11px] font-bold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
            Target Intervensi: {selectedBuilding.components[0]?.optimalRepairQuarter || 'Q4 2026'}
          </div>
        </Card>

        <Card className="border-slate-200 shadow-2xs rounded-2xl bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Estimasi Anggaran Preventif</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono">
              Rp {(totalPreventiveBudget / 1000000).toFixed(1)} Juta
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hemat ~65% dibanding rekonstruksi total
            </p>
          </div>
          <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1">
            <Zap size={13} /> Ekstensi Usia Layan: +3.5 Tahun
          </div>
        </Card>
      </div>

      {/* RECHARTS CHART SECTION 1: DEGRADATION TREND & REPAIR SIMULATION */}
      <Card className="border-slate-200 shadow-2xs rounded-2xl bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <LineChartIcon size={18} className="text-pupr-blue" />
              <h3 className="text-base font-extrabold text-slate-900">
                Grafik Proyeksi Degradasi Kesehatan Struktur (2021 - 2030)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Komparasi garis laju penurunan kondisi alami vs. pemulihan pasca-perbaikan preventif
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSimulateRepair(!simulateRepair)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                simulateRepair
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Sparkles size={14} className={simulateRepair ? 'text-amber-300 animate-pulse' : ''} />
              {simulateRepair ? 'Simulasi Perbaikan Aktif (2026)' : 'Tampilkan Kurva Alami Only'}
            </button>
          </div>
        </div>

        {/* Recharts AreaChart */}
        <div className="h-[340px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedBuilding.timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorPost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {/* Critical Threshold Lines */}
              <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Ambang Rusak Ringan (70%)', fill: '#d97706', fontSize: 10, position: 'insideBottomRight' }} />
              <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Ambang Batas Kritis (50%)', fill: '#dc2626', fontSize: 10, position: 'insideBottomRight' }} />

              {/* Lines */}
              <Area 
                type="monotone" 
                dataKey="predictedScore" 
                name="Penurunan Alami (Tanpa Pemeliharaan)" 
                stroke="#ef4444" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorPredicted)" 
              />

              {simulateRepair && (
                <Area 
                  type="monotone" 
                  dataKey="postMaintenanceScore" 
                  name="Pemulihan Pasca-Perbaikan Q4 2026" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorPost)" 
                />
              )}

              <Line 
                type="monotone" 
                dataKey="actualScore" 
                name="Hasil Inspeksi Historis" 
                stroke="#2563eb" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#2563eb' }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* RECHARTS CHART SECTION 2 & 3: CRACK GROWTH & COMPONENT HEALTH MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 2: Crack Growth vs Failure Probability */}
        <Card className="border-slate-200 shadow-2xs rounded-2xl bg-white p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Ruler size={16} className="text-amber-500" />
                Tren Pertumbuhan Lebar Retak vs Risiko Kegagalan (%)
              </h3>
              <p className="text-[11px] text-slate-500">
                Laju ekspansi retak struktural (mm) & probabilitas kegagalan konstruksi
              </p>
            </div>
          </div>

          <div className="h-[260px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={selectedBuilding.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10, fill: '#64748b' }} unit=" mm" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />

                <Bar yAxisId="left" dataKey="crackWidthMm" name="Lebar Retak (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="failureRiskPct" name="Probabilitas Kegagalan (%)" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Health Breakdown by Structural Component */}
        <Card className="border-slate-200 shadow-2xs rounded-2xl bg-white p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Layers size={16} className="text-pupr-blue" />
                Matriks Kesehatan Komponen Terpisah
              </h3>
              <p className="text-[11px] text-slate-500">
                Skor kesehatan aktual vs laju degradasi tahunan (% per tahun)
              </p>
            </div>
          </div>

          <div className="h-[260px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedBuilding.components} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fontWeight: 600 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="currentHealth" name="Kesehatan Komponen (%)" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* RECOMMENDED PREDICTIVE REPAIR SCHEDULE & ACTIONS TABLE */}
      <Card className="border-slate-200 shadow-2xs rounded-2xl bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/80 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench size={18} className="text-pupr-blue" />
              Rekomendasi Jadwal & Intervensi Perbaikan Preventif (AI Engine)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Optimalisasi urutan perbaikan berdasarkan prioritas tingkat risiko dan efisiensi biaya
            </CardDescription>
          </div>

          <Badge className="bg-emerald-600 text-white font-mono text-xs">
            {selectedBuilding.components.length} Komponen Terdeteksi
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {selectedBuilding.components.map((comp, idx) => (
              <div key={idx} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs bg-slate-100 text-slate-800 font-bold border-slate-300">
                      {comp.type}
                    </Badge>
                    <h4 className="text-sm font-extrabold text-slate-900">{comp.name}</h4>
                    <Badge className={`text-[10px] ${
                      comp.urgency === 'Kritis' ? 'bg-red-600 text-white' : comp.urgency === 'Tinggi' ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      Prioritas: {comp.urgency}
                    </Badge>
                  </div>

                  <p className="text-xs font-medium text-slate-700 bg-blue-50/60 p-2 rounded-xl border border-blue-100/80 flex items-center gap-1.5 mt-1">
                    <Wrench size={13} className="text-pupr-blue shrink-0" />
                    <span><strong>Metode Rekomendasi:</strong> {comp.recommendedAction}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1 font-mono">
                    <span>Laju Lelah: <strong className="text-slate-800">-{comp.decayRatePerYear}%/Thn</strong></span>
                    <span>Laju Retak: <strong className="text-slate-800">+{comp.crackGrowthMmPerYear} mm/Thn</strong></span>
                    <span>Target Jadwal: <strong className="text-amber-700">{comp.optimalRepairQuarter}</strong></span>
                  </div>
                </div>

                {/* Right Column Price & Action */}
                <div className="flex flex-col md:items-end shrink-0 space-y-1.5 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-semibold">Estimasi Biaya Perbaikan</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      Rp {comp.estimatedCostIdr.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="pupr"
                    onClick={() => {
                      alert(`Jadwal perbaikan [${comp.name}] ditambahkan ke Dokumen Rencana Kerja Anggaran (RKA) DPUPR Garut.`);
                    }}
                    className="text-xs font-bold h-8"
                  >
                    <Calendar size={13} className="mr-1" /> Ajukan RKA Pemeliharaan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
