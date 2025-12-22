import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { RateTable } from './entities/rate-table.entity';
import { CreateRateTableDto } from './dto/create-rate-table.dto';
import { UpdateRateTableDto } from './dto/update-rate-table.dto';

@Injectable()
export class RateTablesService {
  constructor(
    @InjectRepository(RateTable)
    private readonly rateTableRepository: Repository<RateTable>,
  ) {}

  async create(createRateTableDto: CreateRateTableDto): Promise<RateTable> {
    // If this is set as default, unset other defaults for the same firm
    if (createRateTableDto.isDefault) {
      await this.rateTableRepository.update(
        { firmId: createRateTableDto.firmId, isDefault: true },
        { isDefault: false },
      );
    }

    const rateTable = this.rateTableRepository.create({
      ...createRateTableDto,
      isActive: createRateTableDto.isActive !== undefined ? createRateTableDto.isActive : true,
      isDefault: createRateTableDto.isDefault || false,
    });

    return await this.rateTableRepository.save(rateTable);
  }

  async findAll(firmId?: string): Promise<RateTable[]> {
    const query = this.rateTableRepository.createQueryBuilder('rateTable');

    if (firmId) {
      query.where('rateTable.firmId = :firmId', { firmId });
    }

    query
      .andWhere('rateTable.deletedAt IS NULL')
      .orderBy('rateTable.effectiveDate', 'DESC');

    return await query.getMany();
  }

  async findActive(firmId?: string): Promise<RateTable[]> {
    const query = this.rateTableRepository.createQueryBuilder('rateTable');

    if (firmId) {
      query.where('rateTable.firmId = :firmId', { firmId });
    }

    query
      .andWhere('rateTable.isActive = :isActive', { isActive: true })
      .andWhere('rateTable.deletedAt IS NULL')
      .orderBy('rateTable.effectiveDate', 'DESC');

    return await query.getMany();
  }

  async findDefault(firmId: string): Promise<RateTable> {
    const rateTable = await this.rateTableRepository.findOne({
      where: {
        firmId,
        isDefault: true,
        isActive: true,
        deletedAt: IsNull(),
      },
    });

    if (!rateTable) {
      throw new NotFoundException(`No default rate table found for firm ${firmId}`);
    }

    return rateTable;
  }

  async findOne(id: string): Promise<RateTable> {
    const rateTable = await this.rateTableRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!rateTable) {
      throw new NotFoundException(`Rate table with ID ${id} not found`);
    }

    return rateTable;
  }

  async update(id: string, updateRateTableDto: UpdateRateTableDto): Promise<RateTable> {
    const rateTable = await this.findOne(id);

    // If setting this as default, unset other defaults for the same firm
    if (updateRateTableDto.isDefault === true) {
      await this.rateTableRepository.update(
        { firmId: rateTable.firmId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(rateTable, updateRateTableDto);

    return await this.rateTableRepository.save(rateTable);
  }

  async remove(id: string): Promise<void> {
    const rateTable = await this.findOne(id);

    if (rateTable.isDefault) {
      throw new BadRequestException('Cannot delete the default rate table');
    }

    rateTable.deletedAt = new Date();
    await this.rateTableRepository.save(rateTable);
  }

  async getRateForUser(
    firmId: string,
    userId: string,
    date?: string,
  ): Promise<{ rate: number; rateTableId: string }> {
    const effectiveDate = date || new Date().toISOString().split('T')[0];

    // Find active rate tables for the firm
    const rateTables = await this.rateTableRepository
      .createQueryBuilder('rateTable')
      .where('rateTable.firmId = :firmId', { firmId })
      .andWhere('rateTable.isActive = :isActive', { isActive: true })
      .andWhere('rateTable.effectiveDate <= :effectiveDate', { effectiveDate })
      .andWhere('rateTable.deletedAt IS NULL')
      .andWhere(
        '(rateTable.expirationDate IS NULL OR rateTable.expirationDate >= :effectiveDate)',
        { effectiveDate },
      )
      .orderBy('rateTable.effectiveDate', 'DESC')
      .getMany();

    // Search for user-specific rate
    for (const table of rateTables) {
      const userRate = table.rates.find((r) => r.userId === userId);
      if (userRate) {
        return { rate: userRate.rate, rateTableId: table.id };
      }
    }

    // If no user-specific rate found, return from default table
    const defaultTable = rateTables.find((t) => t.isDefault);
    if (defaultTable && defaultTable.rates.length > 0) {
      return { rate: defaultTable.rates[0].rate, rateTableId: defaultTable.id };
    }

    throw new NotFoundException(`No rate found for user ${userId} in firm ${firmId}`);
  }
}
