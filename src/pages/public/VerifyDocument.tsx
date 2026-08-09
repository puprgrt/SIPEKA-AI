import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, XCircle, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function VerifyDocument() {
  const { documentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // In a real application, this would fetch the actual verification endpoint
    // For now we'll simulate the public verification of a Laporan Teknis Lengkap
    const verifyDoc = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        
        // Mock successful validation of a document with 3 TTEs
        setResult({
          status: 'VALID',
          documentNumber: '640/LTL/DPUPR/2026/08-001',
          documentType: 'Laporan Teknis Lengkap Penilaian Keandalan Bangunan Gedung',
          issuedDate: new Date().toISOString(),
          buildingName: 'Puskesmas Cikajang (Bangunan Utama)',
          signers: [
            {
              role: 'Penyusun (Surveyor)',
              name: 'Ahmad Surveyor, S.T.',
              nip: '19850101 201001 1 001',
              timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
              isValid: true
            },
            {
              role: 'Pemeriksa (Reviewer)',
              name: 'Siti Reviewer, M.T.',
              nip: '19780202 200501 2 002',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              isValid: true
            },
            {
              role: 'Pengesah (Kepala Bidang)',
              name: 'Ir. Budi Kepala Bidang, M.Si.',
              nip: '19700303 199503 1 003',
              timestamp: new Date().toISOString(),
              isValid: true
            }
          ]
        });
      } catch (err) {
        setError('Gagal memverifikasi dokumen. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      verifyDoc();
    }
  }, [documentId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <img src="/logo-garut.png" alt="Logo Garut" className="h-20 w-auto mx-auto mb-4 grayscale-[0.2]" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <h1 className="text-2xl font-bold text-slate-900">Portal Verifikasi Dokumen Elektronik</h1>
          <p className="text-slate-500">Pemerintah Kabupaten Garut</p>
        </div>

        <Card className="shadow-lg border-0 overflow-hidden">
          <div className={`h-2 ${loading ? 'bg-pupr-blue/50' : result?.status === 'VALID' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <CardHeader className="text-center pb-4">
            {loading ? (
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pupr-blue"></div>
                <p className="text-slate-500">Memverifikasi tanda tangan elektronik...</p>
              </div>
            ) : result?.status === 'VALID' ? (
              <>
                <div className="mx-auto bg-emerald-100 text-emerald-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                  <ShieldCheck size={40} />
                </div>
                <CardTitle className="text-2xl text-emerald-700">DOKUMEN VALID</CardTitle>
                <CardDescription className="text-base text-slate-600 mt-2">
                  Dokumen ini merupakan dokumen resmi yang diterbitkan oleh SIPEKA dan telah ditandatangani secara elektronik.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto bg-red-100 text-red-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                  <XCircle size={40} />
                </div>
                <CardTitle className="text-2xl text-red-700">DOKUMEN TIDAK VALID</CardTitle>
                <CardDescription className="text-base text-slate-600 mt-2">
                  Dokumen ini tidak dapat diverifikasi atau telah mengalami perubahan setelah penandatanganan.
                </CardDescription>
              </>
            )}
          </CardHeader>

          {!loading && result?.status === 'VALID' && (
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 flex items-center mb-3">
                  <FileText size={18} className="mr-2 text-pupr-blue" />
                  Informasi Dokumen
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div>
                    <span className="block text-slate-500 mb-1">Nomor Dokumen</span>
                    <span className="font-medium text-slate-900">{result.documentNumber}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Tanggal Penerbitan</span>
                    <span className="font-medium text-slate-900">{new Date(result.issuedDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-slate-500 mb-1">Jenis Dokumen</span>
                    <span className="font-medium text-slate-900">{result.documentType}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-slate-500 mb-1">Objek / Bangunan</span>
                    <span className="font-medium text-slate-900">{result.buildingName}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 flex items-center mb-4">
                  <CheckCircle2 size={18} className="mr-2 text-pupr-blue" />
                  Riwayat Tanda Tangan Elektronik
                </h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {result.signers.map((signer: any, idx: number) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-emerald-50 text-slate-500 group-[.is-active]:text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      </div>
                      
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">{signer.role}</Badge>
                        </div>
                        <h4 className="font-bold text-slate-800">{signer.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">NIP: {signer.nip}</p>
                        <time className="block text-[11px] text-slate-400 mt-2">
                          Waktu TTE: {new Date(signer.timestamp).toLocaleString('id-ID')}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                <Button variant="outline" asChild>
                  <Link to="/">Kembali ke Beranda</Link>
                </Button>
              </div>
            </CardContent>
          )}

          {!loading && result?.status !== 'VALID' && (
            <CardContent>
              <div className="mt-8 flex justify-center">
                <Button variant="outline" asChild>
                  <Link to="/">Kembali ke Beranda</Link>
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Dokumen ini ditandatangani menggunakan Sertifikat Elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), BSSN.</p>
        </div>
      </div>
    </div>
  );
}
