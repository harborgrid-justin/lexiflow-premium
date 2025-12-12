import { Injectable, Logger } from '@nestjs/common';

/**
 * Condition definition
 */
export interface Condition {
  type: ConditionType;
  field?: string;
  operator?: ComparisonOperator;
  value?: any;
  conditions?: Condition[]; // For composite conditions
}

export enum ConditionType {
  SIMPLE = 'simple',
  AND = 'and',
  OR = 'or',
  NOT = 'not',
}

export enum ComparisonOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  MATCHES_REGEX = 'matches_regex',
}

/**
 * Workflow Conditions Service
 * Implements conditional branching logic for workflows
 */
@Injectable()
export class WorkflowConditionsService {
  private readonly logger = new Logger(WorkflowConditionsService.name);

  /**
   * Evaluate a condition against provided data
   */
  evaluate(condition: Condition, data: Record<string, any>): boolean {
    try {
      switch (condition.type) {
        case ConditionType.SIMPLE:
          return this.evaluateSimpleCondition(condition, data);

        case ConditionType.AND:
          return this.evaluateAndCondition(condition, data);

        case ConditionType.OR:
          return this.evaluateOrCondition(condition, data);

        case ConditionType.NOT:
          return this.evaluateNotCondition(condition, data);

        default:
          this.logger.warn(`Unknown condition type: ${condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Evaluate simple comparison condition
   */
  private evaluateSimpleCondition(
    condition: Condition,
    data: Record<string, any>,
  ): boolean {
    if (!condition.field || !condition.operator) {
      return false;
    }

    const fieldValue = this.getFieldValue(data, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case ComparisonOperator.EQUALS:
        return fieldValue === conditionValue;

      case ComparisonOperator.NOT_EQUALS:
        return fieldValue !== conditionValue;

      case ComparisonOperator.GREATER_THAN:
        return this.compareNumeric(fieldValue, conditionValue, '>');

      case ComparisonOperator.GREATER_THAN_OR_EQUAL:
        return this.compareNumeric(fieldValue, conditionValue, '>=');

      case ComparisonOperator.LESS_THAN:
        return this.compareNumeric(fieldValue, conditionValue, '<');

      case ComparisonOperator.LESS_THAN_OR_EQUAL:
        return this.compareNumeric(fieldValue, conditionValue, '<=');

      case ComparisonOperator.CONTAINS:
        return this.containsValue(fieldValue, conditionValue);

      case ComparisonOperator.NOT_CONTAINS:
        return !this.containsValue(fieldValue, conditionValue);

      case ComparisonOperator.STARTS_WITH:
        return (
          typeof fieldValue === 'string' &&
          fieldValue.startsWith(String(conditionValue))
        );

      case ComparisonOperator.ENDS_WITH:
        return (
          typeof fieldValue === 'string' &&
          fieldValue.endsWith(String(conditionValue))
        );

      case ComparisonOperator.IN:
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);

      case ComparisonOperator.NOT_IN:
        return (
          Array.isArray(conditionValue) && !conditionValue.includes(fieldValue)
        );

      case ComparisonOperator.IS_NULL:
        return fieldValue === null || fieldValue === undefined;

      case ComparisonOperator.IS_NOT_NULL:
        return fieldValue !== null && fieldValue !== undefined;

      case ComparisonOperator.MATCHES_REGEX:
        return this.matchesRegex(fieldValue, conditionValue);

      default:
        return false;
    }
  }

  /**
   * Evaluate AND condition (all sub-conditions must be true)
   */
  private evaluateAndCondition(
    condition: Condition,
    data: Record<string, any>,
  ): boolean {
    if (!condition.conditions || condition.conditions.length === 0) {
      return true;
    }

    return condition.conditions.every((subCondition) =>
      this.evaluate(subCondition, data),
    );
  }

  /**
   * Evaluate OR condition (at least one sub-condition must be true)
   */
  private evaluateOrCondition(
    condition: Condition,
    data: Record<string, any>,
  ): boolean {
    if (!condition.conditions || condition.conditions.length === 0) {
      return false;
    }

    return condition.conditions.some((subCondition) =>
      this.evaluate(subCondition, data),
    );
  }

  /**
   * Evaluate NOT condition (negates the sub-condition)
   */
  private evaluateNotCondition(
    condition: Condition,
    data: Record<string, any>,
  ): boolean {
    if (!condition.conditions || condition.conditions.length === 0) {
      return false;
    }

    return !this.evaluate(condition.conditions[0], data);
  }

  /**
   * Get field value from data (supports dot notation)
   */
  private getFieldValue(data: Record<string, any>, field: string): any {
    const parts = field.split('.');
    let value: any = data;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Compare numeric values
   */
  private compareNumeric(
    value1: any,
    value2: any,
    operator: '>' | '>=' | '<' | '<=',
  ): boolean {
    const num1 = Number(value1);
    const num2 = Number(value2);

    if (isNaN(num1) || isNaN(num2)) {
      return false;
    }

    switch (operator) {
      case '>':
        return num1 > num2;
      case '>=':
        return num1 >= num2;
      case '<':
        return num1 < num2;
      case '<=':
        return num1 <= num2;
      default:
        return false;
    }
  }

  /**
   * Check if value contains another value
   */
  private containsValue(haystack: any, needle: any): boolean {
    if (typeof haystack === 'string') {
      return haystack.includes(String(needle));
    }

    if (Array.isArray(haystack)) {
      return haystack.includes(needle);
    }

    return false;
  }

  /**
   * Check if value matches regex pattern
   */
  private matchesRegex(value: any, pattern: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    try {
      const regex = new RegExp(pattern);
      return regex.test(value);
    } catch (error) {
      this.logger.error(`Invalid regex pattern: ${pattern}`, error);
      return false;
    }
  }

  /**
   * Build condition from expression string
   */
  buildConditionFromExpression(expression: string): Condition {
    // Simple expression parser
    // Supports: field operator value
    // Example: "status equals 'Active'"

    const parts = expression.trim().split(/\s+/);

    if (parts.length < 2) {
      throw new Error('Invalid condition expression');
    }

    const field = parts[0];
    const operator = parts[1].toLowerCase();
    const value = parts.slice(2).join(' ').replace(/^['"]|['"]$/g, '');

    const operatorMap: Record<string, ComparisonOperator> = {
      equals: ComparisonOperator.EQUALS,
      '==': ComparisonOperator.EQUALS,
      '=': ComparisonOperator.EQUALS,
      'not_equals': ComparisonOperator.NOT_EQUALS,
      '!=': ComparisonOperator.NOT_EQUALS,
      'greater_than': ComparisonOperator.GREATER_THAN,
      '>': ComparisonOperator.GREATER_THAN,
      'greater_than_or_equal': ComparisonOperator.GREATER_THAN_OR_EQUAL,
      '>=': ComparisonOperator.GREATER_THAN_OR_EQUAL,
      'less_than': ComparisonOperator.LESS_THAN,
      '<': ComparisonOperator.LESS_THAN,
      'less_than_or_equal': ComparisonOperator.LESS_THAN_OR_EQUAL,
      '<=': ComparisonOperator.LESS_THAN_OR_EQUAL,
      contains: ComparisonOperator.CONTAINS,
      in: ComparisonOperator.IN,
    };

    const mappedOperator = operatorMap[operator];
    if (!mappedOperator) {
      throw new Error(`Unknown operator: ${operator}`);
    }

    return {
      type: ConditionType.SIMPLE,
      field,
      operator: mappedOperator,
      value: this.parseValue(value),
    };
  }

  /**
   * Parse value from string
   */
  private parseValue(value: string): any {
    // Try to parse as number
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Try to parse as boolean
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }

    // Try to parse as null
    if (value.toLowerCase() === 'null') {
      return null;
    }

    // Try to parse as array
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        return JSON.parse(value);
      } catch {
        // Not a valid JSON array
      }
    }

    // Return as string
    return value;
  }

  /**
   * Create AND condition
   */
  and(...conditions: Condition[]): Condition {
    return {
      type: ConditionType.AND,
      conditions,
    };
  }

  /**
   * Create OR condition
   */
  or(...conditions: Condition[]): Condition {
    return {
      type: ConditionType.OR,
      conditions,
    };
  }

  /**
   * Create NOT condition
   */
  not(condition: Condition): Condition {
    return {
      type: ConditionType.NOT,
      conditions: [condition],
    };
  }

  /**
   * Create simple condition
   */
  condition(
    field: string,
    operator: ComparisonOperator,
    value: any,
  ): Condition {
    return {
      type: ConditionType.SIMPLE,
      field,
      operator,
      value,
    };
  }
}
