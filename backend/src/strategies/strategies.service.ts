import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CitationsService } from "../citations/citations.service";
import { CreateStrategyItemDto } from "./dto/create-strategy-item.dto";
import { Defense } from "./entities/defense.entity";
import { LegalArgument } from "./entities/legal-argument.entity";

@Injectable()
export class StrategiesService {
  constructor(
    @InjectRepository(LegalArgument)
    private argumentsRepository: Repository<LegalArgument>,
    @InjectRepository(Defense)
    private defensesRepository: Repository<Defense>,
    private citationsService: CitationsService
  ) {}

  async create(createDto: CreateStrategyItemDto) {
    const { strategyType, caseId, ...data } = createDto as any; // Using strategyType from frontend

    if (strategyType === "Citation") {
      // Delegate to CitationsService
      // Assuming CitationsService.create takes partial citation
      return this.citationsService.create({
        citation: data.title || data.citation, // Frontend maps title/citation
        caseId: caseId,
        court: data.court || "Unknown",
        year: data.year || new Date().getFullYear(),
        // Map other fields
      });
    } else if (strategyType === "Argument") {
      const arg = this.argumentsRepository.create({
        caseId,
        title: data.title,
        description: data.description,
        strength: data.strength || 0,
        status: data.status || "Draft",
      });
      return this.argumentsRepository.save(arg);
    } else if (strategyType === "Defense") {
      const defense = this.defensesRepository.create({
        caseId,
        title: data.title,
        description: data.description,
        category: data.defenseType || data.category || "Affirmative", // Map type/defenseType
        status: data.status || "Draft",
      });
      return this.defensesRepository.save(defense);
    }
    throw new Error(`Unknown strategy type: ${strategyType}`);
  }

  async findAll(caseId: string) {
    const [args, defenses, citationsResult] = await Promise.all([
      this.argumentsRepository.find({ where: { caseId } }),
      this.defensesRepository.find({ where: { caseId } }),
      this.citationsService.findAll({ caseId, limit: 1000 }),
    ]);

    return {
      arguments: args,
      defenses: defenses,
      citations: (citationsResult as any).data || [],
    };
  }

  async remove(id: string, type: string) {
    if (type === "Citation") {
      return this.citationsService.remove(id);
    } else if (type === "Argument") {
      return this.argumentsRepository.delete(id);
    } else if (type === "Defense") {
      return this.defensesRepository.delete(id);
    }
  }

  async update(id: string, updateDto: any) {
    const { strategyType, ...data } = updateDto;

    if (strategyType === "Citation") {
      return this.citationsService.update(id, data);
    } else if (strategyType === "Argument") {
      return this.argumentsRepository.update(id, {
        title: data.title,
        description: data.description,
        strength: data.strength,
        status: data.status,
        // related ids if needed
      });
    } else if (strategyType === "Defense") {
      return this.defensesRepository.update(id, {
        title: data.title,
        description: data.description,
        category: data.defenseType || data.category,
        status: data.status,
      });
    }
    throw new Error(`Unknown strategy type for update: ${strategyType}`);
  }
}
