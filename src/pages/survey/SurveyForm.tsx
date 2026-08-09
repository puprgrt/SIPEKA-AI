import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardGlass, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LeafletMap } from '@/components/ui/LeafletMap';
import { 
  ArrowLeft, Save, MapPin, UploadCloud, CheckCircle2, ChevronRight, 
  ChevronLeft, Download, Info, Camera, Sparkles, Image as ImageIcon, Trash2, Map as MapIcon, X, Upload,
  Building2, AlertTriangle, ShieldCheck, FileText, Clock, UserCheck, FileCheck, Eye, Activity
} from 'lucide-react';
import jsPDF from 'jspdf';
import { addFooterWithQRCode } from '../../lib/pdf-utils';
import autoTable from 'jspdf-autotable';
import { COMPONENT_GROUPS, DAMAGE_LEVELS, COMPONENT_DAMAGE_GUIDES } from '@/lib/assessmentRules';
import { SurveyItem } from './SurveyList';
import { SurveyProgressBar } from '@/components/survey/SurveyProgressBar';
import { CameraAnnotationModal } from '@/components/survey/CameraAnnotationModal';
import { VoiceInput } from '@/components/survey/VoiceInput';
import { PdfPreviewModal } from '@/components/common/PdfPreviewModal';
import { compressImage } from '@/lib/imageCompression';
import { offlineSync } from '@/lib/offlineSync';

export function SurveyForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);

  const [dataPanduan] = useState<Record<string, any>>(() => {
    const s = localStorage.getItem('sipeka_master_panduan');
    return s ? JSON.parse(s) : COMPONENT_DAMAGE_GUIDES;
  });

  const goToStep = (targetStep: number) => {
    setStep(targetStep);
    setMaxVisitedStep(prev => Math.max(prev, targetStep));
  };
  const [guideModal, setGuideModal] = useState<{ isOpen: boolean, component: any }>({ isOpen: false, component: null });
  const [pdfPreviewModal, setPdfPreviewModal] = useState<{ isOpen: boolean; url: string | null; filename: string }>({
    isOpen: false,
    url: null,
    filename: '',
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsAddressInfo, setGpsAddressInfo] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLiveGps, setIsLiveGps] = useState(false);
  const gpsWatchIdRef = React.useRef<number | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [cameraModal, setCameraModal] = useState<{
    isOpen: boolean;
    itemId?: string;
    itemName?: string;
    damageValue?: number;
    damageLabel?: string;
  }>({ isOpen: false });

  // Legal agreement checkbox state for step 4 confirmation
  const [isAgreedLegal, setIsAgreedLegal] = useState(true);

  const showGuide = localStorage.getItem('showComponentGuide') !== 'false';
  const showPhotos = localStorage.getItem('showDamagePhotos') !== 'false';
  
  // Photo previews state
  const [denahFile, setDenahFile] = useState<{ file: File; url: string } | null>(null);
  const [sidePhotos, setSidePhotos] = useState<Record<string, { file: File; url: string }>>({});
  
  const [formData, setFormData] = useState({
    instansi: '',
    kodeOpd: '',
    namaBangunan: '',
    nup: '',
    tahunDibangun: '',
    jumlahLantai: '1',
    luas: '',
    alamat: '',
    kecamatan: '',
    desa: '',
    koordinat: '',
    deskripsi: '',
    catatanKhusus: '',
    nomorSurat: '',
    elemenKerusakan: [] as string[],
    kerusakan: {} as Record<string, { 
      isDamaged: boolean, 
      volTotal?: number, 
      damages: Record<string, number>, 
      documents?: Record<string, string>,
      documentUrls?: Record<string, string>
    }>
  });

  const handleGetLocation = () => {
    setGpsLoading(true);
    setGpsSuccess(false);
    setGpsError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const acc = position.coords.accuracy;
          const coordsStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

          setFormData(prev => ({ ...prev, koordinat: coordsStr }));
          setGpsAccuracy(acc);
          setGpsLoading(false);
          setGpsSuccess(true);

          // Reverse geocoding via OpenStreetMap Nominatim
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                const addr = data.address;
                const subdistrict = addr.subdistrict || addr.district || addr.town || addr.city_district || '';
                const village = addr.village || addr.neighbourhood || addr.suburb || addr.quarter || '';
                const road = addr.road || addr.pedestrian || data.display_name?.split(',')[0] || '';

                if (subdistrict || village || road) {
                  setGpsAddressInfo(data.display_name || 'Lokasi terdeteksi');
                  setFormData(prev => ({
                    ...prev,
                    kecamatan: prev.kecamatan || subdistrict || prev.kecamatan,
                    desa: prev.desa || village || prev.desa,
                    alamat: prev.alamat || road || prev.alamat
                  }));
                }
              }
            }
          } catch (e) {
            console.log('Reverse geocoding unavailable or offline.');
          }
        },
        (err) => {
          console.warn('GPS Geolocation Error:', err);
          // High accuracy failed or timed out, attempt standard fallback or prompt user
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coordsStr = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
              setFormData(prev => ({ ...prev, koordinat: coordsStr }));
              setGpsAccuracy(pos.coords.accuracy);
              setGpsLoading(false);
              setGpsSuccess(true);
            },
            () => {
              // Garut fallback if device has no GPS fix or blocked
              setFormData(prev => ({ ...prev, koordinat: '-7.2028, 107.8824' }));
              setGpsError('GPS Perangkat tidak merespons atau izin ditolak. Menggunakan titik default Garut.');
              setGpsLoading(false);
              setGpsSuccess(true);
            },
            { enableHighAccuracy: false, timeout: 8000 }
          );
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } else {
      setFormData(prev => ({ ...prev, koordinat: '-7.2028, 107.8824' }));
      setGpsError('Browser ini tidak mendukung Geolocation HTML5.');
      setGpsLoading(false);
      setGpsSuccess(true);
    }
  };

  const toggleLiveGpsTracking = () => {
    if (isLiveGps) {
      if (gpsWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      setIsLiveGps(false);
    } else {
      if (navigator.geolocation) {
        setIsLiveGps(true);
        setGpsError(null);
        gpsWatchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setFormData(prev => ({ ...prev, koordinat: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
            setGpsAccuracy(position.coords.accuracy);
            setGpsSuccess(true);
          },
          (err) => {
            console.warn('Watch position error:', err);
            setGpsError('Koneksi GPS Real-Time terputus.');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }
        );
      } else {
        alert('Geolocation tidak didukung oleh browser Anda.');
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (gpsWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      }
    };
  }, []);

  const handleDenahUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        file = await compressImage(file);
      }
      const url = URL.createObjectURL(file);
      setDenahFile({ file, url });
    }
  };

  const handleSidePhotoUpload = async (viewId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      file = await compressImage(file);
      const url = URL.createObjectURL(file);
      setSidePhotos(prev => ({ ...prev, [viewId]: { file, url } }));
    }
  };

  const handleFileUpload = async (itemId: string, damageValue: number, fileParam: File, customUrl?: string) => {
    let file = fileParam;
    if (file.type.startsWith('image/')) {
      file = await compressImage(file);
    }
    const url = customUrl || URL.createObjectURL(file);
    setFormData(prev => {
      const itemData = prev.kerusakan[itemId] || { isDamaged: false, volTotal: 0, damages: {}, documents: {}, documentUrls: {} };
      return {
        ...prev,
        kerusakan: {
          ...prev.kerusakan,
          [itemId]: {
            ...itemData,
            documents: {
              ...(itemData.documents || {}),
              [damageValue.toString()]: file.name
            },
            documentUrls: {
              ...(itemData.documentUrls || {}),
              [damageValue.toString()]: url
            }
          }
        }
      };
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const visibleGroups = React.useMemo(() => {
    const floorCount = parseInt(formData.jumlahLantai) || 1;
    return COMPONENT_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(item => !item.minFloor || item.minFloor <= floorCount)
    })).filter(group => group.items.length > 0);
  }, [formData.jumlahLantai]);

  const handleKerusakanChange = (id: string, field: 'isDamaged' | 'volTotal', value: any) => {
    setFormData(prev => ({
      ...prev,
      kerusakan: {
        ...prev.kerusakan,
        [id]: {
          ...(prev.kerusakan[id] || { isDamaged: false, volTotal: 100, damages: {} }),
          [field]: value
        }
      }
    }));
  };

  const handleDamageVolumeChange = (id: string, levelValue: string, volume: number) => {
    setFormData(prev => {
      const current = prev.kerusakan[id] || { isDamaged: true, volTotal: 100, damages: {} };
      const newDamages = {
        ...current.damages,
        [levelValue]: volume
      };
      
      const newVolTotal = Object.values(newDamages).reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0);
      
      return {
        ...prev,
        kerusakan: {
          ...prev.kerusakan,
          [id]: {
            ...current,
            volTotal: newVolTotal,
            damages: newDamages
          }
        }
      };
    });
  };

  // Memoized summary statistics for Step 4 Confirmation
  const damagedComponentsList = useMemo(() => {
    const result: Array<{ id: string; name: string; volTotal: number; maxDamage: number; damageLabel: string; photoCount: number }> = [];
    
    Object.keys(formData.kerusakan).forEach(itemId => {
      const itemData = formData.kerusakan[itemId];
      if (itemData?.isDamaged) {
        let foundName = itemId;
        let maxD = 0;
        Object.keys(itemData.damages || {}).forEach(dmgValStr => {
          const val = Number(dmgValStr);
          if (itemData.damages[dmgValStr] > 0 && val > maxD) {
            maxD = val;
          }
        });

        COMPONENT_GROUPS.forEach(grp => {
          grp.items.forEach(it => {
            if (it.id === itemId) foundName = it.name;
          });
        });

        let label = 'Kerusakan Ringan (15%)';
        if (maxD >= 1) label = 'Sangat Berat / Keruntuhan (100%)';
        else if (maxD >= 0.7) label = 'Rusak Berat (70%)';
        else if (maxD >= 0.35) label = 'Rusak Sedang (35%)';

        const photoCount = Object.keys(itemData.documents || {}).length;

        result.push({
          id: itemId,
          name: foundName,
          volTotal: itemData.volTotal || 0,
          maxDamage: maxD,
          damageLabel: label,
          photoCount
        });
      }
    });

    return result;
  }, [formData.kerusakan]);

  const totalDamagedItems = damagedComponentsList.length;

  const highestRiskCategory = useMemo(() => {
    if (damagedComponentsList.some(d => d.maxDamage >= 0.7)) return 'Rusak Berat (Prioritas Tinggi)';
    if (damagedComponentsList.some(d => d.maxDamage >= 0.35)) return 'Rusak Sedang (Prioritas Menengah)';
    if (damagedComponentsList.length > 0) return 'Rusak Ringan (Pemeliharaan Rutin)';
    return 'Kondisi Baik / Belum Rusak';
  }, [damagedComponentsList]);

  const totalAttachedPhotos = useMemo(() => {
    let count = Object.keys(sidePhotos).length + (denahFile ? 1 : 0);
    Object.values(formData.kerusakan).forEach((k: any) => {
      if (k?.documents) {
        count += Object.keys(k.documents).length;
      }
    });
    return count;
  }, [formData.kerusakan, sidePhotos, denahFile]);

  const handleSubmitPermohonan = () => {
    if (!isAgreedLegal) {
      alert('Mohon centang persetujuan keabsahan dan kebenaran data terlebih dahulu sebelum mengirim permohonan.');
      return;
    }

    // Generate new survey ID
    const newId = `SRV-0${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    const newSurvey: SurveyItem = {
      id: newId,
      name: formData.namaBangunan || 'Bangunan Baru',
      type: formData.instansi.toLowerCase().includes('sekolah') || formData.instansi.toLowerCase().includes('sd') || formData.instansi.toLowerCase().includes('smp') ? 'Sekolah' : 'Gedung Pemerintah',
      date: today,
      status: 'Menunggu Verifikasi',
      risk: highestRiskCategory.includes('Berat') ? 'Tinggi' : highestRiskCategory.includes('Sedang') ? 'Sedang' : 'Ringan',
      instansi: formData.instansi,
      kodeOpd: formData.kodeOpd,
      nup: formData.nup,
      jumlahLantai: formData.jumlahLantai,
      luas: formData.luas,
      alamat: formData.alamat,
      kecamatan: formData.kecamatan,
      desa: formData.desa,
      koordinat: formData.koordinat,
      deskripsi: formData.deskripsi
    };

    // Save to localStorage (optimistic)
    const saved = localStorage.getItem('sipeka_surveys');
    let list: SurveyItem[] = [];
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) {}
    }
    list = [newSurvey, ...list];
    localStorage.setItem('sipeka_surveys', JSON.stringify(list));

    // Queue to offline sync
    offlineSync.addToQueue({
      operation: 'POST',
      endpoint: '/api/surveys',
      payload: newSurvey
    }).catch(console.error);

    // Try processing queue in background
    if (navigator.onLine) {
      offlineSync.processQueue().catch(console.error);
    }

    goToStep(5);
  };

  const generatePDF = async (autoDownload = false) => {
    try {
      const { SuratPermohonanGenerator } = await import('../../lib/pdf-generator/SuratPermohonan');
      const generator = new SuratPermohonanGenerator();
      
      const docId = formData.nup || "SRV-" + Math.floor(Math.random() * 1000);
      
      const pdfBlob = await generator.generateSurat({
        documentId: docId,
        documentNumber: formData.nomorSurat || `600.1.15.3/${Math.floor(100 + Math.random() * 900)}/DPUPR`,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        applicant: {
          instansiAtas: 'DINAS PENDIDIKAN',
          instansiBawah: formData.instansi || '-',
          alamat: formData.alamat || '-',
        },
        building: {
          name: formData.namaBangunan || '-',
          npsn: formData.kodeOpd || '-',
          area: Number(formData.luas) || 0,
          floors: Number(formData.jumlahLantai) || 1,
          address: formData.alamat || '-',
          village: formData.desa || '-',
          district: formData.kecamatan || '-',
          regency: 'Kabupaten Garut',
          province: 'Jawa Barat',
          coordinates: formData.koordinat ? {
             lat: parseFloat(formData.koordinat.split(',')[0]),
             lng: parseFloat(formData.koordinat.split(',')[1])
          } : undefined
        },
        purpose: formData.deskripsi || 'Penilaian teknis kerusakan bangunan.',
        background: 'Berdasarkan kondisi visual di lapangan yang mengalami kerusakan.',
        attachmentCount: totalAttachedPhotos || 1,
        signer: {
          name: 'Kepala Instansi',
          nip: '-',
          position: 'Kepala ' + (formData.instansi || 'Instansi'),
          organization: formData.instansi || 'Instansi Pemohon',
          status: 'PENDING'
        },
        baseUrl: window.location.origin
      });

      const filename = `Surat_Permohonan_${formData.instansi || 'SIPEKA'}.pdf`;

      if (autoDownload) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const blobUrl = URL.createObjectURL(pdfBlob);
        setPdfPreviewModal({
          isOpen: true,
          url: blobUrl,
          filename,
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat pratinjau surat permohonan.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/survey')} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Formulir Permohonan Penilaian Mandiri</h1>
              <Badge variant="pupr" className="text-xs">Tahap 4</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Lengkapi data bangunan dan kondisi fisik untuk ditindaklanjuti oleh Tim Teknis PUPR.</p>
          </div>
        </div>

        
      </div>

      {/* Multi-step progress bar component */}
      <SurveyProgressBar
        currentStep={step}
        maxVisitedStep={maxVisitedStep}
        onStepClick={(targetStep) => goToStep(targetStep)}
      />

      <CardGlass className="border-0 shadow-sm mt-8">
        <CardHeader className="border-b border-border/40 pb-5">
          <CardTitle className="text-xl font-bold">
            {step === 1 && 'Identitas Bangunan Gedung'}
            {step === 2 && 'Lokasi & Gambar Bangunan'}
            {step === 3 && 'Indikasi Kerusakan Fisik'}
            {step === 4 && 'Penyelesaian & Konfirmasi'}
            {step === 5 && 'Permohonan Berhasil Dikirim'}
          </CardTitle>
          <CardDescription className="text-sm">
            {step === 5 ? 'Unduh surat permohonan resmi dan serahkan ke instansi terkait.' : 'Pastikan data yang diinputkan sesuai dengan kondisi aktual di lapangan.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 overflow-hidden min-h-[420px]">
          <div
            key={step}
            className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-300 ease-out"
          >
              
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Instansi / Sekolah <span className="text-danger">*</span></label>
                    <Input value={formData.instansi} onChange={e => handleInputChange('instansi', e.target.value)} placeholder="Contoh: SDN 1 Tarogong Kidul" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kode OPD / NPSN</label>
                    <Input value={formData.kodeOpd} onChange={e => handleInputChange('kodeOpd', e.target.value)} placeholder="Masukkan nomor identitas instansi" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Bangunan / Gedung <span className="text-danger">*</span></label>
                    <Input value={formData.namaBangunan} onChange={e => handleInputChange('namaBangunan', e.target.value)} placeholder="Contoh: Gedung Kelas Utama" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Urut Perolehan (NUP)</label>
                    <Input value={formData.nup} onChange={e => handleInputChange('nup', e.target.value)} placeholder="Masukkan NUP barang (opsional)" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tahun Dibangun</label>
                    <Input value={formData.tahunDibangun} onChange={e => handleInputChange('tahunDibangun', e.target.value)} type="number" placeholder="Contoh: 2010" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jumlah Lantai</label>
                      <Input value={formData.jumlahLantai} onChange={e => handleInputChange('jumlahLantai', e.target.value)} type="number" placeholder="1" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Luas (m²)</label>
                      <Input value={formData.luas} onChange={e => handleInputChange('luas', e.target.value)} type="number" placeholder="400" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Alamat Lengkap Bangunan</label>
                    <Input value={formData.alamat} onChange={e => handleInputChange('alamat', e.target.value)} placeholder="Nama Jalan, RT/RW, Dusun" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kecamatan</label>
                      <Input value={formData.kecamatan} onChange={e => handleInputChange('kecamatan', e.target.value)} placeholder="Contoh: Tarogong Kidul" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Desa / Kelurahan</label>
                      <Input value={formData.desa} onChange={e => handleInputChange('desa', e.target.value)} placeholder="Contoh: Sukagalih" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Koordinat GPS Real-Time Device & Peta</label>
                      <button
                        type="button"
                        onClick={toggleLiveGpsTracking}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                          isLiveGps 
                            ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isLiveGps ? 'bg-red-500' : 'bg-slate-400'}`} />
                        {isLiveGps ? 'Tracking GPS Real-Time Aktif' : 'Mulai Tracking GPS Live'}
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input 
                        value={formData.koordinat} 
                        onChange={e => handleInputChange('koordinat', e.target.value)} 
                        placeholder="-7.2028, 107.8824" 
                        className="flex-1 font-mono text-xs font-semibold bg-white dark:bg-slate-800" 
                      />
                      <Button 
                        type="button" 
                        onClick={handleGetLocation} 
                        disabled={gpsLoading} 
                        variant="outline" 
                        className="shrink-0 text-pupr-blue dark:text-blue-300 border-pupr-blue/40 hover:bg-blue-50 dark:hover:bg-blue-900/50 font-semibold text-xs shadow-xs"
                      >
                        <MapPin size={15} className="mr-1.5 text-pupr-blue animate-bounce" />
                        {gpsLoading ? 'Mengunci GPS...' : 'Ambil Posisi Real GPS'}
                      </Button>
                      <Button type="button" onClick={() => setShowMapPicker(true)} variant="pupr" className="shrink-0 text-xs font-semibold">
                        <MapIcon size={15} className="mr-1.5" />
                        Peta OpenStreetMap
                      </Button>
                    </div>

                    {/* Real GPS Info & Accuracy Status */}
                    <div className="space-y-1 mt-1.5">
                      {gpsSuccess && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          <span>Titik Koordinat Real GPS Berhasil Dikunci</span>
                          {gpsAccuracy !== null && (
                            <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300 text-[10px] font-mono">
                              Akurasi: ±{gpsAccuracy.toFixed(1)} meter
                            </Badge>
                          )}
                        </div>
                      )}

                      {gpsAddressInfo && (
                        <p className="text-[11px] text-slate-500 italic pl-1 truncate">
                          📍 Terdeteksi: {gpsAddressInfo}
                        </p>
                      )}

                      {gpsError && (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                          ⚠️ {gpsError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* OpenStreetMap Location Picker Modal */}
                  {showMapPicker && (
                    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <MapIcon className="text-pupr-yellow" size={18} />
                            <div>
                              <h3 className="font-bold text-sm">Pilih Koordinat GPS di OpenStreetMap</h3>
                              <p className="text-[11px] text-slate-300">Klik lokasi presisi di peta untuk menetapkan titik koordinat bangunan PUPR</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setShowMapPicker(false)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <LeafletMap
                              center={formData.koordinat && formData.koordinat.includes(',') ? [
                                Number(formData.koordinat.split(',')[0].trim()) || -7.2144,
                                Number(formData.koordinat.split(',')[1].trim()) || 107.9015
                              ] : [-7.2144, 107.9015]}
                              zoom={15}
                              height="100%"
                              tileStyle="osm"
                              pickupLocation={true}
                              onLocationPick={(coords) => {
                                handleInputChange('koordinat', `${coords.lat}, ${coords.lng}`);
                              }}
                            />
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                              Koordinat Terpilih: <strong className="text-pupr-blue dark:text-blue-400">{formData.koordinat || 'Belum dipilih'}</strong>
                            </span>
                            <Button type="button" variant="pupr" size="sm" onClick={() => setShowMapPicker(false)}>
                              Gunakan Koordinat Ini
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Unggah Gambar Denah & Eksterior</h4>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Denah Bangunan (PDF / Gambar)</label>
                      {denahFile ? (
                        <div className="p-3 bg-blue-50/50 dark:bg-blue-900/30 border border-pupr-blue/30 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="text-pupr-blue dark:text-blue-400" size={20} />
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{denahFile.file.name}</span>
                          </div>
                          <button onClick={() => setDenahFile(null)} className="text-slate-400 hover:text-danger">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-center">
                          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleDenahUpload} />
                          <UploadCloud className="text-slate-400 mb-2" size={24} />
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Klik untuk memilih file denah</span>
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {[
                        { id: 'depan', label: 'Tampak Depan' },
                        { id: 'belakang', label: 'Tampak Belakang' },
                        { id: 'kanan', label: 'Samping Kanan' },
                        { id: 'kiri', label: 'Samping Kiri' },
                      ].map(view => (
                        <div key={view.id} className="space-y-2">
                          <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{view.label}</label>
                          {sidePhotos[view.id] ? (
                            <div className="relative aspect-square border dark:border-slate-700 rounded-xl overflow-hidden group">
                              <img src={sidePhotos[view.id].url} alt={view.label} loading="lazy" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => {
                                  const copy = { ...sidePhotos };
                                  delete copy[view.id];
                                  setSidePhotos(copy);
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ) : (
                            <label className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-center p-2">
                              <input type="file" className="hidden" accept="image/*" onChange={e => handleSidePhotoUpload(view.id, e)} />
                              <UploadCloud className="text-slate-400 mb-1" size={20} />
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Unggah Foto</span>
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  {/* Real-time Camera & Annotation Module Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-pupr-blue text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md border border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-pupr-blue/30 rounded-xl text-pupr-yellow border border-pupr-blue/40 shrink-0">
                        <Camera size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">Kamera Terintegrasi & Anotasi Retak Struktur</h4>
                          <Badge variant="outline" className="text-[10px] border-amber-400/50 text-amber-300 bg-amber-400/10">
                            Pedoman PUPR Garut
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Ambil foto retak langsung menggunakan kamera perangkat, berikan anotasi garis/dimensi retak, dan otomatis tempelkan stempel GPS + timestamp resmi PUPR.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setCameraModal({
                        isOpen: true,
                        itemName: 'Inspeksi Retak Lapangan',
                        damageLabel: 'Bukti Foto Retak'
                      })}
                      className="bg-pupr-yellow hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow-md w-full sm:w-auto"
                    >
                      <Camera size={15} className="mr-1.5" /> Buka Modul Kamera
                    </Button>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-blue-900/30 border border-pupr-blue/20 dark:border-blue-800 rounded-xl p-4 flex gap-3 text-pupr-blue/80 dark:text-blue-300">
                    <Info className="flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-xs leading-relaxed">
                      <p className="font-semibold mb-1 text-pupr-blue dark:text-blue-200 text-sm">Panduan Pengisian Indikasi Kerusakan (Sesuai Standar PUPR)</p>
                      <p>
                        Lakukan pemeriksaan visual pada setiap komponen utama bangunan gedung. Centang komponen yang mengalami kerusakan, pilih kategori kerusakannya, dan <b>wajib unggah minimal 1 foto</b> untuk setiap komponen yang dinyatakan rusak sebagai bukti awal sebelum verifikasi teknis.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <VoiceInput
                      label="Deskripsi Umum Kondisi Bangunan (Dikte Suara Web Speech)"
                      value={formData.deskripsi}
                      onChange={val => handleInputChange('deskripsi', val)}
                      placeholder="Contoh: Terjadi penurunan tanah pada area sayap kiri, menyebabkan retak struktur pada dinding dan balok."
                      multiline={true}
                      rows={3}
                      quickPhrases={[
                        'Terjadi retak struktur pada balok induk lantai 1',
                        'Atap gedung bocor di area kelas 4 dan 5',
                        'Penurunan pondasi setempat sekitar 2cm',
                        'Plafon gypsum lapuk akibat kebocoran atap',
                        'Pintu dan kusen mengalami pelapukan kayu'
                      ]}
                      helpText="Bicara langsung melalui mikrofon untuk mengisi deskripsi kondisi bangunan secara bebas tangan."
                    />
                    
                    <div className="space-y-6">
                      {visibleGroups.map(group => (
                        <div key={group.id} className="space-y-3">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">{group.title}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.items.map(item => {
                              const itemData = formData.kerusakan[item.id] || { isDamaged: false, volTotal: 0, damages: {}, documents: {}, documentUrls: {} };
                              const calculatedVolTotal = itemData.damages ? Object.values(itemData.damages).reduce((a: number, b: any) => a + (Number(b) || 0), 0) : 0;
                              
                              return (
                                <div key={item.id} className={`p-4 border rounded-xl transition-colors ${itemData.isDamaged ? 'border-pupr-blue bg-blue-50/10 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'}`}>
                                  <div className="flex items-start gap-3">
                                    <input 
                                      type="checkbox" 
                                      checked={itemData.isDamaged}
                                      onChange={e => handleKerusakanChange(item.id, 'isDamaged', e.target.checked)}
                                      className="mt-1 rounded text-pupr-blue focus:ring-pupr-blue w-4 h-4 cursor-pointer" 
                                    />
                                    <div className="flex-1 space-y-3">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">{item.name}</span>
                                          {showGuide && (
                                            <button 
                                              onClick={(e) => { e.preventDefault(); setGuideModal({ isOpen: true, component: item }); }} 
                                              className="text-slate-400 hover:text-pupr-blue dark:hover:text-blue-400 transition-colors"
                                              title="Panduan Perhitungan & Contoh Kerusakan"
                                            >
                                              <Info size={14} />
                                            </button>
                                          )}
                                        </div>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                          {group.id === 'str' ? 'Periksa retak, lendutan, korosi tulang, atau kegagalan struktur.' : 
                                           group.id === 'ars' ? 'Periksa retak rambut, pelapukan, kerontokan, atau bocor.' : 
                                           'Periksa malfungsi instalasi, kebocoran pipa, atau kabel terkelupas.'}
                                        </span>
                                      </div>
                                      
                                      {itemData.isDamaged && (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                          <div className="space-y-2">
                                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Volume Total Komponen Terdampak ({item.unit})</label>
                                            <Input
                                              type="number"
                                              value={calculatedVolTotal}
                                              readOnly
                                              className="h-8 text-xs bg-slate-50 dark:bg-slate-800 cursor-not-allowed font-semibold text-slate-600 dark:text-slate-400"
                                            />
                                          </div>
                                          
                                          <div className="space-y-3">
                                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Volume per Kategori Kerusakan</label>
                                            {DAMAGE_LEVELS.map(level => {
                                              const volume = itemData.damages?.[level.value.toString()] || 0;
                                              return (
                                                <div key={level.value} className="space-y-2 p-2 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                                                  <div className="flex items-center gap-2">
                                                    <div className="flex-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate">
                                                      {level.label}
                                                    </div>
                                                    <div className="w-24 shrink-0">
                                                      <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        value={volume || ''}
                                                        onChange={(e) => handleDamageVolumeChange(item.id, level.value.toString(), Number(e.target.value))}
                                                        className={`h-7 text-xs bg-white dark:bg-slate-950 text-right ${volume > 0 ? 'border-pupr-blue ring-1 ring-pupr-blue/20' : 'dark:border-slate-700'}`}
                                                      />
                                                    </div>
                                                  </div>
                                                  
                                                  {volume > 0 && (
                                                    <div className="space-y-2 mt-2">
                                                      {/* Camera Annotation Trigger Button */}
                                                      <div className="flex gap-2">
                                                        <Button
                                                          type="button"
                                                          variant="outline"
                                                          size="sm"
                                                          onClick={() => setCameraModal({
                                                            isOpen: true,
                                                            itemId: item.id,
                                                            itemName: item.name,
                                                            damageValue: level.value,
                                                            damageLabel: level.label
                                                          })}
                                                          className="flex-1 h-8 text-[11px] font-semibold border-pupr-blue/30 text-pupr-blue hover:bg-blue-50/80 flex items-center justify-center gap-1.5 shadow-xs"
                                                        >
                                                          <Camera size={13} className="text-pupr-blue" />
                                                          <span>Foto & Anotasi (PUPR)</span>
                                                        </Button>

                                                        <label className="border border-slate-200 rounded-lg px-2.5 h-8 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors text-[11px] font-medium text-slate-600 shrink-0">
                                                          <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*,application/pdf"
                                                            onChange={(e) => {
                                                              if (e.target.files && e.target.files[0]) {
                                                                handleFileUpload(item.id, level.value, e.target.files[0]);
                                                              }
                                                            }}
                                                          />
                                                          <Upload size={13} className="mr-1 text-slate-400" />
                                                          <span>Galeri</span>
                                                        </label>
                                                      </div>

                                                      {/* Attachment Status / Preview */}
                                                      {itemData.documents?.[level.value.toString()] ? (
                                                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2 flex items-center justify-between gap-2">
                                                          <div className="flex items-center gap-2 overflow-hidden">
                                                            {itemData.documentUrls?.[level.value.toString()] ? (
                                                              <img 
                                                                src={itemData.documentUrls[level.value.toString()]} 
                                                                alt="Anotasi Retak" 
                                                                className="w-8 h-8 rounded border border-emerald-300 object-cover shrink-0" 
                                                              />
                                                            ) : (
                                                              <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
                                                            )}
                                                            <div className="truncate">
                                                              <p className="text-[10px] font-bold text-emerald-900 truncate">
                                                                {itemData.documents[level.value.toString()]}
                                                              </p>
                                                              <p className="text-[9px] text-emerald-700">Tersimpan dengan Stempel GPS PUPR</p>
                                                            </div>
                                                          </div>
                                                          <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setCameraModal({
                                                              isOpen: true,
                                                              itemId: item.id,
                                                              itemName: item.name,
                                                              damageValue: level.value,
                                                              damageLabel: level.label
                                                            })}
                                                            className="h-6 text-[10px] text-pupr-blue hover:text-blue-800 px-1.5 font-semibold"
                                                          >
                                                            Ulangi
                                                          </Button>
                                                        </div>
                                                      ) : (
                                                        <div className="text-[10px] text-amber-700 bg-amber-50/80 border border-amber-200/80 rounded-md px-2 py-1 flex items-center gap-1">
                                                          <Info size={11} className="shrink-0 text-amber-600" />
                                                          <span>Wajib melampirkan foto bukti kerusakan sesuai pedoman PUPR.</span>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Hands-Free Voice Notes Panel for Surveyor */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-4 space-y-3">
                        <VoiceInput
                          label="Catatan Khusus & Temuan Lapangan Surveyor (Dikte Suara Hands-Free)"
                          value={formData.catatanKhusus || ''}
                          onChange={val => handleInputChange('catatanKhusus', val)}
                          placeholder="Ucapkan atau ketik catatan teknis tambahan, misalnya kondisi lingkungan sekitar, aksesibilitas kendaraan, atau riwayat gempa..."
                          multiline={true}
                          rows={3}
                          quickPhrases={[
                            'Aksesibilitas lokasi dapat dilalui kendaraan roda 4',
                            'Terdapat riwayat gempa bumi Garut 3 bulan lalu',
                            'Saluran drainase luar tersumbat sampah dan tanah',
                            'Diperlukan verifikasi lanjutan oleh TABG PUPR Garut'
                          ]}
                          helpText="Fitur Web Speech API memungkinkan input bebas tangan di ponsel saat memegang peralatan inspeksi."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Executive Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-pupr-blue to-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-wider">
                            Draf Siap Dikirim
                          </Badge>
                          <Badge className="bg-white/10 text-white border-white/20 font-medium px-2.5 py-0.5 text-[10px]">
                            SIPEKA v2.0 PUPR Garut
                          </Badge>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                          Konfirmasi Final Permohonan Penilaian Kerusakan
                        </h3>
                        <p className="text-xs md:text-sm text-slate-200 mt-1 max-w-2xl">
                          Mohon periksa kembali keabsahan data administratif, titik lokasi geospasial real GPS, serta bukti foto fisik kerusakan sebelum diajukan secara resmi ke Dinas PUPR Kabupaten Garut.
                        </p>
                      </div>
                      <div className="shrink-0 flex flex-col sm:flex-row gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => generatePDF(true)}
                          className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-semibold shadow-xs"
                        >
                          <Download size={14} className="mr-1.5" />
                          Pratinjau Surat (PDF)
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Metric Overview Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-pupr-blue dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Gedung / Instansi</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">{formData.namaBangunan || 'Tanpa Nama'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{formData.instansi || '-'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Lokasi GPS Real</p>
                        <p className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">{formData.koordinat || 'Belum diisi'}</p>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate">
                          {gpsAccuracy !== null ? `Akurasi ±${gpsAccuracy.toFixed(1)}m` : 'Terverifikasi GPS'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Elemen Rusak</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {totalDamagedItems} Komponen Terdampak
                        </p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate">
                          {highestRiskCategory}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Camera size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Bukti Foto & Lampiran</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{totalAttachedPhotos} File Terlampir</p>
                        <p className="text-[10px] text-purple-700 dark:text-purple-400 font-medium truncate">Stempel Geotag PUPR</p>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Review Sections Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                    
                    {/* Input Nomor Surat Permohonan Manual */}
                    <div className="bg-white dark:bg-slate-900 border-2 border-pupr-blue/30 dark:border-pupr-blue/40 rounded-2xl p-5 shadow-sm space-y-3 lg:col-span-2 bg-gradient-to-r from-blue-50/40 via-white to-transparent dark:from-slate-900 dark:to-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-pupr-blue/10 text-pupr-blue dark:text-blue-400 rounded-lg">
                            <FileText size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Nomor Surat Permohonan Resmian (Input Manual)</h4>
                            <p className="text-[11px] text-slate-500">Nomor registrasi dari agenda surat keluar instansi pemohon.</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-pupr-blue border-pupr-blue/30 text-[10px]">
                          Nomor Surat Keluar
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>Nomor Surat</span>
                          <span className="text-[10px] text-slate-400 font-normal">Opsional (Kosongkan untuk otomatisasi nomor draf)</span>
                        </label>
                        <Input 
                          value={formData.nomorSurat} 
                          onChange={e => handleInputChange('nomorSurat', e.target.value)} 
                          placeholder="Contoh: 600.1.15.3/585/DPUPR atau 421.2/045-SD/2026" 
                          className="font-mono text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-pupr-blue"
                        />
                      </div>
                    </div>

                    {/* 1. Informasi Identitas & Fisik Bangunan */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-pupr-blue dark:text-blue-400 rounded-lg">
                            <Building2 size={16} />
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">1. Identitas Legalisasi Bangunan Gedung</h4>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(1)} className="text-[11px] text-pupr-blue dark:text-blue-400 hover:underline h-7">
                          Ubah
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Nama Instansi Pemilik</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{formData.instansi || '-'}</span>
                        </div>
                        <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Kode OPD / NPSN</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{formData.kodeOpd || '-'}</span>
                        </div>
                        <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Nama Bangunan</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{formData.namaBangunan || '-'}</span>
                        </div>
                        <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Nomor NUP Barang</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{formData.nup || '-'}</span>
                        </div>
                        <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Tahun Pembangunan & Usia</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formData.tahunDibangun ? `${formData.tahunDibangun} (${2026 - Number(formData.tahunDibangun)} Tahun)` : '-'}
                          </span>
                        </div>
                        <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Dimensi Fisik</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formData.jumlahLantai} Lantai | {formData.luas || '0'} m²
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Lokasi Geospasial & Peta */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <MapPin size={16} />
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">2. Geolokasi & Geospasial Real GPS</h4>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(2)} className="text-[11px] text-pupr-blue dark:text-blue-400 hover:underline h-7">
                          Ubah
                        </Button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Alamat Lengkap Site</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{formData.alamat || '-'}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Kecamatan</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{formData.kecamatan || '-'}</span>
                          </div>
                          <div className="bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Desa / Kelurahan</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{formData.desa || '-'}</span>
                          </div>
                        </div>

                        <div className="bg-emerald-50/60 dark:bg-emerald-900/20 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-medium block">Koordinat Terkunci:</span>
                            <span className="font-mono font-bold text-emerald-950 dark:text-emerald-300">{formData.koordinat || 'Belum diisi'}</span>
                          </div>
                          <Badge variant="outline" className="bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 font-mono text-[10px]">
                            {gpsAccuracy !== null ? `±${gpsAccuracy.toFixed(1)}m` : 'GPS Verified'}
                          </Badge>
                        </div>

                        {gpsAddressInfo && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate">
                            📍 Geocoding: {gpsAddressInfo}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 3. Komponen Terdampak & Temuan Kerusakan */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4 lg:col-span-2">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                            <AlertTriangle size={16} />
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">3. Rincian Komponen Rusak & Bukti Fisik Lapangan</h4>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(3)} className="text-[11px] text-pupr-blue dark:text-blue-400 hover:underline h-7">
                          Ubah
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kategori Elemen Terdampak:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {formData.elemenKerusakan.length > 0 ? (
                              formData.elemenKerusakan.map(el => (
                                <Badge key={el} className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-400 border-amber-300 dark:border-amber-700/50 text-[10px]">
                                  {el}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 dark:text-slate-500 italic">Belum memilih elemen</span>
                            )}
                          </div>
                        </div>

                        {/* List damaged components */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 max-h-56 overflow-y-auto">
                          {damagedComponentsList.length > 0 ? (
                            damagedComponentsList.map(item => (
                              <div key={item.id} className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">ID: {item.id}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 font-mono text-[10px]">
                                    Vol: {item.volTotal}
                                  </Badge>
                                  <Badge className={
                                    item.maxDamage >= 0.7 
                                      ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 border-red-300 dark:border-red-800/50' 
                                      : item.maxDamage >= 0.35 
                                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800/50' 
                                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-800/50'
                                  }>
                                    {item.damageLabel}
                                  </Badge>
                                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 text-[10px] flex items-center gap-1">
                                    <Camera size={11} /> {item.photoCount} Foto
                                  </Badge>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-xs">
                              Tidak ada komponen kerusakan spesifik yang dicatat.
                            </div>
                          )}
                        </div>

                        {/* Descriptions & Voice Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Deskripsi Kondisi Umum</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">{formData.deskripsi || 'Tidak ada deskripsi.'}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Catatan Surveyor (Voice Notes)</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">{formData.catatanKhusus || 'Tidak ada catatan khusus.'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. SLA & Prosedur Verifikasi DPUPR Garut */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4 lg:col-span-2">
                      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                          <ShieldCheck size={16} />
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">4. Alur Verifikasi & Standar Layanan (SLA) PUPR Garut</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-blue-50/60 dark:bg-blue-900/20 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-800/50 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-pupr-blue dark:text-blue-400 text-[11px]">Tahap 1: Verifikasi Berkas</span>
                            <Badge className="bg-pupr-blue text-white dark:bg-blue-600 dark:text-white text-[9px]">SLA: 1x24 Jam</Badge>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px]">Tim Administrasi Dinas PUPR Garut akan memeriksa kelengkapan identitas NUP & bukti foto berstempel GPS.</p>
                        </div>

                        <div className="bg-amber-50/60 dark:bg-amber-900/20 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-800/50 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900 dark:text-amber-400 text-[11px]">Tahap 2: Penugasan TABG</span>
                            <Badge className="bg-amber-600 text-white dark:bg-amber-600 dark:text-white text-[9px]">SLA: 2x24 Jam</Badge>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px]">Penugasan Tim Ahli Bangunan Gedung (TABG) untuk melakukan verifikasi teknis atau inspeksi lapangan jika diperlukan.</p>
                        </div>

                        <div className="bg-emerald-50/60 dark:bg-emerald-900/20 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-900 dark:text-emerald-400 text-[11px]">Tahap 3: Penerbitan BA / Form</span>
                            <Badge className="bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white text-[9px]">Berita Acara</Badge>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px]">Penetapan persentase kerusakan resmi & penerbitan dokumen Form A/B/C bertanda tangan elektronik QR Code.</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Statement of Legal Compliance & Agreement Checkbox */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3 text-left">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={isAgreedLegal}
                        onChange={(e) => setIsAgreedLegal(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-pupr-blue border-slate-300 dark:border-slate-600 rounded focus:ring-pupr-blue shrink-0 dark:bg-slate-900"
                      />
                      <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
                          Pernyataan Kebenaran Data & Integritas Permohonan (PUPR Compliance)
                        </span>
                        Saya menyatakan dengan sesungguhnya bahwa seluruh data fisik bangunan, koordinat geospasial real GPS, serta dokumentasi foto kerusakan yang disampaikan adalah benar, akurat, dan dapat dipertanggungjawabkan secara teknis maupun legal sesuai ketentuan perundang-undangan.
                      </div>
                    </label>

                    {!isAgreedLegal && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800/50 flex items-center gap-1.5">
                        <AlertTriangle size={13} className="shrink-0 text-amber-600 dark:text-amber-500" />
                        Anda wajib mencentang persetujuan keabsahan data sebelum dapat menekan tombol Kirim Permohonan Resmi.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 text-center py-8">
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={44} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Permohonan Berhasil Dikirim!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Surat permohonan penilaian kerusakan bangunan Anda telah berhasil dikirim ke database SIPEKA PUPR Garut.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md mx-auto flex flex-col gap-2.5 items-center">
                    <Button onClick={() => generatePDF(false)} variant="pupr" className="w-full shadow-sm font-semibold">
                      <Eye size={16} className="mr-2" /> Pratinjau Surat Permohonan (PDF)
                    </Button>
                    <Button onClick={() => generatePDF(true)} variant="outline" className="w-full text-slate-700 dark:text-slate-300">
                      <Download size={16} className="mr-2 text-slate-500 dark:text-slate-400" /> Unduh PDF
                    </Button>
                    <Button variant="ghost" className="w-full text-xs text-slate-600 dark:text-slate-400 mt-1" onClick={() => navigate('/survey')}>
                      Kembali ke Data Survey
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
        {step < 5 && (
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
            <Button 
              variant="outline" 
              onClick={() => goToStep(step - 1)}
              disabled={step === 1}
              className="w-full sm:w-auto"
            >
              <ChevronLeft size={16} className="mr-2" />
              Kembali
            </Button>
            
            {step < 4 ? (
              <Button variant="pupr" onClick={() => goToStep(step + 1)} className="w-full sm:w-auto">
                Selanjutnya
                <ChevronRight size={16} className="ml-2" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => generatePDF(false)} 
                  className="w-full sm:w-auto border-pupr-blue/30 text-pupr-blue hover:bg-blue-50 text-xs font-semibold"
                >
                  <Eye size={15} className="mr-1.5" />
                  Pratinjau Draf Surat (PDF)
                </Button>

                <Button 
                  type="button" 
                  variant="garut" 
                  onClick={handleSubmitPermohonan} 
                  disabled={!isAgreedLegal}
                  className="w-full sm:w-auto shadow-md font-bold text-xs"
                >
                  <CheckCircle2 size={16} className="mr-2" />
                  Kirim Permohonan Resmi
                </Button>
              </div>
            )}
          </CardFooter>
        )}
      </CardGlass>

      {/* Guide Modal */}
      {guideModal.isOpen && guideModal.component && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setGuideModal({ isOpen: false, component: null })}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <Info size={18} className="text-pupr-blue" />
                Panduan Pengisian: {guideModal.component.name}
              </h3>
              <button onClick={() => setGuideModal({ isOpen: false, component: null })} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-2">Cara Perhitungan Volume</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-pupr-blue/10">
                    Untuk komponen <b>{guideModal.component.name}</b>, satuan perhitungannya adalah <b>{guideModal.component.unit}</b>. 
                    {guideModal.component.unit === '%' ? ' Hitung persentase luasan area yang rusak berbanding dengan total luasan keseluruhan dalam satu ruangan/bangunan.' : 
                     guideModal.component.unit === 'unit' ? ' Hitung jumlah unit (titik/buah) yang mengalami kerusakan berbanding dengan total unit yang ada.' : 
                     ' Lakukan estimasi visual atau pengukuran memanjang (m1) terhadap komponen yang terdampak.'}
                  </p>
                </div>

                {showPhotos && (
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-3">Kriteria & Contoh Kerusakan (PUPR)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {DAMAGE_LEVELS.filter(l => l.value > 0).map(level => {
                        const description = dataPanduan[guideModal.component.id]?.[level.value.toString()] || 'Deskripsi tidak tersedia.';
                        
                        const imgUrl = dataPanduan[guideModal.component.id]?.[`${level.value.toString()}_img`];
                        
                        let badgeClass = "bg-slate-50 text-slate-600";
                        if (level.value >= 0.35 && level.value < 0.7) badgeClass = "bg-warning/10 text-warning border-warning/20";
                        else if (level.value >= 0.7) badgeClass = "bg-danger/10 text-danger border-danger/20";
                        if (level.value === 1) badgeClass = "bg-indigo-50 text-indigo-700 border-indigo-200";

                        return (
                          <div key={level.value} className="border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full">
                            <div className="h-24 bg-slate-100 flex items-center justify-center shrink-0">
                              {imgUrl ? (
                                <img src={imgUrl} loading="lazy" className="w-full h-full object-cover" alt={level.label} />
                              ) : (
                                <Camera className="text-slate-300" size={24} />
                              )}
                            </div>
                            <div className="p-3 bg-white flex-1 flex flex-col">
                              <Badge variant="outline" className={"mb-2 text-[10px] self-start " + badgeClass}>
                                {level.label}
                              </Badge>
                              <p className="text-[11px] text-slate-600 flex-1">{description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button onClick={() => setGuideModal({ isOpen: false, component: null })} variant="pupr" size="sm">Tutup Panduan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Camera & Annotation Modal (PUPR Guidelines) */}
      <CameraAnnotationModal
        isOpen={cameraModal.isOpen}
        onClose={() => setCameraModal({ isOpen: false })}
        componentName={cameraModal.itemName || 'Komponen Utama Bangunan'}
        damageLevelLabel={cameraModal.damageLabel}
        locationCoords={formData.koordinat || '-7.2028, 107.8824'}
        buildingName={formData.namaBangunan || 'Bangunan Gedung PUPR'}
        onCaptureAndAttach={(file, customUrl) => {
          if (cameraModal.itemId && cameraModal.damageValue !== undefined) {
            handleFileUpload(cameraModal.itemId, cameraModal.damageValue, file, customUrl);
          } else {
            // General attachment or fallback
            handleFileUpload('str1', 0.1, file, customUrl);
          }
        }}
      />

      {/* PDF In-App Preview Modal */}
      <PdfPreviewModal
        isOpen={pdfPreviewModal.isOpen}
        onClose={() => setPdfPreviewModal(prev => ({ ...prev, isOpen: false }))}
        pdfUrl={pdfPreviewModal.url}
        title={`Pratinjau Dokumen Surat Permohonan`}
        filename={pdfPreviewModal.filename}
      />
    </div>
  );
}
