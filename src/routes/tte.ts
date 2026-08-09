import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db/index';
import { signatureProfiles, signatureRequests, signatureWorkflows, documents, documentVersions } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { MockPSrEAdapter } from '../lib/tte/MockPSrEAdapter';
import { SignatureWorkflowEngine } from '../lib/tte/SignatureWorkflowEngine';
import { PAdESEngine } from '../lib/tte/PAdESEngine';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export const tteRouter = Router();

const psreProvider = new MockPSrEAdapter();
const workflowEngine = new SignatureWorkflowEngine();
const padesEngine = new PAdESEngine();

// Get current user's TTE profile and certificate status
tteRouter.get('/profile', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const [profile] = await db.select().from(signatureProfiles).where(eq(signatureProfiles.userId, userId));
    
    let certInfo = null;
    if (profile) {
      certInfo = await psreProvider.getCertificate(userId);
    }

    res.json({
      profile: profile || null,
      certificate: certInfo
    });
  } catch (error) {
    console.error('Error fetching TTE profile:', error);
    res.status(500).json({ error: 'Failed to fetch TTE profile' });
  }
});

// Submit a new signature request workflow
tteRouter.post('/requests', requireAuth, async (req: any, res) => {
  try {
    const { documentId, documentVersionId, signers, workflowName } = req.body;
    
    const workflow = await workflowEngine.createWorkflow(documentId, workflowName, 'SEQUENTIAL');
    
    const requests = [];
    for (let i = 0; i < signers.length; i++) {
      const request = await workflowEngine.addSignerToWorkflow(
        workflow.id,
        documentVersionId,
        signers[i].userId,
        i + 1,
        signers[i].type || 'INDIVIDUAL'
      );
      requests.push(request);
    }
    
    await workflowEngine.startWorkflow(workflow.id);
    await workflowEngine.logEvent(req.user.uid, 'WORKFLOW_CREATED', 'signature_workflows', workflow.id);
    
    res.status(201).json({ workflow, requests });
  } catch (error) {
    console.error('Error creating signature request:', error);
    res.status(500).json({ error: 'Failed to create signature request' });
  }
});

// Sign a document
tteRouter.post('/sign', requireAuth, async (req: any, res) => {
  try {
    const { requestId, documentHash } = req.body;
    const userId = req.user.uid;

    // Validate request existence and authorization
    const [request] = await db.select().from(signatureRequests).where(eq(signatureRequests.id, requestId));
    if (!request) {
      return res.status(404).json({ error: 'Signature request not found' });
    }
    if (request.signerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to sign this request' });
    }
    if (request.status !== 'PENDING' && request.status !== 'READY_TO_SIGN') {
      return res.status(400).json({ error: 'Signature request is not in a signable state' });
    }

    // --- PAdES Integration ---
    // 1. Fetch or Generate PDF
    // In production, we fetch `request.documentVersionId` from storage (S3/GCS)
    // Here we generate a simple PDF in memory to demonstrate the pipeline
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText('Dokumen ini ditandatangani secara elektronik (PAdES)', { x: 50, y: 700 });
    const rawPdfBytes = await pdfDoc.save();
    
    // 2. Prepare PDF for Signing (Tahap 1 PAdES)
    const { preparedPdf, documentHash: padesHash } = await padesEngine.preparePDFForSigning(
      Buffer.from(rawPdfBytes), 
      {
        signerName: 'User SIPEKA', // Should be fetched from profile
        reason: 'Persetujuan Dokumen SIPEKA',
        location: 'Kabupaten Garut',
        contactInfo: req.user.email || ''
      }
    );

    // 3. Call PSrE to sign the hash (using the PAdES hash, not the raw one from client)
    const signatureResponse = await psreProvider.signDocument(padesHash, userId);
    
    // 4. Stamp Signature into PDF (Tahap 2 PAdES)
    const finalSignedPdf = await padesEngine.stampSignature(preparedPdf, signatureResponse.signatureValue);
    
    // In production, save finalSignedPdf to S3/GCS here
    console.log('[TTE] Final PAdES PDF size:', finalSignedPdf.length, 'bytes');
    
    // Update request status in DB
    await db.update(signatureRequests)
      .set({ 
        status: 'SIGNED', 
        signedAt: new Date() 
      })
      .where(eq(signatureRequests.id, requestId));

    await workflowEngine.logEvent(userId, 'DOCUMENT_SIGNED', 'signature_requests', requestId, { signatureValue: signatureResponse.signatureValue, padesHash });

    res.json({
      ...signatureResponse,
      message: 'PAdES signing completed successfully'
    });
  } catch (error) {
    console.error('Error signing document:', error);
    res.status(500).json({ error: 'Failed to sign document' });
  }
});

// Public verify endpoint
tteRouter.get('/verify/:verification_id', async (req, res) => {
  // Logic to fetch verification record and document info, validate, etc.
  res.json({
    status: 'VALID',
    documentId: req.params.verification_id,
    message: 'Validasi dokumen sedang dalam simulasi.'
  });
});
