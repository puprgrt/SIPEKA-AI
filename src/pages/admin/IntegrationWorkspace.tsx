import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Network, 
  Link as LinkIcon, 
  Code2, 
  Key, 
  Webhook, 
  FileJson,
  Database,
  RefreshCw,
  Server,
  Plus,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

const MOCK_INTEGRATIONS = [
  { id: '1', name: 'Sistem Informasi Manajemen Aset Daerah (SIMBADA)', type: 'REST API', status: 'Active', lastSync: '10 menit yang lalu' },
  { id: '2', name: 'Sistem Perencanaan Daerah (SIPD)', type: 'Webhook', status: 'Active', lastSync: '1 jam yang lalu' },
  { id: '3', name: 'Dashboard Pimpinan Daerah', type: 'GraphQL', status: 'Inactive', lastSync: 'Belum pernah' },
];

const MOCK_API_KEYS = [
  { id: 'key-1', name: 'API Key SIMBADA', prefix: 'pk_live_8f92...', created: '01 Agustus 2026', expires: '01 Agustus 2027', status: 'Active' },
  { id: 'key-2', name: 'API Key SIPD', prefix: 'pk_live_1d4a...', created: '15 Juli 2026', expires: '15 Juli 2027', status: 'Active' },
];

export function IntegrationWorkspace() {
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testWA, setTestWA] = useState({ phone: '+62 811-1234-5678', message: 'Uji coba dari SIPEKA: Koneksi WhatsApp Gateway berhasil.' });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleTestWhatsApp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: testWA.phone, 
          message: testWA.message,
          type: 'test_connection'
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Pesan berhasil dikirim!');
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (e) {
      showToast('Gagal terhubung ke server');
    }
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">API & Interoperabilitas</h1>
            <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/5">Enterprise Integration</Badge>
          </div>
          <p className="text-slate-500 mt-1">Kelola integrasi SIPEKA dengan sistem e-Government lainnya.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => showToast('Membuka dokumentasi API (Fitur Segera Hadir)')}>
            <Code2 size={16} className="mr-2" />
            Dokumentasi API
          </Button>
          <Button onClick={() => showToast('Form Tambah Integrasi (Fitur Segera Hadir)')}>
            <Plus size={16} className="mr-2" />
            Tambah Integrasi
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar shrink-0">
        {[
          { id: 'overview', label: 'Connected Systems', icon: Network },
          { id: 'whatsapp', label: 'WhatsApp Gateway (PURI)', icon: MessageSquare },
          { id: 'api-keys', label: 'API Keys & Auth', icon: Key },
          { id: 'webhooks', label: 'Webhooks', icon: Webhook },
          { id: 'openapi', label: 'OpenAPI Spec', icon: FileJson },
          { id: 'sync', label: 'Data Synchronization', icon: RefreshCw },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 lg:col-span-2 border-0 shadow-sm ring-1 ring-slate-200/50">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon size={18} className="text-pupr-blue" />
                    Sistem Terintegrasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {MOCK_INTEGRATIONS.map((integration) => (
                      <div key={integration.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${integration.status === 'Active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}`}>
                            <Server size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">{integration.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] py-0">{integration.type}</Badge>
                              <span className="text-xs text-slate-500">Sync terakhir: {integration.lastSync}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Badge variant={integration.status === 'Active' ? 'success' : 'secondary'} className="font-normal">
                            {integration.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm ring-1 ring-slate-200/50 bg-gradient-to-br from-pupr-blue to-indigo-700 text-white">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="text-lg text-white">Statistik API</CardTitle>
                  <CardDescription className="text-indigo-100">Bulan ini</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <p className="text-sm text-indigo-200 mb-1">Total API Calls</p>
                    <p className="text-3xl font-bold">142,509</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-200 mb-1">Success Rate</p>
                    <p className="text-3xl font-bold">99.8%</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-200 mb-1">Data Ditransfer</p>
                    <p className="text-3xl font-bold">4.2 GB</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
              <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare size={18} className="text-emerald-600" />
                  Pengaturan WhatsApp Gateway (PURI)
                </CardTitle>
                <CardDescription>Konfigurasi koneksi dengan chatbot WhatsApp Pelayanan Publik Dinas PUPR (PURI).</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">API Endpoint (PURI Webhook)</label>
                      <Input defaultValue="https://api.pupr.garutkab.go.kr/v1/whatsapp/send" disabled className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">API Key / Token Otorisasi</label>
                      <Input type="password" defaultValue="************************" />
                      <p className="text-xs text-slate-500">Token ini digunakan untuk otentikasi pengiriman pesan dari SIPEKA ke Gateway PURI.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Nomor Pengirim (Sender WA)</label>
                      <Input defaultValue="+62 811-1234-5678" disabled className="bg-slate-50" />
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100/50">
                    <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-600" /> Status Koneksi: Terhubung
                    </h4>
                    <p className="text-sm text-emerald-800/80 mb-4 leading-relaxed">
                      Sistem SIPEKA saat ini aktif dan terhubung ke Gateway PURI. Notifikasi akan dikirimkan otomatis pada kejadian berikut:
                    </p>
                    <ul className="text-sm text-emerald-800 space-y-2 list-disc list-inside ml-2">
                      <li>Pengingat Jadwal Survei (H-1)</li>
                      <li>Persetujuan/Penolakan Asesmen (SLF)</li>
                      <li>Laporan Insiden Darurat dari Pengelola</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={handleTestWhatsApp} disabled={isLoading}>
                    {isLoading ? 'Mengirim...' : 'Test Kirim Pesan'}
                  </Button>
                  <Button variant="pupr" onClick={() => showToast('Konfigurasi Gateway PURI berhasil disimpan.')}>Simpan Konfigurasi</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">API Keys</CardTitle>
                  <CardDescription>Kelola otorisasi untuk aplikasi eksternal</CardDescription>
                </div>
                <Button onClick={() => alert('Fitur akan segera hadir!')}>
                  <Plus size={16} className="mr-2" /> Generate Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-medium">Nama Key</th>
                      <th className="px-6 py-3 font-medium">Prefix</th>
                      <th className="px-6 py-3 font-medium">Dibuat</th>
                      <th className="px-6 py-3 font-medium">Berlaku Hingga</th>
                      <th className="px-6 py-3 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_API_KEYS.map((key) => (
                      <tr key={key.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-800">{key.name}</td>
                        <td className="px-6 py-3 font-mono text-slate-500">{key.prefix}</td>
                        <td className="px-6 py-3 text-slate-600">{key.created}</td>
                        <td className="px-6 py-3 text-slate-600">{key.expires}</td>
                        <td className="px-6 py-3 text-center">
                          <Badge variant={key.status === 'Active' ? 'success' : 'secondary'} className="font-normal">{key.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {['webhooks', 'openapi', 'sync'].includes(activeTab) && (
          <Card className="border-0 shadow-sm ring-1 ring-slate-200/50 min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-50/50 text-center">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm">
              {activeTab === 'webhooks' && <Webhook size={24} />}
              {activeTab === 'openapi' && <FileJson size={24} />}
              {activeTab === 'sync' && <RefreshCw size={24} />}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Modul {activeTab === 'webhooks' ? 'Webhooks' : activeTab === 'openapi' ? 'OpenAPI & Swagger' : 'Data Synchronization'}
            </h3>
            <p className="text-slate-500 max-w-md">
              Mendukung pertukaran data secara real-time dan batch. Dokumentasi Swagger UI untuk pengembang eksternal tersedia di sini.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
