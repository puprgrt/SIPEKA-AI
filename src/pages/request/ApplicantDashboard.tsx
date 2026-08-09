import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockRequests = [
  {
    id: 'REQ-2026-08-000123',
    building: 'Gedung Kelas 7A-7D',
    date: '2026-08-01',
    status: 'SUBMITTED',
    statusLabel: 'Terkirim',
    statusColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'REQ-2026-07-000089',
    building: 'Laboratorium Komputer',
    date: '2026-07-15',
    status: 'IN_ASSESSMENT',
    statusLabel: 'Diproses Surveyor',
    statusColor: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'REQ-2026-05-000042',
    building: 'Perpustakaan Utama',
    date: '2026-05-10',
    status: 'COMPLETED',
    statusLabel: 'Selesai',
    statusColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'REQ-2026-08-000125',
    building: 'Ruang Guru & Kepala Sekolah',
    date: '2026-08-05',
    status: 'DRAFT',
    statusLabel: 'Draft',
    statusColor: 'bg-slate-100 text-slate-800'
  }
];

export function ApplicantDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Permohonan Penilaian</h1>
          <p className="text-slate-500">Kelola daftar permohonan penilaian kerusakan bangunan instansi Anda.</p>
        </div>
        <Link to="/survey/new">
          <Button className="bg-pupr-blue hover:bg-blue-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Buat Permohonan Baru
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-lg">
              <FileText className="text-slate-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Draft</p>
              <h3 className="text-2xl font-bold">1</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="text-blue-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Menunggu Diproses</p>
              <h3 className="text-2xl font-bold">1</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <CheckCircle className="text-amber-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Sedang Dinilai</p>
              <h3 className="text-2xl font-bold">1</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <CheckCircle className="text-emerald-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Selesai</p>
              <h3 className="text-2xl font-bold">1</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Daftar Permohonan Saya</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nomor atau bangunan..."
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
                  <th className="px-6 py-3 font-medium">Nomor Permohonan</th>
                  <th className="px-6 py-3 font-medium">Bangunan</th>
                  <th className="px-6 py-3 font-medium">Tanggal</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mockRequests.map((req, idx) => (
                  <tr key={req.id} className={`border-b border-slate-100 hover:bg-slate-50 ${idx === mockRequests.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6 py-4 font-medium text-slate-900">{req.status === 'DRAFT' ? '-' : req.id}</td>
                    <td className="px-6 py-4 text-slate-700">{req.building}</td>
                    <td className="px-6 py-4 text-slate-700">{req.date}</td>
                    <td className="px-6 py-4">
                      <Badge className={`${req.statusColor} hover:${req.statusColor} border-none`}>
                        {req.statusLabel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="text-pupr-blue hover:text-blue-800 hover:bg-blue-50">
                        {req.status === 'DRAFT' ? 'Lanjutkan' : 'Detail'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
