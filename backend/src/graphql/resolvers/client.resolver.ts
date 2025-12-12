import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ClientType, ClientConnection, ClientMetrics } from '../types/client.type';
import {
  CreateClientInput,
  UpdateClientInput,
  ClientFilterInput,
} from '../inputs/client.input';
import { PaginationInput } from '../inputs/pagination.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CaseType } from '../types/case.type';

@Resolver(() => ClientType)
export class ClientResolver {
  // Inject ClientService here
  // constructor(
  //   private clientService: ClientService,
  //   private caseService: CaseService,
  // ) {}

  @Query(() => ClientConnection, { name: 'clients' })
  @UseGuards(GqlAuthGuard)
  async getClients(
    @Args('filter', { nullable: true }) filter?: ClientFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<ClientConnection> {
    // TODO: Implement with ClientService
    // return this.clientService.findAll(filter, pagination);
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: 0,
    };
  }

  @Query(() => ClientType, { name: 'client', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getClient(@Args('id', { type: () => ID }) id: string): Promise<ClientType | null> {
    // TODO: Implement with ClientService
    // return this.clientService.findOne(id);
    return null;
  }

  @Query(() => ClientType, { name: 'clientByNumber', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getClientByNumber(
    @Args('clientNumber') clientNumber: string,
  ): Promise<ClientType | null> {
    // TODO: Implement with ClientService
    // return this.clientService.findByClientNumber(clientNumber);
    return null;
  }

  @Query(() => ClientMetrics, { name: 'clientMetrics' })
  @UseGuards(GqlAuthGuard)
  async getClientMetrics(): Promise<ClientMetrics> {
    // TODO: Implement with ClientService
    // return this.clientService.getMetrics();
    return {
      totalClients: 0,
      activeClients: 0,
      prospectiveClients: 0,
      formerClients: 0,
      totalRevenue: 0,
      outstandingBalance: 0,
      byType: [],
      byStatus: [],
    };
  }

  @Mutation(() => ClientType)
  @UseGuards(GqlAuthGuard)
  async createClient(
    @Args('input') input: CreateClientInput,
    @CurrentUser() user: any,
  ): Promise<ClientType> {
    // TODO: Implement with ClientService
    // return this.clientService.create(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => ClientType)
  @UseGuards(GqlAuthGuard)
  async updateClient(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateClientInput,
    @CurrentUser() user: any,
  ): Promise<ClientType> {
    // TODO: Implement with ClientService
    // return this.clientService.update(id, input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteClient(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    // TODO: Implement with ClientService
    // await this.clientService.delete(id, user);
    // return true;
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async archiveClient(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    // TODO: Implement with ClientService
    // await this.clientService.archive(id, user);
    // return true;
    throw new Error('Not implemented');
  }

  @Mutation(() => ClientType)
  @UseGuards(GqlAuthGuard)
  async updateClientRetainer(
    @Args('id', { type: () => ID }) id: string,
    @Args('amount') amount: number,
    @CurrentUser() user: any,
  ): Promise<ClientType> {
    // TODO: Implement with ClientService
    // return this.clientService.updateRetainer(id, amount, user);
    throw new Error('Not implemented');
  }

  // Field Resolvers
  @ResolveField(() => [CaseType])
  async cases(@Parent() client: ClientType): Promise<CaseType[]> {
    // TODO: Implement with DataLoader
    // return this.caseLoader.loadByCaseId(client.id);
    return [];
  }
}
