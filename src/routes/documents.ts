import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db/index';
import { documents, documentVersions, signatureRequests, signatureWorkflows } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { LaporanTeknisGenerator, LaporanData } from '../lib/pdf-generator/LaporanTeknisLengkap';

export const documentsRouter = Router();

// GET /api/documents/:id/preview-ltl
// Generates a preview of the Laporan Teknis Lengkap PDF
documentsRouter.get('/:id/preview-ltl', requireAuth, async (req: any, res) => {
  try {
    const documentId = req.params.id;

    // 1. Fetch document and related data
    const [doc] = await db.select().from(documents).where(eq(documents.id, documentId));
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // 2. Fetch signature requests (snapshots) to populate signature blocks
    // In a real app, you would query signature_requests for this document's active workflow
    const sigs = await db.execute(`
      SELECT sr.* 
      FROM signature_requests sr
      JOIN signature_workflows sw ON sr.workflow_id = sw.id
      WHERE sw.document_id = '${documentId}'
      ORDER BY sr.signature_order ASC
    `);

    const getSignerData = (order: number) => {
      const row: any = sigs.rows.find((r: any) => r.signature_order === order);
      if (row) {
        return {
          name: row.name_snapshot || 'Unknown',
          nip: row.nip_snapshot || 'Unknown',
          position: row.position_snapshot || 'Unknown',
          organization: row.organization_snapshot || 'Unknown',
          status: (row.status || 'PENDING') as 'PENDING' | 'SIGNED' | 'REJECTED',
          signedAt: row.signed_at ? new Date(row.signed_at).toLocaleString('id-ID') : undefined
        };
      }
      return {
        name: '[Nama Belum Diatur]',
        nip: '[NIP Belum Diatur]',
        position: order === 3 ? 'Kepala Bidang Bangunan' : '[Jabatan Belum Diatur]',
        organization: '[Instansi Belum Diatur]',
        status: 'PENDING' as const
      };
    };

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers.host || 'localhost:3000';

    // 3. Assemble Laporan Data
    const laporanData: LaporanData = {
      documentId: doc.id,
      baseUrl: `${protocol}://${host}`,
      reportNumber: (doc as any).documentNumber || `640/LTL/DPUPR/${new Date().getFullYear()}/${doc.id.substring(0, 5)}`,
      buildingName: 'Puskesmas Cikajang (Bangunan Utama)', // Mocked for now, should fetch from assessment
      location: 'Kec. Cikajang, Kab. Garut', // Mocked for now
      date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      signers: {
        surveyor: getSignerData(1),
        reviewer: getSignerData(2),
        kepalaBidang: getSignerData(3)
      },
      content: {
        executiveSummary: 'RINGKASAN EKSEKUTIF\nBerdasarkan hasil inspeksi visual dan evaluasi teknis, bangunan gedung Puskesmas Cikajang (Bangunan Utama) yang berlokasi di Kec. Cikajang, Kab. Garut diidentifikasi memiliki tingkat kerusakan sebesar 35% (Kategori Sedang). Evaluasi ini mencakup aspek struktural, arsitektural, dan utilitas (MEP).',
        bab1Pendahuluan: '1.1 Latar Belakang\nSistem Informasi Penilaian Keandalan Bangunan (SIPEKA) mencatat adanya kebutuhan evaluasi kelayakan pada aset pemerintah. Penilaian ini dipicu oleh inspeksi rutin dan laporan kerusakan dari pihak pengelola.\n\n1.2 Tujuan Penilaian\nMengetahui tingkat kerusakan eksisting, memberikan rekomendasi teknis penanganan, dan menghasilkan estimasi awal untuk tindakan preventif maupun rehabilitasi.',
        bab2Metodologi: 'Pemeriksaan dilakukan secara Visual Assessment (Non-Destructive) mengacu pada pedoman teknis Permen PUPR No. 22/PRT/M/2018 dan SNI terkait. Analisis dibantu oleh AI Engine SIPEKA.',
        bab3HasilPemeriksaan: 'Pemeriksaan fisik menunjukkan tingkat kerusakan total mencapai 35%. Rincian:\n- Struktur: 10%\n- Arsitektur: 15%\n- Utilitas: 10%',
        bab4AnalisisStruktur: 'Skor struktur menunjukkan kondisi yang masih dalam ambang batas aman. Namun struktur rangka atap mengalami penurunan kapasitas yang perlu diperhatikan.',
        bab5AnalisisUtilitas: 'Sistem utilitas MEP (Mekanikal, Elektrikal, Plumbing) berfungsi secara umum, dengan beberapa temuan minor terkait instalasi air bersih yang memengaruhi nilai keandalan.',
        bab6EstimasiBiaya: 'Estimasi biaya perbaikan belum dapat dipastikan secara definitif tanpa penyusunan Rencana Anggaran Biaya (RAB) detail. Pihak pengelola disarankan untuk mengalokasikan anggaran pemeliharaan preventif.',
        bab7Kesimpulan: 'Bangunan masuk kategori Rusak Sedang. Direkomendasikan pembatasan akses pada area rawan hingga perbaikan atap selesai dilakukan.'
      }
    };

    // 4. Generate PDF using jsPDF
    const generator = new LaporanTeknisGenerator();
    const pdfBlob = await generator.generateLaporan(laporanData);

    // 5. Send PDF to client
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="LTL_${(doc as any).documentNumber || doc.id}.pdf"`);
    res.send(buffer);

  } catch (error) {
    console.error('Error generating LTL Preview:', error);
    res.status(500).json({ error: 'Failed to generate PDF preview' });
  }
});
