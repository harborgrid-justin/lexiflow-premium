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
}
