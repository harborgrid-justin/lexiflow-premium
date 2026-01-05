import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Lead } from "./entities/lead.entity";

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>
  ) {}

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const lead = this.leadsRepository.create(data);
    return this.leadsRepository.save(lead);
  }

  async getLeads(): Promise<Lead[]> {
    return this.leadsRepository.find({ order: { createdAt: "DESC" } });
  }

  async getLead(id: string): Promise<Lead | null> {
    return this.leadsRepository.findOneBy({ id });
  }
}
