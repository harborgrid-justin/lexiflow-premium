import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Public } from "@common/decorators/public.decorator";
import { CaseImportService, ImportOptions } from "./case-import.service";
import { CasesService } from "./cases.service";
import { CaseFilterDto } from "./dto/case-filter.dto";
import {
  CaseResponseDto,
  PaginatedCaseResponseDto,
} from "./dto/case-response.dto";
import { CaseStatsDto } from "./dto/case-stats.dto";
import { CreateCaseDto } from "./dto/create-case.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";

@ApiTags("Cases")
@ApiBearerAuth("JWT-auth")
@Controller("cases")
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly caseImportService: CaseImportService
  ) {}

  @Post("import/parse")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Parse case data from text/document" })
  @ApiResponse({ status: 200, description: "Parsed case data" })
  async parse(@Body() body: { content: string; options: ImportOptions }) {
    return this.caseImportService.parse(body.content, body.options);
  }

  @Public()
  @Get("stats")
  @ApiOperation({ summary: "Get case statistics and KPIs" })
  @ApiResponse({
    status: 200,
    description: "Case statistics",
    type: CaseStatsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getStats(): Promise<CaseStatsDto> {
    return this.casesService.getStats();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "List all cases" })
  @ApiResponse({
    status: 200,
    description: "List of cases",
    type: PaginatedCaseResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(
    @Query() filterDto: CaseFilterDto
  ): Promise<PaginatedCaseResponseDto> {
    return this.casesService.findAll(filterDto);
  }

  @Get("archived")
  @ApiOperation({ summary: "Get archived/closed cases" })
  @ApiResponse({
    status: 200,
    description: "List of archived cases",
    type: PaginatedCaseResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findArchived(
    @Query() filterDto: CaseFilterDto
  ): Promise<PaginatedCaseResponseDto> {
    return this.casesService.findArchived(filterDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get case by ID" })
  @ApiResponse({
    status: 200,
    description: "Case details",
    type: CaseResponseDto,
  })
  @ApiResponse({ status: 404, description: "Case not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<CaseResponseDto> {
    return this.casesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new case" })
  @ApiResponse({
    status: 201,
    description: "Case created successfully",
    type: CaseResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async create(@Body() createCaseDto: CreateCaseDto): Promise<CaseResponseDto> {
    return this.casesService.create(createCaseDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a case" })
  @ApiResponse({
    status: 200,
    description: "Case updated successfully",
    type: CaseResponseDto,
  })
  @ApiResponse({ status: 404, description: "Case not found" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateCaseDto: UpdateCaseDto
  ): Promise<CaseResponseDto> {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a case" })
  @ApiResponse({ status: 204, description: "Case deleted successfully" })
  @ApiResponse({ status: 404, description: "Case not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.casesService.remove(id);
  }

  @Post(":id/archive")
  @ApiOperation({ summary: "Archive a case" })
  @ApiResponse({
    status: 200,
    description: "Case archived successfully",
    type: CaseResponseDto,
  })
  @ApiResponse({ status: 404, description: "Case not found" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async archive(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<CaseResponseDto> {
    return this.casesService.archive(id);
  }
}
