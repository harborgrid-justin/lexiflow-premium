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
  ParseUUIDPipe,
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
  CreateWorkflowInstanceDto,
  UpdateWorkflowInstanceDto,
  WorkflowInstanceQueryDto,
} from "./dto/workflow-instance.dto";
import { WorkflowInstance } from "./entities/workflow-instance.entity";
import {
  PaginatedWorkflowInstances,
  WorkflowInstancesService,
} from "./workflow-instances.service";

@ApiTags("Workflow Instances")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("workflow/instances")
export class WorkflowInstancesController {
  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService
  ) {}

  @Head()
  @HttpCode(HttpStatus.OK)
  async health(): Promise<void> {
    return;
  }

  @Get()
  @ApiOperation({ summary: "Get all workflow instances" })
  @ApiResponse({
    status: 200,
    description: "Instances retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(
    @Query() query: WorkflowInstanceQueryDto
  ): Promise<PaginatedWorkflowInstances> {
    return await this.workflowInstancesService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get workflow instance by ID" })
  @ApiResponse({ status: 200, description: "Instance found" })
  @ApiResponse({ status: 404, description: "Instance not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<WorkflowInstance> {
    return await this.workflowInstancesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create workflow instance" })
  @ApiResponse({ status: 201, description: "Instance created successfully" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Template not found" })
  async create(
    @Body() createDto: CreateWorkflowInstanceDto
  ): Promise<WorkflowInstance> {
    return await this.workflowInstancesService.create(createDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update workflow instance" })
  @ApiResponse({ status: 200, description: "Instance updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 404, description: "Instance not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateWorkflowInstanceDto
  ): Promise<WorkflowInstance> {
    return await this.workflowInstancesService.update(id, updateDto);
  }

  @Post(":id/start")
  @ApiOperation({ summary: "Start workflow instance" })
  @ApiResponse({ status: 200, description: "Instance started successfully" })
  @ApiResponse({ status: 400, description: "Invalid workflow state" })
  @ApiResponse({ status: 404, description: "Instance not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async start(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<WorkflowInstance> {
    return await this.workflowInstancesService.start(id);
  }

  @Post(":id/pause")
  @ApiOperation({ summary: "Pause workflow instance" })
  @ApiResponse({ status: 200, description: "Instance paused successfully" })
  @ApiResponse({ status: 400, description: "Invalid workflow state" })
  @ApiResponse({ status: 404, description: "Instance not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async pause(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<WorkflowInstance> {
    return await this.workflowInstancesService.pause(id);
  }

  @Post(":id/resume")
  @ApiOperation({ summary: "Resume workflow instance" })
  @ApiResponse({ status: 200, description: "Instance resumed successfully" })
  @ApiResponse({ status: 400, description: "Invalid workflow state" })
  @ApiResponse({ status: 404, description: "Instance not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async resume(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<WorkflowInstance> {
    return await this.workflowInstancesService.resume(id);
  }

  @Post(":id/cancel")
  @ApiOperation({ summary: "Cancel workflow instance" })
  @ApiResponse({ status: 200, description: "Instance cancelled successfully" })
  @ApiResponse({ status: 400, description: "Invalid workflow state" })
  @ApiResponse({ status: 404, description: "Instance not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async cancel(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<WorkflowInstance> {
    return await this.workflowInstancesService.cancel(id);
  }

  @Post(":id/complete")
  @ApiOperation({ summary: "Complete workflow instance" })
  @ApiResponse({ status: 200, description: "Instance completed successfully" })
  @ApiResponse({ status: 400, description: "Invalid workflow state" })
  @ApiResponse({ status: 404, description: "Instance not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async complete(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<WorkflowInstance> {
    return await this.workflowInstancesService.complete(id);
  }

  @Post(":id/advance")
  @ApiOperation({ summary: "Advance workflow to next step" })
  @ApiResponse({ status: 200, description: "Instance advanced successfully" })
  @ApiResponse({ status: 400, description: "Invalid workflow state" })
  @ApiResponse({ status: 404, description: "Instance not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async advanceStep(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: { stepData?: Record<string, unknown> }
  ): Promise<WorkflowInstance> {
    return await this.workflowInstancesService.advanceStep(id, body.stepData);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete workflow instance" })
  @ApiResponse({ status: 204, description: "Instance deleted successfully" })
  @ApiResponse({ status: 404, description: "Instance not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.workflowInstancesService.remove(id);
  }
}
