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
  Request,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CorrespondenceService } from './correspondence.service';
import {
  CreateCorrespondenceDto,
  UpdateCorrespondenceDto,
  CorrespondenceQueryDto,
} from './dto';

/**
 * Correspondence Controller
 *
 * REST API endpoints for legal correspondence management
 * Handles letters, emails, faxes, and legal notices
 *
 * @class CorrespondenceController
 */
@ApiTags('Correspondence')
@Public() // Allow public access for development
@Controller('communications')
// @UseGuards(JwtAuthGuard) // Will be enabled once auth module is ready
@ApiBearerAuth()
export class CorrespondenceController {
  constructor(private readonly correspondenceService: CorrespondenceService) {}

  /**
   * GET /api/v1/communications
   * List all correspondence
   */
  @Get()
  @ApiOperation({ summary: 'List all correspondence' })
  @ApiResponse({ status: 200, description: 'Returns paginated correspondence' })
  async getCorrespondence(@Query() query: CorrespondenceQueryDto, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.correspondenceService.findAll(query, userId);
  }

  /**
   * GET /api/v1/communications/:id
   * Get correspondence by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get correspondence by ID' })
  @ApiResponse({ status: 200, description: 'Returns correspondence details' })
  @ApiResponse({ status: 404, description: 'Correspondence not found' })
  @ApiParam({ name: 'id', description: 'Correspondence ID' })
  async getCorrespondenceById(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.correspondenceService.findById(id, userId);
  }

  /**
   * POST /api/v1/communications
   * Create new correspondence
   */
  @Post()
  @ApiOperation({ summary: 'Create new correspondence' })
  @ApiResponse({ status: 201, description: 'Correspondence created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createCorrespondence(@Body() createDto: CreateCorrespondenceDto) {
    return this.correspondenceService.create(createDto);
  }

  /**
   * PUT /api/v1/communications/:id
   * Update correspondence
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update correspondence' })
  @ApiResponse({ status: 200, description: 'Correspondence updated successfully' })
  @ApiResponse({ status: 404, description: 'Correspondence not found' })
  @ApiParam({ name: 'id', description: 'Correspondence ID' })
  async updateCorrespondence(
    @Param('id') id: string,
    @Body() updateDto: UpdateCorrespondenceDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'temp-user-id';
    return this.correspondenceService.update(id, updateDto, userId);
  }

  /**
   * DELETE /api/v1/communications/:id
   * Delete correspondence
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete correspondence' })
  @ApiResponse({ status: 200, description: 'Correspondence deleted' })
  @ApiResponse({ status: 404, description: 'Correspondence not found' })
  @ApiParam({ name: 'id', description: 'Correspondence ID' })
  async deleteCorrespondence(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.correspondenceService.delete(id, userId);
  }

  /**
   * POST /api/v1/communications/:id/send
   * Send correspondence
   */
  @Post(':id/send')
  @ApiOperation({ summary: 'Send correspondence' })
  @ApiResponse({ status: 200, description: 'Correspondence sent successfully' })
  @ApiResponse({ status: 404, description: 'Correspondence not found' })
  @ApiParam({ name: 'id', description: 'Correspondence ID' })
  async sendCorrespondence(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.correspondenceService.send(id, userId);
  }
}

