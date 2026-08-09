import { Router } from 'express';
import { db } from '../db/index.js';
import { surveys, surveyAssignments, assessments } from '../db/schema.js';
import { eq, ilike, or, desc, count, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get all surveys (Paginated)
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const q = req.query.q as string;
    
    let whereClause = undefined;
    if (q) {
      whereClause = or(
        ilike(surveys.notes, `%${q}%`),
        ilike(surveys.status, `%${q}%`)
      );
    }

    const allSurveys = await db.select({
      id: surveys.id,
      assignmentId: surveys.assignmentId,
      status: surveys.status,
      startTime: surveys.startTime,
      syncStatus: surveys.syncStatus,
      createdAt: surveys.createdAt
    })
    .from(surveys)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(surveys.createdAt));

    const totalRes = await db.select({ count: count() }).from(surveys).where(whereClause);
    const total = totalRes[0].count;

    res.json({
      data: allSurveys,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// Get single survey
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, req.params.id));
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// Create survey
router.post('/', requireAuth, async (req, res) => {
  try {
    const newSurvey = await db.insert(surveys).values(req.body).returning();
    res.status(201).json(newSurvey[0]);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// Update survey
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await db.update(surveys).set(req.body).where(eq(surveys.id, req.params.id)).returning();
    if (updated.length === 0) return res.status(404).json({ error: 'Survey not found' });
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

// Delete survey
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await db.delete(surveys).where(eq(surveys.id, req.params.id)).returning();
    if (deleted.length === 0) return res.status(404).json({ error: 'Survey not found' });
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

export const surveysRouter = router;
