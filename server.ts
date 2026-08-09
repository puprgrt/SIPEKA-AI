import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { db } from "./src/db/index.ts";
import { users } from "./src/db/schema.ts";

import { count, eq, and, sql, desc } from "drizzle-orm";
import { buildings, surveys, assessments, reports, assessmentSnapshots } from "./src/db/schema.ts";

import { buildingsRouter } from "./src/routes/buildings.ts";
import { surveysRouter } from "./src/routes/surveys.ts";
import { assessmentsRouter } from "./src/routes/assessments.ts";
import { aiRouter } from "./src/routes/ai.ts";
import { reportsRouter } from "./src/routes/reports.ts";
import { tteRouter } from "./src/routes/tte.ts";
import { profileRouter } from "./src/routes/profile.ts";
import { documentsRouter } from "./src/routes/documents.ts";
import { authRouter } from "./src/routes/auth.ts";
import { uploadRouter } from "./src/routes/upload.ts";


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.use('/api/auth', authRouter);
  app.use('/api/buildings', buildingsRouter);
  app.use('/api/surveys', surveysRouter);
  app.use('/api/assessments-core', assessmentsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/tte', tteRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/upload', uploadRouter);


  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Authenticate and sync user
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { uid, email, name } = req.user;
      
      // Update or create user in Postgres
      const user = await getOrCreateUser(uid, email || '', name || '');
      
      res.json({ user });
    } catch (error) {
      console.error("Error syncing user:", error);
      res.status(500).json({ error: "Failed to sync user" });
    }
  });

  
  // Dashboard Stats
  app.get("/api/dashboard/stats", requireAuth, async (req: AuthRequest, res) => {
    try {
      const [{ count: totalBuildings }] = await db.select({ count: count() }).from(buildings);
      const [{ count: activeSurveys }] = await db.select({ count: count() }).from(surveys).where(eq(surveys.status, 'Berjalan'));
      const [{ count: criticalDamage }] = await db.select({ count: count() }).from(assessments).where(eq(assessments.damageClassification, 'Rusak Berat'));
      const [{ count: completedReports }] = await db.select({ count: count() }).from(reports).where(eq(reports.status, 'Published'));
      const recentList: any[] = [];
      
      res.json({
        totalBuildings,
        activeSurveys,
        criticalDamage,
        completedReports,
        recentList
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Fetch assessment snapshots / history
  app.get("/api/assessments/snapshots/:assessmentId", async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const snapshots = await db
        .select()
        .from(assessmentSnapshots)
        .where(eq(assessmentSnapshots.assessmentId, assessmentId))
        .orderBy(desc(assessmentSnapshots.createdAt));
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching assessment snapshots:", error);
      res.status(500).json({ error: "Failed to fetch assessment snapshots" });
    }
  });

  // Create new assessment snapshot
  app.post("/api/assessments/snapshots", async (req, res) => {
    try {
      const {
        assessmentId,
        buildingId,
        buildingName,
        userName,
        userRole,
        action,
        changedField,
        oldValue,
        newValue,
        snapshotData,
        totalDamagePercentage
      } = req.body;

      if (!assessmentId || !snapshotData) {
        return res.status(400).json({ error: "assessmentId and snapshotData are required" });
      }

      const [newSnapshot] = await db
        .insert(assessmentSnapshots)
        .values({
          assessmentId,
          buildingId: buildingId || null,
          buildingName: buildingName || 'Puskesmas Cikajang (Bangunan Utama)',
          userName: userName || 'Siti Aminah, S.T.',
          userRole: userRole || 'Reviewer Teknis',
          action: action || 'Perubahan Data',
          changedField: changedField || null,
          oldValue: oldValue != null ? String(oldValue) : null,
          newValue: newValue != null ? String(newValue) : null,
          snapshotData,
          totalDamagePercentage: totalDamagePercentage != null ? Number(totalDamagePercentage) : null,
        })
        .returning();

      res.status(201).json(newSnapshot);
    } catch (error) {
      console.error("Error creating assessment snapshot:", error);
      res.status(500).json({ error: "Failed to create assessment snapshot" });
    }
  });

  // Revert assessment to a snapshot version
  app.post("/api/assessments/revert", async (req, res) => {
    try {
      const { snapshotId, userName, userRole } = req.body;
      if (!snapshotId) {
        return res.status(400).json({ error: "snapshotId is required" });
      }

      const [targetSnapshot] = await db
        .select()
        .from(assessmentSnapshots)
        .where(eq(assessmentSnapshots.id, snapshotId));

      if (!targetSnapshot) {
        return res.status(404).json({ error: "Target snapshot not found" });
      }

      // Record a new snapshot noting the revert action
      const [revertRecord] = await db
        .insert(assessmentSnapshots)
        .values({
          assessmentId: targetSnapshot.assessmentId,
          buildingId: targetSnapshot.buildingId,
          buildingName: targetSnapshot.buildingName,
          userName: userName || 'Siti Aminah, S.T.',
          userRole: userRole || 'Reviewer Teknis',
          action: `Pulihkan ke Versi Tanggal ${new Date(targetSnapshot.createdAt).toLocaleString('id-ID')}`,
          changedField: 'Semua Elemen (Revert)',
          oldValue: 'Versi Terkini',
          newValue: `Versi Snapshot #${snapshotId.substring(0, 8)}`,
          snapshotData: targetSnapshot.snapshotData,
          totalDamagePercentage: targetSnapshot.totalDamagePercentage,
        })
        .returning();

      res.json({
        message: "Assessment successfully reverted",
        restoredData: targetSnapshot.snapshotData,
        totalDamagePercentage: targetSnapshot.totalDamagePercentage,
        revertRecord
      });
    } catch (error) {
      console.error("Error reverting assessment snapshot:", error);
      res.status(500).json({ error: "Failed to revert assessment snapshot" });
    }
  });

  // WhatsApp API Gateway Integration (PURI - PUPR Garut)
  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      const { phoneNumber, message, type } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ error: "phoneNumber and message are required" });
      }

      // Mock integration with PURI (WA bot pelayanan publik dinas pupr kabupaten garut)
      console.log(`[PURI WA GATEWAY] Sending ${type || 'notification'} to ${phoneNumber}...`);
      console.log(`[PURI WA GATEWAY] Message Payload: \n${message}`);
      
      // Simulating API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      res.json({ 
        success: true, 
        message: "Pesan WhatsApp berhasil dikirim via PURI Gateway",
        messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ error: "Failed to send WhatsApp message" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
