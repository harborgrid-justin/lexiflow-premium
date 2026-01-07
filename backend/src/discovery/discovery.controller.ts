import { Public } from "@common/decorators/public.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import {
  Body,
  Controller,
  Get,
  Head,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@users/entities/user.entity";
import { CreateDiscoveryRequestDto } from "./discovery-requests/dto/create-discovery-request.dto";
import { QueryDiscoveryRequestDto } from "./discovery-requests/dto/query-discovery-request.dto";
import { DiscoveryService } from "./discovery.service";
import { CreateDiscoveryEvidenceDto } from "./evidence/dto/create-evidence.dto";
import { QueryEvidenceDto } from "./evidence/dto/query-evidence.dto";

@ApiTags("Discovery")
@ApiBearerAuth("JWT-auth")
@Controller("discovery")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Head()
  @HttpCode(HttpStatus.OK)
  async health() {
    return;
  }

  @Head("evidence")
  @HttpCode(HttpStatus.OK)
  async evidenceHealth() {
    return;
  }

  @Public()
  @Get("evidence")
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PARTNER,
    UserRole.ATTORNEY,
    UserRole.PARALEGAL
  )
  @ApiOperation({ summary: "Get all discovery evidence items" })
  @ApiResponse({ status: 200, description: "List of evidence items" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getAllEvidence(@Query() query?: QueryEvidenceDto) {
    return this.discoveryService.getAllEvidence(query);
  }

  @Post("evidence")
  @HttpCode(HttpStatus.CREATED)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PARTNER,
    UserRole.ATTORNEY,
    UserRole.PARALEGAL
  )
  @ApiOperation({ summary: "Create discovery evidence item" })
  @ApiResponse({ status: 201, description: "Evidence item created" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async createEvidence(@Body() createDto: CreateDiscoveryEvidenceDto) {
    return this.discoveryService.createEvidence(createDto);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PARTNER,
    UserRole.ATTORNEY,
    UserRole.PARALEGAL
  )
  @ApiOperation({ summary: "Get all discovery requests" })
  @ApiResponse({ status: 200, description: "List of discovery requests" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  findAll(@Query() _query?: QueryDiscoveryRequestDto) {
    return this.discoveryService.findAllRequests();
  }

  @Get(":id")
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PARTNER,
    UserRole.ATTORNEY,
    UserRole.PARALEGAL
  )
  @ApiOperation({ summary: "Get discovery request by ID" })
  @ApiResponse({ status: 200, description: "Discovery request details" })
  @ApiResponse({ status: 404, description: "Discovery request not found" })
  @ApiParam({ name: "id", description: "Discovery request ID" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  findOne(@Param("id") id: string) {
    return this.discoveryService.findRequestById(id);
  }

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PARTNER,
    UserRole.ATTORNEY,
    UserRole.PARALEGAL
  )
  @ApiOperation({ summary: "Create discovery request" })
  @ApiResponse({ status: 201, description: "Discovery request created" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  create(@Body() createDto: CreateDiscoveryRequestDto) {
    return this.discoveryService.createRequest(createDto);
  }
}
