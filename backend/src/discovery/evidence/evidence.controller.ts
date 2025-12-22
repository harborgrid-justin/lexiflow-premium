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
  Head,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth  , ApiResponse }from '@nestjs/swagger';
import { EvidenceService } from './evidence.service';
import { CreateDiscoveryEvidenceDto } from './dto/create-evidence.dto';
import { UpdateDiscoveryEvidenceDto } from './dto/update-evidence.dto';
import { QueryEvidenceDto } from './dto/query-evidence.dto';
import { Evidence } from './entities/evidence.entity';

@ApiTags('Evidence')
@ApiBearerAuth('JWT-auth')

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  // Health check endpoint
  @Head()
  @HttpCode(HttpStatus.OK)
  async health() {
    return;
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query?: QueryEvidenceDto): Promise<{
    data: Evidence[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const evidence = await this.evidenceService.findAll(query);
    return {
      data: evidence,
      total: evidence.length,
      page: 1,
      limit: evidence.length,
      totalPages: 1,
    };
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<Evidence> {
    return this.evidenceService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createEvidenceDto: CreateDiscoveryEvidenceDto): Promise<Evidence> {
    return this.evidenceService.create(createEvidenceDto);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEvidenceDto: UpdateDiscoveryEvidenceDto,
  ): Promise<Evidence> {
    return this.evidenceService.update(id, updateEvidenceDto);
  }

  @Patch(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async patch(
    @Param('id') id: string,
    @Body() updateEvidenceDto: UpdateDiscoveryEvidenceDto,
  ): Promise<Evidence> {
    return this.evidenceService.update(id, updateEvidenceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.evidenceService.remove(id);
  }

  @Post(':id/chain-of-custody')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async addChainOfCustodyEvent(
    @Param('id') id: string,
    @Body() event: { action: string; actor: string; notes?: string },
  ): Promise<Evidence> {
    return this.evidenceService.addChainOfCustodyEvent(id, event);
  }
}

