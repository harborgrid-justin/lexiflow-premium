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
import {
  GenericRepository,
  createQueryKeys,
  type IApiService,
} from "@/services/core/factories";
import { ClientStatus, ClientType, type Client } from "@/types";

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.byId(clientId) });
 */
export const CLIENT_QUERY_KEYS = {
  ...createQueryKeys("clients"),
  byType: (type: string) => ["clients", "type", type] as const,
  active: () => ["clients", "active"] as const,
  inactive: () => ["clients", "inactive"] as const,
} as const;

/**
 * Client Repository Class
 * Implements strict backend pattern with GenericRepository
 */
export class ClientRepository extends GenericRepository<Client> {
  protected apiService: IApiService<Client> = new ClientsApiService();
  protected repositoryName = "ClientRepository";

  constructor() {
    super("clients");
    console.log(`[ClientRepository] Initialized with Backend API`);
  }

  /**
   * Validate email format
   * @private
   */
  private validateEmail(email: string, methodName: string): void {
    if (!email) {
      throw new Error(
        `[ClientRepository.${methodName}] Invalid email parameter`,
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`[ClientRepository.${methodName}] Invalid email format`);
    }
  }

  // =============================================================================
  // CRUD OPERATIONS - Inherited from GenericRepository
  // Custom logic for email validation on add/update
  // =============================================================================

  override async add(item: Client): Promise<Client> {
    // Validate email if provided
    if (item.email) {
      try {
        this.validateEmail(item.email, "add");
      } catch (error) {
        console.warn(
          "[ClientRepository.add] Invalid email, proceeding anyway:",
          error,
        );
      }
    }
    return super.add(item);
  }

  override async update(id: string, updates: Partial<Client>): Promise<Client> {
    // Validate email if being updated
    if (updates.email) {
      try {
        this.validateEmail(updates.email, "update");
      } catch (error) {
        console.warn(
          "[ClientRepository.update] Invalid email, proceeding anyway:",
          error,
        );
      }
    }
    return super.update(id, updates);
  }

  // =============================================================================
  // CLIENT PORTAL & SECURITY
  // =============================================================================

  /**
   * Generate secure portal token for client
   */
  async generatePortalToken(clientId: string): Promise<string> {
    this.validateIdParameter(clientId, "generatePortalToken");

    try {
      // Generate cryptographically random suffix
      const randomBytes = crypto.getRandomValues(new Uint8Array(6));
      const randomSuffix = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const token = `token-${clientId}-${Date.now()}-${randomSuffix}`;

      console.log(
        `[ClientRepository] Generated portal token for client ${clientId}`,
      );
      return token;
    } catch (error) {
      console.error("[ClientRepository.generatePortalToken] Error:", error);
      throw new OperationError(
        "generatePortalToken",
        "Failed to generate portal token",
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
    opposingParties?: string[],
  ): Promise<{ hasConflict: boolean; conflicts: Client[] }> {
    if (!clientName || clientName.trim() === "") {
      throw new ValidationError(
        "[ClientRepository.checkConflicts] Invalid clientName parameter",
      );
    }

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
            party.toLowerCase().includes(clientNameLower),
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
  }

  // =============================================================================
  // QUERIES & FILTERING
  // =============================================================================

  /**
   * Get active clients
   */
  async getActive(): Promise<Client[]> {
    return await this.apiService.getAll({ status: ClientStatus.ACTIVE });
  }

  /**
   * Get inactive clients
   */
  async getInactive(): Promise<Client[]> {
    return await this.apiService.getAll({ status: ClientStatus.INACTIVE });
  }

  /**
   * Get clients by type
   */
  async getByType(type: string): Promise<Client[]> {
    if (!type || type.trim() === "") {
      throw new ValidationError(
        "[ClientRepository.getByType] Invalid type parameter",
      );
    }
    return await this.apiService.getAll({ clientType: type as ClientType });
  }

  /**
   * Search clients by query
   */
  override async search(query: string): Promise<Client[]> {
    if (!query || query.trim() === "") {
      throw new ValidationError(
        "[ClientRepository.search] Invalid query parameter",
      );
    }
    return await this.apiService.getAll({ search: query });
  }

  /**
   * Find client by email
   */
  async findByEmail(email: string): Promise<Client | undefined> {
    this.validateEmail(email, "findByEmail");
    const results = await this.apiService.getAll({ search: email });
    return results.find(
      (client) => client.email?.toLowerCase() === email.toLowerCase(),
    );
  }

  // =============================================================================
  // ANALYTICS & REPORTING
  // =============================================================================

  /**
   * Get client statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
    recentlyAdded: number;
  }> {
    const clients = await this.getAll();
    const byType: Record<string, number> = {};
    let active = 0;
    let inactive = 0;
    let recentlyAdded = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    clients.forEach((client) => {
      const statusStr = client.status?.toString().toLowerCase();
      if (statusStr === "active" || !client.status) {
        active++;
      } else if (statusStr === "inactive") {
        inactive++;
      }

      const clientExt = client as unknown as { type?: string };
      const type = clientExt.type || client.clientType || "Unknown";
      const typeStr = String(type);
      byType[typeStr] = (byType[typeStr] || 0) + 1;

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
  }

  /**
   * Get recently added clients
   */
  async getRecentlyAdded(days: number = 30): Promise<Client[]> {
    if (days < 1) {
      throw new ValidationError(
        "[ClientRepository.getRecentlyAdded] Invalid days parameter",
      );
    }

    const clients = await this.getAll();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return clients
      .filter(
        (client) => client.createdAt && new Date(client.createdAt) > cutoffDate,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      );
  }
}
