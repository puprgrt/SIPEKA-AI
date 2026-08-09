import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button } from './button';
import { Eraser } from 'lucide-react';

export interface SignatureCanvasRef {
  isEmpty: () => boolean;
  clear: () => void;
  toDataURL: () => string | undefined;
}

export const SignatureCanvas = forwardRef<SignatureCanvasRef, { className?: string }>(({ className }, ref) => {
  const padRef = useRef<SignaturePad>(null);

  useImperativeHandle(ref, () => ({
    isEmpty: () => padRef.current?.isEmpty() ?? true,
    clear: () => padRef.current?.clear(),
    toDataURL: () => padRef.current?.getTrimmedCanvas().toDataURL('image/png')
  }));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">Tanda Tangan Manual</label>
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs text-slate-500 hover:text-red-500 px-2"
          onClick={() => padRef.current?.clear()}
        >
          <Eraser size={12} className="mr-1" /> Bersihkan
        </Button>
      </div>
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <SignaturePad 
          ref={padRef}
          canvasProps={{
            className: 'w-full h-32 cursor-crosshair'
          }}
          backgroundColor="white"
        />
      </div>
    </div>
  );
});

SignatureCanvas.displayName = 'SignatureCanvas';
