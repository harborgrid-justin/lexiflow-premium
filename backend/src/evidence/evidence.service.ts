import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvidenceItem, EvidenceType, EvidenceStatus } from './entities/evidence-item.entity';
import { ChainOfCustodyEvent, ChainOfCustodyAction } from './entities/chain-of-custody-event.entity';

@Injectable()
export class EvidenceService {
  constructor(
    @InjectRepository(EvidenceItem)
    private readonly evidenceRepository: Repository<EvidenceItem>,
    @InjectRepository(ChainOfCustodyEvent)
    private readonly chainOfCustodyRepository: Repository<ChainOfCustodyEvent>,
  ) {}

  async create(evidenceData: Partial<EvidenceItem>): Promise<EvidenceItem> {
    const evidence = this.evidenceRepository.create(evidenceData);
    const saved = await this.evidenceRepository.save(evidence);

    // Create initial chain of custody event
    await this.addChainOfCustodyEvent({
      evidenceId: saved.id,
      action: ChainOfCustodyAction.COLLECTED,
      eventDate: new Date(),
      handler: evidenceData.collectedBy || 'System',
      location: evidenceData.storageLocation,
      notes: 'Initial collection',
    });

    return saved;
  }

  async findAll(): Promise<EvidenceItem[]> {
    return this.evidenceRepository.find({
      order: { collectionDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<EvidenceItem> {
    const evidence = await this.evidenceRepository.findOne({
      where: { id },
      relations: ['chainOfCustodyEvents'],
    });

    if (!evidence) {
      throw new NotFoundException(`Evidence item with ID ${id} not found`);
    }

    return evidence;
  }

  async findByCase(caseId: string): Promise<EvidenceItem[]> {
    return this.evidenceRepository.find({
      where: { caseId },
      order: { collectionDate: 'DESC' },
    });
  }

  async findByType(evidenceType: EvidenceType): Promise<EvidenceItem[]> {
    return this.evidenceRepository.find({
      where: { evidenceType },
      order: { collectionDate: 'DESC' },
    });
  }

  async findByStatus(status: EvidenceStatus): Promise<EvidenceItem[]> {
    return this.evidenceRepository.find({
      where: { status },
      order: { collectionDate: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<EvidenceItem>): Promise<EvidenceItem> {
    const evidence = await this.findOne(id);
    Object.assign(evidence, updateData);
    return this.evidenceRepository.save(evidence);
  }

  async remove(id: string): Promise<void> {
    const evidence = await this.findOne(id);
    await this.evidenceRepository.remove(evidence);
  }

  async addChainOfCustodyEvent(eventData: Partial<ChainOfCustodyEvent>): Promise<ChainOfCustodyEvent> {
    const event = this.chainOfCustodyRepository.create(eventData);
    return this.chainOfCustodyRepository.save(event);
  }

  async getChainOfCustody(evidenceId: string): Promise<ChainOfCustodyEvent[]> {
    return this.chainOfCustodyRepository.find({
      where: { evidenceId },
      order: { eventDate: 'ASC' },
    });
  }

  async transferCustody(
    evidenceId: string,
    transferData: { 
      transferredFrom: string;
      transferredTo: string;
      handler: string;
      handlerId?: string;
      location?: string;
      notes?: string;
    },
  ): Promise<ChainOfCustodyEvent> {
    const evidence = await this.findOne(evidenceId);

    const event = await this.addChainOfCustodyEvent({
      evidenceId,
      action: ChainOfCustodyAction.TRANSFERRED,
      eventDate: new Date(),
      ...transferData,
    });

    // Update evidence location if provided
    if (transferData.location) {
      await this.update(evidenceId, { storageLocation: transferData.location });
    }

    return event;
  }
}
