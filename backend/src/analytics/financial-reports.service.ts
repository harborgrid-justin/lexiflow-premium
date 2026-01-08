import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportTemplate } from './entities/report-template.entity';
import { ReportExecution } from './entities/report-execution.entity';

export interface FinancialSummary {
  revenue: {
    total: number;
    billed: number;
    collected: number;
    outstanding: number;
  };
  expenses: {
    total: number;
    personnel: number;
    overhead: number;
    other: number;
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    grossMargin: number;
    netMargin: number;
  };
  workInProgress: {
    total: number;
    aged30: number;
    aged60: number;
    aged90: number;
  };
  accountsReceivable: {
    total: number;
    current: number;
    aged30: number;
    aged60: number;
    aged90plus: number;
  };
}

@Injectable()
export class FinancialReportsService {
  private readonly logger = new Logger(FinancialReportsService.name);

  constructor(
    @InjectRepository(ReportTemplate)
    private reportTemplateRepository: Repository<ReportTemplate>,
    @InjectRepository(ReportExecution)
    private reportExecutionRepository: Repository<ReportExecution>,
  ) {}

  async getFinancialSummary(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialSummary> {
    return {
      revenue: {
        total: 4250000,
        billed: 4100000,
        collected: 3850000,
        outstanding: 250000,
      },
      expenses: {
        total: 2800000,
        personnel: 2100000,
        overhead: 520000,
        other: 180000,
      },
      profitability: {
        grossProfit: 1450000,
        netProfit: 1200000,
        grossMargin: 34.1,
        netMargin: 28.2,
      },
      workInProgress: {
        total: 620000,
        aged30: 420000,
        aged60: 150000,
        aged90: 50000,
      },
      accountsReceivable: {
        total: 850000,
        current: 520000,
        aged30: 180000,
        aged60: 100000,
        aged90plus: 50000,
      },
    };
  }

  async getCashFlowAnalysis(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{
    month: string;
    inflow: number;
    outflow: number;
    net: number;
    cumulative: number;
  }>> {
    const data = [];
    let cumulative = 0;

    for (let i = 0; i < 6; i++) {
      const inflow = Math.floor(Math.random() * 200000) + 600000;
      const outflow = Math.floor(Math.random() * 150000) + 400000;
      const net = inflow - outflow;
      cumulative += net;

      data.push({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        inflow,
        outflow,
        net,
        cumulative,
      });
    }

    return data;
  }

  async getRevenueBreakdown(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    byPracticeGroup: Array<{ name: string; revenue: number }>;
    byClient: Array<{ name: string; revenue: number }>;
    byAttorney: Array<{ name: string; revenue: number }>;
    byMonth: Array<{ month: string; revenue: number }>;
  }> {
    return {
      byPracticeGroup: [
        { name: 'Corporate', revenue: 1250000 },
        { name: 'Litigation', revenue: 980000 },
        { name: 'Real Estate', revenue: 750000 },
        { name: 'IP', revenue: 620000 },
      ],
      byClient: [
        { name: 'TechCorp', revenue: 485000 },
        { name: 'Global Finance', revenue: 342000 },
        { name: 'Metro Real Estate', revenue: 275000 },
      ],
      byAttorney: [
        { name: 'Sarah Johnson', revenue: 312000 },
        { name: 'Michael Chen', revenue: 216000 },
      ],
      byMonth: [
        { month: 'Jan', revenue: 680000 },
        { month: 'Feb', revenue: 720000 },
        { month: 'Mar', revenue: 695000 },
        { month: 'Apr', revenue: 740000 },
        { month: 'May', revenue: 710000 },
        { month: 'Jun', revenue: 705000 },
      ],
    };
  }

  async createReportTemplate(
    data: Partial<ReportTemplate>,
    userId: string,
  ): Promise<ReportTemplate> {
    const template = this.reportTemplateRepository.create({
      ...data,
      ownerId: userId,
      createdBy: userId,
    });
    return this.reportTemplateRepository.save(template);
  }

  async executeReport(
    templateId: string,
    userId: string,
    parameters?: Record<string, unknown>,
  ): Promise<ReportExecution> {
    const template = await this.reportTemplateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Report template not found');
    }

    const execution = this.reportExecutionRepository.create({
      templateId,
      executedBy: userId,
      format: template.format,
      status: 'pending',
      parameters,
      organizationId: template.organizationId,
    });

    return this.reportExecutionRepository.save(execution);
  }

  async getReportExecutions(
    templateId: string,
    limit = 10,
  ): Promise<ReportExecution[]> {
    return this.reportExecutionRepository.find({
      where: { templateId },
      order: { generatedAt: 'DESC' },
      take: limit,
    });
  }
}
