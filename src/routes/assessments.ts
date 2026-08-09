import { Router } from 'express';
import { db } from '../db/index.js';
import { assessments, assessmentResults } from '../db/schema.js';
import { eq, ilike, or, desc, count, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get all assessments (Paginated)
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const q = req.query.q as string;

    let whereClause = undefined;
    if (q) {
      whereClause = or(
        ilike(assessments.status, `%${q}%`),
        ilike(assessments.damageClassification, `%${q}%`)
      );
    }

    const allAssessments = await db.select({
      id: assessments.id,
      surveyId: assessments.surveyId,
      buildingId: assessments.buildingId,
      status: assessments.status,
      damageClassification: assessments.damageClassification,
      totalDamagePercentage: assessments.totalDamagePercentage,
      createdAt: assessments.createdAt
    })
    .from(assessments)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(assessments.createdAt));

    const totalRes = await db.select({ count: count() }).from(assessments).where(whereClause);
    const total = totalRes[0].count;

    res.json({
      data: allAssessments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Get single assessment
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, req.params.id));
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Create assessment
router.post('/', requireAuth, async (req, res) => {
  try {
    const newAssessment = await db.insert(assessments).values(req.body).returning();
    res.status(201).json(newAssessment[0]);
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Update assessment
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await db.update(assessments).set(req.body).where(eq(assessments.id, req.params.id)).returning();
    if (updated.length === 0) return res.status(404).json({ error: 'Assessment not found' });
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ error: 'Failed to update assessment' });
  }
});

// Delete assessment
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await db.delete(assessments).where(eq(assessments.id, req.params.id)).returning();
    if (deleted.length === 0) return res.status(404).json({ error: 'Assessment not found' });
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

// Get assessment results
router.get('/:id/results', requireAuth, async (req, res) => {
  try {
    const results = await db.select().from(assessmentResults).where(eq(assessmentResults.assessmentId, req.params.id));
    res.json(results);
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    res.status(500).json({ error: 'Failed to fetch assessment results' });
  }
});

export const assessmentsRouter = router;
