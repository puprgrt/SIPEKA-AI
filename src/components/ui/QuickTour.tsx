import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Map, PenTool, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface QuickTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    id: 'dashboard',
    title: 'Dashboard Eksekutif',
    description: 'Pusat komando (Command Center) yang memberikan gambaran kondisi seluruh aset infrastruktur, prioritas rehabilitasi, dan statistik operasional secara real-time.',
    icon: Map,
    color: 'bg-pupr-blue/10 text-pupr-blue',
  },
  {
    id: 'survey',
    title: 'Survey Lapangan',
    description: 'Modul mobile-first untuk surveyor. Kumpulkan data komponen bangunan, foto lapangan, dan titik koordinat GPS meskipun tanpa koneksi internet (Offline First).',
    icon: PenTool,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    id: 'assessment',
    title: 'Assessment Workspace',
    description: 'Ruang kerja bagi Reviewer Teknis untuk memvalidasi data surveyor, menghitung bobot persentase kerusakan, dan menetapkan klasifikasi sesuai pedoman resmi PUPR.',
    icon: ShieldCheck,
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    id: 'reports',
    title: 'Automasi Laporan & AI',
    description: 'SIPEKA didukung oleh AI untuk rekomendasi perbaikan dan menghasilkan dokumen resmi seperti BAP dan Form A/B/C secara otomatis berdasarkan data assessment.',
    icon: FileText,
    color: 'bg-purple-500/10 text-purple-600',
  }
];

export function QuickTour({ isOpen, onClose }: QuickTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset step when closed
      setTimeout(() => setCurrentStep(0), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 sm:p-6 pb-0 flex justify-between items-center">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-pupr-blue' : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`} 
              />
            ))}
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 text-center flex flex-col items-center">
          <div className={`p-5 rounded-3xl ${step.color} mb-6 shadow-sm border border-slate-100/50 dark:border-slate-700/50`}>
            <Icon size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{step.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
            {step.description}
          </p>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className={currentStep === 0 ? 'invisible' : ''}
          >
            <ChevronLeft size={16} className="mr-1" />
            Sebelumnya
          </Button>
          
          <Button 
            variant="pupr" 
            onClick={handleNext}
            className="rounded-full px-6 shadow-md hover:shadow-lg transition-all"
          >
            {isLast ? (
              <>
                Selesai <CheckCircle2 size={16} className="ml-2" />
              </>
            ) : (
              <>
                Selanjutnya <ChevronRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
