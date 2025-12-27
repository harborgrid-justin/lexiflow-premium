import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export enum PolicyEffect {
  ALLOW = 'allow',
  DENY = 'deny',
}

export enum PolicyEvaluationMode {
  DENY_OVERRIDES = 'denyOverrides',
  ALLOW_OVERRIDES = 'allowOverrides',
  FIRST_APPLICABLE = 'firstApplicable',
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  effect: PolicyEffect;
  priority: number;
  conditions: PolicyCondition[];
  evaluationMode?: PolicyEvaluationMode;
  metadata?: Record<string, unknown>;
}

export interface PolicyCondition {
  type: ConditionType;
  operator: ConditionOperator;
  attribute: string;
  value: unknown;
  negate?: boolean;
}

export enum ConditionType {
  USER_ATTRIBUTE = 'userAttribute',
  RESOURCE_ATTRIBUTE = 'resourceAttribute',
  ENVIRONMENT_ATTRIBUTE = 'environmentAttribute',
  TIME_BASED = 'timeBased',
  LOCATION_BASED = 'locationBased',
  CUSTOM = 'custom',
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  GREATER_THAN_OR_EQUALS = 'greaterThanOrEquals',
  LESS_THAN_OR_EQUALS = 'lessThanOrEquals',
  IN = 'in',
  NOT_IN = 'notIn',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  MATCHES = 'matches',
  BETWEEN = 'between',
  EXISTS = 'exists',
  NOT_EXISTS = 'notExists',
}

export interface PolicyEvaluationContext {
  user: {
    id: string;
    role: UserRole;
    organizationId?: string;
    departmentId?: string;
    attributes?: Record<string, unknown>;
    permissions?: string[];
  };
  resource?: {
    id: string;
    type: string;
    ownerId?: string;
    organizationId?: string;
    status?: string;
    attributes?: Record<string, unknown>;
  };
  environment: {
    timestamp: Date;
    ipAddress?: string;
    location?: string;
    country?: string;
    region?: string;
    userAgent?: string;
    requestMethod?: string;
    requestPath?: string;
  };
  action: string;
}

export interface PolicyEvaluationResult {
  decision: 'allow' | 'deny';
  matchedPolicies: string[];
  reason: string;
  requiresMfa?: boolean;
  requiresApproval?: boolean;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);
  private readonly policies = new Map<string, Policy>();

  constructor() {
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    this.registerPolicy({
      id: 'standard-access',
      name: 'Standard Access Policy',
      description: 'Default access policy for standard users',
      effect: PolicyEffect.ALLOW,
      priority: 100,
      conditions: [
        {
          type: ConditionType.USER_ATTRIBUTE,
          operator: ConditionOperator.IN,
          attribute: 'role',
          value: [
            UserRole.ATTORNEY,
            UserRole.ASSOCIATE,
            UserRole.PARALEGAL,
            UserRole.PARTNER,
          ],
        },
        {
          type: ConditionType.TIME_BASED,
          operator: ConditionOperator.BETWEEN,
          attribute: 'hour',
          value: [6, 22],
        },
      ],
    });

    this.registerPolicy({
      id: 'sensitive-data-access',
      name: 'Sensitive Data Access Policy',
      description: 'Policy for accessing sensitive/privileged information',
      effect: PolicyEffect.ALLOW,
      priority: 200,
      conditions: [
        {
          type: ConditionType.USER_ATTRIBUTE,
          operator: ConditionOperator.IN,
          attribute: 'role',
          value: [UserRole.PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
        },
      ],
      metadata: {
        requiresMfa: true,
        auditRequired: true,
      },
    });

    this.registerPolicy({
      id: 'client-data-access',
      name: 'Client Data Access Policy',
      description: 'Policy for client users accessing their own data',
      effect: PolicyEffect.ALLOW,
      priority: 150,
      conditions: [
        {
          type: ConditionType.USER_ATTRIBUTE,
          operator: ConditionOperator.EQUALS,
          attribute: 'role',
          value: UserRole.CLIENT,
        },
        {
          type: ConditionType.RESOURCE_ATTRIBUTE,
          operator: ConditionOperator.EQUALS,
          attribute: 'organizationId',
          value: '{{user.organizationId}}',
        },
      ],
    });

    this.registerPolicy({
      id: 'business-hours-only',
      name: 'Business Hours Only Policy',
      description: 'Restrict access to business hours only',
      effect: PolicyEffect.DENY,
      priority: 300,
      conditions: [
        {
          type: ConditionType.TIME_BASED,
          operator: ConditionOperator.NOT_IN,
          attribute: 'dayOfWeek',
          value: [1, 2, 3, 4, 5],
        },
      ],
    });

    this.registerPolicy({
      id: 'geo-restricted',
      name: 'Geographic Restriction Policy',
      description: 'Restrict access based on geographic location',
      effect: PolicyEffect.DENY,
      priority: 250,
      conditions: [
        {
          type: ConditionType.LOCATION_BASED,
          operator: ConditionOperator.NOT_IN,
          attribute: 'country',
          value: ['US', 'CA', 'GB', 'AU'],
        },
      ],
    });

    this.registerPolicy({
      id: 'admin-override',
      name: 'Admin Override Policy',
      description: 'Admins can override most restrictions',
      effect: PolicyEffect.ALLOW,
      priority: 500,
      conditions: [
        {
          type: ConditionType.USER_ATTRIBUTE,
          operator: ConditionOperator.IN,
          attribute: 'role',
          value: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
        },
      ],
    });
  }

  async evaluatePolicy(
    policyName: string,
    context: PolicyEvaluationContext
  ): Promise<PolicyEvaluationResult> {
    const policy = this.policies.get(policyName);

    if (!policy) {
      this.logger.warn(`Policy ${policyName} not found`);
      return {
        decision: 'deny',
        matchedPolicies: [],
        reason: 'Policy not found',
      };
    }

    const conditionsMatch = await this.evaluateConditions(policy.conditions, context);

    if (conditionsMatch) {
      return {
        decision: policy.effect === PolicyEffect.ALLOW ? 'allow' : 'deny',
        matchedPolicies: [policy.id],
        reason: `Policy ${policy.name} matched`,
        requiresMfa: policy.metadata?.requiresMfa as boolean,
        requiresApproval: policy.metadata?.requiresApproval as boolean,
        metadata: policy.metadata,
      };
    }

    return {
      decision: 'deny',
      matchedPolicies: [],
      reason: `Policy ${policy.name} conditions not met`,
    };
  }

  async evaluatePolicies(
    context: PolicyEvaluationContext,
    evaluationMode: PolicyEvaluationMode = PolicyEvaluationMode.DENY_OVERRIDES
  ): Promise<PolicyEvaluationResult> {
    const sortedPolicies = Array.from(this.policies.values()).sort(
      (a, b) => b.priority - a.priority
    );

    const matchedPolicies: Policy[] = [];

    for (const policy of sortedPolicies) {
      const conditionsMatch = await this.evaluateConditions(policy.conditions, context);

      if (conditionsMatch) {
        matchedPolicies.push(policy);
      }
    }

    return this.combineResults(matchedPolicies, evaluationMode);
  }

  private async evaluateConditions(
    conditions: PolicyCondition[],
    context: PolicyEvaluationContext
  ): Promise<boolean> {
    if (conditions.length === 0) {
      return true;
    }

    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, context);

      if (condition.negate ? result : !result) {
        return false;
      }
    }

    return true;
  }

  private async evaluateCondition(
    condition: PolicyCondition,
    context: PolicyEvaluationContext
  ): Promise<boolean> {
    const actualValue = this.getAttributeValue(condition, context);
    const expectedValue = this.resolveValue(condition.value, context);

    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return actualValue === expectedValue;

      case ConditionOperator.NOT_EQUALS:
        return actualValue !== expectedValue;

      case ConditionOperator.GREATER_THAN:
        return actualValue > expectedValue;

      case ConditionOperator.LESS_THAN:
        return actualValue < expectedValue;

      case ConditionOperator.GREATER_THAN_OR_EQUALS:
        return actualValue >= expectedValue;

      case ConditionOperator.LESS_THAN_OR_EQUALS:
        return actualValue <= expectedValue;

      case ConditionOperator.IN:
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);

      case ConditionOperator.NOT_IN:
        return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);

      case ConditionOperator.CONTAINS:
        return (
          typeof actualValue === 'string' &&
          typeof expectedValue === 'string' &&
          actualValue.includes(expectedValue)
        );

      case ConditionOperator.NOT_CONTAINS:
        return (
          typeof actualValue === 'string' &&
          typeof expectedValue === 'string' &&
          !actualValue.includes(expectedValue)
        );

      case ConditionOperator.STARTS_WITH:
        return (
          typeof actualValue === 'string' &&
          typeof expectedValue === 'string' &&
          actualValue.startsWith(expectedValue)
        );

      case ConditionOperator.ENDS_WITH:
        return (
          typeof actualValue === 'string' &&
          typeof expectedValue === 'string' &&
          actualValue.endsWith(expectedValue)
        );

      case ConditionOperator.MATCHES:
        return (
          typeof actualValue === 'string' &&
          typeof expectedValue === 'string' &&
          new RegExp(expectedValue).test(actualValue)
        );

      case ConditionOperator.BETWEEN:
        if (Array.isArray(expectedValue) && expectedValue.length === 2) {
          return actualValue >= expectedValue[0] && actualValue <= expectedValue[1];
        }
        return false;

      case ConditionOperator.EXISTS:
        return actualValue !== null && actualValue !== undefined;

      case ConditionOperator.NOT_EXISTS:
        return actualValue === null || actualValue === undefined;

      default:
        return false;
    }
  }

  private getAttributeValue(condition: PolicyCondition, context: PolicyEvaluationContext): any {
    switch (condition.type) {
      case ConditionType.USER_ATTRIBUTE:
        return this.getNestedValue(context.user, condition.attribute);

      case ConditionType.RESOURCE_ATTRIBUTE:
        return context.resource
          ? this.getNestedValue(context.resource, condition.attribute)
          : null;

      case ConditionType.ENVIRONMENT_ATTRIBUTE:
        return this.getNestedValue(context.environment, condition.attribute);

      case ConditionType.TIME_BASED:
        return this.getTimeAttribute(condition.attribute, context.environment.timestamp);

      case ConditionType.LOCATION_BASED:
        return this.getLocationAttribute(condition.attribute, context.environment);

      default:
        return null;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getTimeAttribute(attribute: string, timestamp: Date): any {
    switch (attribute) {
      case 'hour':
        return timestamp.getHours();
      case 'dayOfWeek':
        return timestamp.getDay();
      case 'dayOfMonth':
        return timestamp.getDate();
      case 'month':
        return timestamp.getMonth() + 1;
      case 'year':
        return timestamp.getFullYear();
      default:
        return null;
    }
  }

  private getLocationAttribute(attribute: string, environment: any): any {
    switch (attribute) {
      case 'country':
        return environment.country;
      case 'region':
        return environment.region;
      case 'location':
        return environment.location;
      case 'ipAddress':
        return environment.ipAddress;
      default:
        return null;
    }
  }

  private resolveValue(value: unknown, context: PolicyEvaluationContext): any {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const path = value.slice(2, -2).trim();
      return this.getNestedValue(context, path);
    }
    return value;
  }

  private combineResults(
    policies: Policy[],
    evaluationMode: PolicyEvaluationMode
  ): PolicyEvaluationResult {
    if (policies.length === 0) {
      return {
        decision: 'deny',
        matchedPolicies: [],
        reason: 'No policies matched',
      };
    }

    switch (evaluationMode) {
      case PolicyEvaluationMode.DENY_OVERRIDES:
        const denyPolicy = policies.find(p => p.effect === PolicyEffect.DENY);
        if (denyPolicy) {
          return {
            decision: 'deny',
            matchedPolicies: [denyPolicy.id],
            reason: `Denied by policy: ${denyPolicy.name}`,
          };
        }
        break;

      case PolicyEvaluationMode.ALLOW_OVERRIDES:
        const allowPolicy = policies.find(p => p.effect === PolicyEffect.ALLOW);
        if (allowPolicy) {
          return {
            decision: 'allow',
            matchedPolicies: [allowPolicy.id],
            reason: `Allowed by policy: ${allowPolicy.name}`,
            requiresMfa: allowPolicy.metadata?.requiresMfa as boolean,
            requiresApproval: allowPolicy.metadata?.requiresApproval as boolean,
          };
        }
        break;

      case PolicyEvaluationMode.FIRST_APPLICABLE:
        const firstPolicy = policies[0];
        return {
          decision: firstPolicy.effect === PolicyEffect.ALLOW ? 'allow' : 'deny',
          matchedPolicies: [firstPolicy.id],
          reason: `First applicable policy: ${firstPolicy.name}`,
          requiresMfa: firstPolicy.metadata?.requiresMfa as boolean,
          requiresApproval: firstPolicy.metadata?.requiresApproval as boolean,
        };
    }

    const hasAllowPolicy = policies.some(p => p.effect === PolicyEffect.ALLOW);

    return {
      decision: hasAllowPolicy ? 'allow' : 'deny',
      matchedPolicies: policies.map(p => p.id),
      reason: hasAllowPolicy ? 'Allowed by matched policies' : 'No allow policies matched',
    };
  }

  registerPolicy(policy: Policy): void {
    this.policies.set(policy.id, policy);
    this.logger.log(`Policy registered: ${policy.name} (${policy.id})`);
  }

  unregisterPolicy(policyId: string): void {
    this.policies.delete(policyId);
    this.logger.log(`Policy unregistered: ${policyId}`);
  }

  getPolicy(policyId: string): Policy | undefined {
    return this.policies.get(policyId);
  }

  getAllPolicies(): Policy[] {
    return Array.from(this.policies.values());
  }
}
