import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, ShieldCheck, ShieldAlert, FileText, Search, Clock, Shield } from 'lucide-react';

export const PublicVerification: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from /api/tte/verify/:id
    const verifyDocument = async () => {
      try {
        setLoading(true);
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock Response for Demonstration
        setResult({
          status: 'VALID',
          documentId: id,
          documentTitle: 'Berita Acara Penilaian Kerusakan Bangunan',
          documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          signer: 'H. Budi Santoso, S.T., M.T.',
          position: 'Kepala Dinas PUPR',
          organization: 'Pemerintah Kabupaten Garut',
          certificate: 'SN-MOCK-882194',
          issuer: 'Sertifikat Elektronik (PSrE)',
          signingTime: new Date().toISOString(),
          timestampValid: true,
          integrityValid: true,
          certificateValid: true,
          revoked: false
        });
      } catch (err: any) {
        setError('Gagal memverifikasi dokumen.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      verifyDocument();
    } else {
      setLoading(false);
      setError('ID Verifikasi tidak ditemukan.');
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Search className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Memverifikasi Dokumen...</h2>
        <p className="text-slate-500 mt-2">Memeriksa integritas dan sertifikat (PAdES)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifikasi Gagal</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-200 transition">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const isValid = result?.status === 'VALID';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SIPEKA Document Verification</h1>
          <p className="mt-2 text-lg text-slate-500">Platform Validasi Tanda Tangan Elektronik Terpercaya</p>
        </div>

        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`overflow-hidden rounded-2xl shadow-xl border ${isValid ? 'border-green-200' : 'border-red-200'}`}
        >
          <div className={`p-6 sm:p-8 ${isValid ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-center space-x-4">
              {isValid ? (
                <ShieldCheck className="w-16 h-16 text-green-500" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-red-500" />
              )}
              <div>
                <h2 className={`text-3xl font-bold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {isValid ? 'Dokumen Valid' : 'Dokumen Tidak Valid'}
                </h2>
                <p className={`mt-1 text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid ? 'Integritas dan Sertifikat Terverifikasi' : 'Dokumen telah dimodifikasi atau sertifikat tidak sah'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-8 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Document Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Informasi Dokumen</h3>
                
                <div>
                  <dt className="text-sm font-medium text-slate-500 flex items-center">
                    <FileText className="w-4 h-4 mr-2" /> Nama Dokumen
                  </dt>
                  <dd className="mt-1 text-slate-900 font-medium">{result.documentTitle}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-slate-500 flex items-center">
                    <Search className="w-4 h-4 mr-2" /> Hash Dokumen (SHA-256)
                  </dt>
                  <dd className="mt-1 text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded border break-all">
                    {result.documentHash}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500 flex items-center">
                    <Clock className="w-4 h-4 mr-2" /> Waktu Tanda Tangan
                  </dt>
                  <dd className="mt-1 text-slate-900 font-medium">
                    {new Date(result.signingTime).toLocaleString('id-ID', { timeZoneName: 'short' })}
                  </dd>
                </div>
              </div>

              {/* Signer Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Informasi Penanda Tangan</h3>
                
                <div>
                  <dt className="text-sm font-medium text-slate-500">Nama Lengkap</dt>
                  <dd className="mt-1 text-slate-900 font-bold">{result.signer}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500">Jabatan / Instansi</dt>
                  <dd className="mt-1 text-slate-900 font-medium">{result.position}</dd>
                  <dd className="text-slate-600 text-sm">{result.organization}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500">Sertifikat / Issuer</dt>
                  <dd className="mt-1 text-slate-900 font-medium">{result.certificate}</dd>
                  <dd className="text-slate-600 text-sm">{result.issuer}</dd>
                </div>
              </div>

            </div>

            {/* Validation Checklist */}
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 mb-4">Hasil Pengecekan Kriptografis</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <li className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <CheckCircle className={`w-5 h-5 ${result.integrityValid ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium text-slate-700">Integritas Dokumen (Tidak Berubah)</span>
                </li>
                <li className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <CheckCircle className={`w-5 h-5 ${result.certificateValid ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium text-slate-700">Validitas Sertifikat Penanda Tangan</span>
                </li>
                <li className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <CheckCircle className={`w-5 h-5 ${!result.revoked ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium text-slate-700">Sertifikat Tidak Dicabut (CRL/OCSP)</span>
                </li>
                <li className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <CheckCircle className={`w-5 h-5 ${result.timestampValid ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium text-slate-700">Trusted Timestamp Valid</span>
                </li>
              </ul>
            </div>
            
          </div>
          
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">ID Verifikasi: {result.documentId}</p>
            <div className="flex space-x-3">
              <button className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition">
                Unduh PDF Asli
              </button>
              <button className="text-sm font-semibold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                Laporan Validasi
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
