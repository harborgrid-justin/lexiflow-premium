import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Deprecated, DeprecatedVersion } from '../api-deprecation.decorator';

/**
 * Cases API V1 Controller
 *
 * This is the legacy REST API for case management.
 * V1 is deprecated and will be sunset on June 1, 2025.
 *
 * New integrations should use V2 API or GraphQL.
 */
@ApiTags('Cases (V1 - Deprecated)')
@Controller({ path: 'cases', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@DeprecatedVersion({
  version: '1',
  deprecatedAt: new Date('2024-01-01'),
  sunsetAt: new Date('2025-06-01'),
  alternative: 'v2 or GraphQL API',
  migrationGuide: 'https://docs.lexiflow.ai/migration/v1-to-v2',
})
export class CasesV1Controller {
  @Get()
  @ApiOperation({
    summary: 'Get all cases',
    description: 'Returns a list of all cases. Use GraphQL for better filtering.',
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of cases',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              caseNumber: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getAllCases(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    // Legacy pagination and filtering
    return {
      data: [
        {
          id: '1',
          caseNumber: 'CASE-2024-001',
          title: 'Johnson v. Smith',
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: Number(page),
      limit: Number(limit),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get case by ID',
    description: 'Returns a single case by ID',
    deprecated: true,
  })
  @ApiResponse({ status: 200, description: 'Case found' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getCaseById(@Param('id') id: string) {
    return {
      id,
      caseNumber: 'CASE-2024-001',
      title: 'Johnson v. Smith',
      description: 'Contract dispute case',
      status: 'OPEN',
      priority: 'HIGH',
      practiceArea: 'Contract Law',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new case',
    description: 'Creates a new case. Use GraphQL mutations for better type safety.',
    deprecated: true,
  })
  @ApiResponse({ status: 201, description: 'Case created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createCase(@Body() createCaseDto: any) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...createCaseDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a case',
    description: 'Updates an existing case',
    deprecated: true,
  })
  @ApiResponse({ status: 200, description: 'Case updated successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async updateCase(@Param('id') id: string, @Body() updateCaseDto: any) {
    return {
      id,
      ...updateCaseDto,
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a case',
    description: 'Deletes a case by ID',
    deprecated: true,
  })
  @ApiResponse({ status: 204, description: 'Case deleted successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async deleteCase(@Param('id') id: string) {
    // Delete logic
    return;
  }

  @Post(':id/assign')
  @Deprecated({
    deprecatedAt: new Date('2024-06-01'),
    sunsetAt: new Date('2025-01-01'),
    reason: 'Use GraphQL mutation assignCase instead',
    alternative: 'GraphQL: mutation { assignCase(id, userId, role) }',
  })
  @ApiOperation({
    summary: 'Assign case to user',
    description: 'Assigns a case to a user with a specific role',
    deprecated: true,
  })
  async assignCase(
    @Param('id') id: string,
    @Body() body: { userId: string; role: string },
  ) {
    return {
      id,
      assigned: true,
      userId: body.userId,
      role: body.role,
      assignedAt: new Date().toISOString(),
    };
  }

  @Get(':id/documents')
  @ApiOperation({
    summary: 'Get case documents',
    description: 'Returns all documents associated with a case',
    deprecated: true,
  })
  async getCaseDocuments(@Param('id') id: string) {
    return {
      caseId: id,
      documents: [],
      total: 0,
    };
  }

  @Get(':id/timeline')
  @ApiOperation({
    summary: 'Get case timeline',
    description: 'Returns the timeline of events for a case',
    deprecated: true,
  })
  async getCaseTimeline(@Param('id') id: string) {
    return {
      caseId: id,
      events: [],
      total: 0,
    };
  }
}
