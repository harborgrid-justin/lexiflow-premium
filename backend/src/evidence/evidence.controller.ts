import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CreateChainOfCustodyDto } from "./dto/create-chain-of-custody.dto";
import { CreateEvidenceItemDto } from "./dto/create-evidence.dto";
import { TransferCustodyDto } from "./dto/transfer-custody.dto";
import { UpdateEvidenceItemDto } from "./dto/update-evidence.dto";
import { ChainOfCustodyEvent } from "./entities/chain-of-custody-event.entity";
import {
  EvidenceItem,
  EvidenceStatus,
  EvidenceType,
} from "./entities/evidence-item.entity";
import { EvidenceService } from "./evidence.service";

@ApiTags("evidence")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("evidence")
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @ApiOperation({ summary: "Create a new evidence item" })
  @ApiResponse({
    status: 201,
    description: "Evidence item created successfully",
    type: EvidenceItem,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async create(@Body() dto: CreateEvidenceItemDto): Promise<EvidenceItem> {
    return this.evidenceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all evidence items with pagination" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 50)",
  })
  @ApiQuery({
    name: "caseId",
    required: false,
    type: String,
    description: "Filter by case ID",
  })
  @ApiQuery({
    name: "type",
    required: false,
    enum: EvidenceType,
    description: "Filter by evidence type",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: EvidenceStatus,
    description: "Filter by evidence status",
  })
  @ApiQuery({
    name: "custodian",
    required: false,
    type: String,
    description: "Filter by custodian",
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search in description or tags",
  })
  @ApiQuery({
    name: "dateFrom",
    required: false,
    type: String,
    description: "Filter by collection date from (ISO 8601)",
  })
  @ApiQuery({
    name: "dateTo",
    required: false,
    type: String,
    description: "Filter by collection date to (ISO 8601)",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    type: String,
    description: "Sort by field",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order",
  })
  @ApiResponse({
    status: 200,
    description: "Evidence items retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("caseId") caseId?: string,
    @Query("type") type?: EvidenceType,
    @Query("status") status?: EvidenceStatus,
    @Query("custodian") custodian?: string,
    @Query("search") search?: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc",
  ): Promise<{
    data: EvidenceItem[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const cleanString = (value?: string) => {
      if (value === undefined || value === null) return undefined;
      const trimmed = `${value}`.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    };

    const parseDate = (value?: string) => {
      const cleaned = cleanString(value);
      if (!cleaned) return undefined;
      const parsed = new Date(cleaned);
      return Number.isNaN(parsed.getTime()) ? undefined : cleaned;
    };

    const allowedSortFields = [
      "collectionDate",
      "createdAt",
      "status",
      "evidenceType",
      "currentCustodian",
      "caseId",
    ];

    const resolvedSortBy = allowedSortFields.includes(sortBy || "")
      ? sortBy
      : "collectionDate";

    const resolvedSortOrder = sortOrder === "asc" ? "asc" : "desc";

    const result = await this.evidenceService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      caseId: cleanString(caseId),
      type: cleanString(type) as EvidenceType | undefined,
      status: cleanString(status) as EvidenceStatus | undefined,
      custodian: cleanString(custodian),
      search: cleanString(search),
      dateFrom: parseDate(dateFrom),
      dateTo: parseDate(dateTo),
      sortBy: resolvedSortBy,
      sortOrder: resolvedSortOrder,
    });

    return {
      data: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.limit,
    };
  }

  @Get("case/:caseId")
  @ApiOperation({ summary: "Get evidence items by case" })
  @ApiResponse({
    status: 200,
    description: "Evidence items retrieved successfully",
    type: [EvidenceItem],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findByCase(@Param("caseId") caseId: string): Promise<EvidenceItem[]> {
    return this.evidenceService.findByCase(caseId);
  }

  @Get("type/:type")
  @ApiOperation({ summary: "Get evidence items by type" })
  @ApiResponse({
    status: 200,
    description: "Evidence items retrieved successfully",
    type: [EvidenceItem],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findByType(@Param("type") type: EvidenceType): Promise<EvidenceItem[]> {
    return this.evidenceService.findByType(type);
  }

  @Get("status/:status")
  @ApiOperation({ summary: "Get evidence items by status" })
  @ApiResponse({
    status: 200,
    description: "Evidence items retrieved successfully",
    type: [EvidenceItem],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findByStatus(
    @Param("status") status: EvidenceStatus,
  ): Promise<EvidenceItem[]> {
    return this.evidenceService.findByStatus(status);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get evidence item by ID" })
  @ApiResponse({
    status: 200,
    description: "Evidence item retrieved successfully",
    type: EvidenceItem,
  })
  @ApiResponse({ status: 404, description: "Evidence item not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findOne(@Param("id") id: string): Promise<EvidenceItem> {
    return this.evidenceService.findOne(id);
  }

  @Get(":id/chain-of-custody")
  @ApiOperation({ summary: "Get chain of custody for evidence item" })
  @ApiResponse({
    status: 200,
    description: "Chain of custody retrieved successfully",
    type: [ChainOfCustodyEvent],
  })
  @ApiResponse({ status: 404, description: "Evidence item not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getChainOfCustody(
    @Param("id") id: string,
  ): Promise<ChainOfCustodyEvent[]> {
    return this.evidenceService.getChainOfCustody(id);
  }

  @Post(":id/chain-of-custody")
  @ApiOperation({ summary: "Add chain of custody event" })
  @ApiResponse({
    status: 201,
    description: "Chain of custody event added successfully",
    type: ChainOfCustodyEvent,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async addChainOfCustodyEvent(
    @Param("id") id: string,
    @Body() dto: CreateChainOfCustodyDto,
  ): Promise<ChainOfCustodyEvent> {
    return this.evidenceService.addChainOfCustodyEvent({
      ...dto,
      evidenceId: id,
    });
  }

  @Post(":id/transfer")
  @ApiOperation({ summary: "Transfer custody of evidence item" })
  @ApiResponse({
    status: 201,
    description: "Custody transferred successfully",
    type: ChainOfCustodyEvent,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async transferCustody(
    @Param("id") id: string,
    @Body() dto: TransferCustodyDto,
  ): Promise<ChainOfCustodyEvent> {
    return this.evidenceService.transferCustody(id, dto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an evidence item" })
  @ApiResponse({
    status: 200,
    description: "Evidence item updated successfully",
    type: EvidenceItem,
  })
  @ApiResponse({ status: 404, description: "Evidence item not found" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateEvidenceItemDto,
  ): Promise<EvidenceItem> {
    return this.evidenceService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an evidence item" })
  @ApiResponse({
    status: 200,
    description: "Evidence item deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Evidence item not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async remove(@Param("id") id: string): Promise<void> {
    return this.evidenceService.remove(id);
  }
}
