import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Camera, RefreshCw, X, Check, Edit3, Type, MoveRight, Square, 
  RotateCcw, Trash2, Ruler, MapPin, Clock, Upload, Sparkles, AlertTriangle, ShieldCheck, Tag, Mic
} from 'lucide-react';

interface CameraAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  componentName?: string;
  damageLevelLabel?: string;
  locationCoords?: string;
  buildingName?: string;
  onCaptureAndAttach: (file: File, url: string, metadata: { crackType: string; notes: string; widthEstimate: string }) => void;
}

export const PUPR_CRACK_TYPES = [
  { id: 'retak-rambut', label: 'Retak Rambut (< 0.2 mm)', category: 'Ringan', color: 'bg-emerald-500', strokeColor: '#10B981' },
  { id: 'retak-sedang', label: 'Retak Sedang (0.2 - 2.0 mm)', category: 'Sedang', color: 'bg-amber-500', strokeColor: '#F59E0B' },
  { id: 'retak-struktur', label: 'Retak Struktur (> 2.0 mm / Tembus)', category: 'Berat', color: 'bg-red-600', strokeColor: '#DC2626' },
  { id: 'spalling', label: 'Spalling / Selimut Beton Lepas', category: 'Sangat Berat', color: 'bg-purple-600', strokeColor: '#9333EA' },
];

export const TOOL_TYPES = [
  { id: 'freehand', label: 'Garis Retak', icon: Edit3 },
  { id: 'arrow', label: 'Panah', icon: MoveRight },
  { id: 'rectangle', label: 'Kotak Area', icon: Square },
  { id: 'text', label: 'Teks Catatan', icon: Type },
];

export const COLOR_PALETTE = [
  { name: 'Merah PUPR', value: '#DC2626' },
  { name: 'Kuning Peringatan', value: '#F59E0B' },
  { name: 'Hijau Aman', value: '#10B981' },
  { name: 'Biru PUPR', value: '#0F4C81' },
  { name: 'Putih', value: '#FFFFFF' },
];

export function CameraAnnotationModal({
  isOpen,
  onClose,
  componentName = 'Komponen Bangunan',
  damageLevelLabel,
  locationCoords = '-7.2028, 107.8824',
  buildingName = 'Bangunan Gedung PUPR',
  onCaptureAndAttach
}: CameraAnnotationModalProps) {
  // Mode: 'camera' | 'upload' | 'annotate'
  const [mode, setMode] = useState<'camera' | 'annotate'>('camera');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Real GPS state for camera geotagging
  const [realGpsCoords, setRealGpsCoords] = useState<string | null>(null);
  const [realGpsAccuracy, setRealGpsAccuracy] = useState<number | null>(null);

  // Acquire high accuracy Real GPS when modal opens
  useEffect(() => {
    if (isOpen) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude.toFixed(6);
            const lng = pos.coords.longitude.toFixed(6);
            setRealGpsCoords(`${lat}, ${lng}`);
            setRealGpsAccuracy(pos.coords.accuracy);
          },
          (err) => {
            console.warn('Real GPS acquisition warning in camera:', err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [isOpen]);
  const [activeTool, setActiveTool] = useState<'freehand' | 'arrow' | 'rectangle' | 'text'>('arrow');
  const [activeColor, setActiveColor] = useState<string>('#DC2626'); // Red default
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [selectedCrackType, setSelectedCrackType] = useState<string>('retak-sedang');
  const [crackWidthInput, setCrackWidthInput] = useState<string>('1.5 mm');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [textToPlace, setTextToPlace] = useState<string>('');
  const [isAddingText, setIsAddingText] = useState<boolean>(false);

  // Canvas drawing references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const drawHistory = useRef<ImageData[]>([]);

  // Initialize Camera Stream when modal opens in camera mode
  useEffect(() => {
    if (isOpen && mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera access failed or unavailable:", err);
      setCameraError("Kamera tidak dapat diakses atau tidak diizinkan. Silakan unggah foto dari galeri.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Capture image from video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror if user facing
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      setMode('annotate');
      stopCamera();
    }
  };

  // Handle image upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          setMode('annotate');
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Setup Annotation Canvas once mode switches to 'annotate'
  useEffect(() => {
    if (mode === 'annotate' && capturedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Render initial watermark & stamp overlay
        drawPUPROverlay(ctx, canvas.width, canvas.height);
        
        // Save initial state to history
        saveCanvasState();
      };
      img.src = capturedImage;
    }
  }, [mode, capturedImage]);

  const drawPUPROverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Top banner
    ctx.save();
    ctx.fillStyle = 'rgba(15, 76, 129, 0.85)'; // PUPR Blue
    ctx.fillRect(0, 0, width, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('SIPEKA PUPR KABUPATEN GARUT - DOKUMENTASI INSPEKSI KERUSAKAN', 16, 26);

    // Bottom Stamp Metadata Bar
    const now = new Date().toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, height - 50, width, 50);

    ctx.fillStyle = '#F59E0B'; // Yellow accent
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`KOMPONEN: ${componentName.toUpperCase()} ${damageLevelLabel ? `(${damageLevelLabel.toUpperCase()})` : ''}`, 16, height - 28);

    const effectiveCoords = realGpsCoords || locationCoords;
    const accuracyText = realGpsAccuracy !== null ? `(±${realGpsAccuracy.toFixed(1)}m)` : '';

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '12px sans-serif';
    ctx.fillText(`LOKASI: ${buildingName} | GPS REAL: ${effectiveCoords} ${accuracyText} | WAKTU: ${now}`, 16, height - 10);
    ctx.restore();
  };

  const saveCanvasState = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        drawHistory.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
      }
    }
  };

  const undoLastDraw = () => {
    if (drawHistory.current.length > 1) {
      drawHistory.current.pop(); // Remove current
      const previous = drawHistory.current[drawHistory.current.length - 1];
      if (canvasRef.current && previous) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.putImageData(previous, 0, 0);
        }
      }
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current && capturedImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        drawPUPROverlay(ctx, canvas.width, canvas.height);
        drawHistory.current = [];
        saveCanvasState();
      };
      img.src = capturedImage;
    }
  };

  // Canvas Mouse/Touch Events
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    isDrawing.current = true;
    startPos.current = coords;

    if (activeTool === 'freehand') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    } else if (activeTool === 'text') {
      // Place text on click
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && (textToPlace || crackWidthInput)) {
        const text = textToPlace || `Lebar Retak: ${crackWidthInput}`;
        ctx.fillStyle = activeColor;
        ctx.font = `bold ${strokeWidth * 6 + 12}px sans-serif`;
        
        // Background badge for text legibility
        const metrics = ctx.measureText(text);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(coords.x - 4, coords.y - (strokeWidth * 6 + 12), metrics.width + 8, strokeWidth * 6 + 18);

        ctx.fillStyle = activeColor;
        ctx.fillText(text, coords.x, coords.y);
        saveCanvasState();
      }
      isDrawing.current = false;
    }
  };

  const handleMoveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'freehand') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const handleEndDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    isDrawing.current = false;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    if (activeTool === 'arrow') {
      drawArrow(ctx, startPos.current.x, startPos.current.y, coords.x, coords.y, activeColor, strokeWidth);
      saveCanvasState();
    } else if (activeTool === 'rectangle') {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeRect(startPos.current.x, startPos.current.y, coords.x - startPos.current.x, coords.y - startPos.current.y);
      
      // Semi-transparent fill
      ctx.fillStyle = `${activeColor}22`;
      ctx.fillRect(startPos.current.x, startPos.current.y, coords.x - startPos.current.x, coords.y - startPos.current.y);
      saveCanvasState();
    } else if (activeTool === 'freehand') {
      ctx.closePath();
      saveCanvasState();
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) => {
    const headLength = 15 + width * 2;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;

    // Line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Add automatic Crack Annotation Badge
  const addPUPRCrackBadge = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const crackTypeObj = PUPR_CRACK_TYPES.find(c => c.id === selectedCrackType);
    const badgeText = `[PUPR] ${crackTypeObj?.label || 'Retak'} | Est: ${crackWidthInput}`;

    ctx.save();
    const boxWidth = ctx.measureText(badgeText).width + 30;
    const boxHeight = 36;
    const x = 20;
    const y = 60;

    // Background pill
    ctx.fillStyle = crackTypeObj?.strokeColor || '#DC2626';
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(boxWidth, 240), boxHeight, 8);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(badgeText, x + 12, y + 23);
    ctx.restore();

    saveCanvasState();
  };

  // Save & Attach to Form
  const handleSaveAndAttach = () => {
    if (!canvasRef.current) return;
    
    // Convert canvas to Data URL & File
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    
    // Convert data URL to File
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    const fileName = `Retak_${componentName.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    let file: any;
    try {
      file = new File([u8arr], fileName, { type: mime });
    } catch (e) {
      file = new Blob([u8arr], { type: mime });
      file.name = fileName;
    }

    const selectedType = PUPR_CRACK_TYPES.find(t => t.id === selectedCrackType);

    onCaptureAndAttach(file, dataUrl, {
      crackType: selectedType?.label || 'Retak Struktural',
      notes: customNotes || `Estimasi Lebar: ${crackWidthInput}`,
      widthEstimate: crackWidthInput
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pupr-blue/20 text-pupr-yellow rounded-xl border border-pupr-blue/30">
              <Camera size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Kamera & Anotasi Retak Struktur (PUPR)</h3>
                <Badge variant="outline" className="border-pupr-yellow/40 text-pupr-yellow bg-pupr-yellow/10 text-[10px]">
                  Pedoman PUPR Garut
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                {componentName} &bull; {buildingName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {cameraError ? (
                  <div className="text-center p-6 space-y-3">
                    <AlertTriangle size={40} className="mx-auto text-amber-500" />
                    <p className="text-sm text-slate-300 max-w-md">{cameraError}</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-pupr-blue hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md transition-colors">
                      <Upload size={16} />
                      Unggah Foto dari Galeri
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                ) : (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                    
                    {/* Viewfinder Target Guidelines */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-dashed border-pupr-yellow/70 rounded-2xl flex flex-col items-center justify-between p-3 bg-black/10 backdrop-blur-[1px]">
                        <span className="text-[10px] font-mono font-bold bg-slate-900/80 px-2 py-0.5 rounded text-pupr-yellow">
                          TARGET RETAK
                        </span>
                        <div className="w-full flex justify-between items-center text-[9px] text-slate-300 font-mono">
                          <span>PARALAKS 1:1</span>
                          <span>GPS ACTIVE</span>
                        </div>
                      </div>
                    </div>

                    {/* Camera Controls Overlay */}
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6 px-4">
                      <button 
                        type="button" 
                        onClick={toggleCameraFacing} 
                        className="p-3 bg-slate-900/80 backdrop-blur-md rounded-full text-slate-200 hover:text-white border border-slate-700 shadow-lg hover:bg-slate-800"
                        title="Balik Kamera"
                      >
                        <RefreshCw size={20} />
                      </button>

                      <button 
                        type="button" 
                        onClick={capturePhoto} 
                        className="w-16 h-16 rounded-full bg-white text-pupr-blue flex items-center justify-center shadow-2xl border-4 border-pupr-yellow hover:scale-105 active:scale-95 transition-transform"
                        title="Ambil Foto"
                      >
                        <div className="w-12 h-12 rounded-full bg-pupr-blue flex items-center justify-center">
                          <Camera size={24} className="text-white" />
                        </div>
                      </button>

                      <label className="p-3 bg-slate-900/80 backdrop-blur-md rounded-full text-slate-200 hover:text-white border border-slate-700 shadow-lg hover:bg-slate-800 cursor-pointer">
                        <Upload size={20} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-pupr-yellow shrink-0" />
                  <span>GPS: <strong className="text-white font-mono">{locationCoords}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-emerald-400 shrink-0" />
                  <span>Timestamp Otomatis Stempel PUPR</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'annotate' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left/Main Column: Canvas */}
              <div className="lg:col-span-2 space-y-3">
                <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center min-h-[360px]">
                  <canvas 
                    ref={canvasRef}
                    onMouseDown={handleStartDraw}
                    onMouseMove={handleMoveDraw}
                    onMouseUp={handleEndDraw}
                    onTouchStart={handleStartDraw}
                    onTouchMove={handleMoveDraw}
                    onTouchEnd={handleEndDraw}
                    className="max-w-full max-h-[500px] object-contain cursor-crosshair touch-none"
                  />
                </div>

                {/* Canvas Tools Quick Bar */}
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={undoLastDraw} 
                      className="text-slate-300 hover:text-white hover:bg-slate-700 h-8 text-xs"
                      title="Undo"
                    >
                      <RotateCcw size={14} className="mr-1" /> Undo
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={clearCanvas} 
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 text-xs"
                      title="Clear All"
                    >
                      <Trash2 size={14} className="mr-1" /> Reset
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Tebal Garis:</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={strokeWidth} 
                      onChange={e => setStrokeWidth(Number(e.target.value))}
                      className="w-20 accent-pupr-yellow cursor-pointer"
                    />
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => { setMode('camera'); startCamera(); }}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 h-8 text-xs"
                  >
                    <Camera size={14} className="mr-1" /> Foto Ulang
                  </Button>
                </div>
              </div>

              {/* Right Column: Annotation Controls & PUPR Classification */}
              <div className="space-y-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      1. Alat Anotasi
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TOOL_TYPES.map(tool => {
                        const IconComponent = tool.icon;
                        const isActive = activeTool === tool.id;
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => setActiveTool(tool.id as any)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${
                              isActive 
                                ? 'bg-pupr-blue border-pupr-yellow text-white shadow-md' 
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <IconComponent size={15} className={isActive ? 'text-pupr-yellow' : 'text-slate-400'} />
                            <span>{tool.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      2. Warna Indikator
                    </label>
                    <div className="flex items-center gap-2">
                      {COLOR_PALETTE.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setActiveColor(color.value)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${
                            activeColor === color.value ? 'scale-110 border-white ring-2 ring-pupr-yellow' : 'border-slate-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      3. Klasifikasi Retak (PUPR)
                    </label>
                    <div className="space-y-1.5">
                      {PUPR_CRACK_TYPES.map(crack => (
                        <button
                          key={crack.id}
                          type="button"
                          onClick={() => setSelectedCrackType(crack.id)}
                          className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                            selectedCrackType === crack.id
                              ? 'bg-slate-700 border-pupr-yellow text-white font-semibold'
                              : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${crack.color}`} />
                            <span className="truncate">{crack.label}</span>
                          </div>
                          <Badge className="text-[9px] bg-slate-900 border-slate-700 shrink-0">
                            {crack.category}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      4. Estimasi Dimensi & Catatan
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Lebar Retak</span>
                        <Input 
                          value={crackWidthInput} 
                          onChange={e => setCrackWidthInput(e.target.value)}
                          placeholder="Contoh: 2.5 mm"
                          className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400">Catatan Khusus</span>
                          <button
                            type="button"
                            onClick={() => {
                              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                              if (SpeechRecognition) {
                                try {
                                  const rec = new SpeechRecognition();
                                  rec.lang = 'id-ID';
                                  rec.onresult = (ev: any) => {
                                    const text = ev.results[0][0].transcript;
                                    setTextToPlace(prev => prev ? `${prev} ${text}` : text);
                                  };
                                  rec.start();
                                } catch (err) {
                                  alert('Izin mikrofon diblokir atau tidak didukung di lingkungan ini.');
                                }
                              } else {
                                alert('Web Speech API tidak didukung browser ini. Gunakan Chrome/Edge.');
                              }
                            }}
                            className="text-[10px] text-pupr-yellow hover:underline flex items-center gap-0.5 font-medium"
                          >
                            <Mic size={10} /> Dikte Voice
                          </button>
                        </div>
                        <Input 
                          value={textToPlace} 
                          onChange={e => setTextToPlace(e.target.value)}
                          placeholder="Catatan label"
                          className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      onClick={addPUPRCrackBadge}
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2 border-pupr-yellow/40 text-pupr-yellow bg-pupr-yellow/10 hover:bg-pupr-yellow/20 h-8 text-xs"
                    >
                      <Tag size={13} className="mr-1.5" /> Tempel Label Stempel PUPR Ke Gambar
                    </Button>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-2 border-t border-slate-700">
                  <Button 
                    type="button"
                    onClick={handleSaveAndAttach}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 shadow-lg"
                  >
                    <Check size={16} className="mr-2" /> Simpan & Lampirkan Ke Form
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
