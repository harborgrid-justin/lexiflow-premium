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
import { ApiResponse } from "@nestjs/swagger";
import { DiscoveryRequestsService } from "./discovery-requests.service";
import { CreateDiscoveryRequestDto } from "./dto/create-discovery-request.dto";
import { QueryDiscoveryRequestDto } from "./dto/query-discovery-request.dto";
import { UpdateDiscoveryRequestDto } from "./dto/update-discovery-request.dto";

@Controller("discovery-requests")
export class DiscoveryRequestsController {
  constructor(
    private readonly discoveryRequestsService: DiscoveryRequestsService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async create(@Body() createDto: CreateDiscoveryRequestDto) {
    return await this.discoveryRequestsService.create(createDto);
  }

  @Public() // TODO: Remove in production - add proper auth
  @Get()
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(@Query() queryDto: QueryDiscoveryRequestDto) {
    return await this.discoveryRequestsService.findAll(queryDto);
  }

  @Public() // TODO: Remove in production - add proper auth
  @Get("statistics/:caseId")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getStatistics(@Param("caseId") caseId: string) {
    return await this.discoveryRequestsService.getStatistics(caseId);
  }

  @Public() // TODO: Remove in production - add proper auth
  @Get(":id")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async findOne(@Param("id") id: string) {
    return await this.discoveryRequestsService.findOne(id);
  }

  @Put(":id")
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateDiscoveryRequestDto
  ) {
    return await this.discoveryRequestsService.update(id, updateDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async remove(@Param("id") id: string) {
    await this.discoveryRequestsService.remove(id);
  }
}
