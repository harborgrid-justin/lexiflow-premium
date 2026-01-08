/**
 * Zod Validation Schemas for Server Actions
 *
 * Comprehensive validation schemas for all entity types:
 * - Case schemas
 * - Client schemas
 * - Document schemas
 * - Matter schemas
 * - Financial schemas
 * - Party schemas
 * - Password policy validation
 */

import { z } from 'zod';

// Re-export password policy module
export {
  DEFAULT_PASSWORD_POLICY,
  RELAXED_PASSWORD_POLICY,
  STRICT_PASSWORD_POLICY,
  ABSOLUTE_MAX_PASSWORD_LENGTH,
  PASSWORD_PATTERNS,
  EXPIRY_WARNING_DAYS,
  validatePasswordPolicy,
  checkPasswordExpiry,
  checkPasswordReuse,
  hashPasswordForHistory,
  createZodPasswordValidator,
  createZodPasswordSuperRefine,
  mergeWithDefaultPolicy,
  getPasswordRequirementsText,
  type PasswordPolicy,
  type PasswordValidationResult,
  type PasswordExpiryResult,
  type PasswordReuseResult,
} from './password-policy';

// ============================================================================
// Common Primitives & Utilities
// ============================================================================

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Non-empty string with trim
 */
export const nonEmptyString = z.string().trim().min(1, 'This field is required');

/**
 * Optional string that transforms empty strings to undefined
 */
export const optionalString = z
  .string()
  .optional()
  .transform((val) => (val === '' ? undefined : val));

/**
 * ISO date string validation
 */
export const dateString = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date format' }
);

/**
 * Optional date string
 */
export const optionalDateString = z
  .string()
  .optional()
  .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid date format' });

/**
 * Positive number validation
 */
export const positiveNumber = z.number().positive('Must be a positive number');

/**
 * Non-negative number validation
 */
export const nonNegativeNumber = z.number().nonnegative('Cannot be negative');

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage cannot exceed 100');

/**
 * Money amount validation
 */
export const moneySchema = z.object({
  amount: nonNegativeNumber,
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD']).default('USD'),
  precision: z.number().int().min(0).max(4).default(2),
});

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Optional email
 */
export const optionalEmail = z
  .string()
  .email('Invalid email address')
  .optional()
  .or(z.literal(''));

/**
 * Phone number validation (basic)
 */
export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-\+\(\)\.]+$/, 'Invalid phone number format')
  .optional();

/**
 * Tags array validation
 */
export const tagsSchema = z.array(z.string().trim()).default([]);

/**
 * Metadata record validation
 */
export const metadataSchema = z.record(z.string(), z.unknown()).optional();

// ============================================================================
// Pagination Schemas
// ============================================================================

/**
 * Pagination input schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Search params schema
 */
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
}).merge(paginationSchema);

export type SearchParamsInput = z.infer<typeof searchParamsSchema>;

// ============================================================================
// Case Schemas
// ============================================================================

/**
 * Case status enum
 */
export const caseStatusSchema = z.enum([
  'Open',
  'Active',
  'Pending',
  'Discovery',
  'Trial',
  'Settled',
  'Closed',
  'Archived',
  'On Hold',
  'Pre-Filing',
  'Appeal',
  'Transferred',
]);

/**
 * Matter type enum
 */
export const matterTypeSchema = z.enum([
  'LITIGATION',
  'TRANSACTIONAL',
  'ADVISORY',
  'COMPLIANCE',
  'INTELLECTUAL_PROPERTY',
  'EMPLOYMENT',
  'REAL_ESTATE',
  'CORPORATE',
  'OTHER',
]);

/**
 * Billing model enum
 */
export const billingModelSchema = z.enum(['Hourly', 'Fixed', 'Contingency', 'Hybrid']);

/**
 * Create case input schema
 */
export const createCaseSchema = z.object({
  title: nonEmptyString.max(255, 'Title must be less than 255 characters'),
  description: optionalString.pipe(z.string().max(5000).optional()),
  caseNumber: optionalString.pipe(z.string().max(100).optional()),
  type: matterTypeSchema.optional(),
  status: caseStatusSchema.default('Open'),
  practiceArea: optionalString.pipe(z.string().max(100).optional()),
  jurisdiction: optionalString.pipe(z.string().max(100).optional()),
  court: optionalString.pipe(z.string().max(255).optional()),
  judge: optionalString.pipe(z.string().max(255).optional()),
  filingDate: dateString,
  trialDate: optionalDateString,
  clientId: uuidSchema,
  client: nonEmptyString.max(255),
  leadAttorneyId: uuidSchema.optional(),
  billingModel: billingModelSchema.optional(),
  value: nonNegativeNumber.optional(),
  tags: tagsSchema,
  matterType: matterTypeSchema.default('OTHER'),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;

/**
 * Update case input schema (all fields optional)
 */
export const updateCaseSchema = createCaseSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;

/**
 * Case filter schema
 */
export const caseFilterSchema = z.object({
  status: z.array(caseStatusSchema).optional(),
  matterType: z.array(matterTypeSchema).optional(),
  clientId: uuidSchema.optional(),
  leadAttorneyId: uuidSchema.optional(),
  practiceArea: z.string().optional(),
  jurisdiction: z.string().optional(),
  dateFrom: optionalDateString,
  dateTo: optionalDateString,
  searchQuery: z.string().optional(),
}).merge(paginationSchema);

export type CaseFilterInput = z.infer<typeof caseFilterSchema>;

// ============================================================================
// Client Schemas
// ============================================================================

/**
 * Client type enum
 */
export const clientTypeSchema = z.enum([
  'individual',
  'corporation',
  'partnership',
  'llc',
  'nonprofit',
  'government',
  'other',
]);

/**
 * Client status enum
 */
export const clientStatusSchema = z.enum([
  'active',
  'inactive',
  'prospective',
  'former',
  'blocked',
]);

/**
 * Payment terms enum
 */
export const paymentTermsSchema = z.enum([
  'net_15',
  'net_30',
  'net_45',
  'net_60',
  'due_on_receipt',
  'custom',
]);

/**
 * Create client input schema
 */
export const createClientSchema = z.object({
  clientNumber: nonEmptyString.max(100, 'Client number must be less than 100 characters'),
  name: nonEmptyString.max(255, 'Name must be less than 255 characters'),
  clientType: clientTypeSchema.optional(),
  status: clientStatusSchema.default('active'),

  // Contact Information
  email: optionalEmail,
  phone: phoneSchema,
  fax: phoneSchema,
  website: z.string().url('Invalid URL').optional().or(z.literal('')),

  // Primary Address
  address: optionalString.pipe(z.string().max(1000).optional()),
  city: optionalString.pipe(z.string().max(100).optional()),
  state: optionalString.pipe(z.string().max(100).optional()),
  zipCode: optionalString.pipe(z.string().max(20).optional()),
  country: optionalString.pipe(z.string().max(100).optional()),

  // Billing Address
  billingAddress: optionalString.pipe(z.string().max(1000).optional()),
  billingCity: optionalString.pipe(z.string().max(100).optional()),
  billingState: optionalString.pipe(z.string().max(100).optional()),
  billingZipCode: optionalString.pipe(z.string().max(20).optional()),
  billingCountry: optionalString.pipe(z.string().max(100).optional()),

  // Business Information
  taxId: optionalString.pipe(z.string().max(100).optional()),
  industry: optionalString.pipe(z.string().max(255).optional()),

  // Primary Contact
  primaryContactName: optionalString.pipe(z.string().max(255).optional()),
  primaryContactEmail: optionalEmail,
  primaryContactPhone: phoneSchema,
  primaryContactTitle: optionalString.pipe(z.string().max(100).optional()),

  // Payment & Billing
  paymentTerms: paymentTermsSchema.default('net_30'),
  preferredPaymentMethod: optionalString.pipe(z.string().max(100).optional()),
  creditLimit: nonNegativeNumber.default(0),

  // Flags
  isVip: z.boolean().default(false),
  requiresConflictCheck: z.boolean().default(false),
  hasRetainer: z.boolean().default(false),
  retainerAmount: nonNegativeNumber.optional(),

  // Extensibility
  tags: tagsSchema,
  notes: optionalString.pipe(z.string().max(10000).optional()),
  customFields: metadataSchema,
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

/**
 * Update client input schema
 */
export const updateClientSchema = createClientSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

/**
 * Client filter schema
 */
export const clientFilterSchema = z.object({
  status: z.array(clientStatusSchema).optional(),
  clientType: z.array(clientTypeSchema).optional(),
  isVip: z.boolean().optional(),
  hasRetainer: z.boolean().optional(),
  searchQuery: z.string().optional(),
}).merge(paginationSchema);

export type ClientFilterInput = z.infer<typeof clientFilterSchema>;

// ============================================================================
// Document Schemas
// ============================================================================

/**
 * Document status enum
 */
export const documentStatusSchema = z.enum([
  'draft',
  'under_review',
  'approved',
  'filed',
  'archived',
]);

/**
 * Document type enum
 */
export const documentTypeSchema = z.enum([
  'Contract',
  'Pleading',
  'Motion',
  'Brief',
  'Discovery',
  'Correspondence',
  'Evidence',
  'Exhibit',
  'Template',
  'Other',
]);

/**
 * Create document input schema
 */
export const createDocumentSchema = z.object({
  title: nonEmptyString.max(255, 'Title must be less than 255 characters'),
  description: optionalString.pipe(z.string().max(2000).optional()),
  type: documentTypeSchema.default('Other'),
  caseId: uuidSchema,
  status: documentStatusSchema.default('draft'),

  // Content
  content: z.string().optional(),
  filename: optionalString.pipe(z.string().max(255).optional()),
  mimeType: optionalString.pipe(z.string().max(100).optional()),

  // Organization
  folderId: uuidSchema.optional(),
  tags: tagsSchema,

  // Metadata
  author: optionalString.pipe(z.string().max(255).optional()),
  customFields: metadataSchema,
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

/**
 * Update document input schema
 */
export const updateDocumentSchema = createDocumentSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

/**
 * Document filter schema
 */
export const documentFilterSchema = z.object({
  status: z.array(documentStatusSchema).optional(),
  type: z.array(documentTypeSchema).optional(),
  caseId: uuidSchema.optional(),
  folderId: uuidSchema.optional(),
  tags: z.array(z.string()).optional(),
  searchQuery: z.string().optional(),
  dateFrom: optionalDateString,
  dateTo: optionalDateString,
}).merge(paginationSchema);

export type DocumentFilterInput = z.infer<typeof documentFilterSchema>;

/**
 * Upload document schema
 */
export const uploadDocumentSchema = z.object({
  caseId: uuidSchema,
  folderId: uuidSchema.optional(),
  title: nonEmptyString.max(255),
  description: optionalString,
  type: documentTypeSchema.default('Other'),
  tags: tagsSchema,
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

// ============================================================================
// Matter Schemas
// ============================================================================

/**
 * Matter status enum
 */
export const matterStatusSchema = z.enum([
  'INTAKE',
  'ACTIVE',
  'PENDING',
  'ON_HOLD',
  'CLOSED',
  'ARCHIVED',
]);

/**
 * Matter priority enum
 */
export const matterPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

/**
 * Create matter input schema
 */
export const createMatterSchema = z.object({
  matterNumber: nonEmptyString.max(100, 'Matter number must be less than 100 characters'),
  title: nonEmptyString.max(255, 'Title must be less than 255 characters'),
  description: optionalString.pipe(z.string().max(5000).optional()),
  status: matterStatusSchema.default('INTAKE'),
  matterType: matterTypeSchema.default('OTHER'),
  priority: matterPrioritySchema.default('MEDIUM'),
  practiceArea: optionalString.pipe(z.string().max(100).optional()),

  // Client Information
  clientId: uuidSchema.optional(),
  clientName: optionalString.pipe(z.string().max(255).optional()),

  // Attorney Assignment
  leadAttorneyId: uuidSchema.optional(),
  leadAttorneyName: optionalString.pipe(z.string().max(255).optional()),
  originatingAttorneyId: uuidSchema.optional(),
  originatingAttorneyName: optionalString.pipe(z.string().max(255).optional()),

  // Jurisdictional Information
  jurisdiction: optionalString.pipe(z.string().max(100).optional()),
  venue: optionalString.pipe(z.string().max(100).optional()),

  // Financial
  billingType: optionalString.pipe(z.string().max(50).optional()),
  hourlyRate: nonNegativeNumber.optional(),
  flatFee: nonNegativeNumber.optional(),
  contingencyPercentage: percentageSchema.optional(),
  retainerAmount: nonNegativeNumber.optional(),
  estimatedValue: nonNegativeNumber.optional(),
  budgetAmount: nonNegativeNumber.optional(),

  // Dates
  openedDate: dateString,
  targetCloseDate: optionalDateString,

  // Opposing Party
  opposingPartyName: optionalString.pipe(z.string().max(255).optional()),
  opposingCounselFirm: optionalString.pipe(z.string().max(255).optional()),

  // Conflict Check
  conflictCheckCompleted: z.boolean().default(false),
  conflictCheckNotes: optionalString.pipe(z.string().max(5000).optional()),

  // Risk Management
  riskLevel: optionalString.pipe(z.string().max(50).optional()),
  riskNotes: optionalString.pipe(z.string().max(5000).optional()),

  // Notes & Custom Fields
  internalNotes: optionalString.pipe(z.string().max(10000).optional()),
  customFields: metadataSchema,
  tags: tagsSchema,
});

export type CreateMatterInput = z.infer<typeof createMatterSchema>;

/**
 * Update matter input schema
 */
export const updateMatterSchema = createMatterSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateMatterInput = z.infer<typeof updateMatterSchema>;

/**
 * Matter filter schema
 */
export const matterFilterSchema = z.object({
  status: z.array(matterStatusSchema).optional(),
  matterType: z.array(matterTypeSchema).optional(),
  priority: z.array(matterPrioritySchema).optional(),
  clientId: uuidSchema.optional(),
  leadAttorneyId: uuidSchema.optional(),
  practiceArea: z.string().optional(),
  searchQuery: z.string().optional(),
}).merge(paginationSchema);

export type MatterFilterInput = z.infer<typeof matterFilterSchema>;

// ============================================================================
// Financial Schemas
// ============================================================================

/**
 * Time entry status enum
 */
export const timeEntryStatusSchema = z.enum([
  'Draft',
  'Submitted',
  'Approved',
  'Billed',
  'Written Off',
]);

/**
 * Create time entry schema
 */
export const createTimeEntrySchema = z.object({
  caseId: uuidSchema,
  userId: uuidSchema,
  date: dateString,
  duration: z.number().positive('Duration must be positive').max(24, 'Duration cannot exceed 24 hours'),
  description: nonEmptyString.max(2000),
  activity: optionalString.pipe(z.string().max(100).optional()),
  ledesCode: optionalString.pipe(z.string().max(20).optional()),
  rate: nonNegativeNumber,
  billable: z.boolean().default(true),
  internalNotes: optionalString.pipe(z.string().max(1000).optional()),
});

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;

/**
 * Invoice status enum
 */
export const invoiceStatusSchema = z.enum([
  'Draft',
  'Pending',
  'Sent',
  'Viewed',
  'Partial',
  'Paid',
  'Overdue',
  'Written Off',
  'Cancelled',
]);

/**
 * Create invoice schema
 */
export const createInvoiceSchema = z.object({
  invoiceNumber: nonEmptyString.max(100),
  caseId: uuidSchema,
  clientId: uuidSchema,
  clientName: nonEmptyString.max(255),
  matterDescription: nonEmptyString.max(500),
  invoiceDate: dateString,
  dueDate: dateString,
  periodStart: optionalDateString,
  periodEnd: optionalDateString,
  billingModel: z.enum(['Hourly', 'Fixed Fee', 'Contingency', 'Hybrid', 'Retainer']),
  status: invoiceStatusSchema.default('Draft'),
  subtotal: nonNegativeNumber.default(0),
  taxRate: percentageSchema.optional(),
  taxAmount: nonNegativeNumber.default(0),
  discountAmount: nonNegativeNumber.default(0),
  totalAmount: nonNegativeNumber.default(0),
  notes: optionalString.pipe(z.string().max(2000).optional()),
  terms: optionalString.pipe(z.string().max(2000).optional()),
  billingAddress: optionalString.pipe(z.string().max(500).optional()),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD']).default('USD'),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

// ============================================================================
// Party Schemas
// ============================================================================

/**
 * Party type enum
 */
export const partyTypeSchema = z.enum([
  'Plaintiff',
  'Defendant',
  'Petitioner',
  'Respondent',
  'Appellant',
  'Appellee',
  'Third Party',
  'Witness',
  'Expert Witness',
  'Other',
  'Individual',
  'Corporation',
  'Government',
]);

/**
 * Party role enum
 */
export const partyRoleSchema = z.enum([
  'Primary',
  'Co-Party',
  'Interested Party',
  'Guardian',
  'Representative',
]).or(z.string());

/**
 * Create party schema
 */
export const createPartySchema = z.object({
  caseId: uuidSchema,
  name: nonEmptyString.max(255),
  description: optionalString.pipe(z.string().max(500).optional()),
  type: partyTypeSchema,
  role: partyRoleSchema,

  // Organization
  organization: optionalString.pipe(z.string().max(255).optional()),

  // Contact Information
  email: optionalEmail,
  phone: phoneSchema,
  address: optionalString.pipe(z.string().max(1000).optional()),
  city: optionalString.pipe(z.string().max(100).optional()),
  state: optionalString.pipe(z.string().max(100).optional()),
  zipCode: optionalString.pipe(z.string().max(20).optional()),
  country: optionalString.pipe(z.string().max(100).optional()),

  // Legal Representation
  counsel: optionalString.pipe(z.string().max(255).optional()),
  attorneyName: optionalString.pipe(z.string().max(255).optional()),
  attorneyFirm: optionalString.pipe(z.string().max(255).optional()),
  attorneyBarNumber: optionalString.pipe(z.string().max(50).optional()),
  attorneyEmail: optionalEmail,
  attorneyPhone: phoneSchema,
  attorneyAddress: optionalString.pipe(z.string().max(1000).optional()),
  isProSe: z.boolean().default(false),

  // Notes
  notes: optionalString.pipe(z.string().max(5000).optional()),
  metadata: metadataSchema,
});

export type CreatePartyInput = z.infer<typeof createPartySchema>;

/**
 * Update party schema
 */
export const updatePartySchema = createPartySchema.partial().extend({
  id: uuidSchema,
});

export type UpdatePartyInput = z.infer<typeof updatePartySchema>;

// ============================================================================
// ID Validation Schemas
// ============================================================================

/**
 * Single ID input
 */
export const idInputSchema = z.object({
  id: uuidSchema,
});

export type IdInput = z.infer<typeof idInputSchema>;

/**
 * Multiple IDs input
 */
export const idsInputSchema = z.object({
  ids: z.array(uuidSchema).min(1, 'At least one ID is required'),
});

export type IdsInput = z.infer<typeof idsInputSchema>;

// ============================================================================
// Export All Schemas
// ============================================================================

export const schemas = {
  // Primitives
  uuid: uuidSchema,
  dateString,
  money: moneySchema,
  email: emailSchema,
  phone: phoneSchema,
  tags: tagsSchema,
  metadata: metadataSchema,
  pagination: paginationSchema,
  searchParams: searchParamsSchema,

  // Case
  createCase: createCaseSchema,
  updateCase: updateCaseSchema,
  caseFilter: caseFilterSchema,

  // Client
  createClient: createClientSchema,
  updateClient: updateClientSchema,
  clientFilter: clientFilterSchema,

  // Document
  createDocument: createDocumentSchema,
  updateDocument: updateDocumentSchema,
  documentFilter: documentFilterSchema,
  uploadDocument: uploadDocumentSchema,

  // Matter
  createMatter: createMatterSchema,
  updateMatter: updateMatterSchema,
  matterFilter: matterFilterSchema,

  // Financial
  createTimeEntry: createTimeEntrySchema,
  createInvoice: createInvoiceSchema,

  // Party
  createParty: createPartySchema,
  updateParty: updatePartySchema,

  // ID
  id: idInputSchema,
  ids: idsInputSchema,
} as const;

// =============================================================================
// Expense Validation Re-exports
// =============================================================================

export {
  // Constants
  RECEIPT_REQUIRED_THRESHOLD,
  MAX_EXPENSE_AMOUNT,
  EXPENSE_CATEGORIES as EXPENSE_VALIDATION_CATEGORIES,
  // Types
  type ExpenseCategory as ExpenseValidationCategory,
  type ExpenseInput as ExpenseValidationInput,
  type ExpenseValidationResult,
  type ReceiptValidationResult,
  // Core validation functions
  requiresReceipt,
  validateReceiptRequirement,
  isValidExpenseCategory,
  validateExpense,
  // Zod schemas
  expenseCategorySchema,
  expenseSchema,
  validateExpenseSchema,
  // Utility functions
  formatAmountWithReceiptIndicator,
  getReceiptRequirementMessage,
} from './expense-validation';

// =============================================================================
// Financial Constraints Validation Re-exports
// =============================================================================

export {
  // Constants
  FINANCIAL_CONSTRAINTS,
  // Types
  type FinancialConstraints,
  type FinancialValidationResult,
  type BatchValidationResult,
  // Core validation functions
  validateHourlyRate,
  validateInvoiceAmount,
  validateExpenseAmount,
  validateTrustTransaction,
  validateDecimalPlaces,
  validateDailyDuration,
  validateDailyHours,
  // Utility functions
  roundToBillingIncrement,
  roundToDecimalPlaces,
  formatCurrency,
  isReceiptRequired,
  minutesToBillableHours,
  hoursToMinutes,
  // Batch validation
  validateFinancialFields,
  validateTimeEntry as validateTimeEntryFinancials,
  validateExpense as validateExpenseFinancials,
  // Type guards
  isValidMonetaryAmount,
  isValidDuration,
} from './financial-constraints';

// =============================================================================
// Invoice Line Item Validation Re-exports
// =============================================================================

export {
  // Constants
  CALCULATION_TOLERANCE,
  FINANCIAL_CONSTRAINTS as INVOICE_FINANCIAL_CONSTRAINTS,
  // Types
  type InvoiceLineItem,
  type InvoiceForValidation,
  type LineItemValidationResult,
  type InvoiceTotalValidationResult,
  type InvoiceValidationResult,
  // Core validation functions
  validateLineItemCalculation,
  validateInvoiceTotal,
  validateInvoiceLineItems,
  validateInvoice,
  // Helper functions
  checkLineItemCalculation,
  checkInvoiceTotal,
  // Utility functions
  roundToTwoDecimals,
  isWithinTolerance,
  isValidAmount,
  isValidRate,
  isValidQuantity,
} from './invoice-validation';

// =============================================================================
// Trust Account Reconciliation Compliance Re-exports
// =============================================================================

export {
  // Constants
  RECONCILIATION_THRESHOLDS,
  RECONCILIATION_FREQUENCIES,
  // Types
  type ClientLedgerEntry,
  type BankTransaction,
  type LedgerTransaction,
  type ReconciliationData,
  type ReconciliationFrequency,
  type ComplianceSeverity,
  type ThreeWayReconciliationResult,
  type NegativeBalanceClient,
  type ReconciliationOverdueResult,
  type UnmatchedTransaction,
  type UnmatchedReason,
  type ComplianceIssue,
  type ComplianceIssueType,
  type ReconciliationComplianceReport,
  // Core validation functions
  validateThreeWayReconciliation,
  detectNegativeBalanceClients,
  checkReconciliationOverdue,
  findUnmatchedTransactions,
  generateReconciliationReport,
  // Helper functions
  validateReconciliationInput,
  serializeReconciliationReport,
} from './reconciliation-compliance';

// =============================================================================
// Time Entry Validation Re-exports
// =============================================================================

export {
  // Constants
  TIME_ENTRY_CONSTRAINTS,
  TIME_ENTRY_STATUSES,
  // Types
  type TimeEntryStatusType,
  type TimeEntryInput,
  type TimeEntryValidationResult,
  type DurationValidationResult,
  type TimeEntrySchemaInput,
  type TimeEntrySchemaOutput,
  type BatchTimeEntryValidationResult,
  // Core validation functions
  validateTimeEntry,
  validateTimeEntrySchema,
  validateDuration,
  isValidDuration,
  isValidDate as isValidTimeEntryDate,
  isFutureDate as isTimeEntryFutureDate,
  isValidStringLength,
  isValidRate as isValidTimeEntryRate,
  isValidEnum,
  // Sanitization functions
  sanitizeString as sanitizeTimeEntryString,
  sanitizeTimeEntryInput,
  // Billing increment functions
  roundToBillingIncrement as roundTimeEntryToBillingIncrement,
  minutesToRoundedHours,
  calculateBillableAmount,
  // Batch validation
  validateTimeEntries,
  validateTimeEntriesBatch,
  // Utility functions
  formatDuration,
  formatBillableHours,
  getValidationSummary as getTimeEntryValidationSummary,
  // Zod schemas
  timeEntryStatusSchema,
  timeEntrySchema,
} from './time-entry-validation';
