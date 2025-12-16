import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowTemplateDto } from './dto/create-workflow-template.dto';
import { UpdateWorkflowTemplateDto } from './dto/update-workflow-template.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Workflow Templates')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/workflow/templates')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}
  @Get()
  @ApiOperation({ summary: 'Get all workflow templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAll(@Query() query: any) {
    return await this.workflowService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow template by ID' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(@Param('id') id: string) {
    return await this.workflowService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create workflow template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async create(@Body() createDto: CreateWorkflowTemplateDto) {
    return await this.workflowService.create(createDto);
  }

  @Post(':id/instantiate')
  @ApiOperation({ summary: 'Instantiate workflow template for a case' })
  @ApiResponse({ status: 200, description: 'Workflow instantiated, tasks generated' })
  async instantiate(@Param('id') id: string, @Body() body: { caseId: string }) {
    return await this.workflowService.instantiate(id, body.caseId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workflow template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateWorkflowTemplateDto) {
    return await this.workflowService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete workflow template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.workflowService.remove(id);
  }
}
