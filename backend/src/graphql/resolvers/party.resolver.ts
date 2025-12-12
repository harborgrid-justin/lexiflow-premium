import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PartyType, PartyConnection, PartyContactType } from '../types/party.type';
import {
  CreatePartyInput,
  UpdatePartyInput,
  PartyFilterInput,
  CreatePartyContactInput,
  UpdatePartyContactInput,
} from '../inputs/party.input';
import { PaginationInput } from '../inputs/pagination.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CaseType } from '../types/case.type';

@Resolver(() => PartyType)
export class PartyResolver {
  // Inject PartyService here
  // constructor(
  //   private partyService: PartyService,
  //   private caseLoader: CaseLoader,
  // ) {}

  @Query(() => PartyConnection, { name: 'parties' })
  @UseGuards(GqlAuthGuard)
  async getParties(
    @Args('filter', { nullable: true }) filter?: PartyFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PartyConnection> {
    // TODO: Implement with PartyService
    // return this.partyService.findAll(filter, pagination);
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: 0,
    };
  }

  @Query(() => PartyType, { name: 'party', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getParty(@Args('id', { type: () => ID }) id: string): Promise<PartyType | null> {
    // TODO: Implement with PartyService
    // return this.partyService.findOne(id);
    return null;
  }

  @Query(() => [PartyType], { name: 'partiesByCase' })
  @UseGuards(GqlAuthGuard)
  async getPartiesByCase(
    @Args('caseId', { type: () => ID }) caseId: string,
  ): Promise<PartyType[]> {
    // TODO: Implement with PartyService
    // return this.partyService.findByCaseId(caseId);
    return [];
  }

  @Mutation(() => PartyType)
  @UseGuards(GqlAuthGuard)
  async createParty(
    @Args('input') input: CreatePartyInput,
    @CurrentUser() user: any,
  ): Promise<PartyType> {
    // TODO: Implement with PartyService
    // return this.partyService.create(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => PartyType)
  @UseGuards(GqlAuthGuard)
  async updateParty(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePartyInput,
    @CurrentUser() user: any,
  ): Promise<PartyType> {
    // TODO: Implement with PartyService
    // return this.partyService.update(id, input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteParty(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    // TODO: Implement with PartyService
    // await this.partyService.delete(id, user);
    // return true;
    throw new Error('Not implemented');
  }

  @Mutation(() => PartyContactType)
  @UseGuards(GqlAuthGuard)
  async createPartyContact(
    @Args('input') input: CreatePartyContactInput,
    @CurrentUser() user: any,
  ): Promise<PartyContactType> {
    // TODO: Implement with PartyService
    // return this.partyService.createContact(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => PartyContactType)
  @UseGuards(GqlAuthGuard)
  async updatePartyContact(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePartyContactInput,
    @CurrentUser() user: any,
  ): Promise<PartyContactType> {
    // TODO: Implement with PartyService
    // return this.partyService.updateContact(id, input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deletePartyContact(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    // TODO: Implement with PartyService
    // await this.partyService.deleteContact(id, user);
    // return true;
    throw new Error('Not implemented');
  }

  // Field Resolvers
  @ResolveField(() => CaseType)
  async case(@Parent() party: PartyType): Promise<CaseType | null> {
    // TODO: Use DataLoader to prevent N+1 queries
    // return this.caseLoader.load(party.caseId);
    return null;
  }
}
