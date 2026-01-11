import { Public } from "@common/decorators/public.decorator";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DocketService } from "./docket.service";
import { CreateDocketEntryDto } from "./dto/create-docket-entry.dto";
import { PacerSyncDto, PacerSyncResultDto } from "./dto/pacer-sync.dto";
import { UpdateDocketEntryDto } from "./dto/update-docket-entry.dto";
import { DocketEntry } from "./entities/docket-entry.entity";

@ApiTags("Docket")
@ApiBearerAuth("JWT-auth")
@Controller("docket")
export class DocketController {
  constructor(private readonly docketService: DocketService) {}

  @Public()
  @Get()
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(
    @Query("caseId") caseId?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20
  ): Promise<{
    data: DocketEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const options = { page, limit };
    const result = caseId
      ? await this.docketService.findAllByCaseId(caseId, options)
      : await this.docketService.findAll(options);

    if (Array.isArray(result)) {
      return {
        data: result,
        total: result.length,
        page: 1,
        limit: result.length,
        totalPages: 1,
      };
    }
    return {
      ...result,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  @Public()
  @Get(":id")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async findOne(@Param("id") id: string): Promise<DocketEntry> {
    return this.docketService.findOne(id);
  }

  @Public() // Temporarily public for import script testing
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async createDocket(
    @Body() createDocketEntryDto: CreateDocketEntryDto
  ): Promise<DocketEntry> {
    return this.docketService.create(createDocketEntryDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async removeDocket(@Param("id") id: string): Promise<void> {
    return this.docketService.remove(id);
  }

  @Get("cases/:caseId/docket")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAllByCaseId(
    @Param("caseId") caseId: string
  ): Promise<DocketEntry[]> {
    const result = await this.docketService.findAllByCaseId(caseId);
    if (Array.isArray(result)) {
      return result;
    }
    // Handle paginated result if necessary, checking for 'data' property in a safe way
    const safeResult = result as { data?: DocketEntry[] };
    return safeResult.data || [];
  }

  @Post("cases/:caseId/docket")
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async create(
    @Body() createDocketEntryDto: CreateDocketEntryDto
  ): Promise<DocketEntry> {
    return this.docketService.create(createDocketEntryDto);
  }

  @Public()
  @Put(":id")
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async update(
    @Param("id") id: string,
    @Body() updateDocketEntryDto: UpdateDocketEntryDto
  ): Promise<DocketEntry> {
    return this.docketService.update(id, updateDocketEntryDto);
  }

  @Post("pacer/sync")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async syncFromPacer(
    @Body() pacerSyncDto: PacerSyncDto
  ): Promise<PacerSyncResultDto> {
    return this.docketService.syncFromPacer(pacerSyncDto);
  }
}
