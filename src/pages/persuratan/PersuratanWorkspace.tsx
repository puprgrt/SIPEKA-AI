import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, Plus, Search, Filter, Mail, Archive, Clock, 
  CheckCircle2, Send, Download, FileSignature, Layers, Settings,
  PenTool, Eraser
} from 'lucide-react';
import { SuratGenerator } from './SuratGenerator';
import { PengaturanKopSurat } from './PengaturanKopSurat';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRole } from '@/contexts/RoleContext';
import { SignatureCanvas, SignatureCanvasRef } from '@/components/ui/signature-canvas';
import { QRScanner } from './QRScanner';
import { AuditTrail, AuditLog } from './AuditTrail';
import { ShieldCheck, ScanLine } from 'lucide-react';

export function PersuratanWorkspace() {
  const { activeRole, availableRoles } = useRole();
  const currentRoleObj = availableRoles.find(r => r.name === activeRole);
  const roleId = currentRoleObj?.id || 1;

  const [activeTab, setActiveTab] = useState<'surat_keluar' | 'surat_masuk' | 'draft' | 'template' | 'buat_surat' | 'pengaturan' | 'kotak_ttd' | 'verifikasi' | 'audit_trail'>('surat_keluar');
  const [searchTerm, setSearchTerm] = useState('');
  const [ttdModalOpen, setTtdModalOpen] = useState(false);
  const [selectedSuratTTD, setSelectedSuratTTD] = useState<any>(null);
  
  const sigCanvas = useRef<SignatureCanvasRef>(null);

  // Define tabs based on roles
  let allowedTabs = [];
  if (roleId === 1) { // Super Administrator
    allowedTabs = [
      { id: 'surat_keluar', label: 'Surat Keluar', icon: Send },
      { id: 'surat_masuk', label: 'Surat Masuk', icon: Mail },
      { id: 'kotak_ttd', label: 'Kotak TTD', icon: FileSignature },
      { id: 'draft', label: 'Draft', icon: FileText },
      { id: 'template', label: 'Template Naskah', icon: Layers },
      { id: 'pengaturan', label: 'Pengaturan Kop', icon: Settings },
      { id: 'audit_trail', label: 'Riwayat TTD', icon: ShieldCheck },
      { id: 'verifikasi', label: 'Verifikasi QR', icon: ScanLine },
    ];
  } else if (roleId === 2 || roleId === 6) { // Kepala Dinas, Kepala Bidang
    allowedTabs = [
      { id: 'kotak_ttd', label: 'Kotak TTD', icon: FileSignature },
      { id: 'surat_masuk', label: 'Surat Masuk', icon: Mail },
      { id: 'surat_keluar', label: 'Surat Keluar', icon: Send },
      { id: 'audit_trail', label: 'Riwayat TTD', icon: ShieldCheck },
      { id: 'verifikasi', label: 'Verifikasi QR', icon: ScanLine },
    ];
  } else if (roleId === 5) { // Pengelola
    allowedTabs = [
      { id: 'surat_masuk', label: 'Surat Masuk', icon: Mail },
      { id: 'surat_keluar', label: 'Surat Keluar', icon: Send },
    ];
  } else if (roleId === 3 || roleId === 4) { // Reviewer Teknis, Surveyor
    allowedTabs = [
      { id: 'surat_keluar', label: 'Surat Keluar / Tugas', icon: Send },
      { id: 'draft', label: 'Draft Laporan', icon: FileText },
    ];
  } else {
    allowedTabs = [
      { id: 'surat_keluar', label: 'Surat Keluar', icon: Send },
    ];
  }

  useEffect(() => {
    if (!allowedTabs.find(t => t.id === activeTab) && activeTab !== 'buat_surat' && activeTab !== 'pengaturan') {
      setActiveTab(allowedTabs[0]?.id as any || 'surat_keluar');
    }
  }, [activeRole, activeTab, allowedTabs]);

  // Mock data for letters

  const mockSuratKeluar = [
    { id: 'SK-001', nomor: '600.1.15/123/DPUPR/2026', hal: 'Pemberitahuan Pelaksanaan Survei Penilaian Kerusakan', tujuan: 'Kepala SDN 1 Garut Kota', tanggal: '2026-08-01', status: 'Terkirim' },
    { id: 'SK-002', nomor: '600.1.15/124/DPUPR/2026', hal: 'Undangan Rapat Koordinasi Teknis', tujuan: 'Seluruh Camat se-Kabupaten Garut', tanggal: '2026-08-02', status: 'Menunggu TTD' },
  ];

  const mockKotakTTD = [
    { id: 'TTD-001', nomor: '600.1.15/124/DPUPR/2026', hal: 'Undangan Rapat Koordinasi Teknis', pembuat: 'Bidang Bangunan', tanggal: '2026-08-02', status: 'Menunggu TTD Anda' },
  ];

  const mockSuratMasuk = [
    { id: 'SM-001', nomor: '421.2/089/SDN1/2026', hal: 'Permohonan Asesmen Bangunan Sekolah', pengirim: 'Kepala SDN 1 Garut Kota', tanggal: '2026-07-28', status: 'Diterima' },
  ];

  const mockDraft = [
    { id: 'DR-001', nomor: '600.1.15/   /DPUPR/2026', hal: 'Laporan Hasil Penilaian Teknis Bencana Gempa', tujuan: 'Bupati Garut', tanggal: '2026-08-03', status: 'Draft' },
  ];

  const renderSuratList = () => {
    let data = mockSuratKeluar;
    if (activeTab === 'kotak_ttd') data = mockKotakTTD as any;
    if (activeTab === 'surat_masuk') data = mockSuratMasuk as any;
    if (activeTab === 'draft') data = mockDraft as any;
    if (activeTab === 'template') data = [];

    return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-slate-800">
              {activeTab === 'surat_keluar' ? 'Daftar Surat Keluar' : 
               activeTab === 'surat_masuk' ? 'Daftar Surat Masuk' : 
               activeTab === 'draft' ? 'Draft Surat' : 
               activeTab === 'template' ? 'Template Naskah' : 
               activeTab === 'kotak_ttd' ? 'Kotak Tanda Tangan' : 'Daftar Surat'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'draft' ? 'Lanjutkan mengedit surat yang belum dikirim' : 'Kelola dan pantau surat resmi instansi'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nomor atau hal surat..."
                className="pl-9 h-9 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter size={16} />
            </Button>
            {/* Hanya role tertentu yang bisa Buat Surat */}
            {[1, 3, 4].includes(roleId) && (
              <Button variant="pupr" className="h-9" onClick={() => setActiveTab('buat_surat')}>
                <Plus size={16} className="mr-2" /> Buat Surat Baru
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[200px] font-semibold">Nomor Surat</TableHead>
              <TableHead className="font-semibold">Hal / Perihal</TableHead>
              <TableHead className="font-semibold">
                {activeTab === 'kotak_ttd' ? 'Pembuat' : 
                 activeTab === 'surat_masuk' ? 'Pengirim' : 'Tujuan'}
              </TableHead>
              <TableHead className="font-semibold">Tanggal</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
              <TableHead className="text-right font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">Belum ada surat di kategori ini.</TableCell>
              </TableRow>
            ) : data.map((surat) => (
              <TableRow key={surat.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                <TableCell className="font-medium text-slate-900">{surat.nomor}</TableCell>
                <TableCell className="text-slate-700">{surat.hal}</TableCell>
                <TableCell className="text-slate-600">{(surat as any).tujuan || (surat as any).pembuat || (surat as any).pengirim}</TableCell>
                <TableCell className="text-slate-600">{surat.tanggal}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={cn(
                    "border-transparent font-medium",
                    surat.status === 'Terkirim' || surat.status === 'Diterima' ? 'bg-emerald-100 text-emerald-700' : 
                    surat.status?.includes('TTD') ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  )}>
                    {surat.status === 'Terkirim' || surat.status === 'Diterima' ? <CheckCircle2 size={14} className="mr-1" /> : <Clock size={14} className="mr-1" />}
                    {surat.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {activeTab === 'kotak_ttd' ? (
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 text-pupr-blue hover:text-pupr-blue/80 hover:bg-pupr-blue/10"
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedSuratTTD(surat);
                         setTtdModalOpen(true);
                       }}
                     >
                       <FileSignature size={15} className="mr-2" /> TTD
                     </Button>
                  ) : activeTab === 'draft' ? (
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 text-pupr-blue hover:text-pupr-blue/80 hover:bg-pupr-blue/10"
                       onClick={(e) => {
                         e.stopPropagation();
                         setActiveTab('buat_surat');
                       }}
                     >
                       <PenTool size={15} className="mr-2" /> Edit
                     </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-pupr-blue">
                      <Download size={15} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Pusat Persuratan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manajemen tata naskah dinas sesuai pedoman resmi Permendagri
          </p>
        </div>
      </div>

      {activeTab !== 'buat_surat' && (
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200">
          {allowedTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2",
                activeTab === tab.id 
                  ? "border-pupr-blue text-pupr-blue bg-pupr-blue/5" 
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {activeTab === 'buat_surat' ? (
          <SuratGenerator onCancel={() => setActiveTab('surat_keluar')} />
        ) : activeTab === 'pengaturan' ? (
          <PengaturanKopSurat />
        ) : activeTab === 'audit_trail' ? (
          <AuditTrail />
        ) : activeTab === 'verifikasi' ? (
          <QRScanner />
        ) : (
          renderSuratList()
        )}
      </div>

      {/* TTD Modal */}
      {ttdModalOpen && selectedSuratTTD && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Tanda Tangan Elektronik</CardTitle>
              <CardDescription>Bubuhi Tanda Tangan Elektronik (TTE) tersertifikasi pada dokumen ini.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-sm font-medium text-slate-700">Detail Dokumen:</p>
                <div className="mt-2 text-sm text-slate-600">
                  <p><span className="w-24 inline-block">Nomor</span>: {selectedSuratTTD.nomor}</p>
                  <p><span className="w-24 inline-block">Hal</span>: {selectedSuratTTD.hal}</p>
                  <p><span className="w-24 inline-block">Pembuat</span>: {selectedSuratTTD.pembuat || selectedSuratTTD.tujuan}</p>
                </div>
              </div>
              <div className="space-y-2">
                <SignatureCanvas ref={sigCanvas} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Passphrase TTE</label>
                <Input 
                  type="password" 
                  placeholder="Masukkan passphrase sertifikat Anda..." 
                  id="tte-passphrase"
                />
              </div>
            </CardContent>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-lg">
              <Button variant="outline" onClick={() => {
                setTtdModalOpen(false);
                sigCanvas.current?.clear();
              }}>Batal</Button>
              <Button 
                variant="pupr" 
                onClick={async (e) => {
                  if (sigCanvas.current?.isEmpty()) {
                    alert('Mohon bubuhkan tanda tangan Anda terlebih dahulu.');
                    return;
                  }

                  const btn = e.currentTarget;
                  const originalText = btn.innerHTML;
                  btn.innerHTML = 'Memproses Kriptografi...';
                  btn.disabled = true;

                  try {
                    const passphraseInput = document.getElementById('tte-passphrase') as HTMLInputElement;
                    const passphrase = passphraseInput?.value || 'default-key';
                    const signatureData = sigCanvas.current?.toDataURL();
                    
                    // Generate cryptographic hash (SHA-256) of document metadata + passphrase + signature
                    const encoder = new TextEncoder();
                    const dataToSign = `${selectedSuratTTD.nomor}|${selectedSuratTTD.hal}|${passphrase}|${new Date().toISOString()}|${signatureData}`;
                    const dataBuffer = encoder.encode(dataToSign);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    
                    // Wait briefly for effect
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const currentLogs = JSON.parse(localStorage.getItem('sipeka_signature_audit') || '[]');
                    const newLog: AuditLog = {
                      id: "AUDIT-" + new Date().getTime(),
                      nomorSurat: selectedSuratTTD.nomor,
                      hal: selectedSuratTTD.hal,
                      signerId: "USR-" + roleId,
                      signerName: currentRoleObj?.name || "Unknown User",
                      timestamp: new Date().toISOString(),
                      hash: hashHex,
                      version: 1
                    };
                    localStorage.setItem('sipeka_signature_audit', JSON.stringify([newLog, ...currentLogs]));
                    
                    setTtdModalOpen(false);
                    sigCanvas.current?.clear();
                    alert(`Dokumen berhasil ditandatangani secara elektronik!\n\nDigital Signature (SHA-256):\n${hashHex}`);
                  } catch (err) {
                    alert('Gagal melakukan penandatanganan kriptografis.');
                  } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                  }
                }}
              >
                <FileSignature size={16} className="mr-2" />
                Tandatangani Dokumen
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
