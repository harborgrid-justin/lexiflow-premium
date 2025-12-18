import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EvidenceService } from './evidence.service';
import { EvidenceItem, EvidenceType, EvidenceStatus } from './entities/evidence-item.entity';
import { ChainOfCustodyEvent } from './entities/chain-of-custody-event.entity';

@ApiTags('evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new evidence item' })
  @ApiResponse({ status: 201, description: 'Evidence item created successfully', type: EvidenceItem })
  async create(@Body() evidenceData: Partial<EvidenceItem>): Promise<EvidenceItem> {
    return this.evidenceService.create(evidenceData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all evidence items' })
  @ApiResponse({ status: 200, description: 'Evidence items retrieved successfully', type: [EvidenceItem] })
  async findAll(): Promise<EvidenceItem[]> {
    return this.evidenceService.findAll();
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get evidence items by case' })
  @ApiResponse({ status: 200, description: 'Evidence items retrieved successfully', type: [EvidenceItem] })
  async findByCase(@Param('caseId') caseId: string): Promise<EvidenceItem[]> {
    return this.evidenceService.findByCase(caseId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get evidence items by type' })
  @ApiResponse({ status: 200, description: 'Evidence items retrieved successfully', type: [EvidenceItem] })
  async findByType(@Param('type') type: EvidenceType): Promise<EvidenceItem[]> {
    return this.evidenceService.findByType(type);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get evidence items by status' })
  @ApiResponse({ status: 200, description: 'Evidence items retrieved successfully', type: [EvidenceItem] })
  async findByStatus(@Param('status') status: EvidenceStatus): Promise<EvidenceItem[]> {
    return this.evidenceService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evidence item by ID' })
  @ApiResponse({ status: 200, description: 'Evidence item retrieved successfully', type: EvidenceItem })
  @ApiResponse({ status: 404, description: 'Evidence item not found' })
  async findOne(@Param('id') id: string): Promise<EvidenceItem> {
    return this.evidenceService.findOne(id);
  }

  @Get(':id/chain-of-custody')
  @ApiOperation({ summary: 'Get chain of custody for evidence item' })
  @ApiResponse({ status: 200, description: 'Chain of custody retrieved successfully', type: [ChainOfCustodyEvent] })
  @ApiResponse({ status: 404, description: 'Evidence item not found' })
  async getChainOfCustody(@Param('id') id: string): Promise<ChainOfCustodyEvent[]> {
    return this.evidenceService.getChainOfCustody(id);
  }

  @Post(':id/chain-of-custody')
  @ApiOperation({ summary: 'Add chain of custody event' })
  @ApiResponse({ status: 201, description: 'Chain of custody event added successfully', type: ChainOfCustodyEvent })
  async addChainOfCustodyEvent(
    @Param('id') id: string,
    @Body() eventData: Partial<ChainOfCustodyEvent>,
  ): Promise<ChainOfCustodyEvent> {
    return this.evidenceService.addChainOfCustodyEvent({ ...eventData, evidenceId: id });
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer custody of evidence item' })
  @ApiResponse({ status: 201, description: 'Custody transferred successfully', type: ChainOfCustodyEvent })
  async transferCustody(
    @Param('id') id: string,
    @Body() transferData: {
      transferredFrom: string;
      transferredTo: string;
      handler: string;
      handlerId?: string;
      location?: string;
      notes?: string;
    },
  ): Promise<ChainOfCustodyEvent> {
    return this.evidenceService.transferCustody(id, transferData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an evidence item' })
  @ApiResponse({ status: 200, description: 'Evidence item updated successfully', type: EvidenceItem })
  @ApiResponse({ status: 404, description: 'Evidence item not found' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<EvidenceItem>,
  ): Promise<EvidenceItem> {
    return this.evidenceService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an evidence item' })
  @ApiResponse({ status: 200, description: 'Evidence item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Evidence item not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.evidenceService.remove(id);
  }
}
