const fs = require('fs');

let code = fs.readFileSync('src/pages/ai/AIWorkspace.tsx', 'utf8');

const exportDraftReportCode = `
  const exportDraftReportPDF = () => {
    if (!activeReview) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Kop Surat
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DINAS PEKERJAAN UMUM DAN PENATAAN RUANG", pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.text("KABUPATEN GARUT", pageWidth / 2, 26, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(20, 32, pageWidth - 20, 32);
    
    // Judul
    doc.setFontSize(12);
    doc.text("BERITA ACARA EXAMINATION & REKOMENDASI TEKNIS", pageWidth / 2, 45, { align: 'center' });
    doc.text("KERUSAKAN BANGUNAN GEDUNG", pageWidth / 2, 52, { align: 'center' });

    // Body text
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("I. DATA UMUM PENGUJIAN:", 20, 70);
    
    doc.setFont("helvetica", "normal");
    const p1 = "Berdasarkan hasil inspeksi lapangan tanggal " + activeReview.dateSubmitted + " pada sampel bangunan gedung " + activeReview.buildingName + " (" + activeReview.instansi + "), tim penilai menyatakan bahwa tingkat kerusakan total terhitung sebesar " + activeReview.damagePercentage.toFixed(1) + "%.";
    const splitP1 = doc.splitTextToSize(p1, pageWidth - 40);
    doc.text(splitP1, 20, 78);

    const yAfterP1 = 78 + (splitP1.length * 6) + 5;

    doc.setFont("helvetica", "bold");
    doc.text("II. DIAGNOSIS KERUSAKAN ELEMEN KRITIS (SIPEKA AI):", 20, yAfterP1);
    
    doc.setFont("helvetica", "normal");
    const p2 = "1. Struktur Utama: Teridentifikasi retak geser diagonal (lebar ~2.8 mm) pada sendi plastis Kolom K-01 teras depan.\\n2. Kapasitas Sisa: FEA Kapasitas Seismik memperkirakan reduksi daya dukung lateral sebesar 42%.\\n3. Kepatuhan Regulasi: Sesuai Permen PUPR No. 22/PRT/M/2018, kondisi ini diklasifikasikan sebagai Rusak Sedang Kritis.";
    const splitP2 = doc.splitTextToSize(p2, pageWidth - 40);
    doc.text(splitP2, 20, yAfterP1 + 8);

    const yAfterP2 = yAfterP1 + 8 + (splitP2.length * 6) + 5;

    doc.setFont("helvetica", "bold");
    doc.text("III. REKOMENDASI PENANGANAN (RETROFITTING):", 20, yAfterP2);

    doc.setFont("helvetica", "normal");
    const p3 = "Direkomendasikan pelaksanaan pekerjaan perkuatan struktur berupa: Carbon FRP Jacketing (" + fRPCount + " Layer), Injeksi Epoxy Resin (" + epoxyVolume + " L), dan penggantian penutup atap menjadi baja ringan dengan estimasi biaya alokasi sebesar Rp " + estimatedRetrofitCost.toLocaleString('id-ID') + ".";
    const splitP3 = doc.splitTextToSize(p3, pageWidth - 40);
    doc.text(splitP3, 20, yAfterP2 + 8);

    // Signatures
    const ySignatures = yAfterP2 + 8 + (splitP3.length * 6) + 30;
    doc.setFont("helvetica", "normal");
    doc.text("Garut, " + new Date().toLocaleDateString('id-ID'), pageWidth - 80, ySignatures);
    doc.setFont("helvetica", "bold");
    doc.text("Tim Pemeriksa / Verifikator", pageWidth - 80, ySignatures + 10);
    doc.setFont("helvetica", "normal");
    doc.text(activeReview.reviewer || 'Siti Aminah, S.T.', pageWidth - 80, ySignatures + 35);
    doc.text("Sistem SIPEKA AI", 25, ySignatures + 35);

    doc.save("Draft_Laporan_Kajian_" + activeReview.id + ".pdf");
    showToast('Draft Laporan Kajian BAP PDF berhasil diunduh!');
  };
`;

code = code.replace(
  "showToast('Dokumen Rekomendasi AI & Decision Sign-Off berhasil diunduh sebagai PDF!');\n  };",
  "showToast('Dokumen Rekomendasi AI & Decision Sign-Off berhasil diunduh sebagai PDF!');\n  };\n\n" + exportDraftReportCode
);

code = code.replace(
  '<Button variant="outline" size="sm" onClick={exportAIDecisionPDF} className="bg-white">\n                    <Download size={14} className="mr-1.5 text-pupr-blue" /> Unduh Draft PDF\n                  </Button>',
  '<Button variant="outline" size="sm" onClick={exportDraftReportPDF} className="bg-white">\n                    <Download size={14} className="mr-1.5 text-pupr-blue" /> Unduh Draft PDF\n                  </Button>'
);

fs.writeFileSync('src/pages/ai/AIWorkspace.tsx', code);
