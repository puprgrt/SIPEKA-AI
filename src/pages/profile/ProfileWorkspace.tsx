import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Shield, Briefcase, KeyRound, CheckCircle2, XCircle, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export function ProfileWorkspace() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
      showToast('Gagal memuat profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat profil...</div>;
  }

  const { personal, employment, tte } = profileData || {};

  const tabs = [
    { id: 'personal', label: 'Informasi Pribadi', icon: UserCircle },
    { id: 'employment', label: 'Kepegawaian', icon: Briefcase },
    { id: 'tte', label: 'Tanda Tangan Elektronik', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
          <p className="text-slate-500 mt-1">Kelola informasi pribadi, kepegawaian, dan TTE Anda.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-pupr-blue text-white shadow-md shadow-pupr-blue/20' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'personal' && (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pribadi</CardTitle>
                <CardDescription>Data identitas utama yang terhubung dengan akun Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">Nama Lengkap</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                      {personal?.fullName || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">Email</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                      {personal?.email || '-'}
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 mt-6">
                  <AlertCircle size={20} className="shrink-0 text-amber-600" />
                  <div className="text-sm">
                    <strong>Catatan:</strong> Informasi pribadi ini bersumber dari sistem SSO. Jika ingin mengubahnya, silakan melalui portal kepegawaian utama.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'employment' && (
            <Card>
              <CardHeader>
                <CardTitle>Data Kepegawaian</CardTitle>
                <CardDescription>Informasi terkait jabatan dan unit kerja Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">NIP (Nomor Induk Pegawai)</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                      {employment?.nip || 'Belum diatur'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">Jabatan / Posisi</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                      {employment?.positionName || 'Belum diatur'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">Unit Kerja / Bidang</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                      {employment?.departmentName || 'Belum diatur'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">Instansi</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                      {employment?.organizationName || 'Dinas Pekerjaan Umum dan Penataan Ruang'}
                    </div>
                  </div>
                </div>
                
                {(!employment?.nip || !employment?.positionName) && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 text-red-800 mt-4">
                    <AlertCircle size={20} className="shrink-0 text-red-600" />
                    <div className="text-sm">
                      <strong>Profil Tidak Lengkap!</strong> Anda tidak dapat menandatangani dokumen teknis jika NIP atau Jabatan belum terdaftar. Silakan hubungi Administrator sistem.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'tte' && (
            <Card>
              <CardHeader>
                <CardTitle>Tanda Tangan Elektronik (TTE)</CardTitle>
                <CardDescription>Kelola status sertifikat elektronik dari PSrE</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                    <Shield size={32} className={tte?.profile?.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      Status Sertifikat
                      {tte?.profile?.status === 'ACTIVE' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 size={12} /> AKTIF
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 flex items-center gap-1">
                          <XCircle size={12} /> {tte?.profile?.status || 'BELUM TERDAFTAR'}
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {tte?.profile?.status === 'ACTIVE' 
                        ? 'Sertifikat elektronik Anda aktif dan dapat digunakan untuk menandatangani dokumen.' 
                        : 'Anda belum memiliki sertifikat elektronik yang aktif untuk TTE.'}
                    </p>
                  </div>
                </div>

                {tte?.certificate && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">Penerbit (Issuer)</label>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm">
                        {tte.certificate.issuer}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">Serial Number</label>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-mono truncate" title={tte.certificate.serialNumber}>
                        {tte.certificate.serialNumber}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">Masa Berlaku Mulai</label>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm">
                        {new Date(tte.certificate.validFrom).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1 block">Berakhir Pada</label>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium">
                        {new Date(tte.certificate.validTo).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button variant="outline">
                    <KeyRound size={16} className="mr-2" />
                    Pembaruan Sertifikat
                  </Button>
                </div>

              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
