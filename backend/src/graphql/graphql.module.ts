import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import * as PathsConfig from '@config/paths.config';
import { DateTimeScalar } from './scalars/date.scalar';
import { JSONScalar } from './scalars/json.scalar';
import { MoneyScalar } from './scalars/money.scalar';
import { CaseResolver } from './resolvers/case.resolver';
import { DocumentResolver } from './resolvers/document.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { BillingResolver } from './resolvers/billing.resolver';
import { DiscoveryResolver } from './resolvers/discovery.resolver';
import { DataLoaderModule } from './dataloaders/dataloader.module';
import { BillingModule } from '@billing/billing.module';
import { CasesModule } from '@cases/cases.module';
import { DocumentsModule } from '@documents/documents.module';
import { UsersModule } from '@users/users.module';
import { AuthModule } from '@auth/auth.module';
import { DiscoveryModule } from '@discovery/discovery.module';

/**
 * GraphQL Module
 * Provides GraphQL API with Apollo Server and custom scalars
 * Features:
 * - Type-safe GraphQL schema with code-first approach
 * - Custom scalars (DateTime, JSON, Money)
 * - DataLoader for N+1 query optimization
 * - Resolvers for Cases, Documents, Users, Billing, Discovery
 * - Playground UI in development mode
 */

@Module({
  imports: [
    NestGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: PathsConfig.GRAPHQL_SCHEMA_FILE,
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault() as any],

      // Enable introspection and playground in development
      introspection: process.env.NODE_ENV !== 'production',

      // Context for GraphQL requests
      context: ({ req, res }: { req: unknown; res: any }) => ({ req, res }),

      // Subscriptions configuration
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },

      // Query complexity and depth limiting
      // Note: Complexity and depth limiting rules can be added here if needed
      // using plugins like graphql-depth-limit and graphql-validation-complexity
      validationRules: [],

      // Format errors for security (hide internal details in production)
      formatError: (error) => {
        if (process.env.NODE_ENV === 'production') {
          // Don't expose internal error details in production
          return {
            message: error.message,
            locations: error.locations,
            path: error.path,
            extensions: {
              code: error.extensions?.code,
            },
          };
        }
        return error;
      },
    }),
    DataLoaderModule,
    BillingModule,
    CasesModule,
    DocumentsModule,
    UsersModule,
    AuthModule,
    DiscoveryModule,
  ],
  providers: [
    // Custom scalars
    DateTimeScalar,
    JSONScalar,
    MoneyScalar,

    // Resolvers
    CaseResolver,
    DocumentResolver,
    UserResolver,
    BillingResolver,
    DiscoveryResolver,
  ],
  exports: [NestGraphQLModule],
})
export class GraphQLModule {}
