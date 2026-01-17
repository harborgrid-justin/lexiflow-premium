import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  CreateRuleDto,
  ExecuteRuleDto,
  QueryRuleDto,
  UpdateRuleDto,
} from "./dto";
import { Rule } from "./entities/rule.entity";

@Injectable()
export class RulesEngineService {
  constructor(
    @InjectRepository(Rule)
    private readonly ruleRepository: Repository<Rule>,
  ) {}

  async findAll(query: QueryRuleDto) {
    const { page = 1, limit = 50, category, isActive } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ruleRepository.createQueryBuilder("rule");

    if (category) {
      queryBuilder.andWhere("rule.category = :category", { category });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere("rule.isActive = :isActive", { isActive });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy("rule.priority", "DESC")
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getCategories() {
    const categories = await this.ruleRepository
      .createQueryBuilder("rule")
      .select("DISTINCT rule.category", "category")
      .getRawMany();

    return categories.map((c) => c.category);
  }

  async findOne(id: string) {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Rule ${id} not found`);
    }
    return rule;
  }

  async create(createDto: CreateRuleDto) {
    const rule = this.ruleRepository.create(createDto);
    return this.ruleRepository.save(rule);
  }

  async execute(executeDto: ExecuteRuleDto) {
    const { ruleId, context } = executeDto;
    const rule = await this.findOne(ruleId);

    if (!rule.isActive) {
      return {
        success: false,
        message: "Rule is not active",
        ruleId,
      };
    }

    // Simple rule execution logic
    const result = {
      success: true,
      ruleId,
      ruleName: rule.name,
      executed: true,
      context,
      timestamp: new Date().toISOString(),
    };

    return result;
  }

  async update(id: string, updateDto: UpdateRuleDto) {
    await this.findOne(id);
    await this.ruleRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.ruleRepository.softDelete(id);
    return { message: "Rule deleted successfully" };
  }
}
