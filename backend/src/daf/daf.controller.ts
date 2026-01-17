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
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { DafService } from "./daf.service";
import {
  CreateOperationDto,
  QueryOperationDto,
  UpdateOperationDto,
} from "./dto";

/**
 * DAF (Department of Air Force) Operations Controller
 * Handles military/government legal operations and compliance
 */
@ApiTags("DAF Operations")
@ApiBearerAuth("JWT-auth")
@Controller("daf")
@UseGuards(JwtAuthGuard)
export class DafController {
  constructor(private readonly dafService: DafService) {}

  @Get()
  @ApiOperation({ summary: "Get all DAF operations" })
  @ApiResponse({ status: 200, description: "Operations retrieved" })
  async findAll(@Query() query: QueryOperationDto) {
    return this.dafService.findAll(query);
  }

  @Get("dashboard")
  @ApiOperation({ summary: "Get DAF operations dashboard" })
  @ApiResponse({ status: 200, description: "Dashboard data retrieved" })
  async getDashboard() {
    return this.dafService.getDashboard();
  }

  @Get("compliance")
  @ApiOperation({ summary: "Get compliance status" })
  @ApiResponse({ status: 200, description: "Compliance data retrieved" })
  async getCompliance() {
    return this.dafService.getCompliance();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get operation by ID" })
  @ApiResponse({ status: 200, description: "Operation found" })
  @ApiResponse({ status: 404, description: "Operation not found" })
  async findOne(@Param("id") id: string) {
    return this.dafService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new operation" })
  @ApiResponse({ status: 201, description: "Operation created" })
  async create(@Body() createDto: CreateOperationDto) {
    return this.dafService.create(createDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update operation" })
  @ApiResponse({ status: 200, description: "Operation updated" })
  async update(@Param("id") id: string, @Body() updateDto: UpdateOperationDto) {
    return this.dafService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete operation" })
  @ApiResponse({ status: 200, description: "Operation deleted" })
  async remove(@Param("id") id: string) {
    return this.dafService.remove(id);
  }
}
