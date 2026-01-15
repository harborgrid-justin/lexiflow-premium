/**
 * Communication Types
 * Types for correspondence and communications
 */

import type { BaseEntity } from "./primitives";

export interface Communication extends BaseEntity {
  subject: string;
  body: string;
  type: "Email" | "Letter" | "Call" | "Meeting" | "Note";
  caseId?: string;
  clientId?: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: string[];
  sentAt?: string;
  receivedAt?: string;
  isRead: boolean;
  priority?: "High" | "Medium" | "Low";
  tags?: string[];
}
