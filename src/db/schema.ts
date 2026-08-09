import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  uuid,
  boolean,
  integer,
  doublePrecision,
  jsonb,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';

// --- ENUMS ---
export const roleEnum = pgEnum('role', ['Super Administrator', 'Administrator', 'Kepala Dinas', 'Sekretaris Dinas', 'Kepala Bidang', 'Verifikator', 'Reviewer Teknis', 'Surveyor', 'Operator', 'Auditor', 'Konsultan', 'Tamu']);
export const surveyStatusEnum = pgEnum('survey_status', ['Draft', 'Dijadwalkan', 'Berjalan', 'Ditunda', 'Selesai', 'Dibatalkan']);
export const assessmentStatusEnum = pgEnum('assessment_status', ['Draft', 'Menunggu Verifikasi', 'Ditolak', 'Disetujui', 'Final', 'Arsip']);
export const damageLevelEnum = pgEnum('damage_level', ['Tidak Rusak', 'Rusak Ringan', 'Rusak Sedang', 'Rusak Berat']);

// TTE Enums
export const signatureStatusEnum = pgEnum('signature_status', ['PENDING', 'ACTIVE', 'REVOKED', 'EXPIRED']);
export const requestStatusEnum = pgEnum('signature_request_status', ['PENDING', 'DRAFT', 'SUBMITTED', 'REVIEW', 'APPROVED', 'READY_TO_SIGN', 'SIGNING', 'SIGNED', 'VERIFIED', 'FINAL', 'SIGNING_FAILED', 'VALIDATION_FAILED', 'REJECTED', 'CANCELLED', 'EXPIRED']);
export const signatureTypeEnum = pgEnum('signature_type', ['INDIVIDUAL', 'ESEAL']);
export const assessmentRequestStatusEnum = pgEnum('assessment_request_status', ['DRAFT', 'READY_FOR_SIGNING', 'WAITING_SIGNATURE', 'SIGNED', 'SUBMITTED', 'RECEIVED', 'VALIDATED', 'ASSIGNED', 'IN_ASSESSMENT', 'COMPLETED', 'REJECTED', 'CANCELLED']);

// --- 1. IDENTITY & AUTHENTICATION ---
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  uid: text('uid').notNull().unique(), // Auth Provider UID
  email: text('email').notNull().unique(),
  phone: text('phone'),
  fullName: text('full_name').notNull(),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  type: text('type').default('Custom'), // System or Custom
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  roleId: integer('role_id').references(() => roles.id).notNull(),
});

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  module: text('module').notNull(),
  action: text('action').notNull(), // Create, Read, Update, Delete, Approve, Export
});

export const rolePermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').references(() => roles.id).notNull(),
  permissionId: integer('permission_id').references(() => permissions.id).notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  token: text('token').notNull(),
  deviceInfo: jsonb('device_info'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  module: text('module').notNull(),
  targetId: text('target_id'),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  ipAddress: text('ip_address'),
  device: text('device'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- 2. ORGANIZATION ---
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // Kementerian, Provinsi, Kabupaten, Instansi Lain
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
});

export const positions = pgTable('positions', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  level: text('level'),
  isActive: boolean('is_active').default(true),
});

export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  positionId: integer('position_id').references(() => positions.id),
  nip: text('nip'),
  employeeId: text('employee_id'),
  signatureUrl: text('signature_url'),
});

// --- 3. WILAYAH ADMINISTRASI ---
export const provinces = pgTable('provinces', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
});

export const regencies = pgTable('regencies', {
  id: serial('id').primaryKey(),
  provinceId: integer('province_id').references(() => provinces.id).notNull(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
});

export const districts = pgTable('districts', {
  id: serial('id').primaryKey(),
  regencyId: integer('regency_id').references(() => regencies.id).notNull(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
});

export const villages = pgTable('villages', {
  id: serial('id').primaryKey(),
  districtId: integer('district_id').references(() => districts.id).notNull(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  postalCode: text('postal_code'),
});

// --- 4. BANGUNAN & MASTER REFERENSI ---
export const buildingFunctions = pgTable('building_functions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const buildingTypes = pgTable('building_types', {
  id: serial('id').primaryKey(),
  functionId: integer('function_id').references(() => buildingFunctions.id).notNull(),
  name: text('name').notNull(),
});

export const structuralSystems = pgTable('structural_systems', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // Beton Bertulang, Baja, Kayu, Pasangan Batu
});

export const buildings = pgTable('buildings', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  assetCode: text('asset_code'),
  registryNumber: text('registry_number'),
  typeId: integer('type_id').references(() => buildingTypes.id),
  structuralSystemId: integer('structural_system_id').references(() => structuralSystems.id),
  
  address: text('address').notNull(),
  villageId: integer('village_id').references(() => villages.id),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  elevation: doublePrecision('elevation'),
  
  buildYear: integer('build_year'),
  renovationYear: integer('renovation_year'),
  floorCount: integer('floor_count'),
  area: doublePrecision('area'),
  height: doublePrecision('height'),
  
  owner: text('owner'),
  manager: text('manager'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: index('buildings_name_idx').on(table.name),
    assetCodeIdx: index('buildings_asset_code_idx').on(table.assetCode),
    createdAtIdx: index('buildings_created_at_idx').on(table.createdAt)
  };
});

// --- 5. SURVEY & FIELD INSPECTION ---
export const surveyAssignments = pgTable('survey_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  buildingId: uuid('building_id').references(() => buildings.id).notNull(),
  assignmentLetterNumber: text('assignment_letter_number'),
  status: surveyStatusEnum('status').default('Draft'),
  scheduledDate: timestamp('scheduled_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const surveyMembers = pgTable('survey_members', {
  id: serial('id').primaryKey(),
  assignmentId: uuid('assignment_id').references(() => surveyAssignments.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  isLeader: boolean('is_leader').default(false),
});

export const surveys = pgTable('surveys', {
  id: uuid('id').defaultRandom().primaryKey(),
  assignmentId: uuid('assignment_id').references(() => surveyAssignments.id).notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  notes: text('notes'),
  weatherCondition: text('weather_condition'),
  status: surveyStatusEnum('status').default('Draft'),
  syncStatus: text('sync_status').default('synced'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    statusIdx: index('surveys_status_idx').on(table.status),
    createdAtIdx: index('surveys_created_at_idx').on(table.createdAt)
  };
});

// --- 6. MEDIA & BUKTI ---
export const mediaFiles = pgTable('media_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  surveyId: uuid('survey_id').references(() => surveys.id),
  buildingId: uuid('building_id').references(() => buildings.id),
  type: text('type').notNull(), // photo, video, document, drawing, lidar, ifc
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  category: text('category'), // komponen, lingkungan, administrasi
  
  // Metadata
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  timestamp: timestamp('timestamp'),
  device: text('device'),
  orientation: text('orientation'),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- 7. DAMAGE ASSESSMENT ---
export const assessmentCategories = pgTable('assessment_categories', { // Struktur, Arsitektur, MEP
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  weight: doublePrecision('weight').notNull(), // Bobot dalam %
});

export const assessmentComponents = pgTable('assessment_components', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => assessmentCategories.id).notNull(),
  name: text('name').notNull(), // Pondasi, Kolom, Atap
  weight: doublePrecision('weight').notNull(), 
});

export const assessmentSubcomponents = pgTable('assessment_subcomponents', {
  id: serial('id').primaryKey(),
  componentId: integer('component_id').references(() => assessmentComponents.id).notNull(),
  name: text('name').notNull(), 
});

export const damageTypes = pgTable('damage_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // Retak, Spalling, Korosi
  description: text('description'),
});

export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  surveyId: uuid('survey_id').references(() => surveys.id).notNull(),
  buildingId: uuid('building_id').references(() => buildings.id).notNull(),
  reviewerId: uuid('reviewer_id').references(() => users.id),
  status: assessmentStatusEnum('status').default('Draft'),
  
  totalDamagePercentage: doublePrecision('total_damage_percentage'),
  damageClassification: damageLevelEnum('damage_classification'),
  
  recommendationPrimary: text('recommendation_primary'),
  technicalNotes: text('technical_notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    statusIdx: index('assessments_status_idx').on(table.status),
    damageClassificationIdx: index('assessments_damage_classification_idx').on(table.damageClassification),
    createdAtIdx: index('assessments_created_at_idx').on(table.createdAt)
  };
});

export const assessmentResults = pgTable('assessment_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').references(() => assessments.id).notNull(),
  subcomponentId: integer('subcomponent_id').references(() => assessmentSubcomponents.id).notNull(),
  damageTypeId: integer('damage_type_id').references(() => damageTypes.id),
  
  damagePercentage: doublePrecision('damage_percentage'),
  damageLevel: damageLevelEnum('damage_level'),
  volume: doublePrecision('volume'),
  unit: text('unit'),
  
  notes: text('notes'),
  mediaId: uuid('media_id').references(() => mediaFiles.id),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- 8. AI ENGINE ---
export const aiRequests = pgTable('ai_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').references(() => assessments.id),
  type: text('type').notNull(), // Review, Report, Vision, Chat
  promptUrl: text('prompt_url'),
  responseJson: jsonb('response_json'),
  confidenceScore: doublePrecision('confidence_score'),
  status: text('status'), // Pending, Completed, Failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const aiRecommendations = pgTable('ai_recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').references(() => assessments.id).notNull(),
  recommendation: text('recommendation').notNull(),
  reasoning: text('reasoning'),
  references: jsonb('references'), // SNI, Permen
  status: text('status').default('Draft'), // Accepted, Rejected
  reviewerId: uuid('reviewer_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const aiKnowledgeBase = pgTable('ai_knowledge_base', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'), // Regulasi, SOP
  url: text('url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- 9. REPORT ENGINE & DIGITAL SIGNATURE ---
export const documentTemplates = pgTable('document_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // DOCX, PDF, HTML
  content: text('content').notNull(),
  isActive: boolean('is_active').default(true),
});

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').references(() => assessments.id).notNull(),
  templateId: integer('template_id').references(() => documentTemplates.id).notNull(),
  reportNumber: text('report_number'),
  status: text('status').default('Draft'), // Draft, Published, Archived
  fileUrl: text('file_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    reportNumberIdx: index('reports_report_number_idx').on(table.reportNumber),
    statusIdx: index('reports_status_idx').on(table.status),
    createdAtIdx: index('reports_created_at_idx').on(table.createdAt)
  };
});

export const digitalSignatures = pgTable('digital_signatures', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportId: uuid('report_id').references(() => reports.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  qrCodeUrl: text('qr_code_url'),
  signedAt: timestamp('signed_at').defaultNow().notNull(),
  hash: text('hash').notNull(),
});

// --- 10. GIS & BIM ---
export const mapLayers = pgTable('map_layers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // WMS, WFS, GeoJSON
  url: text('url').notNull(),
  isActive: boolean('is_active').default(true),
});

export const bimModels = pgTable('bim_models', {
  id: uuid('id').defaultRandom().primaryKey(),
  buildingId: uuid('building_id').references(() => buildings.id).notNull(),
  name: text('name').notNull(),
  ifcUrl: text('ifc_url').notNull(),
  version: text('version'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// --- 11. NOTIFICATIONS ---
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type'), 
  link: text('link'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- 12. OFFLINE SYNC ---
export const syncQueue = pgTable('sync_queue', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  operation: text('operation').notNull(), // Insert, Update, Delete
  tableName: text('table_name').notNull(),
  dataJson: jsonb('data_json').notNull(),
  status: text('status').default('Pending'), // Pending, Synced, Failed
  errorLog: text('error_log'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- 13. ASSESSMENT SNAPSHOTS & ACTIVITY TRACKING ---
export const assessmentSnapshots = pgTable('assessment_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: text('assessment_id').notNull(), // e.g. ASM-2026-001 or active assessment ID
  buildingId: text('building_id'),
  buildingName: text('building_name'),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(), // e.g. "Update Field", "Revert Version"
  changedField: text('changed_field'), // e.g. "str-kolom", "note", "damages"
  oldValue: text('old_value'),
  newValue: text('new_value'),
  snapshotData: jsonb('snapshot_data').notNull(), // Complete JSON snapshot of assessment state
  totalDamagePercentage: doublePrecision('total_damage_percentage'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- 14. DIGITAL SIGNATURE (TTE) & TRUST PLATFORM ---

export const signatureProfiles = pgTable('signature_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  status: signatureStatusEnum('status').default('PENDING'),
  provider: text('provider'), // e.g., BSrE
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const certificates = pgTable('certificates', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => signatureProfiles.id).notNull(),
  serialNumber: text('serial_number').notNull(),
  subject: text('subject').notNull(),
  issuer: text('issuer').notNull(),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to').notNull(),
  status: signatureStatusEnum('status').default('ACTIVE'),
  fingerprint: text('fingerprint'),
  publicKey: text('public_key'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  documentType: text('document_type').notNull(), // Surat, Laporan, Berita Acara
  fileUrl: text('file_url'),
  status: requestStatusEnum('status').default('DRAFT'),
  creatorId: uuid('creator_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documentVersions = pgTable('document_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id).notNull(),
  versionNumber: integer('version_number').notNull(),
  fileUrl: text('file_url').notNull(),
  hashAlgorithm: text('hash_algorithm').default('SHA-256'),
  documentHash: text('document_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const signatureWorkflows = pgTable('signature_workflows', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id).notNull(),
  name: text('name').notNull(),
  type: text('type').default('SEQUENTIAL'), // SEQUENTIAL, PARALLEL
  status: requestStatusEnum('status').default('DRAFT'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const signatureRequests = pgTable('signature_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  workflowId: uuid('workflow_id').references(() => signatureWorkflows.id).notNull(),
  documentVersionId: uuid('document_version_id').references(() => documentVersions.id).notNull(),
  signerId: uuid('signer_id').references(() => users.id).notNull(),
  signatureOrder: integer('signature_order').default(1),
  signatureType: signatureTypeEnum('signature_type').default('INDIVIDUAL'),
  status: requestStatusEnum('status').default('PENDING'),
  
  // Identity Snapshots
  nameSnapshot: text('name_snapshot'),
  nipSnapshot: text('nip_snapshot'),
  positionSnapshot: text('position_snapshot'),
  organizationSnapshot: text('organization_snapshot'),
  
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  expiredAt: timestamp('expired_at'),
  signedAt: timestamp('signed_at'),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
});

export const signatures = pgTable('signatures', {
  id: uuid('id').defaultRandom().primaryKey(),
  requestId: uuid('request_id').references(() => signatureRequests.id).notNull(),
  certificateId: uuid('certificate_id').references(() => certificates.id).notNull(),
  signatureValue: text('signature_value').notNull(),
  signatureProfile: text('signature_profile').default('PAdES-LT'), // PAdES-B, PAdES-T, PAdES-LT
  timestampValue: text('timestamp_value'),
  signedHash: text('signed_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const signatureEvents = pgTable('signature_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id').references(() => users.id),
  eventType: text('event_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  previousHash: text('previous_hash'),
  eventHash: text('event_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const verificationRecords = pgTable('verification_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentVersionId: uuid('document_version_id').references(() => documentVersions.id).notNull(),
  verifiedByIp: text('verified_by_ip'),
  isValid: boolean('is_valid').notNull(),
  validationDetails: jsonb('validation_details'),
  verifiedAt: timestamp('verified_at').defaultNow().notNull(),
});

// --- 15. SURAT PERMOHONAN PENILAIAN ---
export const assessmentRequests = pgTable('assessment_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  requestNumber: text('request_number'),
  documentId: uuid('document_id').references(() => documents.id),
  applicantUserId: uuid('applicant_user_id').references(() => users.id).notNull(),
  organizationId: integer('organization_id').references(() => organizations.id),
  buildingId: uuid('building_id').references(() => buildings.id),
  requestType: text('request_type').notNull(),
  purpose: text('purpose'),
  background: text('background'),
  status: assessmentRequestStatusEnum('status').default('DRAFT'),
  submittedAt: timestamp('submitted_at'),
  receivedAt: timestamp('received_at'),
  assignedAt: timestamp('assigned_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const requestDocuments = pgTable('request_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  requestId: uuid('request_id').references(() => assessmentRequests.id).notNull(),
  documentType: text('document_type').notNull(),
  documentVersion: integer('document_version').default(1),
  filePath: text('file_path'),
  fileHash: text('file_hash'),
  signatureStatus: requestStatusEnum('signature_status').default('DRAFT'),
  verificationId: text('verification_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const requestAttachments = pgTable('request_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  requestId: uuid('request_id').references(() => assessmentRequests.id).notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size'),
  storagePath: text('storage_path').notNull(),
  category: text('category'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- RELATIONSHIPS (for ORM queries) ---
export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  sessions: many(sessions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const buildingsRelations = relations(buildings, ({ many, one }) => ({
  surveys: many(surveyAssignments),
  assessments: many(assessments),
  media: many(mediaFiles),
  village: one(villages, {
    fields: [buildings.villageId],
    references: [villages.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ many, one }) => ({
  results: many(assessmentResults),
  building: one(buildings, {
    fields: [assessments.buildingId],
    references: [buildings.id],
  }),
  survey: one(surveys, {
    fields: [assessments.surveyId],
    references: [surveys.id],
  }),
  reviewer: one(users, {
    fields: [assessments.reviewerId],
    references: [users.id],
  }),
}));

export const assessmentRequestsRelations = relations(assessmentRequests, ({ many, one }) => ({
  applicant: one(users, {
    fields: [assessmentRequests.applicantUserId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [assessmentRequests.organizationId],
    references: [organizations.id],
  }),
  building: one(buildings, {
    fields: [assessmentRequests.buildingId],
    references: [buildings.id],
  }),
  document: one(documents, {
    fields: [assessmentRequests.documentId],
    references: [documents.id],
  }),
  requestDocs: many(requestDocuments),
  attachments: many(requestAttachments),
}));
