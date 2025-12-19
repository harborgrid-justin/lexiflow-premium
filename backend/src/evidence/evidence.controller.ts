import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth , ApiResponse} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EvidenceService } from './evidence.service';
import { EvidenceItem, EvidenceType, EvidenceStatus } from './entities/evidence-item.entity';
import { ChainOfCustodyEvent } from './entities/chain-of-custody-event.entity';
import { CreateEvidenceItemDto } from './dto/create-evidence.dto';
import { UpdateEvidenceItemDto } from './dto/update-evidence.dto';
import { CreateChainOfCustodyDto } from './dto/create-chain-of-custody.dto';
import { TransferCustodyDto } from './dto/transfer-custody.dto';

@ApiTags('evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new evidence item' })
  @ApiResponse({ status: 201, description: 'Evidence item created successfully', type: EvidenceItem })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() dto: CreateEvidenceItemDto): Promise<EvidenceItem> {
    return this.evidenceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all evidence items' })
  @ApiResponse({ status: 200, description: 'Evidence items retrieved successfully', type: [EvidenceItem] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(): Promise<EvidenceItem[]> {
    return this.evidenceService.findAll();
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get evidence items by case' })
  @ApiResponse({ status: 200, description: 'Evidence items retrieved successfully', type: [EvidenceItem] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByCase(@Param('caseId') caseId: string): Promise<EvidenceItem[]> {
    return this.evidenceService.findByCase(caseId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get evidence items by type' })
  @ApiResponse({ status: 200, description: 'Evidence items retrieved successfully', type: [EvidenceItem] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByType(@Param('type') type: EvidenceType): Promise<EvidenceItem[]> {
    return this.evidenceService.findByType(type);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get evidence items by status' })
  @ApiResponse({ status: 200, description: 'Evidence items retrieved successfully', type: [EvidenceItem] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByStatus(@Param('status') status: EvidenceStatus): Promise<EvidenceItem[]> {
    return this.evidenceService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evidence item by ID' })
  @ApiResponse({ status: 200, description: 'Evidence item retrieved successfully', type: EvidenceItem })
  @ApiResponse({ status: 404, description: 'Evidence item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string): Promise<EvidenceItem> {
    return this.evidenceService.findOne(id);
  }

  @Get(':id/chain-of-custody')
  @ApiOperation({ summary: 'Get chain of custody for evidence item' })
  @ApiResponse({ status: 200, description: 'Chain of custody retrieved successfully', type: [ChainOfCustodyEvent] })
  @ApiResponse({ status: 404, description: 'Evidence item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getChainOfCustody(@Param('id') id: string): Promise<ChainOfCustodyEvent[]> {
    return this.evidenceService.getChainOfCustody(id);
  }

  @Post(':id/chain-of-custody')
  @ApiOperation({ summary: 'Add chain of custody event' })
  @ApiResponse({ status: 201, description: 'Chain of custody event added successfully', type: ChainOfCustodyEvent })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async addChainOfCustodyEvent(
    @Param('id') id: string,
    @Body() dto: CreateChainOfCustodyDto,
  ): Promise<ChainOfCustodyEvent> {
    return this.evidenceService.addChainOfCustodyEvent({ ...dto, evidenceId: id });
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer custody of evidence item' })
  @ApiResponse({ status: 201, description: 'Custody transferred successfully', type: ChainOfCustodyEvent })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async transferCustody(
    @Param('id') id: string,
    @Body() dto: TransferCustodyDto,
  ): Promise<ChainOfCustodyEvent> {
    return this.evidenceService.transferCustody(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an evidence item' })
  @ApiResponse({ status: 200, description: 'Evidence item updated successfully', type: EvidenceItem })
  @ApiResponse({ status: 404, description: 'Evidence item not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEvidenceItemDto,
  ): Promise<EvidenceItem> {
    return this.evidenceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an evidence item' })
  @ApiResponse({ status: 200, description: 'Evidence item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Evidence item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.evidenceService.remove(id);
  }
}
