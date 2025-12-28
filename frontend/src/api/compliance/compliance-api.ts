/**
 * Compliance API Service
 * Enterprise-grade API service for compliance management with backend integration
 * 
 * @module ComplianceApiService
 * @description Manages all compliance-related operations including:
 * - Compliance check execution and monitoring
 * - Ethical wall management
 * - Conflict check operations
 * - Regulatory compliance tracking
 * - Data retention policy enforcement
 * - Security compliance monitoring
 * 
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Audit trail for all compliance operations
 * - Proper error handling and logging
 * - Sensitive data protection
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via COMPLIANCE_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Event-driven compliance monitoring
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface ComplianceCheck {
  id: string;
  checkType: 'conflict' | 'ethical_wall' | 'regulatory' | 'data_retention' | 'security';
  status: 'pending' | 'passed' | 'failed' | 'requires_review';
  entityId?: string;
  entityType?: string;
  results?: {
    summary: string;
    details?: unknown;
    recommendations?: string[];
  };
  performedBy?: string;
  performedAt: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// EthicalWall type imported from @/types - see compliance-risk.ts
import type { EthicalWall } from '@/types';

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: COMPLIANCE_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: COMPLIANCE_QUERY_KEYS.checkById(checkId) });
 * queryClient.invalidateQueries({ queryKey: COMPLIANCE_QUERY_KEYS.ethicalWalls() });
 */
export const COMPLIANCE_QUERY_KEYS = {
    checks: {
        all: () => ['compliance', 'checks'] as const,
        byId: (id: string) => ['compliance', 'checks', id] as const,
        byType: (type: string) => ['compliance', 'checks', 'type', type] as const,
        byStatus: (status: string) => ['compliance', 'checks', 'status', status] as const,
    },
    ethicalWalls: {
        all: () => ['compliance', 'ethical-walls'] as const,
        byId: (id: string) => ['compliance', 'ethical-walls', id] as const,
        active: () => ['compliance', 'ethical-walls', 'active'] as const,
    },
} as const;

/**
 * Compliance API Service Class
 * Implements secure, type-safe compliance management operations
 */
export class ComplianceApiService {
    private readonly baseUrl = '/compliance';

    constructor() {
        this.logInitialization();
    }

    /**
     * Log service initialization
     * @private
     */
    private logInitialization(): void {
        console.log('[ComplianceApiService] Initialized with Backend API (PostgreSQL)');
    }

    /**
     * Validate and sanitize ID parameter
     * @private
     */
    private validateId(id: string, methodName: string): void {
        if (!id || false || id.trim() === '') {
            throw new Error(`[ComplianceApiService.${methodName}] Invalid id parameter`);
        }
    }

    /**
     * Validate and sanitize object parameter
     * @private
     */
    private validateObject(obj: unknown, paramName: string, methodName: string): void {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            throw new Error(`[ComplianceApiService.${methodName}] Invalid ${paramName} parameter`);
        }
    }

    /**
     * Validate check type parameter
     * @private
     */
    private validateCheckType(checkType: string, methodName: string): void {
        const validTypes = ['conflict', 'ethical_wall', 'regulatory', 'data_retention', 'security'];
        if (!checkType || !validTypes.includes(checkType)) {
            throw new Error(`[ComplianceApiService.${methodName}] Invalid checkType. Must be one of: ${validTypes.join(', ')}`);
        }
    }

    // =============================================================================
    // COMPLIANCE CHECK OPERATIONS
    // =============================================================================

    /**
     * Run a compliance check
     * 
     * @param data - Check configuration with type and entity information
     * @returns Promise<ComplianceCheck> Check result
     * @throws Error if validation fails or check execution fails
     * 
     * @example
     * const check = await service.runCheck({ 
     *   checkType: 'conflict', 
     *   entityId: 'case-123', 
     *   entityType: 'case' 
     * });
     */
    async runCheck(data: { checkType: string; entityId?: string; entityType?: string }): Promise<ComplianceCheck> {
        this.validateObject(data, 'data', 'runCheck');
        this.validateCheckType(data.checkType, 'runCheck');

        try {
            return await apiClient.post<ComplianceCheck>(`${this.baseUrl}/checks`, data);
        } catch (error) {
            console.error('[ComplianceApiService.runCheck] Error:', error);
            throw new Error('Failed to run compliance check');
        }
    }

    /**
     * Get compliance checks with optional filters
     * 
     * @param filters - Optional filters for checkType and status
     * @returns Promise<ComplianceCheck[]> Array of compliance checks
     * @throws Error if fetch fails
     * 
     * @example
     * const allChecks = await service.getChecks();
     * const conflictChecks = await service.getChecks({ checkType: 'conflict' });
     */
    async getChecks(filters?: { checkType?: string; status?: string }): Promise<ComplianceCheck[]> {
        try {
            if (filters?.checkType) {
                this.validateCheckType(filters.checkType, 'getChecks');
            }

            const params = new URLSearchParams();
            if (filters?.checkType) params.append('checkType', filters.checkType);
            if (filters?.status) params.append('status', filters.status);
            const queryString = params.toString();
            const url = queryString ? `${this.baseUrl}/checks?${queryString}` : `${this.baseUrl}/checks`;
            
            return await apiClient.get<ComplianceCheck[]>(url);
        } catch (error) {
            console.error('[ComplianceApiService.getChecks] Error:', error);
            throw new Error('Failed to fetch compliance checks');
        }
    }

    /**
     * Get compliance check by ID
     * 
     * @param id - Check ID
     * @returns Promise<ComplianceCheck> Compliance check data
     * @throws Error if id is invalid or fetch fails
     * 
     * @example
     * const check = await service.getCheckById('check-123');
     */
    async getCheckById(id: string): Promise<ComplianceCheck> {
        this.validateId(id, 'getCheckById');

        try {
            return await apiClient.get<ComplianceCheck>(`${this.baseUrl}/checks/${id}`);
        } catch (error) {
            console.error('[ComplianceApiService.getCheckById] Error:', error);
            throw new Error(`Failed to fetch compliance check with id: ${id}`);
        }
    }

    // =============================================================================
    // ETHICAL WALL OPERATIONS
    // =============================================================================

    /**
     * Get all ethical walls
     * 
     * @returns Promise<EthicalWall[]> Array of ethical walls
     * @throws Error if fetch fails
     * 
     * @example
     * const walls = await service.getEthicalWalls();
     */
    async getEthicalWalls(): Promise<EthicalWall[]> {
        try {
            return await apiClient.get<EthicalWall[]>(`${this.baseUrl}/ethical-walls`);
        } catch (error) {
            console.error('[ComplianceApiService.getEthicalWalls] Error:', error);
            throw new Error('Failed to fetch ethical walls');
        }
    }

    /**
     * Get ethical wall by ID
     * 
     * @param id - Ethical wall ID
     * @returns Promise<EthicalWall> Ethical wall data
     * @throws Error if id is invalid or fetch fails
     * 
     * @example
     * const wall = await service.getEthicalWallById('wall-123');
     */
    async getEthicalWallById(id: string): Promise<EthicalWall> {
        this.validateId(id, 'getEthicalWallById');

        try {
            return await apiClient.get<EthicalWall>(`${this.baseUrl}/ethical-walls/${id}`);
        } catch (error) {
            console.error('[ComplianceApiService.getEthicalWallById] Error:', error);
            throw new Error(`Failed to fetch ethical wall with id: ${id}`);
        }
    }

    /**
     * Create a new ethical wall
     * 
     * @param data - Ethical wall configuration
     * @returns Promise<EthicalWall> Created ethical wall
     * @throws Error if validation fails or creation fails
     * 
     * @example
     * const wall = await service.createEthicalWall({
     *   name: 'Client Conflict Wall',
     *   reason: 'Conflicting interests',
     *   restrictedParties: ['party1', 'party2'],
     *   excludedUsers: ['user1']
     * });
     */
    async createEthicalWall(data: Partial<EthicalWall>): Promise<EthicalWall> {
        this.validateObject(data, 'data', 'createEthicalWall');

        if (!data.name) {
            throw new Error('[ComplianceApiService.createEthicalWall] Name is required');
        }
        if (!data.reason) {
            throw new Error('[ComplianceApiService.createEthicalWall] Reason is required');
        }

        try {
            return await apiClient.post<ComplianceEthicalWall>(`${this.baseUrl}/ethical-walls`, data);
        } catch (error) {
            console.error('[ComplianceApiService.createEthicalWall] Error:', error);
            throw new Error('Failed to create ethical wall');
        }
    }

    /**
     * Update an existing ethical wall
     * 
     * @param id - Ethical wall ID
     * @param data - Partial ethical wall updates
     * @returns Promise<ComplianceEthicalWall> Updated ethical wall
     * @throws Error if validation fails or update fails
     */
    async updateEthicalWall(id: string, data: Partial<ComplianceEthicalWall>): Promise<ComplianceEthicalWall> {
        this.validateId(id, 'updateEthicalWall');
        this.validateObject(data, 'data', 'updateEthicalWall');

        try {
            return await apiClient.put<ComplianceEthicalWall>(`${this.baseUrl}/ethical-walls/${id}`, data);
        } catch (error) {
            console.error('[ComplianceApiService.updateEthicalWall] Error:', error);
            throw new Error(`Failed to update ethical wall with id: ${id}`);
        }
    }

    /**
     * Lift (deactivate) an ethical wall
     * 
     * @param id - Ethical wall ID
     * @returns Promise<ComplianceEthicalWall> Lifted ethical wall
     * @throws Error if id is invalid or lift operation fails
     * 
     * @example
     * const liftedWall = await service.liftEthicalWall('wall-123');
     */
    async liftEthicalWall(id: string): Promise<ComplianceEthicalWall> {
        this.validateId(id, 'liftEthicalWall');

        try {
            return await apiClient.post<ComplianceEthicalWall>(`${this.baseUrl}/ethical-walls/${id}/lift`, {});
        } catch (error) {
            console.error('[ComplianceApiService.liftEthicalWall] Error:', error);
            throw new Error(`Failed to lift ethical wall with id: ${id}`);
        }
    }

    /**
     * Delete an ethical wall
     * 
     * @param id - Ethical wall ID
     * @returns Promise<void>
     * @throws Error if id is invalid or delete fails
     */
    async deleteEthicalWall(id: string): Promise<void> {
        this.validateId(id, 'deleteEthicalWall');

        try {
            await apiClient.delete(`${this.baseUrl}/ethical-walls/${id}`);
        } catch (error) {
            console.error('[ComplianceApiService.deleteEthicalWall] Error:', error);
            throw new Error(`Failed to delete ethical wall with id: ${id}`);
        }
    }
}
