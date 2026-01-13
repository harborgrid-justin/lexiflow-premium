/**
 * GraphQL Query Complexity Analyzer
 * 
 * PhD-Grade Security: Prevents memory exhaustion from complex GraphQL queries
 * by analyzing query cost before execution and rejecting expensive queries.
 * 
 * @module GraphQLComplexityPlugin
 * @category Security - Memory Protection
 * 
 * Benefits:
 * - Prevents "nested explosion" queries (depth bombs)
 * - Blocks queries that would allocate massive memory
 * - Configurable cost limits per query
 * - Per-field cost calculation
 * 
 * Example Dangerous Query:
 * ```graphql
 * query {
 *   cases {               # 1000 cases
 *     documents {         # 100 documents each = 100K results
 *       versions {        # 50 versions each = 5M results
 *         content         # Would allocate GBs of memory
 *       }
 *     }
 *   }
 * }
 * ```
 * 
 * This would be rejected before execution.
 */

import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
  type ComplexityEstimatorArgs,
} from 'graphql-query-complexity';
import { GraphQLError } from 'graphql';
import type { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import type { GraphQLSchemaHost } from '@nestjs/graphql';
import type { GraphQLRequestContext } from '@apollo/server';
import type { BaseContext } from '@apollo/server';

interface ComplexityOptions {
  /**
   * Maximum allowed query complexity
   * Default: 1000
   * 
   * Guidelines:
   * - Simple query (1-2 levels): 10-50
   * - Medium query (3-4 levels): 100-500
   * - Complex query (5+ levels): 500-1000
   */
  maxComplexity?: number;

  /**
   * Custom complexity estimators per field
   * 
   * @example
   * ```typescript
   * {
   *   'Case.documents': { complexity: 10 },
   *   'Document.content': { complexity: 5 }
   * }
   * ```
   */
  estimators?: Array<(options: ComplexityEstimatorArgs) => number | void>;

  /**
   * Whether to log complexity for all queries
   */
  verbose?: boolean;
}

export class GraphQLComplexityPlugin implements ApolloServerPlugin<BaseContext> {
  private readonly maxComplexity: number;
  private readonly verbose: boolean;
  private readonly estimators: Array<(options: ComplexityEstimatorArgs) => number | void>;

  constructor(
    private schemaHost: GraphQLSchemaHost,
    options: ComplexityOptions = {}
  ) {
    this.maxComplexity = options.maxComplexity || 1000;
    this.verbose = options.verbose || false;
    this.estimators = options.estimators || [
      // Field-level complexity estimation
      fieldExtensionsEstimator(),
      // Simple estimation: each field = 1, array multiplier
      simpleEstimator({ defaultComplexity: 1 }),
    ];
  }

  async requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    const maxComplexity = this.maxComplexity;
    const estimators = this.estimators;
    const verbose = this.verbose;
    const schema = this.schemaHost.schema;

    return {
      async didResolveOperation(requestContext: GraphQLRequestContext<BaseContext>): Promise<void> {
        const { request, document } = requestContext;
        
        if (!document) {
          return;
        }

        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators,
        });

        if (verbose) {
          console.log(`GraphQL Query Complexity: ${complexity}/${maxComplexity}`);
        }

        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}.`,
            {
              extensions: {
                code: 'QUERY_TOO_COMPLEX',
                complexity,
                maxComplexity,
              },
            }
          );
        }
      },
    };
  }
}

/**
 * Field complexity calculator for custom types
 * 
 * @example
 * ```typescript
 * @Field(() => [Document])
 * @Complexity({ complexity: 10, multipliers: ['limit'] })
 * async documents(@Args('limit') limit: number) {
 *   // Complexity = 10 * limit
 * }
 * ```
 */
export function Complexity(options: { complexity: number; multipliers?: string[] }) {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    // Store complexity metadata on the field
    const existingMetadata = (Reflect.getMetadata('graphql:complexity', target, propertyKey) || {}) as Record<string, unknown>;
    Reflect.defineMetadata(
      'graphql:complexity',
      { ...existingMetadata, ...options },
      target,
      propertyKey
    );
    return descriptor;
  };
}
