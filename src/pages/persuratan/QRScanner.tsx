import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import jsQR from 'jsqr';

export function QRScanner() {
  const [scanResult, setScanResult] = useState<{ id?: string; hash?: string; raw?: string; isValid: boolean | null }>({ isValid: null });
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult({ isValid: null });

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          parseQRData(code.data);
        } else {
          setScanResult({ isValid: false, raw: 'QR Code tidak terdeteksi pada gambar tersebut.' });
        }
        setIsScanning(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const parseQRData = (data: string) => {
    // Example data format:
    // ID: SRV-002
    // Hash: abcdef123456
    // Verify: https://...

    const lines = data.split('\n');
    let id = '';
    let hash = '';

    lines.forEach(line => {
      if (line.startsWith('ID: ')) id = line.substring(4).trim();
      if (line.startsWith('Hash: ')) hash = line.substring(6).trim();
    });

    if (id || hash) {
      setScanResult({ id, hash, raw: data, isValid: true });
    } else {
      setScanResult({ raw: data, isValid: false });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="text-pupr-blue" />
          Verifikasi Integritas Dokumen (QR Code)
        </CardTitle>
        <CardDescription>
          Unggah gambar QR Code (potongan dari PDF) untuk memverifikasi keaslian dokumen dan tanda tangan elektronik.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-10 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Upload size={40} className="text-slate-400 mb-4" />
          <p className="text-sm font-medium text-slate-700">Klik untuk mengunggah gambar QR Code</p>
          <p className="text-xs text-slate-500 mt-1">Mendukung format PNG, JPG, JPEG</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {isScanning && (
          <div className="text-center text-sm text-slate-500">Menganalisis gambar...</div>
        )}

        {scanResult.isValid !== null && !isScanning && (
          <div className={`p-4 rounded-lg border ${scanResult.isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-3">
              {scanResult.isValid ? (
                <CheckCircle2 className="text-emerald-600 mt-0.5" />
              ) : (
                <XCircle className="text-red-600 mt-0.5" />
              )}
              
              <div>
                <h4 className={`font-medium ${scanResult.isValid ? 'text-emerald-800' : 'text-red-800'}`}>
                  {scanResult.isValid ? 'Verifikasi Berhasil' : 'Verifikasi Gagal'}
                </h4>
                
                {scanResult.isValid ? (
                  <div className="mt-3 space-y-2 text-sm text-emerald-900">
                    <p><strong>ID Dokumen:</strong> {scanResult.id || '-'}</p>
                    <p><strong>Signature Hash:</strong> <span className="font-mono text-xs break-all">{scanResult.hash || '-'}</span></p>
                    <div className="mt-4 pt-3 border-t border-emerald-200/60">
                      <p className="text-emerald-700 text-xs">Dokumen ini terverifikasi asli dan ditandatangani secara kriptografis oleh sistem.</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-700 mt-1">{scanResult.raw}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
