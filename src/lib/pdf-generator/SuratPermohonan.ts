import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface SuratTTEData {
  name: string;
  nip: string;
  position: string;
  organization: string;
  signedAt?: string;
  status: 'PENDING' | 'SIGNED' | 'REJECTED';
}

export interface SuratPermohonanData {
  documentId: string;
  documentNumber: string;
  date: string;
  applicant: {
    instansiAtas: string;
    instansiBawah: string;
    alamat: string;
  };
  building: {
    name: string;
    npsn?: string;
    area: number;
    floors: number;
    address: string;
    village: string;
    district: string;
    regency: string;
    province: string;
    coordinates?: { lat: number; lng: number };
  };
  purpose: string;
  background: string;
  attachmentCount: number;
  signer: SuratTTEData;
  baseUrl?: string;
}

export class SuratPermohonanGenerator {
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

  private async getImageDataUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Failed to load image', e);
      return '';
    }
  }

  public async generateSurat(data: SuratPermohonanData): Promise<Blob> {
    // 1. KOP SURAT (Header)
    const logoUrl = data.baseUrl ? `${data.baseUrl}/logo-garut.png` : '/logo-garut.png';
    const logoDataUrl = await this.getImageDataUrl(logoUrl);

    if (logoDataUrl) {
      this.doc.addImage(logoDataUrl, 'PNG', 15, 10, 20, 26);
    }
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.text('PEMERINTAH KABUPATEN GARUT', 105, 15, { align: 'center' });
    
    this.doc.setFontSize(16);
    this.doc.text(data.applicant.instansiAtas.toUpperCase(), 105, 22, { align: 'center' });
    this.doc.text(data.applicant.instansiBawah.toUpperCase(), 105, 29, { align: 'center' });
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.text(data.applicant.alamat, 105, 35, { align: 'center' });
    
    // Garis Kop Surat
    this.doc.setLineWidth(1);
    this.doc.line(15, 39, 195, 39);
    this.doc.setLineWidth(0.3);
    this.doc.line(15, 40, 195, 40);

    // 2. NOMOR & TANGGAL SURAT
    this.doc.setFontSize(11);
    this.doc.text(data.building.regency + ', ' + data.date, 130, 50);

    const labelX = 15;
    const colonX = 35;

    this.doc.text(`Nomor`, labelX, 50);
    this.doc.text(`: ${data.documentNumber}`, colonX, 50);
    
    this.doc.text(`Sifat`, labelX, 56);
    this.doc.text(`: Biasa`, colonX, 56);
    
    this.doc.text(`Lampiran`, labelX, 62);
    this.doc.text(`: ${data.attachmentCount} berkas`, colonX, 62);
    
    this.doc.text(`Hal`, labelX, 68);
    this.doc.text(`:`, colonX, 68);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Permohonan Penilaian Kerusakan Bangunan Gedung`, colonX + 2, 68);
    this.doc.text(data.building.name, colonX + 2, 73);
    
    this.doc.setFont('helvetica', 'normal');

    // 3. TUJUAN SURAT
    const recipientX = 15;
    this.doc.text(`Yth. Kepala Dinas Pekerjaan Umum dan Penataan Ruang`, recipientX, 82);
    this.doc.text(`Kabupaten Garut`, recipientX, 88);
    this.doc.text(`di`, recipientX, 94);
    this.doc.text(`Garut`, recipientX, 100);

    // 4. ISI SURAT (Paragraf Pembuka)
    const openingText = `Dalam rangka menjamin keselamatan, keamanan, kenyamanan, dan keberlanjutan fungsi bangunan gedung pada ${data.applicant.instansiBawah}, bersama ini kami mengajukan permohonan Analisis dan Perhitungan Kerusakan Bangunan Gedung terhadap bangunan yang berada pada lokasi berikut:`;
    this.doc.text(openingText, 15, 115, { maxWidth: 180, align: 'justify' });

    // 5. IDENTITAS BANGUNAN
    let startY = 135;
    const leftCol = 35;
    const rightCol = 75;

    this.doc.text(`Nama Bangunan`, leftCol, startY);
    this.doc.text(`: ${data.building.name}`, rightCol, startY);
    startY += 6;

    if (data.building.npsn) {
      this.doc.text(`NPSN`, leftCol, startY);
      this.doc.text(`: ${data.building.npsn}`, rightCol, startY);
      startY += 6;
    }

    this.doc.text(`Luas Bangunan`, leftCol, startY);
    this.doc.text(`: ${data.building.area} m2`, rightCol, startY);
    startY += 6;

    this.doc.text(`Jumlah Lantai`, leftCol, startY);
    this.doc.text(`: ${data.building.floors} Lantai`, rightCol, startY);
    startY += 6;

    this.doc.text(`Alamat Bangunan`, leftCol, startY);
    this.doc.text(`: ${data.building.address}`, rightCol, startY);
    startY += 6;

    this.doc.text(`Desa/Kelurahan`, leftCol, startY);
    this.doc.text(`: ${data.building.village}`, rightCol, startY);
    startY += 6;

    this.doc.text(`Kecamatan`, leftCol, startY);
    this.doc.text(`: ${data.building.district}`, rightCol, startY);
    startY += 6;

    this.doc.text(`Kabupaten/Kota`, leftCol, startY);
    this.doc.text(`: ${data.building.regency}`, rightCol, startY);
    startY += 6;

    this.doc.text(`Provinsi`, leftCol, startY);
    this.doc.text(`: ${data.building.province}`, rightCol, startY);
    startY += 6;

    if (data.building.coordinates) {
      this.doc.text(`Koordinat GPS`, leftCol, startY);
      this.doc.text(`: ${data.building.coordinates.lat.toFixed(6)}, ${data.building.coordinates.lng.toFixed(6)}`, rightCol, startY);
      startY += 6;
    }

    startY += 5;

    // 6. MAKSUD DAN ALASAN PERMOHONAN
    this.doc.text(`Maksud Permohonan: ${data.purpose}`, 15, startY);
    startY += 6;
    
    this.doc.text(`Latar Belakang / Alasan:`, 15, startY);
    startY += 5;
    this.doc.text(data.background, 15, startY, { maxWidth: 180, align: 'justify' });

    // Cek tinggi teks untuk memposisikan paragraf penutup
    const backgroundLines = this.doc.splitTextToSize(data.background, 180);
    startY += (backgroundLines.length * 5) + 5;

    // 7. PENUTUP
    const closingText = `Sebagai bahan pertimbangan, bersama ini kami lampirkan dokumen-dokumen pendukung. Demikian permohonan ini disampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.`;
    this.doc.text(closingText, 15, startY, { maxWidth: 180, align: 'justify' });

    startY += 20;

    // 8. TTE BLOCK (Signature)
    const sigX = 130;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(data.signer.position, sigX, startY);
    
    // QR Code or Signing status
    if (data.signer.status === 'SIGNED') {
      const baseUrl = data.baseUrl || 'https://sipeka.garutkab.go.id';
      const verifyUrl = `${baseUrl.replace(/\/+$/, '')}/verify/${data.documentId}`;
      const qrDataUrl = await this.generateQRCode(verifyUrl);
      
      if (qrDataUrl) {
        this.doc.addImage(qrDataUrl, 'PNG', sigX - 5, startY + 5, 30, 30);
      }
      
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 128, 0);
      this.doc.text('DITANDATANGANI SECARA ELEKTRONIK', sigX, startY + 38);
      
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(11);
    } else {
      this.doc.setTextColor(150, 150, 150);
      this.doc.text('[ BELUM DITANDATANGANI ]', sigX, startY + 20);
      this.doc.setTextColor(0, 0, 0);
    }

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.signer.name, sigX, startY + 45);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`NIP. ${data.signer.nip}`, sigX, startY + 50);

    return this.doc.output('blob');
  }
}
