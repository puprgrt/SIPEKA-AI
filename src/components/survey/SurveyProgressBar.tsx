import React from 'react';
import { CheckCircle2, Building2, MapPin, AlertTriangle, Send, FileCheck } from 'lucide-react';

export interface StepItem {
  num: number;
  label: string;
  shortDesc: string;
  icon: React.ElementType;
}

interface SurveyProgressBarProps {
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  maxVisitedStep?: number;
}

export const DEFAULT_SURVEY_STEPS: StepItem[] = [
  {
    num: 1,
    label: 'Identitas Bangunan',
    shortDesc: 'Data Instansi & Fisik',
    icon: Building2,
  },
  {
    num: 2,
    label: 'Lokasi & Foto',
    shortDesc: 'GPS, Denah & Tampak',
    icon: MapPin,
  },
  {
    num: 3,
    label: 'Indikasi Kerusakan',
    shortDesc: 'Evaluasi Komponen PUPR',
    icon: AlertTriangle,
  },
  {
    num: 4,
    label: 'Konfirmasi & Kirim',
    shortDesc: 'Review & Cetak Surat',
    icon: FileCheck,
  },
];

export function SurveyProgressBar({
  currentStep,
  onStepClick,
  maxVisitedStep = currentStep
}: SurveyProgressBarProps) {
  const steps = DEFAULT_SURVEY_STEPS;
  // Calculate percentage based on active step (1 -> 25%, 2 -> 50%, 3 -> 75%, 4/5 -> 100%)
  const percentage = Math.min(100, Math.round(((Math.min(currentStep, 4)) / 4) * 100));

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      {/* Top Header bar with progress percentage & active badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pupr-blue/10 dark:bg-blue-900/30 text-pupr-blue dark:text-blue-400 flex items-center justify-center font-bold text-xs">
            {currentStep > 4 ? '✓' : `${currentStep}/4`}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tahap Inspeksi Lapangan PUPR
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {currentStep <= 4 ? steps[currentStep - 1]?.label : 'Permohonan Berhasil Sent'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kemajuan Form: </span>
            <span className="text-xs font-bold text-pupr-blue dark:text-blue-400">{percentage}%</span>
          </div>
          {/* Progress Pill Bar */}
          <div className="w-24 sm:w-32 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div 
              className="bg-gradient-to-r from-pupr-blue to-blue-500 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stepper Node Line (Desktop & Tablet Layout) */}
      <div className="relative pt-2 pb-1">
        {/* Background connector track */}
        <div className="absolute top-7 left-[8%] right-[8%] h-1 bg-slate-100 dark:bg-slate-800 -z-0 rounded-full hidden sm:block">
          <div 
            className="h-full bg-pupr-blue dark:bg-blue-500 transition-all duration-500 ease-in-out rounded-full"
            style={{ 
              width: `${currentStep >= 4 ? 100 : Math.max(0, (currentStep - 1) * 33.33)}%` 
            }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          {steps.map((step) => {
            const isCompleted = currentStep > step.num;
            const isActive = currentStep === step.num;
            const isVisited = step.num <= maxVisitedStep;
            const IconComponent = step.icon;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  if (isVisited && onStepClick && currentStep <= 4) {
                    onStepClick(step.num);
                  }
                }}
                disabled={!isVisited || currentStep > 4}
                className={`flex sm:flex-col items-center sm:items-center text-left sm:text-center p-2.5 sm:p-2 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-50/70 dark:bg-blue-900/20 border border-pupr-blue/30 dark:border-blue-700/50 shadow-xs' 
                    : isVisited 
                      ? 'hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer' 
                      : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Step Circle Icon */}
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-100 dark:ring-emerald-900'
                      : isActive
                        ? 'bg-pupr-blue text-white ring-4 ring-pupr-blue/15 dark:ring-blue-900/40 shadow-md scale-105'
                        : isVisited
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                          : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} className="animate-in zoom-in-50" />
                  ) : (
                    <IconComponent size={18} />
                  )}
                </div>

                {/* Step Text Info */}
                <div className="ml-3 sm:ml-0 sm:mt-2.5">
                  <div className="flex items-center gap-1 sm:justify-center">
                    <span className={`text-xs font-bold leading-snug ${
                      isActive 
                        ? 'text-pupr-blue dark:text-blue-400' 
                        : isCompleted 
                          ? 'text-emerald-700 dark:text-emerald-400' 
                          : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {step.num}. {step.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block mt-0.5 line-clamp-1">
                    {step.shortDesc}
                  </p>
                </div>

                {/* Status Indicator Badge */}
                <div className="ml-auto sm:ml-0 sm:mt-1.5">
                  {isCompleted ? (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Selesai
                    </span>
                  ) : isActive ? (
                    <span className="text-[10px] font-semibold text-pupr-blue dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/40 px-2 py-0.5 rounded-full border border-pupr-blue/30 dark:border-blue-700/50 animate-pulse">
                      Aktif
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                      Belum
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
