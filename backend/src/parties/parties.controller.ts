import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PartiesService } from './parties.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { Party } from './entities/party.entity';

@ApiTags('parties')
@ApiBearerAuth()
@Controller('api/v1')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get('cases/:caseId/parties')
  @ApiOperation({
    summary: 'Get all parties for a case',
    description: 'Retrieve all parties (plaintiffs, defendants, witnesses, attorneys) associated with a specific case'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by party role' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by party type' })
  @ApiResponse({
    status: 200,
    description: 'Parties retrieved successfully',
    type: [Party],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async findAllByCaseId(@Param('caseId', ParseUUIDPipe) caseId: string): Promise<Party[]> {
    return this.partiesService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/parties')
  @ApiOperation({
    summary: 'Add party to a case',
    description: 'Create and associate a new party (plaintiff, defendant, witness, attorney, etc.) with a case'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiBody({ type: CreatePartyDto })
  @ApiResponse({
    status: 201,
    description: 'Party created successfully',
    type: Party,
  })
  @ApiResponse({ status: 400, description: 'Invalid party data or duplicate party' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPartyDto: CreatePartyDto): Promise<Party> {
    return this.partiesService.create(createPartyDto);
  }

  @Get('parties/:id')
  @ApiOperation({
    summary: 'Get party by ID',
    description: 'Retrieve detailed information about a specific party including contact details and role'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Party UUID' })
  @ApiResponse({
    status: 200,
    description: 'Party retrieved successfully',
    type: Party,
  })
  @ApiResponse({ status: 404, description: 'Party not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Party> {
    return this.partiesService.findOne(id);
  }

  @Put('parties/:id')
  @ApiOperation({
    summary: 'Full update of party',
    description: 'Replace all party fields with new data'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Party UUID' })
  @ApiBody({ type: UpdatePartyDto })
  @ApiResponse({
    status: 200,
    description: 'Party updated successfully',
    type: Party,
  })
  @ApiResponse({ status: 404, description: 'Party not found' })
  @ApiResponse({ status: 400, description: 'Invalid party data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartyDto: UpdatePartyDto,
  ): Promise<Party> {
    return this.partiesService.update(id, updatePartyDto);
  }

  @Patch('parties/:id')
  @ApiOperation({
    summary: 'Partial update of party',
    description: 'Update specific fields of a party without affecting other fields'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Party UUID' })
  @ApiBody({ type: UpdatePartyDto })
  @ApiResponse({
    status: 200,
    description: 'Party updated successfully',
    type: Party,
  })
  @ApiResponse({ status: 404, description: 'Party not found' })
  @ApiResponse({ status: 400, description: 'Invalid party data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartyDto: Partial<UpdatePartyDto>,
  ): Promise<Party> {
    return this.partiesService.update(id, updatePartyDto);
  }

  @Delete('parties/:id')
  @ApiOperation({
    summary: 'Delete party',
    description: 'Remove a party from a case. Soft delete to maintain audit trail.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001', description: 'Party UUID' })
  @ApiResponse({ status: 204, description: 'Party deleted successfully' })
  @ApiResponse({ status: 404, description: 'Party not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.partiesService.remove(id);
  }

  @Post('parties/check-conflicts')
  @ApiOperation({
    summary: 'Check for conflict of interest',
    description: 'Check if adding a party would create a conflict of interest with existing cases'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        type: { type: 'string', example: 'individual' },
        caseId: { type: 'string', format: 'uuid' },
        excludePartyId: { type: 'string', format: 'uuid', description: 'Exclude this party ID from conflict check (for updates)' }
      },
      required: ['name', 'type', 'caseId']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Conflict check completed',
    schema: {
      example: {
        hasConflict: true,
        conflicts: [
          {
            caseId: '323e4567-e89b-12d3-a456-426614174002',
            caseNumber: 'CV-2024-001',
            partyRole: 'defendant',
            conflictType: 'opposing_party'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkConflicts(
    @Body() body: { name: string; type: string; caseId: string; excludePartyId?: string },
  ) {
    return this.partiesService.checkConflicts(
      body.name,
      body.type,
      body.caseId,
      body.excludePartyId,
    );
  }

  @Get('cases/:caseId/parties/conflict-summary')
  @ApiOperation({
    summary: 'Get conflict summary for case parties',
    description: 'Get summary of all potential conflicts for parties in a case'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiResponse({
    status: 200,
    description: 'Conflict summary retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Case not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getConflictSummary(@Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.partiesService.getConflictSummary(caseId);
  }

  @Get('cases/:caseId/parties/by-role/:role')
  @ApiOperation({
    summary: 'Get parties by role',
    description: 'Retrieve all parties in a case filtered by their role (e.g., plaintiff, defendant, witness)'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiParam({ name: 'role', type: String, example: 'plaintiff', description: 'Party role', enum: ['plaintiff', 'defendant', 'witness', 'attorney', 'expert', 'other'] })
  @ApiResponse({
    status: 200,
    description: 'Parties retrieved successfully',
    type: [Party],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByRole(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Param('role') role: string,
  ) {
    return this.partiesService.findByRole(caseId, role);
  }

  @Get('cases/:caseId/parties/by-type/:type')
  @ApiOperation({
    summary: 'Get parties by type',
    description: 'Retrieve all parties in a case filtered by their type (individual, organization, government)'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiParam({ name: 'type', type: String, example: 'individual', description: 'Party type', enum: ['individual', 'organization', 'government', 'other'] })
  @ApiResponse({
    status: 200,
    description: 'Parties retrieved successfully',
    type: [Party],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByType(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Param('type') type: string,
  ) {
    return this.partiesService.findByType(caseId, type);
  }

  @Post('parties/bulk')
  @ApiOperation({
    summary: 'Bulk add parties to a case',
    description: 'Add multiple parties to a case at once for efficient case setup'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string', format: 'uuid' },
        parties: {
          type: 'array',
          items: { $ref: '#/components/schemas/CreatePartyDto' }
        }
      },
      required: ['caseId', 'parties']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Parties created successfully',
    type: [Party],
  })
  @ApiResponse({ status: 400, description: 'Invalid party data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(@Body() body: { caseId: string; parties: CreatePartyDto[] }) {
    return this.partiesService.bulkCreate(body.caseId, body.parties);
  }

  @Get('parties/search')
  @ApiOperation({
    summary: 'Search parties across all cases',
    description: 'Full-text search for parties by name, email, phone, or organization'
  })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query', example: 'John Doe' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by party type' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by party role' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      example: {
        data: [],
        total: 15,
        page: 1,
        limit: 20
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async search(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.partiesService.search(query, { type, role, page, limit });
  }
}
