import React, { useState } from 'react';
import { User, Mail, Phone, Building2, MapPin, Briefcase, Camera, Shield, Save, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/contexts/RoleContext';

export function UserProfile() {
  const { activeRole } = useRole();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [profileData, setProfileData] = useState({
    name: 'Budi Santoso, S.T.',
    email: 'budi.santoso@garutkab.go.id',
    phone: '0812-3456-7890',
    nip: '19850101 201001 1 001',
    organization: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    department: 'Bidang Bangunan Gedung',
    position: activeRole,
    address: 'Jl. Raya Samarang No. 123, Tarogong Kaler, Kabupaten Garut'
  });

  const handleSave = () => {
    showToast('Profil berhasil diperbarui');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 border border-slate-700">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profil Pengguna</h1>
        <p className="text-slate-500 dark:text-slate-400">Kelola informasi data diri dan pengaturan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center relative group">
                  <User size={64} className="text-slate-400" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={24} className="text-white mb-1" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ubah Foto</span>
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{profileData.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{profileData.position}</p>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                <Shield size={12} className="mr-1" /> Akun Terverifikasi
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
              <CardDescription>Perbarui data pribadi dan informasi kontak Anda</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-pupr-blue" /> Nama Lengkap
                  </label>
                  <Input 
                    value={profileData.name} 
                    onChange={e => setProfileData({...profileData, name: e.target.value})} 
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail size={14} className="text-pupr-blue" /> Email
                  </label>
                  <Input 
                    type="email"
                    value={profileData.email} 
                    onChange={e => setProfileData({...profileData, email: e.target.value})} 
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone size={14} className="text-pupr-blue" /> No. Telepon / WhatsApp
                  </label>
                  <Input 
                    value={profileData.phone} 
                    onChange={e => setProfileData({...profileData, phone: e.target.value})} 
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-pupr-blue" /> NIP / NIK
                  </label>
                  <Input 
                    value={profileData.nip} 
                    onChange={e => setProfileData({...profileData, nip: e.target.value})} 
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Informasi Instansi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400" /> Instansi
                    </label>
                    <Input 
                      value={profileData.organization} 
                      disabled
                      className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400" /> Bidang / Bagian
                    </label>
                    <Input 
                      value={profileData.department} 
                      onChange={e => setProfileData({...profileData, department: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin size={14} className="text-pupr-blue" /> Alamat Lengkap
                  </label>
                  <textarea 
                    rows={3}
                    value={profileData.address}
                    onChange={e => setProfileData({...profileData, address: e.target.value})}
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pupr-blue bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="pupr" onClick={handleSave} className="px-8">
                  <Save size={16} className="mr-2" />
                  Simpan Perubahan
                </Button>
              </div>

            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm mt-6">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Keamanan Akun</CardTitle>
              <CardDescription>Ubah kata sandi dan amankan akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kata Sandi Saat Ini</label>
                  <Input type="password" placeholder="Masukkan kata sandi saat ini" className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kata Sandi Baru</label>
                  <Input type="password" placeholder="Buat kata sandi baru" className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Konfirmasi Kata Sandi Baru</label>
                  <Input type="password" placeholder="Ketik ulang kata sandi baru" className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <Button variant="outline" className="mt-2 text-pupr-blue border-pupr-blue/20 hover:bg-pupr-blue/10">
                  Perbarui Kata Sandi
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm mt-6">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Preferensi Notifikasi</CardTitle>
              <CardDescription>Atur notifikasi yang ingin Anda terima</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifikasi Email</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Terima pembaruan via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pupr-blue/30 dark:peer-focus:ring-pupr-blue/80 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pupr-blue"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Pemberitahuan Assessment Baru</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Diberitahu ketika ada jadwal survey yang menanti</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pupr-blue/30 dark:peer-focus:ring-pupr-blue/80 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pupr-blue"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifikasi Sistem</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pemberitahuan update dan maintenance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pupr-blue/30 dark:peer-focus:ring-pupr-blue/80 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pupr-blue"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
