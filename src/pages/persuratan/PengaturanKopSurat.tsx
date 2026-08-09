import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Upload } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';

export interface KopSuratData {
  namaPemerintah: string;
  namaInstansi: string;
  alamat: string;
  telepon: string;
  faksimili: string;
  website: string;
  email: string;
}

export function getKopSuratData(role?: string): KopSuratData {
  const key = role ? `sipeka_kop_surat_${role}` : 'sipeka_kop_surat';
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
  }
  
  if (role === 'Pengelola') {
    return {
      namaPemerintah: 'PEMERINTAH KABUPATEN GARUT',
      namaInstansi: 'DINAS KESEHATAN (PENGELOLA BANGUNAN)',
      alamat: 'Jalan Proklamasi No. 12 Tarogong Kidul - Garut',
      telepon: '(0262) 123456',
      faksimili: '(0262) 123457',
      website: 'dinkes.garutkab.go.id',
      email: 'dinkes@garutkab.go.id'
    };
  }
  
  return {
    namaPemerintah: 'PEMERINTAH KABUPATEN GARUT',
    namaInstansi: 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    alamat: 'Jalan Raya Samarang No. 115 Tarogong Kidul - Garut 44151',
    telepon: '(0262) 233155',
    faksimili: '(0262) 232938',
    website: 'dpupr.garutkab.go.id',
    email: 'dpupr@garutkab.go.id'
  };
}

export function PengaturanKopSurat() {
  const { activeRole } = useRole();
  const [formData, setFormData] = useState<KopSuratData>(getKopSuratData(activeRole));
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(getKopSuratData(activeRole));
  }, [activeRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(`sipeka_kop_surat_${activeRole}`, JSON.stringify(formData));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-lg text-slate-800">Pengaturan Kop Surat</CardTitle>
        <CardDescription>Sesuaikan identitas instansi yang akan ditampilkan pada kop dokumen resmi</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Identitas Utama</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm text-slate-600 font-medium">Nama Pemerintah Daerah</label>
              <Input 
                name="namaPemerintah" 
                value={formData.namaPemerintah} 
                onChange={handleChange}
                placeholder="Contoh: PEMERINTAH KABUPATEN GARUT"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm text-slate-600 font-medium">Nama Instansi / Dinas</label>
              <Input 
                name="namaInstansi" 
                value={formData.namaInstansi} 
                onChange={handleChange}
                placeholder="Contoh: DINAS PEKERJAAN UMUM DAN PENATAAN RUANG"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Logo Instansi</h3>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-20 border border-slate-200 mb-3 flex items-center justify-center text-xs text-slate-400">
                Logo<br/>Kab. Garut
              </div>
              <p className="text-sm text-slate-500 mb-4">Gunakan format PNG atau JPG dengan background transparan. Maks. 2MB</p>
              <Button variant="outline" size="sm" className="text-pupr-blue border-pupr-blue/30 hover:bg-pupr-blue/5">
                <Upload size={16} className="mr-2" /> Unggah Logo Baru
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Informasi Kontak & Alamat</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm text-slate-600 font-medium">Alamat Lengkap</label>
              <Input 
                name="alamat" 
                value={formData.alamat} 
                onChange={handleChange}
                placeholder="Jalan Raya..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-600 font-medium">Telepon</label>
              <Input 
                name="telepon" 
                value={formData.telepon} 
                onChange={handleChange}
                placeholder="(0262) xxxxxx"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-600 font-medium">Faksimili</label>
              <Input 
                name="faksimili" 
                value={formData.faksimili} 
                onChange={handleChange}
                placeholder="(0262) xxxxxx"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-600 font-medium">Website</label>
              <Input 
                name="website" 
                value={formData.website} 
                onChange={handleChange}
                placeholder="domain.go.id"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-600 font-medium">Email Resmi</label>
              <Input 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                placeholder="email@domain.go.id"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
        <Button variant="pupr" onClick={handleSave}>
          <Save size={16} className="mr-2" /> {isSaved ? 'Tersimpan!' : 'Simpan Pengaturan'}
        </Button>
      </CardFooter>
    </Card>
  );
}
