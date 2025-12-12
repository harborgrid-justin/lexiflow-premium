import { Injectable, Logger } from '@nestjs/common';
import { AuditTrailService, AuditEntry, AuditAction, AuditCategory, AuditSeverity } from './audit-trail.service';

export interface SearchQuery {
  keywords?: string[];
  userId?: string;
  userEmail?: string;
  userName?: string;
  action?: AuditAction[];
  category?: AuditCategory[];
  severity?: AuditSeverity[];
  resourceType?: string[];
  resourceId?: string[];
  ipAddress?: string;
  sessionId?: string;
  organizationId?: string;
  successful?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity' | 'action';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  entries: AuditEntry[];
  total: number;
  query: SearchQuery;
  executionTime: number;
  facets: SearchFacets;
}

export interface SearchFacets {
  users: Map<string, number>;
  actions: Map<AuditAction, number>;
  categories: Map<AuditCategory, number>;
  severities: Map<AuditSeverity, number>;
  resourceTypes: Map<string, number>;
  ipAddresses: Map<string, number>;
  dateHistogram: Array<{ date: string; count: number }>;
}

export interface SavedSearch {
  id: string;
  name: string;
  description: string;
  query: SearchQuery;
  createdBy: string;
  createdAt: Date;
  shared: boolean;
  alertEnabled: boolean;
  alertThreshold?: number;
}

@Injectable()
export class AuditSearchService {
  private readonly logger = new Logger(AuditSearchService.name);
  private savedSearches: Map<string, SavedSearch> = new Map();

  constructor(private readonly auditTrailService: AuditTrailService) {}

  /**
   * Advanced search across audit logs
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();

    // Start with all entries
    let { entries } = await this.auditTrailService.getAuditEntries({
      startDate: query.startDate,
      endDate: query.endDate,
      limit: 100000, // Get all for filtering
    });

    // Apply filters
    if (query.userId) {
      entries = entries.filter(e => e.userId === query.userId);
    }

    if (query.userEmail) {
      entries = entries.filter(e => e.userEmail.toLowerCase().includes(query.userEmail!.toLowerCase()));
    }

    if (query.userName) {
      entries = entries.filter(e => e.userName.toLowerCase().includes(query.userName!.toLowerCase()));
    }

    if (query.action && query.action.length > 0) {
      entries = entries.filter(e => query.action!.includes(e.action));
    }

    if (query.category && query.category.length > 0) {
      entries = entries.filter(e => query.category!.includes(e.category));
    }

    if (query.severity && query.severity.length > 0) {
      entries = entries.filter(e => query.severity!.includes(e.severity));
    }

    if (query.resourceType && query.resourceType.length > 0) {
      entries = entries.filter(e => query.resourceType!.includes(e.resourceType));
    }

    if (query.resourceId && query.resourceId.length > 0) {
      entries = entries.filter(e => query.resourceId!.includes(e.resourceId));
    }

    if (query.ipAddress) {
      entries = entries.filter(e => e.ipAddress === query.ipAddress);
    }

    if (query.sessionId) {
      entries = entries.filter(e => e.sessionId === query.sessionId);
    }

    if (query.organizationId) {
      entries = entries.filter(e => e.organizationId === query.organizationId);
    }

    if (query.successful !== undefined) {
      entries = entries.filter(e => e.successful === query.successful);
    }

    // Keyword search in description and metadata
    if (query.keywords && query.keywords.length > 0) {
      entries = entries.filter(e => {
        const searchText = `${e.description} ${JSON.stringify(e.metadata)}`.toLowerCase();
        return query.keywords!.some(keyword => searchText.includes(keyword.toLowerCase()));
      });
    }

    // Calculate facets before pagination
    const facets = this.calculateFacets(entries);

    // Sort results
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';

    entries.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'timestamp':
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        case 'severity':
          const severityOrder = {
            [AuditSeverity.CRITICAL]: 4,
            [AuditSeverity.ERROR]: 3,
            [AuditSeverity.WARNING]: 2,
            [AuditSeverity.INFO]: 1,
          };
          aValue = severityOrder[a.severity];
          bValue = severityOrder[b.severity];
          break;
        case 'action':
          aValue = a.action;
          bValue = b.action;
          break;
        default:
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const total = entries.length;
    const offset = query.offset || 0;
    const limit = query.limit || 100;

    const paginated = entries.slice(offset, offset + limit);
    const executionTime = Date.now() - startTime;

    this.logger.log(
      `Search completed: ${total} results found in ${executionTime}ms`,
    );

    return {
      entries: paginated,
      total,
      query,
      executionTime,
      facets,
    };
  }

  /**
   * Calculate search facets for filtering
   */
  private calculateFacets(entries: AuditEntry[]): SearchFacets {
    const users = new Map<string, number>();
    const actions = new Map<AuditAction, number>();
    const categories = new Map<AuditCategory, number>();
    const severities = new Map<AuditSeverity, number>();
    const resourceTypes = new Map<string, number>();
    const ipAddresses = new Map<string, number>();
    const dateHistogram: Array<{ date: string; count: number }> = [];

    // Count occurrences
    entries.forEach(entry => {
      users.set(entry.userName, (users.get(entry.userName) || 0) + 1);
      actions.set(entry.action, (actions.get(entry.action) || 0) + 1);
      categories.set(entry.category, (categories.get(entry.category) || 0) + 1);
      severities.set(entry.severity, (severities.get(entry.severity) || 0) + 1);
      resourceTypes.set(entry.resourceType, (resourceTypes.get(entry.resourceType) || 0) + 1);
      ipAddresses.set(entry.ipAddress, (ipAddresses.get(entry.ipAddress) || 0) + 1);
    });

    // Build date histogram (by day)
    const dateGroups = new Map<string, number>();
    entries.forEach(entry => {
      const dateKey = entry.timestamp.toISOString().split('T')[0];
      dateGroups.set(dateKey, (dateGroups.get(dateKey) || 0) + 1);
    });

    Array.from(dateGroups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([date, count]) => {
        dateHistogram.push({ date, count });
      });

    return {
      users,
      actions,
      categories,
      severities,
      resourceTypes,
      ipAddresses,
      dateHistogram,
    };
  }

  /**
   * Full-text search across audit logs
   */
  async fullTextSearch(searchText: string, options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<SearchResult> {
    const keywords = searchText.toLowerCase().split(/\s+/).filter(k => k.length > 0);

    return this.search({
      keywords,
      startDate: options?.startDate,
      endDate: options?.endDate,
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  /**
   * Search by user
   */
  async searchByUser(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    action?: AuditAction[];
    limit?: number;
  }): Promise<SearchResult> {
    return this.search({
      userId,
      startDate: options?.startDate,
      endDate: options?.endDate,
      action: options?.action,
      limit: options?.limit,
    });
  }

  /**
   * Search by resource
   */
  async searchByResource(
    resourceType: string,
    resourceId?: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      action?: AuditAction[];
      limit?: number;
    },
  ): Promise<SearchResult> {
    return this.search({
      resourceType: [resourceType],
      resourceId: resourceId ? [resourceId] : undefined,
      startDate: options?.startDate,
      endDate: options?.endDate,
      action: options?.action,
      limit: options?.limit,
    });
  }

  /**
   * Search failed operations
   */
  async searchFailedOperations(options?: {
    startDate?: Date;
    endDate?: Date;
    category?: AuditCategory[];
    limit?: number;
  }): Promise<SearchResult> {
    return this.search({
      successful: false,
      startDate: options?.startDate,
      endDate: options?.endDate,
      category: options?.category,
      limit: options?.limit,
    });
  }

  /**
   * Search critical events
   */
  async searchCriticalEvents(options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<SearchResult> {
    return this.search({
      severity: [AuditSeverity.CRITICAL, AuditSeverity.ERROR],
      startDate: options?.startDate,
      endDate: options?.endDate,
      limit: options?.limit,
    });
  }

  /**
   * Search by IP address
   */
  async searchByIP(ipAddress: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<SearchResult> {
    return this.search({
      ipAddress,
      startDate: options?.startDate,
      endDate: options?.endDate,
      limit: options?.limit,
    });
  }

  /**
   * Search by session
   */
  async searchBySession(sessionId: string): Promise<SearchResult> {
    return this.search({
      sessionId,
      sortBy: 'timestamp',
      sortOrder: 'asc',
      limit: 10000,
    });
  }

  /**
   * Save a search query
   */
  async saveSearch(
    name: string,
    description: string,
    query: SearchQuery,
    createdBy: string,
    shared: boolean = false,
    alertEnabled: boolean = false,
    alertThreshold?: number,
  ): Promise<SavedSearch> {
    const savedSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name,
      description,
      query,
      createdBy,
      createdAt: new Date(),
      shared,
      alertEnabled,
      alertThreshold,
    };

    this.savedSearches.set(savedSearch.id, savedSearch);
    this.logger.log(`Saved search created: ${name} by ${createdBy}`);

    return savedSearch;
  }

  /**
   * Get saved search
   */
  async getSavedSearch(searchId: string): Promise<SavedSearch | null> {
    return this.savedSearches.get(searchId) || null;
  }

  /**
   * Get all saved searches
   */
  async getSavedSearches(userId?: string): Promise<SavedSearch[]> {
    let searches = Array.from(this.savedSearches.values());

    if (userId) {
      searches = searches.filter(s => s.createdBy === userId || s.shared);
    }

    return searches.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Execute saved search
   */
  async executeSavedSearch(searchId: string): Promise<SearchResult> {
    const savedSearch = this.savedSearches.get(searchId);
    if (!savedSearch) {
      throw new Error(`Saved search not found: ${searchId}`);
    }

    const result = await this.search(savedSearch.query);

    // Check alert threshold
    if (savedSearch.alertEnabled && savedSearch.alertThreshold) {
      if (result.total >= savedSearch.alertThreshold) {
        this.logger.warn(
          `Alert threshold exceeded for saved search "${savedSearch.name}": ${result.total} >= ${savedSearch.alertThreshold}`,
        );
        // In production, trigger alert notification
      }
    }

    return result;
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(searchId: string): Promise<void> {
    this.savedSearches.delete(searchId);
    this.logger.log(`Deleted saved search: ${searchId}`);
  }

  /**
   * Get search suggestions based on recent queries
   */
  async getSearchSuggestions(): Promise<string[]> {
    // In production, would analyze recent searches and suggest common patterns
    return [
      'failed login attempts',
      'critical events',
      'data exports',
      'permission changes',
      'security incidents',
      'unauthorized access',
      'configuration changes',
    ];
  }

  /**
   * Build complex query
   */
  buildQuery(): QueryBuilder {
    return new QueryBuilder(this);
  }
}

/**
 * Fluent query builder for complex searches
 */
export class QueryBuilder {
  private query: SearchQuery = {};

  constructor(private searchService: AuditSearchService) {}

  byUser(userId: string): this {
    this.query.userId = userId;
    return this;
  }

  byUserEmail(email: string): this {
    this.query.userEmail = email;
    return this;
  }

  withAction(...actions: AuditAction[]): this {
    this.query.action = actions;
    return this;
  }

  withCategory(...categories: AuditCategory[]): this {
    this.query.category = categories;
    return this;
  }

  withSeverity(...severities: AuditSeverity[]): this {
    this.query.severity = severities;
    return this;
  }

  forResource(resourceType: string, resourceId?: string): this {
    this.query.resourceType = [resourceType];
    if (resourceId) {
      this.query.resourceId = [resourceId];
    }
    return this;
  }

  fromIP(ipAddress: string): this {
    this.query.ipAddress = ipAddress;
    return this;
  }

  inSession(sessionId: string): this {
    this.query.sessionId = sessionId;
    return this;
  }

  successful(value: boolean = true): this {
    this.query.successful = value;
    return this;
  }

  failed(): this {
    return this.successful(false);
  }

  between(startDate: Date, endDate: Date): this {
    this.query.startDate = startDate;
    this.query.endDate = endDate;
    return this;
  }

  since(startDate: Date): this {
    this.query.startDate = startDate;
    return this;
  }

  until(endDate: Date): this {
    this.query.endDate = endDate;
    return this;
  }

  withKeywords(...keywords: string[]): this {
    this.query.keywords = keywords;
    return this;
  }

  limit(limit: number): this {
    this.query.limit = limit;
    return this;
  }

  offset(offset: number): this {
    this.query.offset = offset;
    return this;
  }

  sortBy(field: 'timestamp' | 'severity' | 'action', order: 'asc' | 'desc' = 'desc'): this {
    this.query.sortBy = field;
    this.query.sortOrder = order;
    return this;
  }

  async execute(): Promise<SearchResult> {
    return this.searchService.search(this.query);
  }
}
