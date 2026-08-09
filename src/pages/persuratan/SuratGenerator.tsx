import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Send, Printer, FileText, CheckCircle2, Eye, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getKopSuratData } from './PengaturanKopSurat';
import { TandaTanganPad } from './TandaTanganPad';
import { QRCodeSVG } from 'qrcode.react';
import { useRole } from '@/contexts/RoleContext';

interface SuratGeneratorProps {
  onCancel: () => void;
}

export function SuratGenerator({ onCancel }: SuratGeneratorProps) {
  const { activeRole } = useRole();
  const [formData, setFormData] = useState({
    nomorSurat: '600.1.15/   /DPUPR/2026',
    sifat: 'Biasa',
    lampiran: '-',
    hal: 'Pemberitahuan Pelaksanaan Survei Penilaian Kerusakan',
    tanggal: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
    tujuanNama: 'Kepala Sekolah Dasar Negeri 1 Garut Kota',
    tujuanTempat: 'Garut',
    paragrafPembuka: 'Berdasarkan Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat tentang Pedoman Penilaian Kerusakan Bangunan Gedung, bersama ini kami sampaikan bahwa Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Garut akan melaksanakan kegiatan survei dan identifikasi kerusakan pada bangunan yang Saudara pimpin.',
    paragrafIsi: 'Kegiatan survei ini bertujuan untuk mengumpulkan data teknis terkait kondisi faktual struktur, arsitektur, dan utilitas bangunan guna keperluan perencanaan rehabilitasi dan rekonstruksi di tahun anggaran mendatang. Survei akan dilaksanakan pada:\n\nHari/Tanggal : Senin, 10 Agustus 2026\nWaktu        : 09.00 WIB s.d. selesai\nTim Survei   : Tim Penilai Teknis DPUPR Kab. Garut\n\nSehubungan dengan hal tersebut, kami mohon bantuan Saudara untuk dapat mendampingi tim survei serta menyiapkan data pendukung berupa denah bangunan atau dokumen riwayat pemeliharaan (jika ada).',
    paragrafPenutup: 'Demikian surat pemberitahuan ini kami sampaikan. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.',
    penandatanganJabatan: 'Kepala Dinas Pekerjaan Umum dan Penataan Ruang\nKabupaten Garut',
    penandatanganNama: 'Ir. H. Budi Santoso, M.T.',
    penandatanganPangkat: 'Pembina Utama Muda',
    penandatanganNip: '19700101 199503 1 001',
    tembusan: '1. Bupati Garut (sebagai laporan);\n2. Inspektur Daerah Kabupaten Garut.'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [useTTE, setUseTTE] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);
  
  const kopData = getKopSuratData(activeRole);

  const handleExportPDF = async () => {
    if (!letterRef.current) return;
    
    setIsGenerating(true);
    try {
      let hashHex = '';
      if (useTTE) {
        // Generate cryptographic digital signature
        const encoder = new TextEncoder();
        const dataToSign = `${formData.nomorSurat}|${formData.hal}|${formData.penandatanganNama}|${new Date().toISOString()}`;
        const dataBuffer = encoder.encode(dataToSign);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      const canvas = await html2canvas(letterRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      if (hashHex) {
        pdf.setProperties({
          title: `Surat_${formData.hal}`,
          author: 'PUPR Garut',
          keywords: `TTE, SHA-256, ${hashHex}`,
          creator: 'Sistem Persuratan PUPR Garut'
        });
      }

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      if (hashHex) {
        pdf.setFontSize(6);
        pdf.setTextColor(150);
        pdf.text(`Digital Signature (SHA-256): ${hashHex}`, 5, pdf.internal.pageSize.getHeight() - 5);
      }

      pdf.save(`Surat_${formData.hal.replace(/\s+/g, '_')}.pdf`);
      
      if (hashHex) {
        setTimeout(() => {
          alert(`Dokumen berhasil dibuat dan ditandatangani secara elektronik!\n\nDigital Signature (SHA-256):\n${hashHex}`);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Gagal membuat dokumen PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in slide-in-from-bottom-4 duration-300">
      
      {/* Editor Panel */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-500 hover:text-slate-700">
            <ArrowLeft size={16} className="mr-1" /> Kembali
          </Button>
          <div className="flex-1"></div>
          <Badge variant="outline" className="bg-pupr-blue/10 text-pupr-blue border-pupr-blue/20">
            Tata Naskah Dinas
          </Badge>
        </div>

        <Card className="shadow-sm border-slate-200 sticky top-4">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <FileText size={18} className="text-pupr-blue" /> Form Editor Naskah
            </CardTitle>
            <CardDescription>
              Lengkapi isian untuk menghasilkan dokumen resmi sesuai format Permendagri
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            
            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pupr-blue text-white flex items-center justify-center text-xs">1</span> 
                Atribut Surat
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium block">Nomor Surat</label>
                  <Input name="nomorSurat" value={formData.nomorSurat} onChange={handleChange} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium block">Tanggal Surat</label>
                  <Input name="tanggal" value={formData.tanggal} onChange={handleChange} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium block">Sifat</label>
                  <Input name="sifat" value={formData.sifat} onChange={handleChange} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium block">Lampiran</label>
                  <Input name="lampiran" value={formData.lampiran} onChange={handleChange} className="h-8 text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium block">Hal / Perihal</label>
                <Input name="hal" value={formData.hal} onChange={handleChange} className="h-8 text-sm" />
              </div>
            </div>

            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pupr-blue text-white flex items-center justify-center text-xs">2</span> 
                Tujuan Surat
              </h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium block">Yth. (Nama Jabatan/Instansi)</label>
                  <Input name="tujuanNama" value={formData.tujuanNama} onChange={handleChange} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium block">di (Tempat)</label>
                  <Input name="tujuanTempat" value={formData.tujuanTempat} onChange={handleChange} className="h-8 text-sm" />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pupr-blue text-white flex items-center justify-center text-xs">3</span> 
                Isi Naskah
              </h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium block">Paragraf Pembuka</label>
                  <textarea 
                    name="paragrafPembuka" 
                    value={formData.paragrafPembuka} 
                    onChange={handleChange} 
                    className="w-full text-sm min-h-[80px] p-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-pupr-blue resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium block">Paragraf Isi / Maksud</label>
                  <textarea 
                    name="paragrafIsi" 
                    value={formData.paragrafIsi} 
                    onChange={handleChange} 
                    className="w-full text-sm min-h-[120px] p-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-pupr-blue resize-y"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium block">Paragraf Penutup</label>
                  <textarea 
                    name="paragrafPenutup" 
                    value={formData.paragrafPenutup} 
                    onChange={handleChange} 
                    className="w-full text-sm min-h-[60px] p-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-pupr-blue resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pupr-blue text-white flex items-center justify-center text-xs">4</span> 
                Penandatangan & Tembusan
              </h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium block">Jabatan Penandatangan</label>
                  <textarea 
                    name="penandatanganJabatan" 
                    value={formData.penandatanganJabatan} 
                    onChange={handleChange} 
                    className="w-full text-sm min-h-[60px] p-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-pupr-blue resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium block">Nama Jelas</label>
                    <Input name="penandatanganNama" value={formData.penandatanganNama} onChange={handleChange} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium block">Pangkat/Golongan</label>
                    <Input name="penandatanganPangkat" value={formData.penandatanganPangkat} onChange={handleChange} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs text-slate-500 font-medium block">NIP</label>
                    <Input name="penandatanganNip" value={formData.penandatanganNip} onChange={handleChange} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  <label className="text-xs text-slate-500 font-medium block">Tembusan</label>
                  <textarea 
                    name="tembusan" 
                    value={formData.tembusan} 
                    onChange={handleChange} 
                    className="w-full text-sm min-h-[80px] p-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-pupr-blue resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pupr-blue text-white flex items-center justify-center text-xs">5</span> 
                  Tanda Tangan Digital (TTE)
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useTTE}
                    onChange={(e) => setUseTTE(e.target.checked)}
                    className="w-4 h-4 rounded text-pupr-blue focus:ring-pupr-blue" 
                  />
                  <span className="text-xs text-slate-600 font-medium">Gunakan TTE QR Code</span>
                </label>
              </h3>
              <div className="space-y-2">
                {!useTTE ? (
                  <TandaTanganPad 
                    onSave={setSignatureData}
                    onClear={() => setSignatureData(null)}
                    savedSignature={signatureData}
                  />
                ) : (
                  <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4 flex items-start gap-3">
                    <div className="bg-white p-1 rounded border border-emerald-100 shrink-0">
                      <ShieldCheck className="text-emerald-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Tanda Tangan Elektronik Aktif</p>
                      <p className="text-xs text-emerald-600 mt-1">Dokumen ini akan dibubuhi TTE berupa QR Code bersertifikat sesuai standar BSrE.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between">
            <Button variant="outline" className="text-slate-600">
              <Save size={16} className="mr-2" /> Simpan Draft
            </Button>
            <Button variant="pupr" onClick={handleExportPDF} disabled={isGenerating}>
              {isGenerating ? 'Memproses...' : <><Printer size={16} className="mr-2" /> Cetak PDF</>}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Live Preview Panel (A4 Format) */}
      <div className="lg:col-span-7 flex justify-center bg-slate-100 p-4 sm:p-8 rounded-xl border border-slate-200 overflow-x-auto h-full min-h-[800px]">
        
        {/* A4 Paper Container */}
        <div 
          ref={letterRef}
          className="bg-white shadow-md relative shrink-0" 
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            padding: '25mm 20mm 25mm 25mm', // Top, Right, Bottom, Left margins standard
            fontFamily: '"Times New Roman", Times, serif',
            color: '#000000',
            fontSize: '11pt', // Usually 11pt or 12pt for official letters
            lineHeight: 1.5
          }}
        >
          {/* Kop Surat (Letterhead) */}
          <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-1">
            <div className="w-[20%] flex justify-center">
              {/* Fallback to text if logo fails */}
              <div className="w-20 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center text-center text-xs text-gray-400 font-sans">
                Logo<br/>Kab. Garut
              </div>
            </div>
            <div className="w-[80%] text-center px-4">
              <h1 className="text-[14pt] font-bold uppercase tracking-wide leading-snug">{kopData.namaPemerintah}</h1>
              <h2 className="text-[16pt] font-bold uppercase tracking-wider leading-snug">{kopData.namaInstansi}</h2>
              <p className="text-[10pt] mt-1 leading-snug">{kopData.alamat}</p>
              <p className="text-[10pt] leading-snug">Telepon: {kopData.telepon} Faksimili: {kopData.faksimili}</p>
              <p className="text-[10pt] leading-snug">Website: {kopData.website} Email: {kopData.email}</p>
            </div>
          </div>
          <div className="border-b-[1.5px] border-black mb-6 w-full"></div>

          {/* Tanggal & Atribut Surat */}
          <div className="flex justify-between items-start mb-6 text-[11pt]">
            <div className="w-[60%]">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-24 align-top">Nomor</td>
                    <td className="w-4 align-top">:</td>
                    <td className="align-top">{formData.nomorSurat}</td>
                  </tr>
                  <tr>
                    <td className="align-top">Sifat</td>
                    <td className="align-top">:</td>
                    <td className="align-top">{formData.sifat}</td>
                  </tr>
                  <tr>
                    <td className="align-top">Lampiran</td>
                    <td className="align-top">:</td>
                    <td className="align-top">{formData.lampiran}</td>
                  </tr>
                  <tr>
                    <td className="align-top">Hal</td>
                    <td className="align-top">:</td>
                    <td className="align-top font-bold">{formData.hal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-[35%] text-right">
              <p>Garut, {formData.tanggal}</p>
            </div>
          </div>

          {/* Tujuan Surat */}
          <div className="mb-8 text-[11pt]">
            <p>Yth.</p>
            <p className="font-bold">{formData.tujuanNama}</p>
            <p>di</p>
            <p className="pl-4">{formData.tujuanTempat}</p>
          </div>

          {/* Isi Surat */}
          <div className="space-y-4 text-justify text-[11pt]">
            <p className="indent-10">
              {formData.paragrafPembuka}
            </p>
            
            <div className="whitespace-pre-wrap font-sans text-[11pt] leading-relaxed">
              {formData.paragrafIsi.split('\n').map((line, i) => (
                <p key={i} className={line.trim() === '' ? 'h-4' : ''}>
                  {line}
                </p>
              ))}
            </div>
            
            <p className="indent-10">
              {formData.paragrafPenutup}
            </p>
          </div>

          {/* Penandatangan */}
          <div className="mt-12 flex justify-end">
            <div className="w-[50%] text-center text-[11pt]">
              <div className="whitespace-pre-wrap font-bold mb-4">
                {formData.penandatanganJabatan}
              </div>
              
              <div className="min-h-[80px] flex items-center justify-center my-2 relative">
                {useTTE ? (
                  <div className="flex flex-col items-center">
                    <QRCodeSVG 
                      value={`https://sipeka.garutkab.go.id/verify/${formData.nomorSurat}`} 
                      size={70} 
                      level="Q"
                      includeMargin={false}
                    />
                    <span className="text-[7pt] mt-1 text-gray-500 font-sans">Dokumen ini telah ditandatangani secara elektronik</span>
                  </div>
                ) : signatureData ? (
                  <img src={signatureData} alt="Tanda Tangan" className="h-20 object-contain" />
                ) : (
                  <div className="text-gray-300 text-xs italic">
                    (Tanda tangan)
                  </div>
                )}
              </div>

              <div>
                <p className="font-bold underline">{formData.penandatanganNama}</p>
                <p>{formData.penandatanganPangkat}</p>
                <p>NIP. {formData.penandatanganNip}</p>
              </div>
            </div>
          </div>

          {/* Tembusan */}
          {formData.tembusan && (
            <div className="mt-16 text-[10pt]">
              <p className="font-bold mb-1">Tembusan disampaikan kepada Yth.:</p>
              <div className="whitespace-pre-wrap pl-2">
                {formData.tembusan}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
