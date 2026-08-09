import React, { useState } from 'react';
import { X, Download, Printer, ExternalLink, FileText, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  pdfUrl: string | null;
  filename?: string;
  onDownload?: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  title = 'Pratinjau Dokumen Resmi PUPR',
  pdfUrl,
  filename = 'Dokumen_SIPEKA.pdf',
  onDownload,
}) => {
  const [zoom, setZoom] = useState<number>(100);

  if (!isOpen || !pdfUrl) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-pupr-blue to-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20 shrink-0">
              <FileText size={20} className="text-amber-400" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">{title}</h3>
                <Badge className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 text-[10px] shrink-0">
                  Pratinjau Langsung
                </Badge>
              </div>
              <p className="text-[11px] text-slate-300 truncate font-mono mt-0.5">{filename}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Zoom controls */}
            <div className="hidden md:flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg p-1 mr-2 text-xs">
              <button 
                type="button"
                onClick={() => setZoom(prev => Math.max(75, prev - 15))}
                className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="font-mono text-[11px] px-1.5 font-bold">{zoom}%</span>
              <button 
                type="button"
                onClick={() => setZoom(prev => Math.min(150, prev + 15))}
                className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            <Button 
              type="button"
              size="sm" 
              onClick={handleDownload}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs"
            >
              <Download size={14} className="mr-1.5" />
              Unduh PDF
            </Button>

            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hidden sm:flex items-center justify-center p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-xs"
              title="Buka di Tab Baru"
            >
              <ExternalLink size={15} />
            </a>

            <button 
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Info & Action Sub-bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>Dokumen telah digenerate oleh engine SIPEKA v2.0 Dinas PUPR Garut.</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handlePrint} 
              className="text-pupr-blue hover:underline font-semibold flex items-center gap-1"
            >
              <Printer size={13} /> Cetak Langsung
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500 font-mono">Format: PDF (A4)</span>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-900/90 p-2 sm:p-4 overflow-auto flex justify-center items-center relative">
          <div 
            className="w-full h-full bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-200"
            style={{ zoom: `${zoom}%` }}
          >
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0`} 
              title="PDF Preview"
              className="w-full h-full border-0 rounded-xl"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-2.5 flex items-center justify-between shrink-0 text-xs">
          <p className="text-slate-500 text-[11px]">
            Halaman Pratinjau Interaktif SIPEKA v2.0 • Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Garut
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-7 text-xs">
            Tutup Pratinjau
          </Button>
        </div>
      </div>
    </div>
  );
};
