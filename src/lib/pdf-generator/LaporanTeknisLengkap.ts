import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

export interface TTEData {
  name: string;
  nip: string;
  position: string;
  organization: string;
  signedAt?: string;
  status: 'PENDING' | 'SIGNED' | 'REJECTED';
}

export interface LaporanData {
  documentId: string;
  baseUrl?: string;
  reportNumber: string;
  buildingName: string;
  location: string;
  date: string;
  signers: {
    surveyor: TTEData;
    reviewer: TTEData;
    kepalaBidang: TTEData;
  };
  content: {
    executiveSummary: string;
    bab1Pendahuluan: string;
    bab2Metodologi: string;
    bab3HasilPemeriksaan: string;
    bab4AnalisisStruktur: string;
    bab5AnalisisUtilitas: string;
    bab6EstimasiBiaya: string;
    bab7Kesimpulan: string;
  };
}

export class LaporanTeknisGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  }

  private async generateQRCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, { margin: 1, width: 100 });
    } catch (err) {
      console.error(err);
      return '';
    }
  }

  private addHeaderFooter(pageTitle: string) {
    const pageCount = (this.doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Header
      this.doc.setFillColor(30, 64, 175); // pupr-blue
      this.doc.rect(0, 0, 210, 20, 'F');
      
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('PEMERINTAH KABUPATEN GARUT', 105, 9, { align: 'center' });
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('DINAS PEKERJAAN UMUM DAN PENATAAN RUANG', 105, 15, { align: 'center' });

      // Footer
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(15, 282, 195, 282);
      
      this.doc.setTextColor(150, 150, 150);
      this.doc.setFontSize(8);
      this.doc.text(`Dokumen ini dihasilkan oleh SIPEKA (Sistem Informasi Penilaian Keandalan Bangunan)`, 15, 287);
      this.doc.text(`Halaman ${i} dari ${pageCount}`, 195, 287, { align: 'right' });
    }
  }

  public async generateLaporan(data: LaporanData): Promise<Blob> {
    // 1. Cover Page
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('LAPORAN TEKNIS LENGKAP', 105, 100, { align: 'center' });
    this.doc.text('PENILAIAN KEANDALAN BANGUNAN GEDUNG', 105, 110, { align: 'center' });
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Nama Bangunan: ${data.buildingName}`, 105, 130, { align: 'center' });
    this.doc.text(`Lokasi: ${data.location}`, 105, 140, { align: 'center' });
    this.doc.text(`Tanggal Inspeksi: ${data.date}`, 105, 150, { align: 'center' });
    
    this.doc.text(`Nomor Dokumen: ${data.reportNumber}`, 105, 170, { align: 'center' });

    // Generate Verification QR for Cover
    const baseUrl = data.baseUrl || 'https://sipeka.garutkab.go.id';
    const verifyUrl = `${baseUrl.replace(/\/+$/, '')}/verify/${data.documentId}`;
    const qrDataUrl = await this.generateQRCode(verifyUrl);
    if (qrDataUrl) {
      this.doc.addImage(qrDataUrl, 'PNG', 85, 190, 40, 40);
      this.doc.setFontSize(8);
      this.doc.text('Scan untuk verifikasi keaslian dokumen', 105, 235, { align: 'center' });
    }

    // 2. Lembar Pengesahan (Signature Page)
    this.doc.addPage();
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LEMBAR PENGESAHAN', 105, 40, { align: 'center' });
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Dokumen Laporan Teknis Lengkap untuk bangunan ${data.buildingName} ini telah disusun, diperiksa, dan disahkan secara elektronik melalui Sistem Informasi Penilaian Keandalan Bangunan (SIPEKA) Pemerintah Kabupaten Garut.`, 15, 60, { maxWidth: 180, align: 'justify' });

    const createSignatureBlock = (x: number, y: number, signerData: TTEData, role: string) => {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(role, x, y);
      
      if (signerData.status === 'SIGNED') {
        this.doc.setTextColor(0, 128, 0);
        this.doc.setFontSize(8);
        this.doc.text('Ditandatangani secara elektronik', x, y + 15);
        this.doc.text(signerData.signedAt || '', x, y + 20);
        this.doc.setTextColor(0, 0, 0);
      } else {
        this.doc.setTextColor(150, 150, 150);
        this.doc.text('[ BELUM DITANDATANGANI ]', x, y + 15);
        this.doc.setTextColor(0, 0, 0);
      }

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(signerData.name, x, y + 40);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`NIP. ${signerData.nip}`, x, y + 45);
      this.doc.setFontSize(8);
      this.doc.text(signerData.position, x, y + 50, { maxWidth: 60 });
    };

    // Layout signatures (Left to Right: Highest role to Lowest role)
    createSignatureBlock(15, 100, data.signers.kepalaBidang, 'Diketahui Oleh:');
    createSignatureBlock(80, 100, data.signers.reviewer, 'Diperiksa Oleh:');
    createSignatureBlock(145, 100, data.signers.surveyor, 'Disusun Oleh:');

    if (qrDataUrl) {
      this.doc.addImage(qrDataUrl, 'PNG', 15, 230, 30, 30);
      this.doc.setFontSize(8);
      this.doc.text('Dokumen ini telah ditandatangani secara elektronik.', 50, 240);
      this.doc.text('Verifikasi keaslian dokumen dan tanda tangan', 50, 245);
      this.doc.text('dapat dilakukan dengan memindai QR Code di samping.', 50, 250);
    }

    // 3. Executive Summary
    this.doc.addPage();
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RINGKASAN EKSEKUTIF', 105, 40, { align: 'center' });
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(data.content.executiveSummary, 15, 60, { maxWidth: 180, align: 'justify' });

    // 4. BAB 1 - 7
    const renderBab = (title: string, text: string, startY: number = 40) => {
      this.doc.addPage();
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, 15, startY);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(text, 15, startY + 15, { maxWidth: 180, align: 'justify' });
    };

    renderBab('BAB 1. PENDAHULUAN', data.content.bab1Pendahuluan);
    renderBab('BAB 2. METODOLOGI PENILAIAN', data.content.bab2Metodologi);
    renderBab('BAB 3. HASIL PEMERIKSAAN FISIK', data.content.bab3HasilPemeriksaan);
    renderBab('BAB 4. ANALISIS STRUKTUR & ARSITEKTUR', data.content.bab4AnalisisStruktur);
    renderBab('BAB 5. ANALISIS UTILITAS (MEP)', data.content.bab5AnalisisUtilitas);
    renderBab('BAB 6. ESTIMASI BIAYA & REKOMENDASI PENANGANAN', data.content.bab6EstimasiBiaya);
    renderBab('BAB 7. KESIMPULAN', data.content.bab7Kesimpulan);

    // 5. LAMPIRAN
    this.doc.addPage();
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LAMPIRAN', 105, 140, { align: 'center' });
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('1. Dokumentasi Kerusakan Visual (Foto)', 105, 155, { align: 'center' });
    this.doc.text('2. Denah Titik Kerusakan', 105, 165, { align: 'center' });
    this.doc.text('3. Rincian Estimasi Anggaran Biaya (RAB)', 105, 175, { align: 'center' });

    // Headers & Footers
    this.addHeaderFooter('Laporan Teknis Lengkap');

    return this.doc.output('blob');
  }
}
