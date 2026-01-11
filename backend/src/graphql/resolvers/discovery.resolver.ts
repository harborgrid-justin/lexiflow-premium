import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import {
  DiscoveryRequestType,
  DepositionType,
  LegalHoldType,
  PrivilegeLogEntryType,
} from "@graphql/types/discovery.type";
import {
  CreateDiscoveryRequestInput,
  UpdateDiscoveryRequestInput,
  CreateDepositionInput,
  UpdateDepositionInput,
  CreateLegalHoldInput,
  CreatePrivilegeLogEntryInput,
} from "@graphql/inputs/discovery.input";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { GqlAuthGuard } from "@auth/guards/gql-auth.guard";
import { DiscoveryService } from "@discovery/discovery.service";
import { DepositionsService } from "@discovery/depositions/depositions.service";
import { PrivilegeLogService } from "@discovery/privilege-log/privilege-log.service";
import { AuthenticatedUser } from "@auth/interfaces/authenticated-user.interface";

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
    return (requests as unknown).data || requests;
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
      return request as unknown;
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
    const request = await this.discoveryService.createRequest(input as unknown);
    return request as unknown;
  }

  @Mutation(() => DiscoveryRequestType)
  @UseGuards(GqlAuthGuard)
  async updateDiscoveryRequest(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateDiscoveryRequestInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<DiscoveryRequestType> {
    const request = await this.discoveryService.updateRequest(
      id,
      input as unknown
    );
    return request as unknown;
  }

  @Query(() => [DepositionType], { name: "depositions" })
  @UseGuards(GqlAuthGuard)
  async getDepositions(
    @Args("caseId", { type: () => ID }) caseId: string
  ): Promise<DepositionType[]> {
    const result = await this.depositionsService.findAll({ caseId });
    return result.items as any[];
  }

  @Query(() => DepositionType, { name: "deposition", nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDeposition(
    @Args("id", { type: () => ID }) id: string
  ): Promise<DepositionType | null> {
    try {
      const deposition = await this.depositionsService.findOne(id);
      return deposition as unknown;
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
    const deposition = await this.depositionsService.create(input as unknown);
    return deposition as unknown;
  }

  @Mutation(() => DepositionType)
  @UseGuards(GqlAuthGuard)
  async updateDeposition(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateDepositionInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<DepositionType> {
    const deposition = await this.depositionsService.update(
      id,
      input as unknown
    );
    return deposition as unknown;
  }

  @Query(() => [LegalHoldType], { name: "legalHolds" })
  @UseGuards(GqlAuthGuard)
  async getLegalHolds(
    @Args("caseId", { type: () => ID }) caseId: string
  ): Promise<LegalHoldType[]> {
    const holds = await this.discoveryService.findHoldsByCaseId(caseId);
    return holds as any[];
  }

  @Mutation(() => LegalHoldType)
  @UseGuards(GqlAuthGuard)
  async createLegalHold(
    @Args("input") input: CreateLegalHoldInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<LegalHoldType> {
    const hold = await this.discoveryService.createHold(input as unknown);
    return hold as unknown;
  }

  @Mutation(() => LegalHoldType)
  @UseGuards(GqlAuthGuard)
  async releaseLegalHold(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<LegalHoldType> {
    const hold = await this.discoveryService.releaseHold(id);
    return hold as unknown;
  }

  @Query(() => [PrivilegeLogEntryType], { name: "privilegeLog" })
  @UseGuards(GqlAuthGuard)
  async getPrivilegeLog(
    @Args("caseId", { type: () => ID }) caseId: string
  ): Promise<PrivilegeLogEntryType[]> {
    const result = await this.privilegeLogService.findAll({ caseId });
    return result.items as any[];
  }

  @Mutation(() => PrivilegeLogEntryType)
  @UseGuards(GqlAuthGuard)
  async createPrivilegeLogEntry(
    @Args("input") input: CreatePrivilegeLogEntryInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<PrivilegeLogEntryType> {
    const entry = await this.privilegeLogService.create(input as unknown);
    return entry as unknown;
  }
}
