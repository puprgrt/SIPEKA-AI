import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, X, Send, Sparkles, FileText, Shield, Wrench, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: Sparkles, label: 'Ringkasan', prompt: 'Berikan ringkasan kondisi bangunan terbaru' },
  { icon: Shield, label: 'Cek Data', prompt: 'Periksa kelengkapan data survey terakhir' },
  { icon: Wrench, label: 'Analisis', prompt: 'Analisis kerusakan dan saran perbaikan' },
  { icon: Scale, label: 'Regulasi', prompt: 'Rekomendasi regulasi PUPR yang relevan' },
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo! Saya **SIPEKA AI**, asisten cerdas untuk analisis kondisi bangunan. Ada yang bisa saya bantu?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Terima kasih atas pertanyaannya. Saya sedang menganalisis data yang relevan dari database SIPEKA. Fitur AI Assistant ini akan segera tersedia sepenuhnya.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl",
          "flex items-center justify-center",
          "shadow-lg shadow-pupr-blue/25",
          "transition-all duration-300",
          isOpen
            ? "bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
            : "bg-gradient-to-br from-pupr-blue to-sky-blue hover:from-pupr-blue-light hover:to-sky-blue-light"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
              <BrainCircuit size={24} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "fixed bottom-24 right-6 z-50",
              "w-[380px] max-h-[560px] flex flex-col",
              "rounded-2xl overflow-hidden",
              "glass shadow-xl shadow-black/10 dark:shadow-black/30",
              "border border-white/30 dark:border-white/10"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pupr-blue to-sky-blue p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <BrainCircuit size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">SIPEKA AI</h3>
                <p className="text-[10px] text-blue-100">Copilot Inspeksi Bangunan</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-blue-100">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white/50 dark:bg-slate-900/50 min-h-[280px]">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === 'user'
                      ? "bg-pupr-blue text-white rounded-br-md"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-border/60 dark:border-slate-700 rounded-bl-md shadow-xs"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-border/60 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pupr-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-pupr-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-pupr-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 pt-0 flex flex-wrap gap-1.5 bg-white/50 dark:bg-slate-900/50">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-pupr-blue-50 dark:bg-pupr-blue/15 text-pupr-blue dark:text-pupr-blue-100 hover:bg-pupr-blue/20 transition-colors border border-pupr-blue/10 dark:border-pupr-blue/20"
                  >
                    <action.icon size={12} />
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border/60 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Tanya SIPEKA AI..."
                  className="flex-1 bg-muted dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-pupr-blue/30 border border-transparent focus:border-pupr-blue/30 transition-all"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    input.trim()
                      ? "bg-pupr-blue text-white hover:bg-pupr-blue-light shadow-sm"
                      : "bg-muted dark:bg-slate-800 text-slate-400"
                  )}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
