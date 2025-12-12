import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

/**
 * Money scalar type
 * Represents monetary values as integers in cents to avoid floating point issues
 * Input/Output as decimal strings (e.g., "100.50")
 */
@Scalar('Money')
export class MoneyScalar implements CustomScalar<string, number> {
  description = 'Money custom scalar type (cents as integer, displayed as decimal string)';

  parseValue(value: unknown): number {
    if (typeof value === 'string') {
      const cents = Math.round(parseFloat(value) * 100);
      if (isNaN(cents)) {
        throw new Error('Invalid Money value');
      }
      return cents;
    }
    if (typeof value === 'number') {
      return Math.round(value * 100);
    }
    throw new Error('Invalid Money value');
  }

  serialize(value: unknown): string {
    if (typeof value === 'number') {
      return (value / 100).toFixed(2);
    }
    throw new Error('Invalid Money value');
  }

  parseLiteral(ast: ValueNode): number {
    if (ast.kind === Kind.STRING || ast.kind === Kind.FLOAT) {
      const cents = Math.round(parseFloat(ast.value) * 100);
      if (isNaN(cents)) {
        throw new Error('Invalid Money literal');
      }
      return cents;
    }
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10) * 100;
    }
    throw new Error('Invalid Money literal');
  }
}
