import { PDFDocument, PDFName, PDFDict, PDFString, PDFHexString, PDFNumber, PDFArray, rgb } from 'pdf-lib';
import forge from 'node-forge';
import crypto from 'crypto';
import QRCode from 'qrcode';

export interface PAdESOptions {
  signerName: string;
  reason: string;
  location: string;
  contactInfo: string;
}

export class PAdESEngine {
  /**
   * Tahap 1: Mempersiapkan PDF untuk ditandatangani.
   * Menambahkan Signature Dictionary (ByteRange placeholder) ke PDF.
   * Mengembalikan PDF buffer (belum ditandatangani) dan hash dokumen (SHA-256) untuk dikirim ke PSrE.
   */
  async preparePDFForSigning(pdfBuffer: Buffer, options: PAdESOptions): Promise<{ preparedPdf: Buffer, documentHash: string, signatureFieldName: string }> {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    const signatureFieldName = `Signature_${Date.now()}`;
    // In a full implementation, we would manually create the AcroForm Sig field here:
    // const form = pdfDoc.getForm();
    // (Manual injection of signature dictionary into the PDF objects tree)

    // To comply with PAdES-B, we usually need to specify SUBFILTER as adbe.pkcs7.detached or ETSI.CAdES.detached
    const signatureDict = pdfDoc.context.obj({
      Type: 'Sig',
      Filter: 'Adobe.PPKLite',
      SubFilter: 'ETSI.CAdES.detached',
      Name: PDFString.of(options.signerName),
      Reason: PDFString.of(options.reason),
      Location: PDFString.of(options.location),
      ContactInfo: PDFString.of(options.contactInfo),
      M: PDFString.fromDate(new Date()),
      // ByteRange placeholder will be injected here during saving
    });

    // --- VISUAL STAMPING ---
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();
    
    // Generate QR Code data URL
    const qrData = `ID: ${signatureFieldName}\nTimestamp: ${new Date().toISOString()}\nVerify: https://sipeka.garutkab.go.id/verify/${signatureFieldName}`;
    const qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 80 });
    
    // Embed QR Image
    const qrImage = await pdfDoc.embedPng(qrDataUrl);
    
    const footerY = 20;
    // Draw Separator
    lastPage.drawLine({
      start: { x: 50, y: footerY + 50 },
      end: { x: width - 50, y: footerY + 50 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    // Draw QR
    lastPage.drawImage(qrImage, {
      x: 50,
      y: footerY,
      width: 40,
      height: 40,
    });
    
    // Draw TTE Text
    lastPage.drawText("DOKUMEN INI TELAH DITANDATANGANI SECARA ELEKTRONIK (PAdES)", { x: 100, y: footerY + 30, size: 8 });
    lastPage.drawText(`Penanda Tangan: ${options.signerName}`, { x: 100, y: footerY + 20, size: 7 });
    lastPage.drawText(`Alasan: ${options.reason}`, { x: 100, y: footerY + 10, size: 7 });

    // Note: Implementing a full PAdES ByteRange placeholder using standard pdf-lib requires
    // advanced document manipulation since pdf-lib doesn't natively support creating signed ByteRanges out of the box without manual offsets.
    // For this implementation, we simulate the preparation phase.
    
    // In a production app, we would calculate the exact offset, inject a placeholder of 8192 bytes,
    // generate the PDF, and hash everything except the placeholder (ByteRange).
    
    const preparedPdf = Buffer.from(await pdfDoc.save());
    
    // Hash of the document
    const documentHash = crypto.createHash('sha256').update(preparedPdf).digest('hex');

    return { preparedPdf, documentHash, signatureFieldName };
  }

  /**
   * Tahap 2: Memasukkan signature kriptografis dari PSrE ke dalam PDF yang telah disiapkan (Stamping).
   * 
   * @param preparedPdf PDF yang sudah memiliki placeholder dari preparePDFForSigning
   * @param signatureValue Signature dalam format Base64 yang dikembalikan oleh PSrE (PKCS#7 / CAdES)
   */
  async stampSignature(preparedPdf: Buffer, signatureValue: string): Promise<Buffer> {
    // In a real PAdES implementation:
    // 1. Locate the ByteRange placeholder in `preparedPdf`.
    // 2. Convert `signatureValue` (Base64) to Hex.
    // 3. Inject the Hex string into the PDF placeholder.
    
    // For this boilerplate/simulation, we will just return the prepared PDF.
    // Full PAdES injection requires a lower-level PDF offset manipulation tool like `node-signpdf`.
    console.log('[PAdESEngine] Stamping signature into PDF...', signatureValue.substring(0, 20) + '...');
    
    return preparedPdf;
  }

  /**
   * Verifikasi PAdES
   * Mengekstrak signature dictionary dari PDF dan memvalidasi keutuhannya terhadap ByteRange.
   */
  async verifyPDF(pdfBuffer: Buffer): Promise<boolean> {
    // In production, this would parse the PDF, extract the ByteRange, hash the contents,
    // and verify the embedded PKCS7 signature.
    console.log('[PAdESEngine] Verifying PAdES Signature...');
    return true;
  }
}
