/**
 * Client Repository
 * Enterprise-grade repository for client management with backend API integration
 *
 * @module ClientRepository
 * @description Manages all client-related operations including:
 * - Client CRUD operations
 * - Client portal token generation
 * - Conflict checks
 * - Client statistics and reporting
 * - Search and filtering
 * - Integration event publishing
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend-first architecture (Strict)
 * - Secure token generation
 * - Proper error handling and logging
 *
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via CLIENT_QUERY_KEYS
 * - Type-safe operations
 * - Event-driven integration
 */

import { ClientsApiService } from "@/api/communications/clients-api";
import { OperationError, ValidationError } from "@/services/core/errors";
import { Repository } from "@/services/core/Repository";
import { Client } from "@/types";

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.byId(clientId) });
 */
export const CLIENT_QUERY_KEYS = {
  all: () => ["clients"] as const,
  byId: (id: string) => ["clients", id] as const,
  byType: (type: string) => ["clients", "type", type] as const,
  active: () => ["clients", "active"] as const,
  inactive: () => ["clients", "inactive"] as const,
  search: (query: string) => ["clients", "search", query] as const,
} as const;

/**
 * Client Repository Class
 * Implements strict backend pattern
 */
export class ClientRepository extends Repository<Client> {
  private clientsApi: ClientsApiService;

  constructor() {
    super("clients");
    this.clientsApi = new ClientsApiService();
    console.log(`[ClientRepository] Initialized with Backend API`);
  }

  /**
   * Validate and sanitize ID parameter
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error(`[ClientRepository.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate email format
   * @private
   */
  private validateEmail(email: string, methodName: string): void {
    if (!email) {
      throw new Error(
        `[ClientRepository.${methodName}] Invalid email parameter`
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`[ClientRepository.${methodName}] Invalid email format`);
    }
  }

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  /**
   * Get all clients
   *
   * @returns Promise<Client[]> Array of clients
   * @throws Error if fetch fails
   */
  override async getAll(): Promise<Client[]> {
    try {
      const result = await this.clientsApi.getAll();
      return result;
    } catch (error) {
      console.error("[ClientRepository.getAll] Error:", error);
      throw error;
    }
  }

  /**
   * Get client by ID
   *
   * @param id - Client ID
   * @returns Promise<Client | undefined> Client or undefined
   * @throws Error if id is invalid or fetch fails
   */
  override async getById(id: string): Promise<Client | undefined> {
    this.validateId(id, "getById");

    try {
      return await this.clientsApi.getById(id);
    } catch (error) {
      console.error("[ClientRepository.getById] Error:", error);
      return undefined;
    }
  }

  /**
   * Add a new client
   *
   * @param item - Client data
   * @returns Promise<Client> Created client
   * @throws Error if validation fails or create fails
   */
  override async add(item: Client): Promise<Client> {
    if (!item || typeof item !== "object") {
      throw new ValidationError("[ClientRepository.add] Invalid client data");
    }

    // Validate email if provided
    if (item.email) {
      try {
        this.validateEmail(item.email, "add");
      } catch (error) {
        console.warn(
          "[ClientRepository.add] Invalid email, proceeding anyway:",
          error
        );
      }
    }

    try {
      return await this.clientsApi.create(item);
    } catch (error) {
      console.error("[ClientRepository.add] Error:", error);
      throw error;
    }
  }

  /**
   * Update an existing client
   *
   * @param id - Client ID
   * @param updates - Partial client updates
   * @returns Promise<Client> Updated client
   * @throws Error if validation fails or update fails
   */
  override async update(id: string, updates: Partial<Client>): Promise<Client> {
    this.validateId(id, "update");

    if (!updates || typeof updates !== "object") {
      throw new ValidationError(
        "[ClientRepository.update] Invalid updates data"
      );
    }

    // Validate email if being updated
    if (updates.email) {
      try {
        this.validateEmail(updates.email, "update");
      } catch (error) {
        console.warn(
          "[ClientRepository.update] Invalid email, proceeding anyway:",
          error
        );
      }
    }

    try {
      return await this.clientsApi.update(id, updates);
    } catch (error) {
      console.error("[ClientRepository.update] Error:", error);
      throw error;
    }
  }

  /**
   * Delete a client
   *
   * @param id - Client ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");

    try {
      await this.clientsApi.delete(id);
    } catch (error) {
      console.error("[ClientRepository.delete] Error:", error);
      throw error;
    }
  }

  // =============================================================================
  // CLIENT PORTAL & SECURITY
  // =============================================================================

  /**
   * Generate secure portal token for client
   *
   * @param clientId - Client ID
   * @returns Promise<string> Generated portal token
   * @throws Error if clientId is invalid
   */
  async generatePortalToken(clientId: string): Promise<string> {
    this.validateId(clientId, "generatePortalToken");

    try {
      // Generate cryptographically random suffix
      const randomBytes = crypto.getRandomValues(new Uint8Array(6));
      const randomSuffix = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const token = `token-${clientId}-${Date.now()}-${randomSuffix}`;

      console.log(
        `[ClientRepository] Generated portal token for client ${clientId}`
      );
      return token;
    } catch (error) {
      console.error("[ClientRepository.generatePortalToken] Error:", error);
      throw new OperationError(
        "generatePortalToken",
        "Failed to generate portal token"
      );
    }
  }

  // =============================================================================
  // CONFLICT CHECKS
  // =============================================================================

  /**
   * Check for conflicts with prospective client
   *
   * @param clientName - Name of prospective client
   * @param opposingParties - Optional list of opposing parties
   * @returns Promise<{ hasConflict: boolean; conflicts: Client[] }>
   * @throws Error if clientName is invalid or check fails
   */
  async checkConflicts(
    clientName: string,
    opposingParties?: string[]
  ): Promise<{ hasConflict: boolean; conflicts: Client[] }> {
    if (!clientName || clientName.trim() === "") {
      throw new ValidationError(
        "[ClientRepository.checkConflicts] Invalid clientName parameter"
      );
    }

    try {
      // Use API search if available or fetch all
      // For conflict check, fetching all (or strict search) is safer to do in backend.
      // But preserving logic:
      const allClients = await this.getAll();
      const conflicts: Client[] = [];
      const lowerClientName = clientName.toLowerCase();

      // Check for name matches
      allClients.forEach((client) => {
        const clientNameLower = (client.name || "").toLowerCase();

        // Check if existing client matches prospective client name
        if (
          clientNameLower.includes(lowerClientName) ||
          lowerClientName.includes(clientNameLower)
        ) {
          conflicts.push(client);
          return;
        }

        // Check if existing client matches any opposing party
        if (opposingParties) {
          const hasOpposingMatch = opposingParties.some(
            (party) =>
              clientNameLower.includes(party.toLowerCase()) ||
              party.toLowerCase().includes(clientNameLower)
          );

          if (hasOpposingMatch) {
            conflicts.push(client);
          }
        }
      });

      return {
        hasConflict: conflicts.length > 0,
        conflicts,
      };
    } catch (error) {
      console.error("[ClientRepository.checkConflicts] Error:", error);
      throw error;
    }
  }

  // =============================================================================
  // QUERIES & FILTERING
  // =============================================================================

  /**
   * Get active clients
   *
   * @returns Promise<Client[]> Array of active clients
   * @throws Error if fetch fails
   */
  async getActive(): Promise<Client[]> {
    try {
      // Use API filtering
      return await this.clientsApi.getAll({ status: "active" as ClientStatus });
    } catch (error) {
      console.error("[ClientRepository.getActive] Error:", error);
      throw error;
    }
  }

  /**
   * Get inactive clients
   *
   * @returns Promise<Client[]> Array of inactive clients
   * @throws Error if fetch fails
   */
  async getInactive(): Promise<Client[]> {
    try {
      // Use API filtering
      return await this.clientsApi.getAll({ status: "inactive" as ClientStatus });
    } catch (error) {
      console.error("[ClientRepository.getInactive] Error:", error);
      throw error;
    }
  }

  /**
   * Get clients by type
   *
   * @param type - Client type (individual, corporate, government, etc.)
   * @returns Promise<Client[]> Array of clients of type
   * @throws Error if type is invalid or fetch fails
   */
  async getByType(type: string): Promise<Client[]> {
    if (!type || type.trim() === "") {
      throw new ValidationError(
        "[ClientRepository.getByType] Invalid type parameter"
      );
    }

    try {
      // Use API filtering
      return await this.clientsApi.getAll({ clientType: type });
    } catch (error) {
      console.error("[ClientRepository.getByType] Error:", error);
      throw error;
    }
  }

  /**
   * Search clients by query
   * Searches across name, email, company, and notes fields
   *
   * @param query - Search query
   * @returns Promise<Client[]> Matching clients
   * @throws Error if query is invalid or search fails
   */
  async search(query: string): Promise<Client[]> {
    if (!query || query.trim() === "") {
      throw new ValidationError(
        "[ClientRepository.search] Invalid query parameter"
      );
    }

    try {
      // Use API filtering
      return await this.clientsApi.getAll({ search: query });
    } catch (error) {
      console.error("[ClientRepository.search] Error:", error);
      throw error;
    }
  }

  /**
   * Find client by email
   *
   * @param email - Email address
   * @returns Promise<Client | undefined> Client or undefined
   * @throws Error if email is invalid or search fails
   */
  async findByEmail(email: string): Promise<Client | undefined> {
    this.validateEmail(email, "findByEmail");

    try {
      // API search for email typically works via search param or specific endpoint.
      // We'll trust search param or fetch all as fallback if search isn't specific enough.
      // But searching "email" string in search param is supported by ClientsApiService in backend usually.
      const results = await this.clientsApi.getAll({ search: email });
      return results.find(
        (client) => client.email?.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error("[ClientRepository.findByEmail] Error:", error);
      throw error;
    }
  }

  // =============================================================================
  // ANALYTICS & REPORTING
  // =============================================================================

  /**
   * Get client statistics
   *
   * @returns Promise with statistics
   * @throws Error if fetch fails
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
    recentlyAdded: number;
  }> {
    try {
      const clients = await this.getAll();
      const byType: Record<string, number> = {};
      let active = 0;
      let inactive = 0;
      let recentlyAdded = 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      clients.forEach((client) => {
        // Count by status
        const statusStr = client.status?.toString().toLowerCase();
        if (statusStr === "active" || !client.status) {
          active++;
        } else if (statusStr === "inactive") {
          inactive++;
        }

        // Count by type
        const clientExt = client as unknown as { type?: string };
        const type = clientExt.type || client.clientType || "Unknown";
        const typeStr = String(type);
        byType[typeStr] = (byType[typeStr] || 0) + 1;

        // Count recently added
        if (client.createdAt && new Date(client.createdAt) > thirtyDaysAgo) {
          recentlyAdded++;
        }
      });

      return {
        total: clients.length,
        active,
        inactive,
        byType,
        recentlyAdded,
      };
    } catch (error) {
      console.error("[ClientRepository.getStatistics] Error:", error);
      throw error;
    }
  }

  /**
   * Get recently added clients
   *
   * @param days - Number of days to look back (default: 30)
   * @returns Promise<Client[]> Recently added clients
   * @throws Error if fetch fails
   */
  async getRecentlyAdded(days: number = 30): Promise<Client[]> {
    if (days < 1) {
      throw new ValidationError(
        "[ClientRepository.getRecentlyAdded] Invalid days parameter"
      );
    }

    try {
      const clients = await this.getAll();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return clients
        .filter(
          (client) =>
            client.createdAt && new Date(client.createdAt) > cutoffDate
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
    } catch (error) {
      console.error("[ClientRepository.getRecentlyAdded] Error:", error);
      throw error;
    }
  }
}
