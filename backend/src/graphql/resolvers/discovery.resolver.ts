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
import { DiscoveryService } from '../../discovery/discovery.service';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

@Resolver(() => DiscoveryRequestType)
export class DiscoveryResolver {
  constructor(private discoveryService: DiscoveryService) {}

  @Query(() => [DiscoveryRequestType], { name: 'discoveryRequests' })
  @UseGuards(GqlAuthGuard)
  async getDiscoveryRequests(
    @Args('caseId', { type: () => ID }) caseId: string,
  ): Promise<DiscoveryRequestType[]> {
    const requests = await this.discoveryService.findRequestsByCaseId(caseId);
    return requests as any[];
  }

  @Query(() => DiscoveryRequestType, { name: 'discoveryRequest', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDiscoveryRequest(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DiscoveryRequestType | null> {
    try {
      const request = await this.discoveryService.findRequestById(id);
      return request as any;
    } catch (error) {
      return null;
    }
  }

  @Mutation(() => DiscoveryRequestType)
  @UseGuards(GqlAuthGuard)
  async createDiscoveryRequest(
    @Args('input') input: CreateDiscoveryRequestInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<DiscoveryRequestType> {
    const request = await this.discoveryService.createRequest(input as any);
    return request as any;
  }

  @Mutation(() => DiscoveryRequestType)
  @UseGuards(GqlAuthGuard)
  async updateDiscoveryRequest(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDiscoveryRequestInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<DiscoveryRequestType> {
    const request = await this.discoveryService.updateRequest(id, input as any);
    return request as any;
  }

  @Query(() => [DepositionType], { name: 'depositions' })
  @UseGuards(GqlAuthGuard)
  async getDepositions(@Args('_caseId', { type: () => ID }) _caseId: string): Promise<DepositionType[]> {
    // Note: Depositions are not directly implemented in the current DiscoveryService
    // This would require a separate Depositions service or module
    return [];
  }

  @Query(() => DepositionType, { name: 'deposition', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDeposition(@Args('_id', { type: () => ID }) _id: string): Promise<DepositionType | null> {
    // Note: Depositions are not directly implemented in the current DiscoveryService
    return null;
  }

  @Mutation(() => DepositionType)
  @UseGuards(GqlAuthGuard)
  async createDeposition(
    @Args('_input') _input: CreateDepositionInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<DepositionType> {
    // Note: Depositions are not directly implemented in the current DiscoveryService
    throw new Error('Deposition functionality requires additional service implementation');
  }

  @Mutation(() => DepositionType)
  @UseGuards(GqlAuthGuard)
  async updateDeposition(
    @Args('_id', { type: () => ID }) _id: string,
    @Args('_input') _input: UpdateDepositionInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<DepositionType> {
    // Note: Depositions are not directly implemented in the current DiscoveryService
    throw new Error('Deposition functionality requires additional service implementation');
  }

  @Query(() => [LegalHoldType], { name: 'legalHolds' })
  @UseGuards(GqlAuthGuard)
  async getLegalHolds(@Args('caseId', { type: () => ID }) caseId: string): Promise<LegalHoldType[]> {
    const holds = await this.discoveryService.findHoldsByCaseId(caseId);
    return holds as any[];
  }

  @Mutation(() => LegalHoldType)
  @UseGuards(GqlAuthGuard)
  async createLegalHold(
    @Args('input') input: CreateLegalHoldInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<LegalHoldType> {
    const hold = await this.discoveryService.createHold(input as any);
    return hold as any;
  }

  @Mutation(() => LegalHoldType)
  @UseGuards(GqlAuthGuard)
  async releaseLegalHold(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<LegalHoldType> {
    const hold = await this.discoveryService.releaseHold(id);
    return hold as any;
  }

  @Query(() => [PrivilegeLogEntryType], { name: 'privilegeLog' })
  @UseGuards(GqlAuthGuard)
  async getPrivilegeLog(@Args('_caseId', { type: () => ID }) _caseId: string): Promise<PrivilegeLogEntryType[]> {
    // Note: Privilege log is not directly implemented in the current DiscoveryService
    // This would require additional service methods for full implementation
    return [];
  }

  @Mutation(() => PrivilegeLogEntryType)
  @UseGuards(GqlAuthGuard)
  async createPrivilegeLogEntry(
    @Args('_input') _input: CreatePrivilegeLogEntryInput,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<PrivilegeLogEntryType> {
    // Note: Privilege log is not directly implemented in the current DiscoveryService
    throw new Error('Privilege log functionality requires additional service implementation');
  }
}
