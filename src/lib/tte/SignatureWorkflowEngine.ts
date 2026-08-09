import { db } from '../../db/index';
import { 
  signatureRequests, 
  signatureWorkflows, 
  documents,
  signatureEvents,
  documentVersions
} from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export class SignatureWorkflowEngine {
  /**
   * Initializes a new signature request workflow.
   */
  async createWorkflow(documentId: string, name: string, type: 'SEQUENTIAL' | 'PARALLEL' = 'SEQUENTIAL') {
    const [workflow] = await db.insert(signatureWorkflows).values({
      documentId,
      name,
      type,
      status: 'DRAFT'
    }).returning();
    
    return workflow;
  }

  /**
   * Adds a signer to the workflow and snapshots their identity.
   */
  async addSignerToWorkflow(workflowId: string, documentVersionId: string, signerId: string, order: number, type: 'INDIVIDUAL' | 'ESEAL' = 'INDIVIDUAL') {
    // 1. Fetch user identity snapshot data
    const userQuery = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, signerId),
      with: {
        // Assume relationship to employees exists (we'll need to define it in schema)
      }
    });

    // We will do a manual join since we haven't set up the Drizzle relations for the new tables yet.
    // Instead of raw query, let's just use db.select()
    const snapshotData = await db.execute(`
      SELECT u.full_name as "name", e.nip, p.name as "position", o.name as "organization"
      FROM users u
      LEFT JOIN employees e ON e.user_id = u.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN organizations o ON p.organization_id = o.id
      WHERE u.id = '${signerId}'
    `);
    
    let nameSnapshot = 'Unknown';
    let nipSnapshot = null;
    let positionSnapshot = null;
    let organizationSnapshot = null;
    
    if (snapshotData && snapshotData.rows && snapshotData.rows.length > 0) {
      const data = snapshotData.rows[0] as any;
      nameSnapshot = data.name;
      nipSnapshot = data.nip;
      positionSnapshot = data.position;
      organizationSnapshot = data.organization;
    }

    const [request] = await db.insert(signatureRequests).values({
      workflowId,
      documentVersionId,
      signerId,
      signatureOrder: order,
      signatureType: type,
      status: 'PENDING',
      nameSnapshot,
      nipSnapshot,
      positionSnapshot,
      organizationSnapshot
    }).returning();
    
    return request;
  }

  /**
   * Starts the workflow.
   */
  async startWorkflow(workflowId: string) {
    await db.update(signatureWorkflows)
      .set({ status: 'REVIEW' })
      .where(eq(signatureWorkflows.id, workflowId));
      
    // Additional logic can be added to notify the first signer(s)
  }

  /**
   * Logs an event in the audit trail.
   */
  async logEvent(actorId: string, eventType: string, entityType: string, entityId: string, metadata: any = {}) {
    await db.insert(signatureEvents).values({
      actorId,
      eventType,
      entityType,
      entityId,
      metadata
    });
  }
}
