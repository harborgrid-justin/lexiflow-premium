import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DocketEntryType, DocketEntryConnection, DocketMetrics } from '../types/docket.type';
import {
  CreateDocketEntryInput,
  UpdateDocketEntryInput,
  DocketEntryFilterInput,
  BulkCreateDocketEntriesInput,
} from '../inputs/docket.input';
import { PaginationInput } from '../inputs/pagination.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CaseType } from '../types/case.type';
import { UserType } from '../types/user.type';

@Resolver(() => DocketEntryType)
export class DocketResolver {
  // Inject DocketService here
  // constructor(
  //   private docketService: DocketService,
  //   private caseLoader: CaseLoader,
  //   private userLoader: UserLoader,
  // ) {}

  @Query(() => DocketEntryConnection, { name: 'docketEntries' })
  @UseGuards(GqlAuthGuard)
  async getDocketEntries(
    @Args('filter', { nullable: true }) filter?: DocketEntryFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<DocketEntryConnection> {
    // TODO: Implement with DocketService
    // return this.docketService.findAll(filter, pagination);
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: 0,
    };
  }

  @Query(() => DocketEntryType, { name: 'docketEntry', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDocketEntry(@Args('id', { type: () => ID }) id: string): Promise<DocketEntryType | null> {
    // TODO: Implement with DocketService
    // return this.docketService.findOne(id);
    return null;
  }

  @Query(() => [DocketEntryType], { name: 'docketEntriesByCase' })
  @UseGuards(GqlAuthGuard)
  async getDocketEntriesByCase(
    @Args('caseId', { type: () => ID }) caseId: string,
  ): Promise<DocketEntryType[]> {
    // TODO: Implement with DocketService
    // return this.docketService.findByCaseId(caseId);
    return [];
  }

  @Mutation(() => DocketEntryType)
  @UseGuards(GqlAuthGuard)
  async createDocketEntry(
    @Args('input') input: CreateDocketEntryInput,
    @CurrentUser() user: any,
  ): Promise<DocketEntryType> {
    // TODO: Implement with DocketService
    // return this.docketService.create(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => [DocketEntryType])
  @UseGuards(GqlAuthGuard)
  async bulkCreateDocketEntries(
    @Args('input') input: BulkCreateDocketEntriesInput,
    @CurrentUser() user: any,
  ): Promise<DocketEntryType[]> {
    // TODO: Implement with DocketService
    // return this.docketService.bulkCreate(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => DocketEntryType)
  @UseGuards(GqlAuthGuard)
  async updateDocketEntry(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDocketEntryInput,
    @CurrentUser() user: any,
  ): Promise<DocketEntryType> {
    // TODO: Implement with DocketService
    // return this.docketService.update(id, input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteDocketEntry(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    // TODO: Implement with DocketService
    // await this.docketService.delete(id, user);
    // return true;
    throw new Error('Not implemented');
  }

  @Mutation(() => DocketEntryType)
  @UseGuards(GqlAuthGuard)
  async markDocketEntryServed(
    @Args('id', { type: () => ID }) id: string,
    @Args('servedDate', { type: () => Date }) servedDate: Date,
    @CurrentUser() user: any,
  ): Promise<DocketEntryType> {
    // TODO: Implement with DocketService
    // return this.docketService.markServed(id, servedDate, user);
    throw new Error('Not implemented');
  }

  @Query(() => DocketMetrics, { name: 'docketMetrics' })
  @UseGuards(GqlAuthGuard)
  async getDocketMetrics(
    @Args('caseId', { type: () => ID, nullable: true }) caseId?: string,
  ): Promise<DocketMetrics> {
    // TODO: Implement with DocketService
    // return this.docketService.getMetrics(caseId);
    return {
      totalEntries: 0,
      entriesThisMonth: 0,
      entriesThisWeek: 0,
      byType: [],
      byStatus: [],
    };
  }

  // Field Resolvers
  @ResolveField(() => CaseType)
  async case(@Parent() docketEntry: DocketEntryType): Promise<CaseType | null> {
    // TODO: Use DataLoader to prevent N+1 queries
    // return this.caseLoader.load(docketEntry.caseId);
    return null;
  }

  @ResolveField(() => UserType)
  async createdBy(@Parent() docketEntry: DocketEntryType): Promise<UserType | null> {
    // TODO: Use DataLoader to prevent N+1 queries
    // return this.userLoader.load(docketEntry.createdBy.id);
    return null;
  }
}
