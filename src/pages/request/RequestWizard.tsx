import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { CheckCircle2, ChevronRight, ChevronLeft, MapPin, Upload, FileText, CheckCircle, ShieldCheck } from 'lucide-react';

const steps = [
  { id: 1, title: 'PEMOHON' },
  { id: 2, title: 'BANGUNAN' },
  { id: 3, title: 'PERMOHONAN' },
  { id: 4, title: 'LAMPIRAN' },
  { id: 5, title: 'REVIEW' },
  { id: 6, title: 'TTE' },
  { id: 7, title: 'SUBMIT' },
];

export function RequestWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    applicant: {
      instansiAtas: 'Dinas Pendidikan Kabupaten Garut',
      instansiBawah: 'SMP Negeri 1 Tarogong',
      alamat: 'Jl. Suherman No.1, Tarogong',
      email: 'smpn1tarogong@garutkab.go.id',
      phone: '0262-123456',
    },
    building: {
      name: '',
      npsn: '',
      area: '',
      floors: '',
      address: '',
      village: '',
      district: '',
      regency: 'Garut',
      province: 'Jawa Barat',
      coordinates: null as {lat: number, lng: number} | null,
    },
    purpose: '',
    background: '',
  });

  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(curr => curr + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleAutofillBuilding = () => {
    setFormData({
      ...formData,
      building: {
        name: 'Gedung Kelas 7A-7D',
        npsn: '20227189',
        area: '400',
        floors: '2',
        address: 'Jl. Suherman No.1, Tarogong',
        village: 'Tarogong',
        district: 'Tarogong Kidul',
        regency: 'Garut',
        province: 'Jawa Barat',
        coordinates: { lat: -7.215, lng: 107.886 },
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    nextStep();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex flex-col items-center ${currentStep >= step.id ? 'text-pupr-blue' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
              currentStep > step.id ? 'bg-pupr-blue text-white' : 
              currentStep === step.id ? 'bg-pupr-blue text-white ring-4 ring-pupr-blue/20' : 
              'bg-slate-100 text-slate-400'
            }`}>
              {currentStep > step.id ? <CheckCircle2 size={16} /> : step.id}
            </div>
            <span className="text-xs font-semibold whitespace-nowrap">{step.title}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-1 w-12 mx-2 rounded ${currentStep > step.id ? 'bg-pupr-blue' : 'bg-slate-100'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Buat Permohonan Penilaian</h1>
        <p className="text-slate-500">Isi formulir berikut untuk mengajukan penilaian kerusakan bangunan.</p>
      </div>

      {renderStepIndicator()}

      <Card className="shadow-sm border-slate-200">
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Identitas Pemohon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Nama Instansi / Unit Kerja</label>
                  <Input value={formData.applicant.instansiBawah} readOnly className="bg-slate-50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Induk Instansi</label>
                  <Input value={formData.applicant.instansiAtas} readOnly className="bg-slate-50" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Alamat</label>
                  <Input value={formData.applicant.alamat} readOnly className="bg-slate-50" />
                </div>
              </div>
              <p className="text-xs text-slate-500 italic mt-2">Data ini diambil otomatis dari Profil Anda.</p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-semibold">Identitas Bangunan Gedung</h3>
                <Button variant="outline" size="sm" onClick={handleAutofillBuilding} className="border-pupr-blue text-pupr-blue">
                  Pilih Bangunan Terdaftar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Nama Bangunan</label>
                  <Input 
                    value={formData.building.name} 
                    onChange={e => setFormData({...formData, building: {...formData.building, name: e.target.value}})} 
                    placeholder="Contoh: Gedung Kelas A" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">NPSN (Opsional)</label>
                  <Input 
                    value={formData.building.npsn} 
                    onChange={e => setFormData({...formData, building: {...formData.building, npsn: e.target.value}})} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Luas Bangunan (m2)</label>
                  <Input 
                    type="number" 
                    value={formData.building.area} 
                    onChange={e => setFormData({...formData, building: {...formData.building, area: e.target.value}})} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Jumlah Lantai</label>
                  <Input 
                    type="number" 
                    value={formData.building.floors} 
                    onChange={e => setFormData({...formData, building: {...formData.building, floors: e.target.value}})} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Alamat Bangunan</label>
                  <Input 
                    value={formData.building.address} 
                    onChange={e => setFormData({...formData, building: {...formData.building, address: e.target.value}})} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Koordinat GPS</label>
                  <div className="flex gap-2">
                    <Input 
                      readOnly 
                      value={formData.building.coordinates ? `${formData.building.coordinates.lat}, ${formData.building.coordinates.lng}` : ''} 
                      placeholder="-7.xxxxx, 107.xxxxx" 
                      className="bg-slate-50"
                    />
                    <Button variant="outline" className="px-3" onClick={handleAutofillBuilding}>
                      <MapPin size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Maksud dan Alasan Permohonan</h3>
              <div>
                <label className="text-sm font-medium text-slate-700">Maksud Permohonan</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pupr-blue focus-visible:ring-offset-2"
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                >
                  <option value="">-- Pilih Maksud Permohonan --</option>
                  <option value="Penilaian kerusakan bangunan">Penilaian kerusakan bangunan</option>
                  <option value="Penilaian pascakejadian">Penilaian pascakejadian bencana</option>
                  <option value="Penilaian untuk rehabilitasi">Penilaian untuk rencana rehabilitasi</option>
                  <option value="Penilaian untuk pengusulan anggaran">Penilaian untuk pengusulan anggaran DAK</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Latar Belakang / Alasan (Uraikan secara ringkas)</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pupr-blue focus-visible:ring-offset-2"
                  placeholder="Contoh: Bangunan mengalami kerusakan berat pada bagian atap dan kolom pasca gempa bumi..."
                  value={formData.background}
                  onChange={e => setFormData({...formData, background: e.target.value})}
                ></textarea>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Dokumen Pendukung & Dokumentasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50">
                  <Upload className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Dokumen Teknis (Opsional)</p>
                  <p className="text-xs text-slate-500 mb-4">DED, As-Built Drawing, dll (PDF, max 10MB)</p>
                  <Button variant="outline" size="sm">Pilih File</Button>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50">
                  <Upload className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Foto Kerusakan Awal</p>
                  <p className="text-xs text-slate-500 mb-4">Tampak Depan, Samping, Detail Kerusakan (JPG/PNG)</p>
                  <Button variant="outline" size="sm">Pilih Foto</Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Review Dokumen</h3>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <p className="text-sm text-slate-600 mb-4">
                  Pastikan semua data yang telah diisi sudah benar. Klik tombol di bawah ini untuk mengenerate preview Surat Permohonan resmi.
                </p>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setDocumentGenerated(true)}
                    className="bg-pupr-blue hover:bg-blue-700 text-white"
                  >
                    <FileText className="mr-2" size={16} /> Generate Preview PDF
                  </Button>
                </div>
              </div>

              {documentGenerated && (
                <div className="mt-6 border rounded-lg bg-white overflow-hidden shadow-sm">
                  <div className="bg-slate-100 p-2 border-b flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 ml-2">Preview: Surat Permohonan.pdf</span>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">DRAFT (Belum Ditandatangani)</Badge>
                  </div>
                  <div className="p-8 h-96 overflow-y-auto bg-slate-200 flex justify-center">
                    <div className="w-full max-w-2xl bg-white shadow-lg h-[800px] p-12">
                      <div className="text-center mb-8 border-b-2 border-black pb-2">
                        <h2 className="text-xl font-bold">PEMERINTAH KABUPATEN GARUT</h2>
                        <h3 className="text-lg font-bold">{formData.applicant.instansiAtas.toUpperCase()}</h3>
                        <h4 className="text-lg font-bold">{formData.applicant.instansiBawah.toUpperCase()}</h4>
                        <p className="text-sm">{formData.applicant.alamat}</p>
                      </div>
                      <div className="text-sm space-y-1 mb-8">
                        <p>Nomor: (Dihasilkan Otomatis)</p>
                        <p>Sifat: Biasa</p>
                        <p>Lampiran: -</p>
                        <p className="font-bold">Hal: Permohonan Penilaian Kerusakan Bangunan Gedung {formData.building.name}</p>
                      </div>
                      <div className="text-sm mb-4 text-right">
                        <p>Yth. Kepala Dinas Pekerjaan Umum dan Penataan Ruang</p>
                        <p>Kabupaten Garut</p>
                        <p>di Garut</p>
                      </div>
                      <div className="text-sm text-justify space-y-4">
                        <p>Dalam rangka menjamin keselamatan, keamanan, kenyamanan, dan keberlanjutan fungsi bangunan gedung pada {formData.applicant.instansiBawah}, bersama ini kami mengajukan permohonan Analisis dan Perhitungan Kerusakan Bangunan Gedung terhadap bangunan yang berada pada lokasi berikut:</p>
                        
                        <div className="pl-4 space-y-1">
                          <p>Nama Bangunan: {formData.building.name || '-'}</p>
                          <p>Luas Bangunan: {formData.building.area || '-'} m2</p>
                          <p>Alamat: {formData.building.address || '-'}</p>
                        </div>
                        
                        <p>Maksud Permohonan: {formData.purpose || '-'}</p>
                        <p>Latar Belakang: {formData.background || '-'}</p>
                        
                        <p>Sebagai bahan pertimbangan, bersama ini kami lampirkan dokumen-dokumen pendukung. Demikian permohonan ini disampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>
                      </div>
                      <div className="mt-12 flex justify-end text-sm">
                        <div className="text-center w-64">
                          <p>Kepala {formData.applicant.instansiBawah}</p>
                          <p className="mt-2 text-slate-400 italic">[ BLOK TTE ]</p>
                          <div className="h-20"></div>
                          <p className="font-bold underline">Budi Santoso, M.Pd</p>
                          <p>NIP. 198001012005011001</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">Tanda Tangan Elektronik (TTE)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-pupr-blue bg-blue-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="text-pupr-blue" /> Status Sertifikat TTE
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nama</span>
                        <span className="font-medium text-slate-800">Budi Santoso, M.Pd</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">NIP</span>
                        <span className="font-medium text-slate-800">198001012005011001</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Jabatan</span>
                        <span className="font-medium text-slate-800">Kepala Sekolah</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">PSrE</span>
                        <span className="font-medium text-slate-800">BSrE BSSN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status</span>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Valid & Aktif</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col justify-center">
                  {!isSigned ? (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">
                        Dengan menekan tombol di bawah, Anda menyatakan bahwa data yang diisi adalah benar dan Anda menyetujui penandatanganan dokumen secara elektronik. Dokumen akan dikunci (immutable) setelah ditandatangani.
                      </p>
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                        size="lg"
                        onClick={() => {
                          // Simulate signing process
                          setIsSubmitting(true);
                          setTimeout(() => {
                            setIsSubmitting(false);
                            setIsSigned(true);
                          }, 1500);
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Memproses TTE...' : 'Tanda Tangani Dokumen Secara Elektronik'}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-emerald-600 w-8 h-8" />
                      </div>
                      <h4 className="text-emerald-800 font-bold mb-2">Dokumen Berhasil Ditandatangani</h4>
                      <p className="text-xs text-emerald-600 mb-4">SHA-256: 8a4b...29fc | Waktu: {new Date().toLocaleString()}</p>
                      <Button variant="outline" className="border-emerald-600 text-emerald-700" onClick={() => nextStep()}>
                        Lanjutkan ke Pengiriman <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="text-pupr-blue w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Siap Dikirim ke Dinas PUPR</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                Surat Permohonan Anda telah ditandatangani secara elektronik dan siap untuk dikirimkan ke Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Garut.
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-pupr-blue hover:bg-blue-700 text-white px-8"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Permohonan Sekarang'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50 border-t flex justify-between p-4">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1 || currentStep === 7 || isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          
          {currentStep < 6 && (
            <Button 
              className="bg-pupr-blue hover:bg-blue-700 text-white" 
              onClick={nextStep}
              disabled={currentStep === 5 && !documentGenerated}
            >
              Lanjut <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === 6 && !isSigned && (
            <Button disabled>
              Lanjut <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
