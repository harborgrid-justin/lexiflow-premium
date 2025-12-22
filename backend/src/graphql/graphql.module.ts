import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import * as PathsConfig from '../config/paths.config';
import { DateTimeScalar } from './scalars/date.scalar';
import { JSONScalar } from './scalars/json.scalar';
import { MoneyScalar } from './scalars/money.scalar';
import { CaseResolver } from './resolvers/case.resolver';
import { DocumentResolver } from './resolvers/document.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { BillingResolver } from './resolvers/billing.resolver';
import { DiscoveryResolver } from './resolvers/discovery.resolver';
import { DataLoaderModule } from './dataloaders/dataloader.module';
import { BillingModule } from '../billing/billing.module';

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
      context: ({ req, res }) => ({ req, res }),

      // Subscriptions configuration
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },

      // Query complexity and depth limiting
      validationRules: [
        // TODO: Add complexity and depth limiting rules
        // Example:
        // createComplexityLimitRule(1000),
        // depthLimit(10),
      ],

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
