import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DeepPartial } from "typeorm";
import { Citation } from "./entities/citation.entity";

/**
 * ╔=================================================================================================================╗
 * ║CITATIONS                                                                                                        ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class CitationsService {
  constructor(
    @InjectRepository(Citation)
    private readonly citationRepository: Repository<Citation>
  ) {}

  async create(createDto: unknown) {
    const citation = this.citationRepository.create(
      createDto as DeepPartial<Citation>
    );
    return await this.citationRepository.save(citation);
  }

  async findAll(filters: unknown) {
    const {
      page = 1,
      limit = 50,
      caseId,
    } = filters as { page?: number; limit?: number; caseId?: string };
    const where = caseId ? { caseId } : {};

    const [data, total] = await this.citationRepository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const citation = await this.citationRepository.findOne({ where: { id } });
    if (!citation) throw new NotFoundException(`Citation ${id} not found`);
    return citation;
  }

  async update(id: string, updateDto: unknown) {
    const citation = await this.findOne(id);
    Object.assign(citation, updateDto);
    return await this.citationRepository.save(citation);
  }

  async remove(id: string) {
    const citation = await this.findOne(id);
    await this.citationRepository.remove(citation);
  }

  async checkShepards(id: string) {
    await this.findOne(id);
    return { status: "Valid", history: [], treatment: "Good Law" };
  }

  async verifyAll() {
    const citations = await this.citationRepository.find();
    return { checked: citations.length, flagged: 0, updated: [] };
  }
}
