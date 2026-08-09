import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Pen, RotateCcw, Check, Save } from 'lucide-react';

interface TandaTanganPadProps {
  onSave: (signatureData: string) => void;
  onClear: () => void;
  savedSignature?: string | null;
}

export function TandaTanganPad({ onSave, onClear, savedSignature }: TandaTanganPadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsDrawing(false);
      onClear();
    }
  };

  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      onSave(dataURL);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <Pen size={14} /> Tanda Tangan Basah
        </label>
        {savedSignature && (
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Check size={10} /> Tersimpan
          </span>
        )}
      </div>
      
      <div className="border-2 border-dashed border-slate-300 rounded-lg bg-white overflow-hidden" 
           style={{ touchAction: 'none' }}>
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: "signature-canvas w-full h-[150px]",
          }}
          onBegin={() => setIsDrawing(true)}
        />
      </div>
      
      <div className="flex justify-between gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleClear}
          className="text-slate-500 text-xs h-8"
        >
          <RotateCcw size={14} className="mr-1" /> Hapus
        </Button>
        <Button 
          type="button" 
          size="sm" 
          onClick={handleSave}
          disabled={!isDrawing && !savedSignature}
          className="bg-slate-800 text-white hover:bg-slate-700 text-xs h-8"
        >
          <Save size={14} className="mr-1" /> Simpan TTD
        </Button>
      </div>
    </div>
  );
}
