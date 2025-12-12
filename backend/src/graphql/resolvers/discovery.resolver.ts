import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DiscoveryRequestType, DepositionType, LegalHoldType, PrivilegeLogEntryType } from '../types/discovery.type';
import {
  CreateDiscoveryRequestInput,
  UpdateDiscoveryRequestInput,
  CreateDepositionInput,
  UpdateDepositionInput,
  CreateLegalHoldInput,
  CreatePrivilegeLogEntryInput,
} from '../inputs/discovery.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';

@Resolver(() => DiscoveryRequestType)
export class DiscoveryResolver {
  // Inject DiscoveryService here
  // constructor(private discoveryService: DiscoveryService) {}

  @Query(() => [DiscoveryRequestType], { name: 'discoveryRequests' })
  @UseGuards(GqlAuthGuard)
  async getDiscoveryRequests(
    @Args('caseId', { type: () => ID }) caseId: string,
  ): Promise<DiscoveryRequestType[]> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.findAllRequests(caseId);
    return [];
  }

  @Query(() => DiscoveryRequestType, { name: 'discoveryRequest', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDiscoveryRequest(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DiscoveryRequestType | null> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.findOneRequest(id);
    return null;
  }

  @Mutation(() => DiscoveryRequestType)
  @UseGuards(GqlAuthGuard)
  async createDiscoveryRequest(
    @Args('input') input: CreateDiscoveryRequestInput,
    @CurrentUser() user: any,
  ): Promise<DiscoveryRequestType> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.createRequest(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => DiscoveryRequestType)
  @UseGuards(GqlAuthGuard)
  async updateDiscoveryRequest(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDiscoveryRequestInput,
    @CurrentUser() user: any,
  ): Promise<DiscoveryRequestType> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.updateRequest(id, input, user);
    throw new Error('Not implemented');
  }

  @Query(() => [DepositionType], { name: 'depositions' })
  @UseGuards(GqlAuthGuard)
  async getDepositions(@Args('caseId', { type: () => ID }) caseId: string): Promise<DepositionType[]> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.findAllDepositions(caseId);
    return [];
  }

  @Query(() => DepositionType, { name: 'deposition', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDeposition(@Args('id', { type: () => ID }) id: string): Promise<DepositionType | null> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.findOneDeposition(id);
    return null;
  }

  @Mutation(() => DepositionType)
  @UseGuards(GqlAuthGuard)
  async createDeposition(
    @Args('input') input: CreateDepositionInput,
    @CurrentUser() user: any,
  ): Promise<DepositionType> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.createDeposition(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => DepositionType)
  @UseGuards(GqlAuthGuard)
  async updateDeposition(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDepositionInput,
    @CurrentUser() user: any,
  ): Promise<DepositionType> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.updateDeposition(id, input, user);
    throw new Error('Not implemented');
  }

  @Query(() => [LegalHoldType], { name: 'legalHolds' })
  @UseGuards(GqlAuthGuard)
  async getLegalHolds(@Args('caseId', { type: () => ID }) caseId: string): Promise<LegalHoldType[]> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.findAllLegalHolds(caseId);
    return [];
  }

  @Mutation(() => LegalHoldType)
  @UseGuards(GqlAuthGuard)
  async createLegalHold(
    @Args('input') input: CreateLegalHoldInput,
    @CurrentUser() user: any,
  ): Promise<LegalHoldType> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.createLegalHold(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => LegalHoldType)
  @UseGuards(GqlAuthGuard)
  async releaseLegalHold(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<LegalHoldType> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.releaseLegalHold(id, user);
    throw new Error('Not implemented');
  }

  @Query(() => [PrivilegeLogEntryType], { name: 'privilegeLog' })
  @UseGuards(GqlAuthGuard)
  async getPrivilegeLog(@Args('caseId', { type: () => ID }) caseId: string): Promise<PrivilegeLogEntryType[]> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.findPrivilegeLog(caseId);
    return [];
  }

  @Mutation(() => PrivilegeLogEntryType)
  @UseGuards(GqlAuthGuard)
  async createPrivilegeLogEntry(
    @Args('input') input: CreatePrivilegeLogEntryInput,
    @CurrentUser() user: any,
  ): Promise<PrivilegeLogEntryType> {
    // TODO: Implement with DiscoveryService
    // return this.discoveryService.createPrivilegeLogEntry(input, user);
    throw new Error('Not implemented');
  }
}
