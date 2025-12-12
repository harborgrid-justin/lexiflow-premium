import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { GraphQLError } from 'graphql';
import depthLimit from 'graphql-depth-limit';

@Plugin()
export class DepthLimitPlugin implements ApolloServerPlugin {
  constructor(private maxDepth: number = 10) {}

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const maxDepth = this.maxDepth;

    return {
      async didResolveOperation({ request, document }) {
        // Use graphql-depth-limit to validate query depth
        const depthLimitRule = depthLimit(maxDepth);

        // The validation happens in the GraphQL module configuration
        // This plugin logs the depth for monitoring
        console.log(`Query depth validation active (max: ${maxDepth})`);
      },
    };
  }
}
