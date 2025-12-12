import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { CaseType, CaseConnection, CaseMetrics } from '../types/case.type';
import {
  CreateCaseInput,
  UpdateCaseInput,
  CaseFilterInput,
  AddPartyInput,
  AddTeamMemberInput,
  CreateMotionInput,
  CreateDocketEntryInput,
} from '../inputs/case.input';
import { PaginationInput } from '../inputs/pagination.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';

const pubSub = new PubSub();

@Resolver(() => CaseType)
export class CaseResolver {
  // Inject CaseService here
  // constructor(private caseService: CaseService) {}

  @Query(() => CaseConnection, { name: 'cases' })
  @UseGuards(GqlAuthGuard)
  async getCases(
    @Args('filter', { nullable: true }) filter?: CaseFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<CaseConnection> {
    // TODO: Implement with CaseService
    // return this.caseService.findAll(filter, pagination);
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: 0,
    };
  }

  @Query(() => CaseType, { name: 'case', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getCase(@Args('id', { type: () => ID }) id: string): Promise<CaseType | null> {
    // TODO: Implement with CaseService
    // return this.caseService.findOne(id);
    return null;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async createCase(
    @Args('input') input: CreateCaseInput,
    @CurrentUser() user: any,
  ): Promise<CaseType> {
    // TODO: Implement with CaseService
    // const caseEntity = await this.caseService.create(input, user);
    // pubSub.publish('caseCreated', { caseCreated: caseEntity });
    // return caseEntity;
    throw new Error('Not implemented');
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async updateCase(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCaseInput,
    @CurrentUser() user: any,
  ): Promise<CaseType> {
    // TODO: Implement with CaseService
    // const caseEntity = await this.caseService.update(id, input, user);
    // pubSub.publish('caseUpdated', { caseUpdated: caseEntity, id });
    // return caseEntity;
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCase(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    // TODO: Implement with CaseService
    // await this.caseService.delete(id, user);
    // return true;
    throw new Error('Not implemented');
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async addParty(
    @Args('input') input: AddPartyInput,
    @CurrentUser() user: any,
  ): Promise<CaseType> {
    // TODO: Implement with CaseService
    throw new Error('Not implemented');
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async addTeamMember(
    @Args('input') input: AddTeamMemberInput,
    @CurrentUser() user: any,
  ): Promise<CaseType> {
    // TODO: Implement with CaseService
    throw new Error('Not implemented');
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async createMotion(
    @Args('input') input: CreateMotionInput,
    @CurrentUser() user: any,
  ): Promise<CaseType> {
    // TODO: Implement with CaseService
    throw new Error('Not implemented');
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async createDocketEntry(
    @Args('input') input: CreateDocketEntryInput,
    @CurrentUser() user: any,
  ): Promise<CaseType> {
    // TODO: Implement with CaseService
    throw new Error('Not implemented');
  }

  @Query(() => CaseMetrics, { name: 'caseMetrics' })
  @UseGuards(GqlAuthGuard)
  async getCaseMetrics(): Promise<CaseMetrics> {
    // TODO: Implement with CaseService
    return {
      totalCases: 0,
      activeCases: 0,
      closedCases: 0,
      pendingCases: 0,
      byType: [],
      byStatus: [],
    };
  }

  @Subscription(() => CaseType, {
    name: 'caseUpdated',
    filter: (payload, variables) => {
      return payload.id === variables.id;
    },
  })
  caseUpdated(@Args('id', { type: () => ID }) id: string) {
    return pubSub.asyncIterator('caseUpdated');
  }
}
