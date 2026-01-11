import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CrmService } from "./crm.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { Lead } from "./entities/lead.entity";
import { CreateOpportunityDto } from "./dto/create-opportunity.dto";
import { CreateRelationshipDto } from "./dto/create-relationship.dto";

@ApiTags("CRM")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("crm")
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get("leads")
  @ApiOperation({ summary: "Get all leads" })
  @ApiResponse({ status: 200, description: "Return all leads." })
  async getLeads(): Promise<Lead[]> {
    return this.crmService.getLeads();
  }

  @Post("leads")
  @ApiOperation({ summary: "Create a lead" })
  @ApiResponse({
    status: 201,
    description: "The lead has been successfully created.",
  })
  async createLead(@Body() leadData: CreateLeadDto): Promise<Lead> {
    return this.crmService.createLead(leadData);
  }

  @Get("leads/:id")
  @ApiOperation({ summary: "Get a lead by id" })
  @ApiResponse({ status: 200, description: "Return the lead." })
  @ApiResponse({ status: 404, description: "Lead not found." })
  async getLead(@Param("id") id: string): Promise<Lead> {
    const lead = await this.crmService.getLead(id);
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  @Get("opportunities")
  @ApiOperation({ summary: "Get all opportunities" })
  @ApiResponse({ status: 200, description: "Returns all opportunities." })
  async getOpportunities() {
    return this.crmService.getOpportunities();
  }

  @Post("opportunities")
  @ApiOperation({ summary: "Create an opportunity" })
  @ApiResponse({
    status: 201,
    description: "The opportunity has been successfully created.",
  })
  async createOpportunity(@Body() createOpportunityDto: CreateOpportunityDto) {
    return this.crmService.createOpportunity(createOpportunityDto);
  }

  @Get("relationships")
  @ApiOperation({ summary: "Get all client relationships" })
  @ApiResponse({
    status: 200,
    description: "Returns all client relationships.",
  })
  async getRelationships() {
    return this.crmService.getRelationships();
  }

  @Post("relationships")
  @ApiOperation({ summary: "Create a client relationship" })
  @ApiResponse({
    status: 201,
    description: "The relationship has been successfully created.",
  })
  async createRelationship(
    @Body() createRelationshipDto: CreateRelationshipDto
  ) {
    return this.crmService.createRelationship(createRelationshipDto);
  }

  @Get("business-development")
  @ApiOperation({ summary: "Get business development metrics and data" })
  @ApiResponse({ status: 200, description: "Returns business dev data." })
  async getBusinessDevelopmentData() {
    return this.crmService.getBusinessDevelopmentData();
  }

  @Get("pitches")
  @ApiOperation({ summary: "Get pitches" })
  @ApiResponse({ status: 200, description: "Returns pitches." })
  async getPitches() {
    return this.crmService.getPitches();
  }

  @Get("rfps")
  @ApiOperation({ summary: "Get RFPs" })
  @ApiResponse({ status: 200, description: "Returns RFPs." })
  async getRFPs() {
    return this.crmService.getRFPs();
  }

  @Get("win-loss")
  @ApiOperation({ summary: "Get Win/Loss Analysis" })
  @ApiResponse({ status: 200, description: "Returns win/loss data." })
  async getWinLossAnalysis() {
    return this.crmService.getWinLossAnalysis();
  }

  @Get("client-analytics")
  @ApiOperation({ summary: "Get client analytics data" })
  @ApiResponse({ status: 200, description: "Returns client analytics data." })
  async getClientAnalytics() {
    return this.crmService.getClientAnalytics();
  }
}
