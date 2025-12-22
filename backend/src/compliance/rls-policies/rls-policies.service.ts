import { Injectable } from '@nestjs/common';
import {
  RlsPolicyDto,
  CreateRlsPolicyDto,
  UpdateRlsPolicyDto,
  QueryRlsPoliciesDto,
  EvaluateRlsPolicyDto,
  RlsPolicyEvaluationResult,
  RlsOperation,
} from './dto/rls-policy.dto';

@Injectable()
export class RlsPoliciesService {
  private rlsPolicies: Map<string, RlsPolicyDto> = new Map();

  async create(dto: CreateRlsPolicyDto): Promise<RlsPolicyDto> {
    const policy: RlsPolicyDto = {
      id: this.generateId(),
      ...dto,
      priority: dto.priority || 100,
      enabled: dto.enabled !== undefined ? dto.enabled : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rlsPolicies.set(policy.id, policy);
    return policy;
  }

  async findAll(query: QueryRlsPoliciesDto): Promise<{
    data: RlsPolicyDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    let policies = Array.from(this.rlsPolicies.values());

    // Apply filters
    if (query.table) {
      policies = policies.filter(
        (policy) => policy.table.toLowerCase() === query.table.toLowerCase(),
      );
    }
    if (query.operation) {
      policies = policies.filter(
        (policy) =>
          policy.operation === query.operation ||
          policy.operation === RlsOperation.ALL,
      );
    }
    if (query.role) {
      policies = policies.filter((policy) =>
        policy.roles.includes(query.role),
      );
    }
    if (query.enabled !== undefined) {
      policies = policies.filter((policy) => policy.enabled === query.enabled);
    }

    // Sort by priority (lower number = higher priority)
    policies.sort((a, b) => a.priority - b.priority);

    // Paginate
    const page = query.page || 1;
    const limit = query.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPolicies = policies.slice(startIndex, endIndex);

    return {
      data: paginatedPolicies,
      total: policies.length,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<RlsPolicyDto> {
    const policy = this.rlsPolicies.get(id);
    if (!policy) {
      throw new Error(`RLS policy with ID ${id} not found`);
    }
    return policy;
  }

  async update(
    id: string,
    dto: UpdateRlsPolicyDto,
  ): Promise<RlsPolicyDto> {
    const policy = await this.findOne(id);

    const updatedPolicy: RlsPolicyDto = {
      ...policy,
      ...dto,
      updatedAt: new Date(),
    };

    this.rlsPolicies.set(id, updatedPolicy);
    return updatedPolicy;
  }

  async remove(id: string): Promise<void> {
    const _policy = await this.findOne(id);
    this.rlsPolicies.delete(id);
  }

  async evaluate(
    dto: EvaluateRlsPolicyDto,
  ): Promise<RlsPolicyEvaluationResult> {
    // Find applicable policies
    const applicablePolicies = Array.from(this.rlsPolicies.values())
      .filter((policy) => {
        if (!policy.enabled) return false;
        if (policy.table.toLowerCase() !== dto.table.toLowerCase())
          return false;
        if (
          policy.operation !== RlsOperation.ALL &&
          policy.operation !== dto.operation
        )
          return false;
        if (!policy.roles.includes(dto.userRole)) return false;

        return true;
      })
      .sort((a, b) => a.priority - b.priority);

    if (applicablePolicies.length === 0) {
      return {
        allowed: false,
        appliedPolicies: [],
        message: 'No matching RLS policies found. Access denied by default.',
      };
    }

    // Combine conditions using AND logic
    const conditions = applicablePolicies
      .map((policy) => this.interpolateCondition(policy.condition, dto.context))
      .filter((cond) => cond);

    const finalCondition = conditions.length > 0
      ? conditions.map((c) => `(${c})`).join(' AND ')
      : '';

    return {
      allowed: true,
      appliedPolicies: applicablePolicies,
      finalCondition,
      message: `Access granted with ${applicablePolicies.length} RLS policies applied.`,
    };
  }

  private interpolateCondition(
    condition: string,
    context: Record<string, unknown>,
  ): string {
    let result = condition;

    // Replace placeholders like {{userId}} with actual values
    for (const [key, value] of Object.entries(context)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, this.sanitizeValue(value));
    }

    return result;
  }

  private sanitizeValue(value: any): string {
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`; // SQL escape single quotes
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'boolean') {
      return value.toString();
    }
    if (value === null || value === undefined) {
      return 'NULL';
    }
    return `'${String(value)}'`;
  }

  private generateId(): string {
    return `rls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
