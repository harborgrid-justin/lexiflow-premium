/**
 * Communications Domain Normalizers
 */

import {
  normalizeArray,
  normalizeDate,
  normalizeId,
  normalizeString,
  type Normalizer,
} from "./core";

interface BackendClient {
  id: string | number;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  contact_person?: string;
  created_at?: string;
}

export const normalizeClient: Normalizer<BackendClient, unknown> = (
  backend
) => {
  return {
    id: normalizeId(backend.id),
    name: normalizeString(backend.name),
    email: normalizeString(backend.email),
    phone: normalizeString(backend.phone),
    company: normalizeString(backend.company),
    address: normalizeString(backend.address),
    contactPerson: normalizeString(backend.contact_person),
    createdAt: normalizeDate(backend.created_at),
  };
};

interface BackendMessage {
  id: string | number;
  subject?: string;
  body?: string;
  from_user_id?: string;
  to_user_id?: string;
  case_id?: string;
  sent_at?: string;
  read_at?: string;
}

export const normalizeMessage: Normalizer<BackendMessage, unknown> = (
  backend
) => {
  return {
    id: normalizeId(backend.id),
    subject: normalizeString(backend.subject),
    body: normalizeString(backend.body),
    fromUserId: normalizeString(backend.from_user_id),
    toUserId: normalizeString(backend.to_user_id),
    caseId: normalizeString(backend.case_id),
    sentAt: normalizeDate(backend.sent_at),
    readAt: normalizeDate(backend.read_at),
  };
};

export function normalizeClients(backend: unknown): unknown[] {
  return normalizeArray(backend, normalizeClient);
}

export function normalizeMessages(backend: unknown): unknown[] {
  return normalizeArray(backend, normalizeMessage);
}
