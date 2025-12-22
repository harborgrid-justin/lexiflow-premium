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
import { CasesService } from '../../cases/cases.service';
import { CaseStatus } from '../../cases/entities/case.entity';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

const pubSub = new PubSub();

@Resolver(() => CaseType)
export class CaseResolver {
  constructor(private caseService: CasesService) {}

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
    @CurrentUser() user: AuthenticatedUser,
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
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.update(id, input as any);
    pubSub.publish('caseUpdated', { caseUpdated: caseEntity, id });
    return caseEntity as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCase(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.caseService.remove(id);
    return true;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async addParty(
    @Args('input') input: AddPartyInput,
    @CurrentUser() user: AuthenticatedUser,
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
    @CurrentUser() user: AuthenticatedUser,
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
    @CurrentUser() user: AuthenticatedUser,
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
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.findOne(input.caseId);
    // Note: Docket entries are typically managed through case updates or a separate docket service
    // This mutation would need additional service methods for full implementation
    return caseEntity as any;
  }

  @Query(() => CaseMetrics, { name: 'caseMetrics' })
  @UseGuards(GqlAuthGuard)
  async getCaseMetrics(): Promise<CaseMetrics> {
    // Get all cases for metrics calculation
    const allCases = await this.caseService.findAll({ limit: 10000 } as any);

    const totalCases = allCases.total;
    const activeCases = allCases.data.filter(c =>
      c.status === CaseStatus.ACTIVE
    ).length;
    const closedCases = allCases.data.filter(c =>
      c.status === CaseStatus.CLOSED || c.status === CaseStatus.CLOSED_LOWER
    ).length;
    const pendingCases = allCases.data.filter(c =>
      c.status === CaseStatus.PENDING
    ).length;

    // Calculate by type and status distributions
    const typeMap = new Map<string, number>();
    const statusMap = new Map<string, number>();

    allCases.data.forEach(c => {
      typeMap.set(c.type, (typeMap.get(c.type) || 0) + 1);
      statusMap.set(c.status, (statusMap.get(c.status) || 0) + 1);
    });

    return {
      totalCases,
      activeCases,
      closedCases,
      pendingCases,
      byType: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })),
      byStatus: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
    };
  }

  @Subscription(() => CaseType, {
    name: 'caseUpdated',
    filter: (payload, variables) => {
      return payload.id === variables.id;
    },
  })
  caseUpdated(@Args('id', { type: () => ID }) id: string) {
    // @ts-ignore - PubSub asyncIterator exists at runtime
    return pubSub.asyncIterator('caseUpdated');
  }
}
