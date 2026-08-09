import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Shield, FileText, Key, FileCheck } from 'lucide-react';

export interface DocumentForSigning {
  id: string;
  title: string;
  hash: string;
  version: string;
}

interface Signer {
  id: string;
  name: string;
  role: string;
}

interface SigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentForSigning[];
  signer: Signer;
  onSignComplete: (responses: any[]) => void;
}

export const SigningModal: React.FC<SigningModalProps> = ({
  isOpen,
  onClose,
  documents,
  signer,
  onSignComplete
}) => {
  const [agreed, setAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSign = async () => {
    if (!agreed || documents.length === 0) return;
    
    setIsSigning(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const responses = [];
      for (const doc of documents) {
        const res = await fetch('/api/tte/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer mock-token`
          },
          body: JSON.stringify({
            requestId: doc.id,
            documentHash: doc.hash
          })
        });

        if (!res.ok) {
          throw new Error(`Gagal menandatangani dokumen: ${doc.title}`);
        }
        responses.push(await res.json());
      }

      setSuccess(true);
      setTimeout(() => {
        onSignComplete(responses);
        onClose();
        // reset state after close
        setTimeout(() => {
          setSuccess(false);
          setAgreed(false);
        }, 500);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Tanda Tangan Elektronik</h2>
            </div>
            {!isSigning && !success && (
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
            
            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
                <h3 className="text-2xl font-bold text-slate-800">
                  {documents.length > 1 ? 'Batch Dokumen' : 'Dokumen'} Berhasil Ditandatangani
                </h3>
                <p className="text-slate-500">Signature kriptografis telah diterapkan pada dokumen.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <FileText className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        Dokumen ({documents.length})
                      </h4>
                      {documents.length === 1 ? (
                        <>
                          <p className="font-medium text-slate-800">{documents[0].title}</p>
                          <p className="text-xs text-slate-500 mt-1">Versi: {documents[0].version}</p>
                        </>
                      ) : (
                        <p className="font-medium text-slate-800">{documents.length} Dokumen Terpilih (Batch Approval)</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <Key className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Integritas Hash (SHA-256)</h4>
                      {documents.length === 1 ? (
                        <p className="font-mono text-xs text-slate-800 mt-1 truncate">{documents[0].hash}</p>
                      ) : (
                        <p className="font-mono text-xs text-slate-800 mt-1 truncate">Multiple Hashes Disertakan</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Penanda Tangan</h4>
                      <p className="font-medium text-slate-800 mt-1">{signer.name}</p>
                      <p className="text-xs text-slate-500">{signer.role}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">PSrE / Provider</h4>
                      <p className="font-medium text-slate-800 mt-1">Sertifikat Instansi</p>
                      <p className="text-xs text-slate-500">PAdES-LT Profile</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="w-5 h-5 border-2 border-slate-300 rounded text-indigo-600 focus:ring-indigo-600 transition"
                        />
                      </div>
                    </div>
                    <div className="text-sm leading-6">
                      <span className="font-medium text-slate-900">Konfirmasi Penandatanganan</span>
                      <p className="text-slate-500 group-hover:text-slate-700 transition">
                        Saya menyatakan telah membaca dan menyetujui isi dokumen ini secara keseluruhan. 
                        Tanda tangan elektronik ini memiliki kekuatan hukum yang sah.
                      </p>
                    </div>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-2 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={isSigning}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSign}
                disabled={!agreed || isSigning}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSigning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Tanda Tangani</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
