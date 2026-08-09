import React, { useState, useEffect } from 'react';
import { Shield, Key, FileText, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export const TTEProfileTab: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/tte/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setCert(data.certificate);
        }
      } catch (err) {
        console.error('Failed to fetch TTE profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Status Tanda Tangan Elektronik</h2>
          </div>
          {cert ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Aktif
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
              Belum Terdaftar
            </span>
          )}
        </div>

        <div className="p-6">
          {!cert ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Anda belum memiliki Sertifikat Elektronik</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                Untuk dapat menandatangani dokumen secara digital, Anda harus mendaftarkan identitas Anda ke Penyelenggara Sertifikasi Elektronik (PSrE) yang diakui.
              </p>
              <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition">
                Daftar TTE Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Informasi Sertifikat</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Issuer (Penerbit)</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">{cert.issuer}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Serial Number</dt>
                      <dd className="mt-1 text-sm font-mono text-slate-700 bg-slate-50 p-1.5 rounded inline-block">{cert.serialNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Subjek</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">{cert.subject}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Masa Berlaku</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Berlaku Sejak</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">
                        {new Date(cert.validFrom).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Berakhir Pada</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">
                        {new Date(cert.validTo).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </dd>
                    </div>
                  </dl>
                  
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                      Sertifikat Anda akan kedaluwarsa dalam 365 hari. Pastikan Anda melakukan perpanjangan sebelum masa berlaku habis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                    <FileText className="w-4 h-4" />
                    <span>Riwayat Tanda Tangan</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                    <Key className="w-4 h-4" />
                    <span>Ganti Passphrase</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition ml-auto">
                    <span>Cabut Sertifikat (Revoke)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
