import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationType, OrganizationStatus } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(organizationData: Partial<Organization>): Promise<Organization> {
    const organization = this.organizationRepository.create(organizationData);
    return this.organizationRepository.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findByType(organizationType: OrganizationType): Promise<Organization[]> {
    return this.organizationRepository.find({
      where: { organizationType },
      order: { name: 'ASC' },
    });
  }

  async findByStatus(status: OrganizationStatus): Promise<Organization[]> {
    return this.organizationRepository.find({
      where: { status },
      order: { name: 'ASC' },
    });
  }

  async findByJurisdiction(jurisdiction: string): Promise<Organization[]> {
    return this.organizationRepository.find({
      where: { jurisdiction },
      order: { name: 'ASC' },
    });
  }

  async search(searchTerm: string): Promise<Organization[]> {
    return this.organizationRepository
      .createQueryBuilder('organization')
      .where('organization.name ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('organization.legalName ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('organization.name', 'ASC')
      .getMany();
  }

  async update(id: string, updateData: Partial<Organization>): Promise<Organization> {
    const organization = await this.findOne(id);
    Object.assign(organization, updateData);
    return this.organizationRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);
    await this.organizationRepository.remove(organization);
  }
}
