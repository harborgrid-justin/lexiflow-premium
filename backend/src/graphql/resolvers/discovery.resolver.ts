import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { GqlAuthGuard } from "@auth/guards/gql-auth.guard";
import { AuthenticatedUser } from "@auth/interfaces/authenticated-user.interface";
import { DepositionsService } from "@discovery/depositions/depositions.service";
import { DiscoveryService } from "@discovery/discovery.service";
import { PrivilegeLogService } from "@discovery/privilege-log/privilege-log.service";
import {
  CreateDepositionInput,
  CreateDiscoveryRequestInput,
  CreateLegalHoldInput,
  CreatePrivilegeLogEntryInput,
  UpdateDepositionInput,
  UpdateDiscoveryRequestInput,
} from "@graphql/inputs/discovery.input";
import {
  DepositionType,
  DiscoveryRequestType,
  LegalHoldType,
  PrivilegeLogEntryType,
} from "@graphql/types/discovery.type";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

@Resolver(() => DiscoveryRequestType)
export class DiscoveryResolver {
  constructor(
    private discoveryService: DiscoveryService,
    private depositionsService: DepositionsService,
    private privilegeLogService: PrivilegeLogService
  ) {}

  @Query(() => [DiscoveryRequestType], { name: "discoveryRequests" })
  @UseGuards(GqlAuthGuard)
  async getDiscoveryRequests(
    @Args("caseId", { type: () => ID }) caseId: string
  ): Promise<DiscoveryRequestType[]> {
    const requests = await this.discoveryService.findRequestsByCaseId(caseId);
    const data = (requests as { data?: unknown[] }).data || requests;
    return data as DiscoveryRequestType[];
  }

  @Query(() => DiscoveryRequestType, {
    name: "discoveryRequest",
    nullable: true,
  })
  @UseGuards(GqlAuthGuard)
  async getDiscoveryRequest(
    @Args("id", { type: () => ID }) id: string
  ): Promise<DiscoveryRequestType | null> {
    try {
      const request = await this.discoveryService.findRequestById(id);
      return request as unknown as DiscoveryRequestType;
    } catch {
      return null;
    }
  }

  @Mutation(() => DiscoveryRequestType)
  @UseGuards(GqlAuthGuard)
  async createDiscoveryRequest(
    @Args("input") input: CreateDiscoveryRequestInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<DiscoveryRequestType> {
    const request = await this.discoveryService.createRequest(input as unknown as Parameters<DiscoveryService['createRequest']>[0]);
    return request as unknown as DiscoveryRequestType;
  }

  @Mutation(() => DiscoveryRequestType)
  @UseGuards(GqlAuthGuard)
  async updateDiscoveryRequest(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateDiscoveryRequestInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<DiscoveryRequestType> {
    const request = await this.discoveryService.updateRequest(id, input as unknown as Parameters<DiscoveryService['updateRequest']>[1]);
    return request as unknown as DiscoveryRequestType;
  }

  @Query(() => [DepositionType], { name: "depositions" })
  @UseGuards(GqlAuthGuard)
  async getDepositions(
    @Args("caseId", { type: () => ID }) caseId: string
  ): Promise<DepositionType[]> {
    const result = await this.depositionsService.findAll({ caseId });
    return result.items as unknown as DepositionType[];
  }

  @Query(() => DepositionType, { name: "deposition", nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDeposition(
    @Args("id", { type: () => ID }) id: string
  ): Promise<DepositionType | null> {
    try {
      const deposition = await this.depositionsService.findOne(id);
      return deposition as unknown as DepositionType;
    } catch {
      return null;
    }
  }

  @Mutation(() => DepositionType)
  @UseGuards(GqlAuthGuard)
  async createDeposition(
    @Args("input") input: CreateDepositionInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<DepositionType> {
    const deposition = await this.depositionsService.create(input as unknown as Parameters<DepositionsService['create']>[0]);
    return deposition as unknown as DepositionType;
  }

  @Mutation(() => DepositionType)
  @UseGuards(GqlAuthGuard)
  async updateDeposition(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateDepositionInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<DepositionType> {
    const deposition = await this.depositionsService.update(id, input as unknown as Parameters<DepositionsService['update']>[1]);
    return deposition as unknown as DepositionType;
  }

  @Query(() => [LegalHoldType], { name: "legalHolds" })
  @UseGuards(GqlAuthGuard)
  async getLegalHolds(
    @Args("caseId", { type: () => ID }) caseId: string
  ): Promise<LegalHoldType[]> {
    const holds = await this.discoveryService.findHoldsByCaseId(caseId);
    return holds as unknown as LegalHoldType[];
  }

  @Mutation(() => LegalHoldType)
  @UseGuards(GqlAuthGuard)
  async createLegalHold(
    @Args("input") input: CreateLegalHoldInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<LegalHoldType> {
    const hold = await this.discoveryService.createHold(input as unknown as Parameters<DiscoveryService['createHold']>[0]);
    return hold as unknown as LegalHoldType;
  }

  @Mutation(() => LegalHoldType)
  @UseGuards(GqlAuthGuard)
  async releaseLegalHold(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<LegalHoldType> {
    const hold = await this.discoveryService.releaseHold(id);
    return hold as unknown as LegalHoldType;
  }

  @Query(() => [PrivilegeLogEntryType], { name: "privilegeLog" })
  @UseGuards(GqlAuthGuard)
  async getPrivilegeLog(
    @Args("caseId", { type: () => ID }) caseId: string
  ): Promise<PrivilegeLogEntryType[]> {
    const result = await this.privilegeLogService.findAll({ caseId });
    return result.items as unknown as PrivilegeLogEntryType[];
  }

  @Mutation(() => PrivilegeLogEntryType)
  @UseGuards(GqlAuthGuard)
  async createPrivilegeLogEntry(
    @Args("input") input: CreatePrivilegeLogEntryInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<PrivilegeLogEntryType> {
    const entry = await this.privilegeLogService.create(input as any);
    return entry as unknown as PrivilegeLogEntryType;
  }
}
