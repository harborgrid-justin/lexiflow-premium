import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { DateTimeScalar } from './scalars/date.scalar';
import { JSONScalar } from './scalars/json.scalar';
import { MoneyScalar } from './scalars/money.scalar';
import { CaseResolver } from './resolvers/case.resolver';
import { DocumentResolver } from './resolvers/document.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { BillingResolver } from './resolvers/billing.resolver';
import { DiscoveryResolver } from './resolvers/discovery.resolver';
import { AnalyticsResolver } from './resolvers/analytics.resolver';
import { SubscriptionsResolver } from './subscriptions/subscriptions.resolver';
import { DataLoaderModule } from './dataloaders/dataloader.module';
import { ComplexityPlugin } from './plugins/complexity.plugin';
import { DepthLimitPlugin } from './plugins/depth-limit.plugin';

@Module({
  imports: [
    NestGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],

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

      // CORS configuration
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      },
    }),
    DataLoaderModule,
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
    AnalyticsResolver,
    SubscriptionsResolver,

    // Plugins
    ComplexityPlugin,
    DepthLimitPlugin,
  ],
  exports: [NestGraphQLModule],
})
export class GraphQLModule {}
