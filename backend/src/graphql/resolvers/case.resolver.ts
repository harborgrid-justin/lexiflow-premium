import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
// import { ConfigService } from '@nestjs/config';
import { CaseType, CaseConnection, CaseMetrics } from '@graphql/types/case.type';
import {
  CreateCaseInput,
  UpdateCaseInput,
  CaseFilterInput,
  AddPartyInput,
  AddTeamMemberInput,
  CreateMotionInput,
  CreateDocketEntryInput,
} from '@graphql/inputs/case.input';
import { PaginationInput } from '@graphql/inputs/pagination.input';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '@auth/guards/gql-auth.guard';
import { CasesService } from '@cases/cases.service';
// import { CaseStatus } from '@cases/entities/case.entity';
import { AuthenticatedUser } from '@auth/interfaces/authenticated-user.interface';

// TODO: For production horizontal scaling, replace with RedisPubSub:
// import { RedisPubSub } from 'graphql-redis-subscriptions';
// const pubSub = new RedisPubSub({ ... });
const pubSub = new PubSub();

@Resolver(() => CaseType)
export class CaseResolver {
  private readonly logger = new Logger(CaseResolver.name);

  constructor(private readonly caseService: CasesService) {}

  @Query(() => CaseConnection, { name: 'cases' })
  @UseGuards(GqlAuthGuard)
  async getCases(
    @Args('filter', { nullable: true }) filter?: CaseFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<CaseConnection> {
    const result = await this.caseService.findAll({
      ...filter,
      page: pagination?.page,
      limit: pagination?.limit,
      sortBy: pagination?.sortBy,
      sortOrder: pagination?.sortOrder,
    } as any);

    return {
      edges: result.data.map(caseItem => ({
        node: caseItem as any,
        cursor: caseItem.id,
      })),
      pageInfo: {
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
        startCursor: result.data[0]?.id,
        endCursor: result.data[result.data.length - 1]?.id,
      },
      totalCount: result.total,
    };
  }

  @Query(() => CaseType, { name: 'case', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getCase(@Args('id', { type: () => ID }) id: string): Promise<CaseType | null> {
    try {
      const caseItem = await this.caseService.findOne(id);
      return caseItem as any;
    } catch (error) {
      return null;
    }
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async createCase(
    @Args('input') input: CreateCaseInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.create(input as any);
    pubSub.publish('caseCreated', { caseCreated: caseEntity });
    return caseEntity as any;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async updateCase(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCaseInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.update(id, input as any);
    pubSub.publish('caseUpdated', { caseUpdated: caseEntity, id });
    return caseEntity as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCase(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.caseService.remove(id);
    return true;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async addParty(
    @Args('input') input: AddPartyInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.findOne(input.caseId);
    // Note: Parties are typically managed through case updates in the REST API
    // This mutation would need additional service methods for full implementation
    return caseEntity as any;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async addTeamMember(
    @Args('input') input: AddTeamMemberInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.findOne(input.caseId);
    // Note: Team members are typically managed through case updates in the REST API
    // This mutation would need additional service methods for full implementation
    return caseEntity as any;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async createMotion(
    @Args('input') input: CreateMotionInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.findOne(input.caseId);
    // Note: Motions are typically managed through case updates or a separate motions service
    // This mutation would need additional service methods for full implementation
    return caseEntity as any;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async createDocketEntry(
    @Args('input') input: CreateDocketEntryInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.findOne(input.caseId);
    // Note: Docket entries are typically managed through case updates or a separate docket service
    // This mutation would need additional service methods for full implementation
    return caseEntity as any;
  }

  @Query(() => CaseMetrics, { name: 'caseMetrics', description: 'Get aggregated case metrics using efficient database queries' })
  @UseGuards(GqlAuthGuard)
  async getCaseMetrics(): Promise<CaseMetrics> {
    // PERFORMANCE: Use database aggregation instead of loading all records into memory
    // This is critical for enterprise scale - never load 10,000+ records for metrics
    try {
      const metrics = await this.caseService.getCaseMetrics();
      return metrics;
    } catch (error) {
      this.logger.error('Failed to get case metrics', error);
      // Return empty metrics on error rather than crashing
      return {
        totalCases: 0,
        activeCases: 0,
        closedCases: 0,
        pendingCases: 0,
        byType: [],
        byStatus: [],
      };
    }
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
