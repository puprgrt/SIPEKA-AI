import { Router } from 'express';
import { db } from '../db/index.js';
import { buildings, villages, districts, provinces } from '../db/schema.js';
import { eq, ilike, or, desc, count, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get all buildings (Paginated)
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const q = req.query.q as string;

    let whereClause = undefined;
    if (q) {
      whereClause = or(
        ilike(buildings.name, `%${q}%`),
        ilike(buildings.assetCode, `%${q}%`),
        ilike(buildings.address, `%${q}%`)
      );
    }

    const allBuildings = await db.select({
      id: buildings.id,
      name: buildings.name,
      assetCode: buildings.assetCode,
      address: buildings.address,
      owner: buildings.owner,
      createdAt: buildings.createdAt
    })
    .from(buildings)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(buildings.createdAt));

    const totalRes = await db.select({ count: count() }).from(buildings).where(whereClause);
    const total = totalRes[0].count;

    res.json({
      data: allBuildings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching buildings:', error);
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
});

// Get single building by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [building] = await db.select().from(buildings).where(eq(buildings.id, req.params.id));
    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }
    res.json(building);
  } catch (error) {
    console.error('Error fetching building:', error);
    res.status(500).json({ error: 'Failed to fetch building' });
  }
});

// Create building
router.post('/', requireAuth, async (req, res) => {
  try {
    const newBuilding = await db.insert(buildings).values(req.body).returning();
    res.status(201).json(newBuilding[0]);
  } catch (error) {
    console.error('Error creating building:', error);
    res.status(500).json({ error: 'Failed to create building' });
  }
});

// Update building
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await db.update(buildings).set(req.body).where(eq(buildings.id, req.params.id)).returning();
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating building:', error);
    res.status(500).json({ error: 'Failed to update building' });
  }
});

// Delete building
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await db.delete(buildings).where(eq(buildings.id, req.params.id)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }
    res.json({ message: 'Building deleted successfully' });
  } catch (error) {
    console.error('Error deleting building:', error);
    res.status(500).json({ error: 'Failed to delete building' });
  }
});

export const buildingsRouter = router;
