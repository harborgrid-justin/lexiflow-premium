import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PleadingsService } from './pleadings.service';
import { CreatePleadingDto } from './dto/create-pleading.dto';
import { UpdatePleadingDto } from './dto/update-pleading.dto';
import { FilePleadingDto } from './dto/file-pleading.dto';
import { CreateFromTemplateDto } from './dto/create-from-template.dto';
import { PleadingStatus } from './entities/pleading.entity';

@ApiTags('Pleadings')
@ApiBearerAuth('JWT-auth')

@Controller('pleadings')
export class PleadingsController {
  constructor(private readonly pleadingsService: PleadingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pleading' })
  @ApiResponse({ status: 201, description: 'Pleading created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createPleadingDto: CreatePleadingDto) {
    return await this.pleadingsService.create(createPleadingDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all pleadings' })
  @ApiQuery({ name: 'caseId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: PleadingStatus })
  @ApiResponse({ status: 200, description: 'Pleadings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query('caseId') caseId?: string,
    @Query('status') status?: PleadingStatus,
  ) {
    return await this.pleadingsService.findAll(caseId, status);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all pleading templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTemplates() {
    return await this.pleadingsService.getTemplates();
  }

  @Get('upcoming-hearings')
  @ApiOperation({ summary: 'Get upcoming hearings' })
  @ApiQuery({ name: 'daysAhead', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Upcoming hearings retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUpcomingHearings(@Query('daysAhead', ParseIntPipe) daysAhead?: number) {
    return await this.pleadingsService.getUpcomingHearings(daysAhead || 30);
  }

  @Post('from-template')
  @ApiOperation({ summary: 'Create pleading from template' })
  @ApiResponse({ status: 201, description: 'Pleading created from template' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createFromTemplate(@Body() createFromTemplateDto: CreateFromTemplateDto) {
    return await this.pleadingsService.createFromTemplate(createFromTemplateDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pleading by ID' })
  @ApiResponse({ status: 200, description: 'Pleading found' })
  @ApiResponse({ status: 404, description: 'Pleading not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pleadingsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a pleading' })
  @ApiResponse({ status: 200, description: 'Pleading updated successfully' })
  @ApiResponse({ status: 404, description: 'Pleading not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePleadingDto: UpdatePleadingDto,
  ) {
    return await this.pleadingsService.update(id, updatePleadingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pleading' })
  @ApiResponse({ status: 200, description: 'Pleading deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pleading not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.pleadingsService.remove(id);
    return { message: 'Pleading deleted successfully' };
  }

  @Post(':id/file')
  @ApiOperation({ summary: 'File a pleading' })
  @ApiResponse({ status: 200, description: 'Pleading filed successfully' })
  @ApiResponse({ status: 404, description: 'Pleading not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async file(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() filePleadingDto: FilePleadingDto,
  ) {
    return await this.pleadingsService.file(id, filePleadingDto);
  }
}

