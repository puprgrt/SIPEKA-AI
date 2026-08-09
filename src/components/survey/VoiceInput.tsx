import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, Check, RefreshCw, Radio, FileText } from 'lucide-react';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  helpText?: string;
  quickPhrases?: string[];
}

export function VoiceInput({
  value,
  onChange,
  placeholder = 'Ketik atau gunakan Dikte Suara (Voice-to-Text)...',
  label,
  multiline = true,
  rows = 3,
  className = '',
  helpText,
  quickPhrases = [
    'Retak struktur pada balok induk',
    'Atap bocor seluas 15m²',
    'Penurunan pondasi setempat 2cm',
    'Dinding retak tembus garis diagonal',
    'Plafon gypsum lapuk akibat rembesan air'
  ]
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<'id-ID' | 'en-US'>('id-ID');
  const [mode, setMode] = useState<'append' | 'replace'>('append');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const startListening = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError('Browser ini belum mendukung Web Speech API. Gunakan Google Chrome atau Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcriptText;
          } else {
            interimChunk += transcriptText;
          }
        }

        setInterimTranscript(interimChunk);

        if (finalChunk) {
          // Command replacements for voice control
          let processedText = finalChunk;
          processedText = processedText.replace(/\bbaris baru\b/gi, '\n');
          processedText = processedText.replace(/\btitik\b/gi, '.');
          processedText = processedText.replace(/\bkoma\b/gi, ',');

          if (mode === 'replace') {
            onChange(processedText.trim());
          } else {
            onChange(value ? `${value.trim()} ${processedText.trim()}` : processedText.trim());
          }
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Izin mikrofon ditolak oleh browser. Silakan izinkan akses mikrofon di pengaturan browser.');
        } else if (event.error === 'no-speech') {
          setSpeechError('Tidak ada suara terdeteksi. Silakan coba bicara lagi.');
        } else {
          setSpeechError(`Kendala mikrofon: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition exception:', err);
      setSpeechError('Gagal memulai modul dikte suara. Pastikan mikrofon terhubung.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handlePhraseClick = (phrase: string) => {
    if (value) {
      onChange(`${value.trim()} ${phrase}`);
    } else {
      onChange(phrase);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Speech Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && (
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <FileText size={14} className="text-pupr-blue" />
            {label}
          </label>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Language toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px]">
            <button
              type="button"
              onClick={() => setSelectedLang('id-ID')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                selectedLang === 'id-ID' ? 'bg-white dark:bg-slate-900 text-pupr-blue shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              🇮🇩 ID
            </button>
            <button
              type="button"
              onClick={() => setSelectedLang('en-US')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                selectedLang === 'en-US' ? 'bg-white dark:bg-slate-900 text-pupr-blue shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              🇺🇸 EN
            </button>
          </div>

          {/* Mode Toggle (Append vs Replace) */}
          <button
            type="button"
            onClick={() => setMode(mode === 'append' ? 'replace' : 'append')}
            title={mode === 'append' ? 'Mode Tambah Text' : 'Mode Timpa Text'}
            className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-pupr-blue bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md"
          >
            {mode === 'append' ? '+ Tambah' : '🔄 Timpa'}
          </button>

          {/* Voice Record Button */}
          <Button
            type="button"
            variant={isListening ? 'destructive' : 'pupr'}
            size="sm"
            onClick={toggleListening}
            className={`h-8 text-xs font-bold gap-1.5 transition-all shadow-2xs ${
              isListening ? 'animate-pulse ring-2 ring-red-400 bg-red-600 hover:bg-red-700' : ''
            }`}
          >
            {isListening ? (
              <>
                <Radio size={14} className="animate-spin text-white" />
                <span>Merekam Voice-to-Text...</span>
              </>
            ) : (
              <>
                <Mic size={14} className="text-pupr-yellow" />
                <span>Dikte Suara (Web Speech)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Listening Indicator / Realtime Transcript Display Banner */}
      {isListening && (
        <div className="p-3 bg-red-50/90 border border-red-200 rounded-xl space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between text-xs text-red-900 font-bold">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <span>Mikrofon Aktif — Bicara sekarang...</span>
            </div>
            <span className="text-[10px] font-normal text-red-600 font-mono">
              Bahasa: {selectedLang === 'id-ID' ? 'Indonesia' : 'English'}
            </span>
          </div>

          <p className="text-xs text-red-950 font-mono italic bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-red-100 min-h-[32px]">
            {interimTranscript ? `"${interimTranscript}"` : 'Mendengarkan ucapan surveyor...'}
          </p>

          <p className="text-[10px] text-red-700/80">
            💡 Tips Kata Kunci: Ucapkan <code className="bg-red-100 px-1 rounded font-bold">"titik"</code> untuk ( . ), <code className="bg-red-100 px-1 rounded font-bold">"koma"</code> untuk ( , ), atau <code className="bg-red-100 px-1 rounded font-bold">"baris baru"</code> untuk ganti paragraf.
          </p>
        </div>
      )}

      {/* Error message fallback */}
      {speechError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle size={15} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{speechError}</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Anda tetap dapat mengetikkan teks catatan secara manual di bawah ini.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="text-amber-500 hover:text-amber-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Textarea or Input */}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="flex w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pupr-blue focus-visible:border-pupr-blue shadow-2xs font-sans transition-all"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pupr-blue focus-visible:border-pupr-blue shadow-2xs transition-all"
        />
      )}

      {/* Quick Phrase Chips for Hands-free / One-click Input */}
      {quickPhrases && quickPhrases.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" /> Fraser Istilah Lapangan PUPR Cepat:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPhrases.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePhraseClick(phrase)}
                className="text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-pupr-blue hover:text-white border border-slate-200 dark:border-slate-700/80 px-2 py-1 rounded-md transition-colors text-left"
              >
                + {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {helpText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helpText}</p>
      )}
    </div>
  );
}
