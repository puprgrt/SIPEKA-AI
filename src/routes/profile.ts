import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db/index';
import { users, employees, positions, organizations, departments, signatureProfiles, certificates } from '../db/schema';
import { eq } from 'drizzle-orm';

export const profileRouter = Router();

// GET /api/profile
profileRouter.get('/', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    
    // Fetch user info
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Fetch employment info
    const employeeData = await db.execute(`
      SELECT 
        e.nip, 
        e.employee_id, 
        p.name as "positionName", 
        p.code as "positionCode",
        p.level as "positionLevel",
        o.name as "organizationName",
        d.name as "departmentName"
      FROM employees e
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN organizations o ON p.organization_id = o.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.user_id = '${userId}'
    `);
    
    // Fetch TTE profile info
    const [tteProfile] = await db.select().from(signatureProfiles).where(eq(signatureProfiles.userId, userId));
    let tteCert = null;
    if (tteProfile) {
      const [cert] = await db.select().from(certificates).where(eq(certificates.profileId, tteProfile.id));
      tteCert = cert;
    }

    res.json({
      personal: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      },
      employment: employeeData.rows[0] || null,
      tte: {
        profile: tteProfile || null,
        certificate: tteCert || null
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH /api/profile/employment (Simulation for admin or user self-update depending on business rules)
profileRouter.patch('/employment', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { nip, positionId } = req.body;
    
    // Check if employee record exists
    const [existing] = await db.select().from(employees).where(eq(employees.userId, userId));
    
    if (existing) {
      await db.update(employees)
        .set({ nip, positionId })
        .where(eq(employees.userId, userId));
    } else {
      await db.insert(employees).values({
        userId,
        nip,
        positionId
      });
    }
    
    res.json({ success: true, message: 'Employment profile updated' });
  } catch (error) {
    console.error('Error updating employment:', error);
    res.status(500).json({ error: 'Failed to update employment profile' });
  }
});
