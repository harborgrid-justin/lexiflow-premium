import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatePropertyDto, QueryPropertyDto, UpdatePropertyDto } from "./dto";
import { Property } from "./entities/property.entity";

@Injectable()
export class RealEstateService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async findAll(query: QueryPropertyDto) {
    const { page = 1, limit = 50, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.propertyRepository.createQueryBuilder("property");

    if (search) {
      queryBuilder.where(
        "property.name ILIKE :search OR property.rpuid ILIKE :search",
        {
          search: `%${search}%`,
        },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy("property.createdAt", "DESC")
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getPortfolioSummary() {
    const total = await this.propertyRepository.count();
    const totalValue = await this.propertyRepository
      .createQueryBuilder("property")
      .select("SUM(property.assessedValue)", "total")
      .getRawOne();

    return {
      totalProperties: total,
      totalValue: totalValue.total || 0,
      summary: "Real Estate Portfolio Summary",
    };
  }

  async getInventory(query: QueryPropertyDto) {
    return this.findAll(query);
  }

  async getUtilization() {
    return {
      utilizationRate: 85.5,
      occupiedProperties: 45,
      vacantProperties: 8,
      underDevelopment: 2,
    };
  }

  async findOne(id: string) {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) {
      throw new NotFoundException(`Property ${id} not found`);
    }
    return property;
  }

  async create(createDto: CreatePropertyDto) {
    const property = this.propertyRepository.create(createDto);
    return this.propertyRepository.save(property);
  }

  async update(id: string, updateDto: UpdatePropertyDto) {
    await this.findOne(id);
    await this.propertyRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.propertyRepository.softDelete(id);
    return { message: "Property deleted successfully" };
  }
}
