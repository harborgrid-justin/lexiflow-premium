import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { ExhibitsService } from './exhibits.service';
import { CreateExhibitDto } from './dto/create-exhibit.dto';
import { UpdateExhibitDto } from './dto/update-exhibit.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@ApiTags('Exhibits')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('exhibits')
export class ExhibitsController {
  constructor(private readonly exhibitsService: ExhibitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exhibits' })
  @ApiResponse({ status: 200, description: 'Exhibits retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: unknown) {
    return await this.exhibitsService.findAll(query as any);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exhibit by ID' })
  @ApiResponse({ status: 200, description: 'Exhibit found' })
  @ApiResponse({ status: 404, description: 'Exhibit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string) {
    return await this.exhibitsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create exhibit' })
  @ApiResponse({ status: 201, description: 'Exhibit created successfully' })
  @ApiResponse({ status: 409, description: 'Exhibit number already exists' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createDto: CreateExhibitDto) {
    return await this.exhibitsService.create(createDto);
  }

  @Post(':id/admit')
  @ApiOperation({ summary: 'Mark exhibit as admitted' })
  @ApiResponse({ status: 200, description: 'Exhibit marked as admitted' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async markAdmitted(@Param('id') id: string, @Body() body: { date: string }, @Req() req: unknown) {
    const admittedBy = (req as any).user?.id || 'system';
    return await this.exhibitsService.markAdmitted(id, admittedBy, body.date);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update exhibit' })
  @ApiResponse({ status: 200, description: 'Exhibit updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateExhibitDto) {
    return await this.exhibitsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete exhibit' })
  @ApiResponse({ status: 204, description: 'Exhibit deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) {
    await this.exhibitsService.remove(id);
  }
}

