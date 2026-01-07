import { Public } from "@common/decorators/public.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Head,
  HttpCode,
  HttpStatus,
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
import {
  CreateAdvisorDto,
  CreateExpertDto,
  UpdateStrategyDto,
} from "./dto/war-room.dto";
import { WarRoomService } from "./war-room.service";

@ApiTags("War Room")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("war-room")
export class WarRoomController {
  constructor(private readonly warRoomService: WarRoomService) {}

  @Public()
  @Head("health")
  @Get("health")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Health check" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  health(): { status: string; service: string } {
    return { status: "ok", service: "war-room" };
  }

  @Get("advisors")
  @ApiOperation({ summary: "Get advisors" })
  @ApiResponse({ status: 200, description: "Advisors retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getAdvisors(@Query() query: Record<string, unknown>): Promise<unknown> {
    return await this.warRoomService.findAllAdvisors(query);
  }

  @Get("advisors/:id")
  @ApiOperation({ summary: "Get advisor by ID" })
  @ApiResponse({ status: 200, description: "Advisor found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async getAdvisor(@Param("id") id: string): Promise<unknown> {
    return await this.warRoomService.findOneAdvisor(id);
  }

  @Post("advisors")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create advisor" })
  @ApiResponse({ status: 201, description: "Advisor created" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async createAdvisor(@Body() createDto: CreateAdvisorDto): Promise<unknown> {
    return await this.warRoomService.createAdvisor(createDto);
  }

  @Delete("advisors/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete advisor" })
  @ApiResponse({ status: 204, description: "Advisor deleted" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async deleteAdvisor(@Param("id") id: string): Promise<void> {
    await this.warRoomService.removeAdvisor(id);
  }

  @Get("experts")
  @ApiOperation({ summary: "Get expert witnesses" })
  @ApiResponse({ status: 200, description: "Experts retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getExperts(@Query() query: Record<string, unknown>): Promise<unknown> {
    return await this.warRoomService.findAllExperts(query);
  }

  @Get("experts/:id")
  @ApiOperation({ summary: "Get expert by ID" })
  @ApiResponse({ status: 200, description: "Expert found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async getExpert(@Param("id") id: string): Promise<unknown> {
    return await this.warRoomService.findOneExpert(id);
  }

  @Post("experts")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create expert" })
  @ApiResponse({ status: 201, description: "Expert created" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async createExpert(@Body() createDto: CreateExpertDto): Promise<unknown> {
    return await this.warRoomService.createExpert(createDto);
  }

  @Delete("experts/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete expert" })
  @ApiResponse({ status: 204, description: "Expert deleted" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async deleteExpert(@Param("id") id: string): Promise<void> {
    await this.warRoomService.removeExpert(id);
  }

  @Get(":caseId")
  @ApiOperation({ summary: "Get war room data for case" })
  @ApiResponse({ status: 200, description: "War room data retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getWarRoomData(@Param("caseId") caseId: string): Promise<unknown> {
    return await this.warRoomService.getWarRoomData(caseId);
  }

  @Get(":caseId/strategy")
  @ApiOperation({ summary: "Get case strategy" })
  @ApiResponse({ status: 200, description: "Strategy retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getStrategy(@Param("caseId") caseId: string): Promise<unknown> {
    return await this.warRoomService.getStrategy(caseId);
  }

  @Put(":caseId/strategy")
  @ApiOperation({ summary: "Update case strategy" })
  @ApiResponse({ status: 200, description: "Strategy updated" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async updateStrategy(
    @Param("caseId") caseId: string,
    @Body() updateDto: UpdateStrategyDto
  ): Promise<unknown> {
    return await this.warRoomService.updateStrategy(caseId, updateDto);
  }
}
