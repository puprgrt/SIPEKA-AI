import { Router } from 'express';
import { db } from '../db/index.js';
import { reports, digitalSignatures } from '../db/schema.js';
import { eq, ilike, or, desc, count, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get all reports (Paginated)
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const q = req.query.q as string;

    let whereClause = undefined;
    if (q) {
      whereClause = or(
        ilike(reports.reportNumber, `%${q}%`),
        ilike(reports.status, `%${q}%`)
      );
    }

    const allReports = await db.select({
      id: reports.id,
      assessmentId: reports.assessmentId,
      templateId: reports.templateId,
      reportNumber: reports.reportNumber,
      status: reports.status,
      createdAt: reports.createdAt
    })
    .from(reports)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(reports.createdAt));

    const totalRes = await db.select({ count: count() }).from(reports).where(whereClause);
    const total = totalRes[0].count;

    res.json({
      data: allReports,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [report] = await db.select().from(reports).where(eq(reports.id, req.params.id));
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Create report
router.post('/', requireAuth, async (req, res) => {
  try {
    const newReport = await db.insert(reports).values(req.body).returning();
    res.status(201).json(newReport[0]);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Digital signature endpoint
router.post('/:id/sign', requireAuth, async (req, res) => {
  try {
    const { userId, hash } = req.body;
    const newSignature = await db.insert(digitalSignatures).values({
      reportId: req.params.id,
      userId,
      hash,
      qrCodeUrl: `https://api.pupr.garutkab.go.kr/verify/${hash}` // Mocked URL
    }).returning();
    
    // Update report status
    await db.update(reports).set({ status: 'Published' }).where(eq(reports.id, req.params.id));
    
    res.status(201).json(newSignature[0]);
  } catch (error) {
    console.error('Error signing report:', error);
    res.status(500).json({ error: 'Failed to sign report' });
  }
});

export const reportsRouter = router;
