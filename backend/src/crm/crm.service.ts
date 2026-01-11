import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Lead } from "./entities/lead.entity";
import { Opportunity } from "./entities/opportunity.entity";
import { ClientRelationship } from "./entities/client-relationship.entity";

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Opportunity)
    private opportunitiesRepository: Repository<Opportunity>,
    @InjectRepository(ClientRelationship)
    private relationshipsRepository: Repository<ClientRelationship>
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

  // Opportunities
  async getOpportunities(): Promise<Opportunity[]> {
    return this.opportunitiesRepository.find({
      order: { expectedCloseDate: "ASC" },
    });
  }

  async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    const opp = this.opportunitiesRepository.create(data);
    return this.opportunitiesRepository.save(opp);
  }

  // Relationships
  async getRelationships(): Promise<ClientRelationship[]> {
    return this.relationshipsRepository.find({
      order: { strength: "DESC" },
    });
  }

  async createRelationship(
    data: Partial<ClientRelationship>
  ): Promise<ClientRelationship> {
    const rel = this.relationshipsRepository.create(data);
    return this.relationshipsRepository.save(rel);
  }

  // Business Development Metrics
  async getBusinessDevelopmentData() {
    return {
      leadsByStatus: [
        { status: "New", count: 12, value: 850000 },
        { status: "Contacted", count: 8, value: 620000 },
        { status: "Qualified", count: 15, value: 1250000 },
        { status: "Proposal", count: 6, value: 980000 },
        { status: "Negotiation", count: 4, value: 720000 },
        { status: "Won", count: 22, value: 3200000 },
        { status: "Lost", count: 18, value: 1100000 },
      ],
      leadsBySource: [
        { source: "Referral", count: 28, color: "#3b82f6" },
        { source: "Website", count: 15, color: "#10b981" },
        { source: "Conference", count: 12, color: "#f59e0b" },
        { source: "LinkedIn", count: 8, color: "#8b5cf6" },
        { source: "Cold Outreach", count: 5, color: "#ef4444" },
        { source: "Other", count: 7, color: "#6b7280" },
      ],
      conversionTrend: [
        { month: "Jul", leads: 42, won: 8, lost: 12 },
        { month: "Aug", leads: 45, won: 10, lost: 10 },
        { month: "Sep", leads: 38, won: 7, lost: 9 },
        { month: "Oct", leads: 52, won: 12, lost: 14 },
        { month: "Nov", leads: 48, won: 11, lost: 11 },
        { month: "Dec", leads: 55, won: 15, lost: 13 },
      ],
    };
  }

  async getPitches() {
    return [
      {
        id: "1",
        leadId: "1",
        clientName: "TechVentures Inc.",
        practiceArea: "Corporate Law",
        pitchDate: "2025-12-18",
        pitchType: "In-Person",
        attendees: ["Sarah Chen", "CFO", "General Counsel"],
        presenters: ["John Smith", "Senior Partner"],
        status: "Completed",
        followUpDate: "2026-01-05",
        estimatedValue: 450000,
        outcome: "No Decision Yet",
        feedbackReceived: true,
        notes: "Very positive reception, requested revised scope",
      },
      {
        id: "2",
        leadId: "4",
        clientName: "RetailCorp",
        practiceArea: "Real Estate",
        pitchDate: "2026-01-15",
        pitchType: "Virtual",
        attendees: ["CEO", "VP Operations"],
        presenters: ["Jane Davis", "Associate"],
        status: "Scheduled",
        estimatedValue: 280000,
      },
    ];
  }

  async getRFPs() {
    return [
      {
        id: "1",
        title: "Outside General Counsel Services",
        clientName: "Acme Corporation",
        industry: "Technology",
        practiceArea: "Corporate Law",
        receivedDate: "2025-12-10",
        dueDate: "2026-01-20",
        estimatedValue: 850000,
        status: "In Progress",
        teamLead: "John Smith",
        contributors: ["Sarah Johnson", "Mike Wilson", "Jane Davis"],
        progress: 65,
        sections: [
          {
            name: "Executive Summary",
            assignedTo: "John Smith",
            status: "Complete",
          },
          {
            name: "Firm Overview",
            assignedTo: "Sarah Johnson",
            status: "Complete",
          },
          {
            name: "Practice Area Experience",
            assignedTo: "Mike Wilson",
            status: "In Progress",
          },
          { name: "Team Bios", assignedTo: "Jane Davis", status: "Review" },
          { name: "Pricing", assignedTo: "John Smith", status: "Not Started" },
        ],
        questions: 45,
        pageLimit: 50,
        goNoGoDecision: "Go",
        goNoGoReason: "Strong fit, existing relationship, high value",
      },
      {
        id: "2",
        title: "IP Litigation Panel",
        clientName: "Tech Innovations LLC",
        industry: "Technology",
        practiceArea: "IP Litigation",
        receivedDate: "2026-01-05",
        dueDate: "2026-02-15",
        estimatedValue: 500000,
        status: "Go/No-Go",
        teamLead: "Sarah Johnson",
        contributors: [],
        progress: 5,
        sections: [],
        questions: 30,
        pageLimit: 30,
        goNoGoDecision: "Pending",
      },
    ];
  }

  async getWinLossAnalysis() {
    return [
      {
        id: "1",
        opportunityName: "Global Manufacturing Employment Matter",
        clientName: "Global Manufacturing LLC",
        practiceArea: "Employment Law",
        estimatedValue: 180000,
        actualValue: 180000,
        outcome: "Won",
        closeDate: "2025-12-28",
        winReasons: [
          "Strong industry expertise",
          "Competitive pricing",
          "Responsive proposal",
        ],
        lessonsLearned: [
          "Quick turnaround on proposal was key",
          "Industry-specific case studies resonated",
        ],
        teamMembers: ["Mike Wilson", "Jane Davis"],
        salesCycle: 48,
      },
      {
        id: "2",
        opportunityName: "Financial Services Compliance Review",
        clientName: "BigBank Corp",
        practiceArea: "Compliance",
        estimatedValue: 400000,
        outcome: "Lost",
        closeDate: "2025-12-15",
        lossReasons: [
          "Price too high",
          "Competitor had existing relationship",
          "Insufficient fintech experience",
        ],
        competitorWon: "Smith & Associates",
        lessonsLearned: [
          "Need more fintech expertise on team",
          "Consider flexible pricing for large engagements",
        ],
        teamMembers: ["John Smith", "Sarah Johnson"],
        salesCycle: 62,
      },
    ];
  }

  // Client Analytics
  async getClientAnalytics() {
    return {
      profitability: [
        {
          clientId: "1",
          clientName: "Acme Corporation",
          totalRevenue: 450000,
          totalCosts: 270000,
          profit: 180000,
          profitMargin: 40,
          realization: 92,
          collectionRate: 95,
          trend: "up",
        },
        {
          clientId: "2",
          clientName: "Tech Startup Inc.",
          totalRevenue: 320000,
          totalCosts: 224000,
          profit: 96000,
          profitMargin: 30,
          realization: 85,
          collectionRate: 88,
          trend: "stable",
        },
        {
          clientId: "3",
          clientName: "Global Industries LLC",
          totalRevenue: 280000,
          totalCosts: 238000,
          profit: 42000,
          profitMargin: 15,
          realization: 78,
          collectionRate: 72,
          trend: "down",
        },
      ],
      ltv: [
        {
          clientId: "1",
          clientName: "Acme Corporation",
          ltv: 1250000,
          acquisitionCost: 15000,
          retentionRate: 95,
          avgAnnualRevenue: 180000,
          yearsAsClient: 5.2,
          projectedFutureValue: 850000,
        },
        {
          clientId: "2",
          clientName: "Tech Startup Inc.",
          ltv: 780000,
          acquisitionCost: 12000,
          retentionRate: 88,
          avgAnnualRevenue: 140000,
          yearsAsClient: 3.8,
          projectedFutureValue: 520000,
        },
      ],
      risk: [
        {
          clientId: "1",
          clientName: "Acme Corporation",
          overallRisk: "Low",
          riskScore: 15,
          factors: {
            paymentRisk: 10,
            scopeCreepRisk: 20,
            communicationRisk: 15,
            expectationRisk: 18,
            complianceRisk: 12,
          },
          outstandingBalance: 15000,
          daysOutstanding: 12,
          disputedInvoices: 0,
          lastActivity: "2026-01-02",
        },
        {
          clientId: "3",
          clientName: "Global Industries LLC",
          overallRisk: "High",
          riskScore: 78,
          factors: {
            paymentRisk: 85,
            scopeCreepRisk: 72,
            communicationRisk: 68,
            expectationRisk: 80,
            complianceRisk: 65,
          },
          outstandingBalance: 125000,
          daysOutstanding: 87,
          disputedInvoices: 3,
          lastActivity: "2025-12-15",
        },
      ],
      satisfaction: [
        {
          clientId: "1",
          clientName: "Acme Corporation",
          nps: 85,
          csat: 92,
          responsiveness: 9.2,
          quality: 9.5,
          value: 8.8,
          likelihood: 9.4,
          lastSurveyDate: "2025-12-20",
          totalSurveys: 8,
        },
        {
          clientId: "2",
          clientName: "Tech Startup Inc.",
          nps: 72,
          csat: 84,
          responsiveness: 8.5,
          quality: 8.8,
          value: 8.2,
          likelihood: 8.6,
          lastSurveyDate: "2025-12-15",
          totalSurveys: 5,
        },
      ],
      segments: [
        {
          segment: "Enterprise",
          count: 15,
          revenue: 2500000,
          avgLifetimeValue: 1200000,
          color: "#3b82f6",
        },
        {
          segment: "Mid-Market",
          count: 35,
          revenue: 1800000,
          avgLifetimeValue: 450000,
          color: "#10b981",
        },
        {
          segment: "Small Business",
          count: 50,
          revenue: 850000,
          avgLifetimeValue: 85000,
          color: "#f59e0b",
        },
        {
          segment: "Individual",
          count: 80,
          revenue: 320000,
          avgLifetimeValue: 15000,
          color: "#8b5cf6",
        },
      ],
      revenueTrend: [
        { month: "Jul", revenue: 420000, profit: 168000 },
        { month: "Aug", revenue: 450000, profit: 180000 },
        { month: "Sep", revenue: 480000, profit: 192000 },
        { month: "Oct", revenue: 510000, profit: 204000 },
        { month: "Nov", revenue: 490000, profit: 196000 },
        { month: "Dec", revenue: 550000, profit: 220000 },
      ],
    };
  }
}
