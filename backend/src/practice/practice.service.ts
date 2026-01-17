import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  CreatePracticeAreaDto,
  QueryPracticeAreaDto,
  UpdatePracticeAreaDto,
} from "./dto";
import { PracticeArea } from "./entities/practice-area.entity";

@Injectable()
export class PracticeService {
  constructor(
    @InjectRepository(PracticeArea)
    private readonly practiceAreaRepository: Repository<PracticeArea>,
  ) {}

  async findAll(query: QueryPracticeAreaDto) {
    const { page = 1, limit = 50, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.practiceAreaRepository.createQueryBuilder("area");

    if (search) {
      queryBuilder.where(
        "area.name ILIKE :search OR area.description ILIKE :search",
        {
          search: `%${search}%`,
        },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy("area.name", "ASC")
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getStatistics() {
    const total = await this.practiceAreaRepository.count();

    return {
      totalPracticeAreas: total,
      topAreas: [
        { name: "Corporate Law", caseCount: 45 },
        { name: "Litigation", caseCount: 38 },
        { name: "Real Estate", caseCount: 22 },
      ],
    };
  }

  async findOne(id: string) {
    const practiceArea = await this.practiceAreaRepository.findOne({
      where: { id },
    });
    if (!practiceArea) {
      throw new NotFoundException(`Practice area ${id} not found`);
    }
    return practiceArea;
  }

  async create(createDto: CreatePracticeAreaDto) {
    const practiceArea = this.practiceAreaRepository.create(createDto);
    return this.practiceAreaRepository.save(practiceArea);
  }

  async update(id: string, updateDto: UpdatePracticeAreaDto) {
    await this.findOne(id);
    await this.practiceAreaRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.practiceAreaRepository.softDelete(id);
    return { message: "Practice area deleted successfully" };
  }
}
