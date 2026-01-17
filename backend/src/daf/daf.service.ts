import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  CreateOperationDto,
  QueryOperationDto,
  UpdateOperationDto,
} from "./dto";
import { DafOperation } from "./entities/daf-operation.entity";

@Injectable()
export class DafService {
  constructor(
    @InjectRepository(DafOperation)
    private readonly operationRepository: Repository<DafOperation>,
  ) {}

  async findAll(query: QueryOperationDto) {
    const { page = 1, limit = 50, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.operationRepository.createQueryBuilder("operation");

    if (status) {
      queryBuilder.where("operation.status = :status", { status });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy("operation.createdAt", "DESC")
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getDashboard() {
    const total = await this.operationRepository.count();
    const active = await this.operationRepository.count({
      where: { status: "Active" },
    });

    return {
      totalOperations: total,
      activeOperations: active,
      completedOperations: total - active,
      complianceRate: 96.5,
    };
  }

  async getCompliance() {
    return {
      complianceRate: 96.5,
      auditsPassed: 45,
      auditsPending: 3,
      lastAuditDate: new Date().toISOString(),
    };
  }

  async findOne(id: string) {
    const operation = await this.operationRepository.findOne({ where: { id } });
    if (!operation) {
      throw new NotFoundException(`Operation ${id} not found`);
    }
    return operation;
  }

  async create(createDto: CreateOperationDto) {
    const operation = this.operationRepository.create(createDto);
    return this.operationRepository.save(operation);
  }

  async update(id: string, updateDto: UpdateOperationDto) {
    await this.findOne(id);
    await this.operationRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.operationRepository.softDelete(id);
    return { message: "Operation deleted successfully" };
  }
}
