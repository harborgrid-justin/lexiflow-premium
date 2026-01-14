/**
 * Communications Frontend API
 * Enterprise-grade API layer for clients, messages, and communications
 *
 * @module lib/frontend-api/communications
 * @description Domain-level contract for communications operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 *
 * Covers:
 * - Client management
 * - Messaging and communications
 * - Contact management
 * - Communication history
 * - Templates
 */

import type { Client, Message } from "@/types";
import type { NotificationDTO } from "@/types/notifications";
import {
  normalizeClient,
  normalizeClients,
  normalizeMessage,
  normalizeMessages,
} from "../normalization/communications";
import { client } from "./client";
import { NotFoundError, ValidationError } from "./errors";
import type { PaginatedResult, Result } from "./types";
import { failure, success } from "./types";

/**
 * Client query filters
 */
export interface ClientFilters {
  status?: "active" | "inactive";
  type?: "individual" | "organization";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}

/**
 * Client creation input
 */
export interface CreateClientInput {
  name: string;
  email: string;
  phone?: string;
  type?: "individual" | "organization";
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Message query filters
 */
export interface MessageFilters {
  caseId?: string;
  clientId?: string;
  type?: "email" | "sms" | "note";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "date";
  sortOrder?: "asc" | "desc";
}

/**
 * Message creation input
 */
export interface CreateMessageInput {
  caseId?: string;
  clientId?: string;
  recipientId: string;
  subject?: string;
  body: string;
  type?: "email" | "sms" | "note";
  attachments?: string[];
}

// Clients

/**
 * Get all clients with optional filtering
 */
export async function getAllClients(
  filters?: ClientFilters
): Promise<Result<PaginatedResult<Client>>> {
  const params: Record<string, string | number> = {};

  if (filters?.status) params.status = filters.status;
  if (filters?.type) params.type = filters.type;
  if (filters?.search) params.search = filters.search;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

  const result = await client.get<unknown>("/clients", { params });

  if (!result.ok) return result;

  const response = result.data as Record<string, unknown>;
  const items = Array.isArray(response.data) ? response.data : [];
  const total =
    typeof response.total === "number" ? response.total : items.length;
  const page = typeof response.page === "number" ? response.page : 1;
  const pageSize =
    typeof response.pageSize === "number" ? response.pageSize : items.length;

  return success({
    data: normalizeClients(items),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

/**
 * Get client by ID
 */
export async function getClientById(id: string): Promise<Result<Client>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid client ID is required"));
  }

  const result = await client.get<unknown>(`/clients/${id}`);
  if (!result.ok) return result;

  if (!result.data) {
    return failure(new NotFoundError(`Client ${id} not found`));
  }

  return success(normalizeClient(result.data));
}

/**
 * Create client
 */
export async function createClient(
  input: CreateClientInput
): Promise<Result<Client>> {
  if (!input || typeof input !== "object") {
    return failure(new ValidationError("Client input is required"));
  }

  if (!input.name || typeof input.name !== "string") {
    return failure(new ValidationError("Client name is required"));
  }

  if (!input.email || typeof input.email !== "string") {
    return failure(new ValidationError("Client email is required"));
  }

  const result = await client.post<unknown>("/clients", input);

  if (!result.ok) return result;
  return success(normalizeClient(result.data));
}

/**
 * Update client
 */
export async function updateClient(
  id: string,
  input: Partial<CreateClientInput>
): Promise<Result<Client>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid client ID is required"));
  }

  if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
    return failure(new ValidationError("At least one field must be updated"));
  }

  const result = await client.patch<unknown>(`/clients/${id}`, input);

  if (!result.ok) return result;
  return success(normalizeClient(result.data));
}

/**
 * Delete client
 */
export async function deleteClient(id: string): Promise<Result<void>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid client ID is required"));
  }

  return client.delete<void>(`/clients/${id}`);
}

// Messages

/**
 * Get all messages with optional filtering
 */
export async function getAllMessages(
  filters?: MessageFilters
): Promise<Result<PaginatedResult<Message>>> {
  const params: Record<string, string | number> = {};

  if (filters?.caseId) params.caseId = filters.caseId;
  if (filters?.clientId) params.clientId = filters.clientId;
  if (filters?.type) params.type = filters.type;
  if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters?.dateTo) params.dateTo = filters.dateTo;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

  const result = await client.get<unknown>("/messages", { params });

  if (!result.ok) return result;

  const response = result.data as Record<string, unknown>;
  const items = Array.isArray(response.data) ? response.data : [];
  const total =
    typeof response.total === "number" ? response.total : items.length;
  const page = typeof response.page === "number" ? response.page : 1;
  const pageSize =
    typeof response.pageSize === "number" ? response.pageSize : items.length;

  return success({
    data: normalizeMessages(items),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

/**
 * Get message by ID
 */
export async function getMessageById(id: string): Promise<Result<Message>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid message ID is required"));
  }

  const result = await client.get<unknown>(`/messages/${id}`);
  if (!result.ok) return result;

  if (!result.data) {
    return failure(new NotFoundError(`Message ${id} not found`));
  }

  return success(normalizeMessage(result.data));
}

/**
 * Send message
 */
export async function sendMessage(
  input: CreateMessageInput
): Promise<Result<Message>> {
  if (!input || typeof input !== "object") {
    return failure(new ValidationError("Message input is required"));
  }

  if (!input.body || typeof input.body !== "string") {
    return failure(new ValidationError("Message body is required"));
  }

  if (!input.recipientId || typeof input.recipientId !== "string") {
    return failure(new ValidationError("Recipient ID is required"));
  }

  const result = await client.post<unknown>("/messages", input);

  if (!result.ok) return result;
  return success(normalizeMessage(result.data));
}

/**
 * Delete message
 */
export async function deleteMessage(id: string): Promise<Result<void>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid message ID is required"));
  }

  return client.delete<void>(`/messages/${id}`);
}

/**
 * Communications API module
 */
export const communicationsApi = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getAllMessages,
  getMessageById,
  sendMessage,
  deleteMessage,
  // Notification methods
  getAllNotifications: async (filters?: {
    page?: number;
    limit?: number;
  }): Promise<Result<PaginatedResult<NotificationDTO>>> => {
    return client.get<PaginatedResult<NotificationDTO>>(
      "/communications/notifications",
      {
        params: filters,
      }
    );
  },
} as const;
