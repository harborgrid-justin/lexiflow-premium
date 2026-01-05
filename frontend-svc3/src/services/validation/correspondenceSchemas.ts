/**
 * @module services/validation/correspondenceSchemas
 * @description Zod validation schemas for correspondence and service job data
 * Ensures data integrity before persistence to IndexedDB
 */

import { z } from 'zod';
import { CommunicationStatus, ServiceStatus } from '@/types/enums';
import { getTodayString } from '@/utils/dateUtils';

// Base validation rules
const sanitizeString = (str: string) => str.trim().replace(/[<>]/g, ''); // Basic XSS prevention
const sanitizeHtml = (str: string) => str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove script tags

/**
 * Communication Item Schema
 * Validates email, letter, fax, and memo communications
 */
export const communicationItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  caseId: z.string().min(1, 'Case ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(500, 'Subject too long')
    .transform(sanitizeString),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  type: z.enum(['Letter', 'Email', 'Fax', 'Notice', 'Memo']),
  direction: z.enum(['Inbound', 'Outbound']),
  sender: z.string()
    .min(1, 'Sender is required')
    .max(200, 'Sender name too long')
    .transform(sanitizeString),
  recipient: z.string()
    .min(1, 'Recipient is required')
    .max(200, 'Recipient name too long')
    .transform(sanitizeString),
  preview: z.string()
    .max(5000, 'Preview content too long')
    .transform(sanitizeHtml),
  hasAttachment: z.boolean().default(false),
  status: z.nativeEnum(CommunicationStatus),
  isPrivileged: z.boolean().default(false),
  // Optional fields
  attachmentIds: z.array(z.string()).optional(),
  threadId: z.string().optional(),
  inReplyTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).strict(); // Strict mode prevents unknown properties

/**
 * Service Job Schema
 * Validates process server and mail service jobs
 */
export const serviceJobSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  caseId: z.string().min(1, 'Case ID is required'),
  requestorId: z.string().min(1, 'Requestor ID is required'),
  documentTitle: z.string()
    .min(1, 'Document title is required')
    .max(300, 'Document title too long')
    .transform(sanitizeString),
  targetPerson: z.string()
    .min(1, 'Target person is required')
    .max(200, 'Target person name too long')
    .transform(sanitizeString),
  targetAddress: z.string()
    .min(1, 'Target address is required')
    .max(500, 'Address too long')
    .transform(sanitizeString),
  serverName: z.string()
    .min(1, 'Server/carrier name is required')
    .max(200, 'Server name too long')
    .transform(sanitizeString),
  method: z.enum(['Process Server', 'Mail']),
  status: z.nativeEnum(ServiceStatus),
  dueDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid due date format (YYYY-MM-DD)')
    .refine(
      (date) => new Date(date) >= new Date(getTodayString()),
      'Due date cannot be in the past'
    ),
  attempts: z.number().int().min(0).max(10, 'Attempts exceeded maximum').default(0),
  // Optional fields
  mailType: z.string().max(100).optional(),
  trackingNumber: z.string()
    .max(100)
    .regex(/^[A-Z0-9\s-]*$/, 'Invalid tracking number format')
    .optional(),
  addressedTo: z.string().max(200).transform(sanitizeString).optional(),
  servedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  signerName: z.string().max(200).transform(sanitizeString).optional(),
  gpsCoordinates: z.string()
    .regex(/^-?\d+.\d+,\s*-?\d+.\d+$/, 'Invalid GPS coordinates')
    .optional(),
  notes: z.string().max(2000).transform(sanitizeHtml).optional(),
  proofDocumentId: z.string().optional(),
}).strict();

/**
 * Partial schemas for updates (all fields optional)
 */
export const communicationItemUpdateSchema = communicationItemSchema.partial().strict();
export const serviceJobUpdateSchema = serviceJobSchema.partial().strict();

/**
 * Type inference from schemas
 */
export type ValidatedCommunicationItem = z.infer<typeof communicationItemSchema>;
export type ValidatedServiceJob = z.infer<typeof serviceJobSchema>;
export type CommunicationItemUpdate = z.infer<typeof communicationItemUpdateSchema>;
export type ServiceJobUpdate = z.infer<typeof serviceJobUpdateSchema>;

/**
 * Validation helper functions
 */
export const validateCommunicationItem = (data: unknown) => {
  return communicationItemSchema.parse(data);
};

export const validateServiceJob = (data: unknown) => {
  return serviceJobSchema.parse(data);
};

export const validateCommunicationItemSafe = (data: unknown) => {
  return communicationItemSchema.safeParse(data);
};

export const validateServiceJobSafe = (data: unknown) => {
  return serviceJobSchema.safeParse(data);
};
