import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, CheckCircle, XCircle, FileText, UserPlus, Eye, ShieldCheck, Download, AlertTriangle } from 'lucide-react';

const mockRequests = [
  {
    id: 'REQ-2026-08-000123',
    applicant: 'SMP Negeri 1 Tarogong',
    building: 'Gedung Kelas 7A-7D',
    date: '2026-08-01',
    status: 'SUBMITTED',
    statusLabel: 'Menunggu Validasi',
    statusColor: 'bg-amber-100 text-amber-800',
    isValidated: false,
  },
  {
    id: 'REQ-2026-08-000121',
    applicant: 'Dinas Kesehatan',
    building: 'Puskesmas Tarogong',
    date: '2026-08-01',
    status: 'VALIDATED',
    statusLabel: 'Menunggu Penugasan',
    statusColor: 'bg-blue-100 text-blue-800',
    isValidated: true,
  },
  {
    id: 'REQ-2026-07-000089',
    applicant: 'Dinas Koperasi dan UKM',
    building: 'Gedung Koperasi Mekar',
    date: '2026-07-15',
    status: 'IN_ASSESSMENT',
    statusLabel: 'Sedang Dinilai',
    statusColor: 'bg-emerald-100 text-emerald-800',
    isValidated: true,
  }
];

export function RequestValidation() {
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'assign'>('list');

  const renderDetail = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('list')}>Kembali</Button>
          <h2 className="text-xl font-bold text-slate-800">Detail Permohonan {selectedReq.id}</h2>
        </div>
        <Badge className={`${selectedReq.statusColor} border-none`}>{selectedReq.statusLabel}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg">Informasi Surat & Bangunan</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Pemohon</p>
                <p className="font-semibold">{selectedReq.applicant}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Tanggal Masuk</p>
                <p className="font-semibold">{selectedReq.date}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Bangunan</p>
                <p className="font-semibold">{selectedReq.building}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Luas / Lantai</p>
                <p className="font-semibold">400 m2 / 2 Lantai</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 mb-1">Alamat</p>
                <p className="font-semibold">Jl. Suherman No.1, Tarogong Kidul, Garut</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 mb-1">Maksud Permohonan</p>
                <p className="font-semibold">Penilaian kerusakan bangunan pasca gempa</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Dokumen Permohonan</CardTitle>
              <Button variant="outline" size="sm" className="h-8"><Download className="h-4 w-4 mr-2" /> Unduh PDF</Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg bg-slate-50">
                <FileText className="h-10 w-10 text-red-500" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Surat_Permohonan_Penilaian.pdf</h4>
                  <p className="text-xs text-slate-500 mb-2">Ditandatangani secara elektronik pada: {selectedReq.date}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-100 p-2 rounded w-max">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Tanda Tangan Elektronik Valid (BSrE)</span>
                  </div>
                </div>
                <Button size="sm">Lihat Dokumen</Button>
              </div>
              
              <h5 className="font-semibold mt-4 mb-2 text-sm">Lampiran Pendukung</h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 border rounded text-sm bg-white cursor-pointer hover:bg-slate-50">
                  <FileText className="h-4 w-4 text-blue-500" /> Foto_Kerusakan_Depan.jpg
                </div>
                <div className="flex items-center gap-2 p-2 border rounded text-sm bg-white cursor-pointer hover:bg-slate-50">
                  <FileText className="h-4 w-4 text-blue-500" /> Foto_Kerusakan_Atap.jpg
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!selectedReq.isValidated ? (
            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50 border-b border-amber-100 pb-3">
                <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Validasi Administrasi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-pupr-blue focus:ring-pupr-blue" />
                    Surat Permohonan Sah & TTE Valid
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-pupr-blue focus:ring-pupr-blue" />
                    Identitas Bangunan Jelas
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-pupr-blue focus:ring-pupr-blue" />
                    Dokumen Lampiran Lengkap
                  </label>
                </div>
                <hr className="my-2" />
                <Button className="w-full bg-pupr-blue hover:bg-blue-700">Terima Permohonan</Button>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">Tolak Permohonan</Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-100 pb-3">
                <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                  <UserPlus className="h-5 w-5" /> Penugasan Surveyor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <p className="text-sm text-slate-600">
                  Permohonan telah divalidasi. Silakan tugaskan Surveyor untuk melakukan inspeksi lapangan.
                </p>
                
                {selectedReq.status === 'VALIDATED' ? (
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setViewMode('assign')}
                  >
                    Tugaskan Surveyor Sekarang
                  </Button>
                ) : (
                  <div className="p-3 bg-slate-50 border rounded-lg text-sm">
                    <p className="text-slate-500 mb-1">Ditugaskan Kepada:</p>
                    <p className="font-semibold text-slate-800">Tim Surveyor 1 (Andi S., Budi K.)</p>
                    <p className="text-xs mt-2 text-emerald-600 font-medium">Status: Sedang dalam proses survei lapangan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="relative pl-4 border-l-2 border-slate-200 space-y-4 pb-2">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-pupr-blue border-2 border-white"></div>
                  <p className="text-xs text-slate-500">2026-08-01 10:15</p>
                  <p className="text-sm font-medium">Permohonan Dikirim</p>
                  <p className="text-xs text-slate-500">Oleh: Budi Santoso (Pemohon)</p>
                </div>
                {selectedReq.isValidated && (
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                    <p className="text-xs text-slate-500">2026-08-02 09:30</p>
                    <p className="text-sm font-medium">Divalidasi Admin</p>
                    <p className="text-xs text-slate-500">Oleh: Admin SIPEKA</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderAssign = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setViewMode('detail')}>Kembali</Button>
        <h2 className="text-xl font-bold text-slate-800">Penugasan Surveyor</h2>
      </div>

      <Card>
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Pilih Surveyor / Tim Inspeksi</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="p-4 border rounded-lg hover:border-pupr-blue hover:bg-blue-50 cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-pupr-blue/10 rounded-full flex items-center justify-center text-pupr-blue font-bold">
                AS
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Tim 1 (Andi Surya & Rekan)</h4>
                <p className="text-xs text-slate-500">Ahli Struktur & Arsitektur</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">2 Tugas Aktif</Badge>
            </div>
          </div>
          
          <div className="p-4 border border-pupr-blue bg-blue-50 rounded-lg cursor-pointer flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-8 h-8 bg-pupr-blue rounded-bl-lg flex items-center justify-center text-white">
              <CheckCircle size={16} />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-pupr-blue/10 rounded-full flex items-center justify-center text-pupr-blue font-bold">
                BW
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Tim 2 (Bambang Wijaya)</h4>
                <p className="text-xs text-slate-500">Surveyor Senior</p>
              </div>
            </div>
            <div className="text-right mr-6">
              <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">Tersedia</Badge>
            </div>
          </div>

          <div className="p-4 border rounded-lg hover:border-pupr-blue hover:bg-blue-50 cursor-pointer flex items-center justify-between opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                CK
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Tim 3 (Cinta Kirana)</h4>
                <p className="text-xs text-slate-500">Ahli MEP</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">Cuti</Badge>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t flex justify-end">
            <Button size="lg" className="bg-pupr-blue hover:bg-blue-700 w-full md:w-auto" onClick={() => setViewMode('list')}>
              Konfirmasi Penugasan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
      {viewMode === 'list' && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Validasi Permohonan Masuk</h1>
            <p className="text-slate-500">Tinjau permohonan penilaian baru dan tugaskan tim surveyor.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="text-amber-500 h-8 w-8 mb-2" />
                <h3 className="text-2xl font-bold text-amber-900">1</h3>
                <p className="text-sm font-medium text-amber-700">Menunggu Validasi</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <UserPlus className="text-blue-500 h-8 w-8 mb-2" />
                <h3 className="text-2xl font-bold text-blue-900">1</h3>
                <p className="text-sm font-medium text-blue-700">Menunggu Penugasan</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="text-emerald-500 h-8 w-8 mb-2" />
                <h3 className="text-2xl font-bold text-emerald-900">3</h3>
                <p className="text-sm font-medium text-emerald-700">Total Selesai (Bulan Ini)</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Daftar Permohonan</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari pemohon atau bangunan..."
                      className="pl-9 h-9 w-[250px] rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-medium">Nomor / Tanggal</th>
                      <th className="px-6 py-3 font-medium">Pemohon</th>
                      <th className="px-6 py-3 font-medium">Bangunan</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRequests.map((req, idx) => (
                      <tr key={req.id} className={`border-b border-slate-100 hover:bg-slate-50 ${idx === mockRequests.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{req.id}</p>
                          <p className="text-xs text-slate-500">{req.date}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{req.applicant}</td>
                        <td className="px-6 py-4 text-slate-700">{req.building}</td>
                        <td className="px-6 py-4">
                          <Badge className={`${req.statusColor} hover:${req.statusColor} border-none`}>
                            {req.statusLabel}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-pupr-blue border-pupr-blue hover:bg-blue-50"
                            onClick={() => {
                              setSelectedReq(req);
                              setViewMode('detail');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Tinjau
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === 'detail' && selectedReq && renderDetail()}
      {viewMode === 'assign' && selectedReq && renderAssign()}
    </div>
  );
}
