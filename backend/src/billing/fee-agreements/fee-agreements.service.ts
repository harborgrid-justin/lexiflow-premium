import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { FeeAgreement, FeeAgreementStatus } from './entities/fee-agreement.entity';
import { CreateFeeAgreementDto } from './dto/create-fee-agreement.dto';
import { UpdateFeeAgreementDto } from './dto/update-fee-agreement.dto';

@Injectable()
export class FeeAgreementsService {
  constructor(
    @InjectRepository(FeeAgreement)
    private readonly feeAgreementRepository: Repository<FeeAgreement>,
  ) {}

  async create(createFeeAgreementDto: CreateFeeAgreementDto): Promise<FeeAgreement> {
    const feeAgreement = this.feeAgreementRepository.create({
      ...createFeeAgreementDto,
      status: createFeeAgreementDto.status || FeeAgreementStatus.DRAFT,
      paymentTermsDays: createFeeAgreementDto.paymentTermsDays || 30,
      expensesBillable: createFeeAgreementDto.expensesBillable !== undefined
        ? createFeeAgreementDto.expensesBillable
        : true,
    });

    return await this.feeAgreementRepository.save(feeAgreement);
  }

  async findAll(
    clientId?: string,
    caseId?: string,
    status?: FeeAgreementStatus,
  ): Promise<FeeAgreement[]> {
    const query = this.feeAgreementRepository.createQueryBuilder('feeAgreement');

    if (clientId) {
      query.andWhere('feeAgreement.clientId = :clientId', { clientId });
    }

    if (caseId) {
      query.andWhere('feeAgreement.caseId = :caseId', { caseId });
    }

    if (status) {
      query.andWhere('feeAgreement.status = :status', { status });
    }

    query
      .andWhere('feeAgreement.deletedAt IS NULL')
      .orderBy('feeAgreement.effectiveDate', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<FeeAgreement> {
    const feeAgreement = await this.feeAgreementRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!feeAgreement) {
      throw new NotFoundException(`Fee agreement with ID ${id} not found`);
    }

    return feeAgreement;
  }

  async findByCase(caseId: string): Promise<FeeAgreement | null> {
    return await this.feeAgreementRepository.findOne({
      where: {
        caseId,
        status: FeeAgreementStatus.ACTIVE,
        deletedAt: IsNull(),
      },
      order: {
        effectiveDate: 'DESC',
      },
    });
  }

  async findByClient(clientId: string): Promise<FeeAgreement[]> {
    return await this.feeAgreementRepository.find({
      where: {
        clientId,
        deletedAt: IsNull(),
      },
      order: {
        effectiveDate: 'DESC',
      },
    });
  }

  async update(id: string, updateFeeAgreementDto: UpdateFeeAgreementDto): Promise<FeeAgreement> {
    const feeAgreement = await this.findOne(id);
    Object.assign(feeAgreement, updateFeeAgreementDto);
    return await this.feeAgreementRepository.save(feeAgreement);
  }

  async remove(id: string): Promise<void> {
    const feeAgreement = await this.findOne(id);
    feeAgreement.deletedAt = new Date();
    feeAgreement.status = FeeAgreementStatus.TERMINATED;
    await this.feeAgreementRepository.save(feeAgreement);
  }

  async activate(id: string): Promise<FeeAgreement> {
    const feeAgreement = await this.findOne(id);
    feeAgreement.status = FeeAgreementStatus.ACTIVE;
    return await this.feeAgreementRepository.save(feeAgreement);
  }

  async suspend(id: string): Promise<FeeAgreement> {
    const feeAgreement = await this.findOne(id);
    feeAgreement.status = FeeAgreementStatus.SUSPENDED;
    return await this.feeAgreementRepository.save(feeAgreement);
  }

  async terminate(id: string, terminationDate?: string): Promise<FeeAgreement> {
    const feeAgreement = await this.findOne(id);
    feeAgreement.status = FeeAgreementStatus.TERMINATED;
    feeAgreement.terminationDate = (terminationDate ?? new Date().toISOString().split('T')[0]) as string;
    return await this.feeAgreementRepository.save(feeAgreement);
  }

  async sign(id: string, signedBy: string): Promise<FeeAgreement> {
    const feeAgreement = await this.findOne(id);
    feeAgreement.signedDate = new Date();
    feeAgreement.signedBy = signedBy;
    feeAgreement.status = FeeAgreementStatus.ACTIVE;
    return await this.feeAgreementRepository.save(feeAgreement);
  }
}
