import QRCode from 'qrcode';

export async function addFooterWithQRCode(doc: any, reportId: string, hash: string, pageHeight: number, pageWidth: number) {
  // Generate QR Code data URL
  const qrData = `ID: ${reportId}\nHash: ${hash}\nVerify: https://sipeka.garutkab.go.id/verify/${reportId}`;
  const qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 60 });
  
  // Footer Y position
  const footerY = pageHeight - 25;
  
  // Add separator line
  doc.setDrawColor(200);
  doc.line(15, footerY, pageWidth - 15, footerY);
  
  // Add QR Code
  doc.addImage(qrDataUrl, 'PNG', 15, footerY + 2, 18, 18);
  
  // Add Text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100);
  
  doc.text("Pemerintah Kabupaten Garut - Dinas Pekerjaan Umum dan Penataan Ruang", 35, footerY + 6);
  doc.setFont("helvetica", "bold");
  doc.text("DOKUMEN INI TELAH DITANDATANGANI SECARA ELEKTRONIK", 35, footerY + 10);
  
  doc.setFont("helvetica", "normal");
  doc.text(`ID Laporan: ${reportId}`, 35, footerY + 14);
  doc.text(`Digital Signature (SHA-256): ${hash}`, 35, footerY + 18);
}
