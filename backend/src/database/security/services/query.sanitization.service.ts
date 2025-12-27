import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface QueryComplexityLimits {
  maxJoins: number;
  maxWhereConditions: number;
  maxOrderByFields: number;
  maxDepth: number;
  maxParameterLength: number;
}

export interface SanitizationResult {
  isSafe: boolean;
  violations: string[];
  sanitizedQuery?: string;
}

@Injectable()
export class QuerySanitizationService {
  private readonly logger = new Logger(QuerySanitizationService.name);

  private readonly dangerousPatterns: RegExp[] = [
    /(\b(DROP|TRUNCATE|DELETE\s+FROM|ALTER|EXEC|EXECUTE|UNION|INSERT\s+INTO)\b)/gi,
    /(--|\*\/|\/\*|;)/g,
    /(\bxp_|\bsp_)/gi,
    /(\bSCRIPT\b|\bJAVASCRIPT\b)/gi,
    /(\bEVAL\b|\bEXEC\b)/gi,
  ];

  private readonly sqlInjectionPatterns: RegExp[] = [
    /('\s*(OR|AND)\s*'?\d+\s*'?\s*=\s*'?\d+)/gi,
    /('\s*OR\s*'?\d+\s*'?\s*=\s*'?\d+\s*--)/gi,
    /(\bUNION\b\s+\bSELECT\b)/gi,
    /(\bSELECT\b.*\bFROM\b.*\bWHERE\b.*\bOR\b.*=.*)/gi,
    /(;\s*(DROP|DELETE|TRUNCATE|ALTER))/gi,
    /(\bBENCHMARK\b|\bSLEEP\b)/gi,
    /(\bLOAD_FILE\b|\bINTO\s+OUTFILE\b)/gi,
  ];

  private readonly complexityLimits: QueryComplexityLimits;

  constructor(private readonly configService: ConfigService) {
    this.complexityLimits = {
      maxJoins: this.configService.get<number>('QUERY_MAX_JOINS') || 10,
      maxWhereConditions: this.configService.get<number>('QUERY_MAX_WHERE') || 20,
      maxOrderByFields: this.configService.get<number>('QUERY_MAX_ORDER_BY') || 5,
      maxDepth: this.configService.get<number>('QUERY_MAX_DEPTH') || 5,
      maxParameterLength: this.configService.get<number>('QUERY_MAX_PARAM_LENGTH') || 10000,
    };
  }

  validateQuery(query: string, parameters?: any[]): SanitizationResult {
    const violations: string[] = [];

    if (!query || typeof query !== 'string') {
      violations.push('Invalid query format');
      return { isSafe: false, violations };
    }

    if (query.length > 50000) {
      violations.push('Query exceeds maximum length');
    }

    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(query)) {
        violations.push(`Dangerous SQL operation detected: ${pattern.source}`);
      }
    }

    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(query)) {
        violations.push(`SQL injection pattern detected: ${pattern.source}`);
      }
    }

    const complexityViolations = this.checkQueryComplexity(query);
    violations.push(...complexityViolations);

    if (parameters) {
      const paramViolations = this.validateParameters(parameters);
      violations.push(...paramViolations);
    }

    return {
      isSafe: violations.length === 0,
      violations,
      sanitizedQuery: violations.length === 0 ? query : undefined,
    };
  }

  private checkQueryComplexity(query: string): string[] {
    const violations: string[] = [];

    const joinCount = (query.match(/\bJOIN\b/gi) || []).length;
    if (joinCount > this.complexityLimits.maxJoins) {
      violations.push(`Too many JOINs: ${joinCount} (max: ${this.complexityLimits.maxJoins})`);
    }

    const whereConditions = (query.match(/\bAND\b|\bOR\b/gi) || []).length + 1;
    if (whereConditions > this.complexityLimits.maxWhereConditions) {
      violations.push(
        `Too many WHERE conditions: ${whereConditions} (max: ${this.complexityLimits.maxWhereConditions})`
      );
    }

    const orderByFields = query.match(/\bORDER\s+BY\b([^;]+)/gi);
    if (orderByFields && orderByFields.length > 0) {
      const fieldCount = orderByFields[0].split(',').length;
      if (fieldCount > this.complexityLimits.maxOrderByFields) {
        violations.push(
          `Too many ORDER BY fields: ${fieldCount} (max: ${this.complexityLimits.maxOrderByFields})`
        );
      }
    }

    const subqueryDepth = this.calculateSubqueryDepth(query);
    if (subqueryDepth > this.complexityLimits.maxDepth) {
      violations.push(
        `Subquery depth too deep: ${subqueryDepth} (max: ${this.complexityLimits.maxDepth})`
      );
    }

    return violations;
  }

  private calculateSubqueryDepth(query: string): number {
    let depth = 0;
    let maxDepth = 0;

    for (const char of query) {
      if (char === '(') {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      } else if (char === ')') {
        depth--;
      }
    }

    return maxDepth;
  }

  private validateParameters(parameters: any[]): string[] {
    const violations: string[] = [];

    for (let i = 0; i < parameters.length; i++) {
      const param = parameters[i];

      if (param === null || param === undefined) {
        continue;
      }

      if (typeof param === 'string') {
        if (param.length > this.complexityLimits.maxParameterLength) {
          violations.push(
            `Parameter ${i} exceeds maximum length: ${param.length} (max: ${this.complexityLimits.maxParameterLength})`
          );
        }

        for (const pattern of this.sqlInjectionPatterns) {
          if (pattern.test(param)) {
            violations.push(`Parameter ${i} contains SQL injection pattern`);
            break;
          }
        }
      } else if (typeof param === 'object') {
        const jsonString = JSON.stringify(param);
        if (jsonString.length > this.complexityLimits.maxParameterLength) {
          violations.push(`Parameter ${i} object exceeds maximum size`);
        }
      }
    }

    return violations;
  }

  enforceParameterized(query: string): void {
    const hasRawValues = /'\s*\w+\s*'/g.test(query);

    if (hasRawValues) {
      const result = this.validateQuery(query);
      if (!result.isSafe) {
        this.logger.error('Non-parameterized query detected with violations', {
          violations: result.violations,
        });
        throw new BadRequestException('Query must use parameterized values');
      }
    }
  }

  sanitizeIdentifier(identifier: string): string {
    const sanitized = identifier.replace(/[^\w_]/g, '');

    if (sanitized !== identifier) {
      this.logger.warn('Identifier sanitized', {
        original: identifier,
        sanitized,
      });
    }

    return sanitized;
  }

  sanitizeTableName(tableName: string): string {
    const sanitized = tableName.replace(/[^\w_]/g, '');

    const systemTables = ['pg_', 'information_schema', 'sys', 'mysql', 'performance_schema'];
    for (const prefix of systemTables) {
      if (sanitized.toLowerCase().startsWith(prefix)) {
        throw new BadRequestException(`Access to system table '${sanitized}' is not allowed`);
      }
    }

    return sanitized;
  }

  sanitizeColumnName(columnName: string): string {
    return this.sanitizeIdentifier(columnName);
  }

  validateWhereClause(whereClause: Record<string, any>): void {
    const conditionCount = Object.keys(whereClause).length;

    if (conditionCount > this.complexityLimits.maxWhereConditions) {
      throw new BadRequestException(
        `Too many WHERE conditions: ${conditionCount} (max: ${this.complexityLimits.maxWhereConditions})`
      );
    }

    for (const [key, value] of Object.entries(whereClause)) {
      this.sanitizeIdentifier(key);

      if (typeof value === 'string') {
        const result = this.validateQuery(value);
        if (!result.isSafe) {
          throw new BadRequestException(`Invalid value in WHERE clause for key '${key}'`);
        }
      }
    }
  }

  blockDangerousOperations(query: string): void {
    const result = this.validateQuery(query);

    if (!result.isSafe) {
      this.logger.error('Dangerous query blocked', {
        violations: result.violations,
        query: query.substring(0, 200),
      });

      throw new BadRequestException('Query contains dangerous operations or patterns');
    }
  }

  logSuspiciousQuery(query: string, parameters?: any[], metadata?: Record<string, any>): void {
    this.logger.warn('Suspicious query detected', {
      query: query.substring(0, 500),
      parameterCount: parameters?.length || 0,
      ...metadata,
    });
  }

  createSafeLimit(limit: number, defaultLimit: number = 100, maxLimit: number = 1000): number {
    if (!limit || limit < 1) {
      return defaultLimit;
    }

    return Math.min(limit, maxLimit);
  }

  createSafeOffset(offset: number, maxOffset: number = 100000): number {
    if (!offset || offset < 0) {
      return 0;
    }

    return Math.min(offset, maxOffset);
  }

  escapeString(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "''")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\x00/g, '\\0')
      .replace(/\x1a/g, '\\Z');
  }
}
