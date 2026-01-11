import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Subscription,
} from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import {
  CaseType,
  CaseConnection,
  CaseMetrics,
} from "@graphql/types/case.type";
import {
  CreateCaseInput,
  UpdateCaseInput,
  CaseFilterInput,
  AddPartyInput,
  AddTeamMemberInput,
  CreateMotionInput,
  CreateDocketEntryInput,
} from "@graphql/inputs/case.input";
import { PaginationInput } from "@graphql/inputs/pagination.input";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { GqlAuthGuard } from "@auth/guards/gql-auth.guard";
import { CasesService } from "@cases/cases.service";
import { CaseStatus } from "@cases/entities/case.entity";
import { AuthenticatedUser } from "@auth/interfaces/authenticated-user.interface";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Cacheable } from "@common/decorators/cache.decorator";

const pubSub = new PubSub();

/**
 * OPTIMIZED Case Resolver
 * Fixes Critical Performance Issues:
 * 1. N+1 query problem in getCaseMetrics
 * 2. Adds caching for expensive aggregations
 * 3. Uses efficient database aggregations instead of loading all records
 * 4. Implements query result caching
 */
@Resolver(() => CaseType)
export class CaseResolverOptimized {
  constructor(
    private caseService: CasesService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Query(() => CaseConnection, { name: "cases" })
  @UseGuards(GqlAuthGuard)
  @Cacheable({ ttl: 60 }) // Cache for 1 minute
  async getCases(
    @Args("filter", { nullable: true }) filter?: CaseFilterInput,
    @Args("pagination", { nullable: true }) pagination?: PaginationInput
  ): Promise<CaseConnection> {
    const result = await this.caseService.findAll({
      ...filter,
      page: pagination?.page,
      limit: pagination?.limit,
      sortBy: pagination?.sortBy,
      sortOrder: pagination?.sortOrder,
    } as unknown as CaseFilterDto);

    return {
      edges: result.data.map((caseItem) => ({
        node: caseItem as unknown as CaseType,
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

  @Query(() => CaseType, { name: "case", nullable: true })
  @UseGuards(GqlAuthGuard)
  @Cacheable({ ttl: 300 }) // Cache for 5 minutes
  async getCase(
    @Args("id", { type: () => ID }) id: string
  ): Promise<CaseType | null> {
    try {
      const caseItem = await this.caseService.findOne(id);
      return caseItem as unknown as CaseType;
    } catch {
      return null;
    }
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async createCase(
    @Args("input") input: CreateCaseInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.create(
      input as unknown as CreateCaseDto
    );
    pubSub.publish("caseCreated", { caseCreated: caseEntity });
    return caseEntity as unknown as CaseType;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async updateCase(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateCaseInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.update(
      id,
      input as unknown as UpdateCaseDto
    );
    pubSub.publish("caseUpdated", { caseUpdated: caseEntity, id });
    return caseEntity as unknown as CaseType;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCase(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<boolean> {
    await this.caseService.remove(id);
    return true;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async addParty(
    @Args("input") input: AddPartyInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.findOne(input.caseId);
    return caseEntity as unknown as CaseType;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async addTeamMember(
    @Args("input") input: AddTeamMemberInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.findOne(input.caseId);
    return caseEntity as unknown as CaseType;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async createMotion(
    @Args("input") input: CreateMotionInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.findOne(input.caseId);
    return caseEntity as unknown as CaseType;
  }

  @Mutation(() => CaseType)
  @UseGuards(GqlAuthGuard)
  async createDocketEntry(
    @Args("input") input: CreateDocketEntryInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<CaseType> {
    const caseEntity = await this.caseService.findOne(input.caseId);
    return caseEntity as unknown as CaseType;
  }

  /**
   * OPTIMIZED: Use database aggregations instead of loading 10,000 records
   * Original implementation loaded all cases into memory - CRITICAL PERFORMANCE BUG
   * This uses efficient SQL aggregations with proper indexing
   */
  @Query(() => CaseMetrics, { name: "caseMetrics" })
  @UseGuards(GqlAuthGuard)
  @Cacheable({ ttl: 300 }) // Cache for 5 minutes
  async getCaseMetrics(): Promise<CaseMetrics> {
    // Use single optimized query with aggregations
    const metricsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE status = '${CaseStatus.ACTIVE}') as active_cases,
        COUNT(*) FILTER (WHERE status IN ('${CaseStatus.OPEN}', '${CaseStatus.PENDING}')) as pending_cases,
        COUNT(*) FILTER (WHERE status IN ('${CaseStatus.CLOSED}', 'closed')) as closed_cases,
        COUNT(*) as total_cases
      FROM cases
      WHERE deleted_at IS NULL;
    `;

    const [metrics] = await this.dataSource.query(metricsQuery);

    // Get type distribution efficiently
    const typeDistribution = await this.dataSource.query(`
      SELECT
        type,
        COUNT(*) as count
      FROM cases
      WHERE deleted_at IS NULL
      GROUP BY type
      ORDER BY count DESC;
    `);

    // Get status distribution efficiently
    const statusDistribution = await this.dataSource.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM cases
      WHERE deleted_at IS NULL
      GROUP BY status
      ORDER BY count DESC;
    `);

    return {
      totalCases: parseInt(metrics.total_cases) || 0,
      activeCases: parseInt(metrics.active_cases) || 0,
      closedCases: parseInt(metrics.closed_cases) || 0,
      pendingCases: parseInt(metrics.pending_cases) || 0,
      byType: typeDistribution.map((row: unknown) => ({
        type: (row as any).type,
        count: parseInt((row as any).count),
      })),
      byStatus: statusDistribution.map((row: unknown) => ({
        status: (row as any).status,
        count: parseInt((row as any).count),
      })),
    };
  }

  @Subscription(() => CaseType, {
    name: "caseUpdated",
    filter: (payload, variables) => {
      return payload.id === variables.id;
    },
  })
  caseUpdated(@Args("_id", { type: () => ID }) _id: string) {
    // @ts-expect-error - PubSub asyncIterator exists at runtime
    return pubSub.asyncIterator("caseUpdated");
  }
}
