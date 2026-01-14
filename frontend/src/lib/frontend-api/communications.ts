/**
 * Communications Frontend API
 * Domain contract for clients, messages, and communications
 */

import { normalizeClient, normalizeClients, normalizeMessage, normalizeMessages } from "../normalization/communications";
import { client, failure, type Result, success, ValidationError } from "./index";

// Clients
export async function getAllClients(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown>("/clients");

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeClients(items));
}

export async function getClientById(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Client ID is required"));

  const result = await client.get<unknown>(`/clients/${id}`);
  if (!result.ok) return result;

  return success(normalizeClient(result.data));
}

export async function createClient(input: Record<string, unknown>): Promise<Result<unknown>> {
  const result = await client.post<unknown>("/clients", input);

  if (!result.ok) return result;
  return success(normalizeClient(result.data));
}

export async function updateClient(id: string, input: Record<string, unknown>): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Client ID is required"));

  const result = await client.patch<unknown>(`/clients/${id}`, input);

  if (!result.ok) return result;
  return success(normalizeClient(result.data));
}

// Messages
export async function getAllMessages(filters?: { caseId?: string }): Promise<Result<unknown[]>> {
  const params = filters || {};
  const result = await client.get<unknown>("/messages", { params });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeMessages(items));
}

export async function getMessageById(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Message ID is required"));

  const result = await client.get<unknown>(`/messages/${id}`);
  if (!result.ok) return result;

  return success(normalizeMessage(result.data));
}

export async function sendMessage(input: Record<string, unknown>): Promise<Result<unknown>> {
  const result = await client.post<unknown>("/messages", input);

  if (!result.ok) return result;
  return success(normalizeMessage(result.data));
}

export const communicationsApi = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  getAllMessages,
  getMessageById,
  sendMessage,
};
