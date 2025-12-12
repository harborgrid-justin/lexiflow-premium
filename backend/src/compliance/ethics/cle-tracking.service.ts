import { Injectable, Logger } from '@nestjs/common';

export enum CLECategory {
  GENERAL = 'GENERAL',
  ETHICS = 'ETHICS',
  PROFESSIONAL_RESPONSIBILITY = 'PROFESSIONAL_RESPONSIBILITY',
  TECHNOLOGY = 'TECHNOLOGY',
  DIVERSITY = 'DIVERSITY',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  ELIMINATION_OF_BIAS = 'ELIMINATION_OF_BIAS',
  SUBSTANCE_ABUSE = 'SUBSTANCE_ABUSE',
  SPECIALIZATION = 'SPECIALIZATION',
}

export enum CLEDeliveryMethod {
  IN_PERSON = 'IN_PERSON',
  LIVE_WEBCAST = 'LIVE_WEBCAST',
  ON_DEMAND = 'ON_DEMAND',
  SELF_STUDY = 'SELF_STUDY',
  TEACHING = 'TEACHING',
  WRITING = 'WRITING',
  PRO_BONO = 'PRO_BONO',
}

export interface CLECredit {
  id: string;
  attorneyId: string;
  title: string;
  provider: string;
  category: CLECategory;
  deliveryMethod: CLEDeliveryMethod;
  credits: number;
  jurisdiction: string;
  completionDate: Date;
  certificateNumber?: string;
  certificateUrl?: string;
  approved: boolean;
  approvedBy?: string;
  approvalDate?: Date;
  notes?: string;
  createdAt: Date;
}

export interface CLERequirement {
  jurisdiction: string;
  reportingPeriod: { start: Date; end: Date };
  totalRequired: number;
  ethicsRequired: number;
  technologyRequired?: number;
  diversityRequired?: number;
  currentTotal: number;
  currentEthics: number;
  currentTechnology: number;
  currentDiversity: number;
  compliant: boolean;
  deficiency?: number;
}

export interface CLEProvider {
  id: string;
  name: string;
  jurisdiction: string[];
  approved: boolean;
  website?: string;
  contactEmail?: string;
  specializations: string[];
}

export interface CLECourse {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: CLECategory;
  credits: number;
  jurisdiction: string[];
  deliveryMethods: CLEDeliveryMethod[];
  cost?: number;
  startDate?: Date;
  endDate?: Date;
  registrationUrl?: string;
  approved: boolean;
}

@Injectable()
export class CleTrackingService {
  private readonly logger = new Logger(CleTrackingService.name);
  private credits: Map<string, CLECredit[]> = new Map(); // attorneyId -> credits
  private providers: Map<string, CLEProvider> = new Map();
  private courses: Map<string, CLECourse> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize approved CLE providers
   */
  private initializeProviders(): void {
    const providers: CLEProvider[] = [
      {
        id: 'provider-1',
        name: 'American Bar Association',
        jurisdiction: ['ALL'],
        approved: true,
        website: 'https://www.americanbar.org/cle',
        contactEmail: 'cle@americanbar.org',
        specializations: ['Ethics', 'Professional Responsibility', 'General Practice'],
      },
      {
        id: 'provider-2',
        name: 'Practising Law Institute',
        jurisdiction: ['ALL'],
        approved: true,
        website: 'https://www.pli.edu',
        contactEmail: 'info@pli.edu',
        specializations: ['Corporate Law', 'Litigation', 'Technology'],
      },
      {
        id: 'provider-3',
        name: 'National Institute for Trial Advocacy',
        jurisdiction: ['ALL'],
        approved: true,
        website: 'https://www.nita.org',
        specializations: ['Trial Skills', 'Advocacy', 'Evidence'],
      },
      {
        id: 'provider-4',
        name: 'State Bar of California',
        jurisdiction: ['CA'],
        approved: true,
        website: 'https://www.calbar.ca.gov',
        specializations: ['Ethics', 'California Law', 'MCLE'],
      },
      {
        id: 'provider-5',
        name: 'New York State Bar Association',
        jurisdiction: ['NY'],
        approved: true,
        website: 'https://www.nysba.org',
        specializations: ['Ethics', 'New York Law', 'CLE'],
      },
    ];

    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
    });

    this.logger.log(`Initialized ${providers.length} CLE providers`);
  }

  /**
   * Record CLE credit
   */
  async recordCredit(creditData: {
    attorneyId: string;
    title: string;
    provider: string;
    category: CLECategory;
    deliveryMethod: CLEDeliveryMethod;
    credits: number;
    jurisdiction: string;
    completionDate: Date;
    certificateNumber?: string;
    certificateUrl?: string;
    notes?: string;
  }): Promise<CLECredit> {
    const credit: CLECredit = {
      id: `cle-${Date.now()}`,
      attorneyId: creditData.attorneyId,
      title: creditData.title,
      provider: creditData.provider,
      category: creditData.category,
      deliveryMethod: creditData.deliveryMethod,
      credits: creditData.credits,
      jurisdiction: creditData.jurisdiction,
      completionDate: creditData.completionDate,
      certificateNumber: creditData.certificateNumber,
      certificateUrl: creditData.certificateUrl,
      approved: false, // Requires approval
      notes: creditData.notes,
      createdAt: new Date(),
    };

    const attorneyCredits = this.credits.get(creditData.attorneyId) || [];
    attorneyCredits.push(credit);
    this.credits.set(creditData.attorneyId, attorneyCredits);

    this.logger.log(
      `Recorded ${credit.credits} CLE credits for attorney ${creditData.attorneyId}: ${credit.title}`,
    );

    return credit;
  }

  /**
   * Approve CLE credit
   */
  async approveCredit(
    creditId: string,
    approvedBy: string,
  ): Promise<void> {
    for (const [attorneyId, credits] of this.credits.entries()) {
      const credit = credits.find(c => c.id === creditId);
      if (credit) {
        credit.approved = true;
        credit.approvedBy = approvedBy;
        credit.approvalDate = new Date();
        this.credits.set(attorneyId, credits);

        this.logger.log(`CLE credit ${creditId} approved by ${approvedBy}`);
        return;
      }
    }
  }

  /**
   * Calculate CLE requirements for jurisdiction
   */
  async calculateRequirements(
    attorneyId: string,
    jurisdiction: string,
    reportingPeriod: { start: Date; end: Date },
  ): Promise<CLERequirement> {
    // Get jurisdiction-specific requirements
    const requirements = this.getJurisdictionRequirements(jurisdiction);

    // Get approved credits for this period
    const attorneyCredits = this.credits.get(attorneyId) || [];
    const periodCredits = attorneyCredits.filter(
      c =>
        c.approved &&
        c.jurisdiction === jurisdiction &&
        c.completionDate >= reportingPeriod.start &&
        c.completionDate <= reportingPeriod.end,
    );

    // Calculate totals
    const currentTotal = periodCredits.reduce((sum, c) => sum + c.credits, 0);
    const currentEthics = periodCredits
      .filter(
        c =>
          c.category === CLECategory.ETHICS ||
          c.category === CLECategory.PROFESSIONAL_RESPONSIBILITY,
      )
      .reduce((sum, c) => sum + c.credits, 0);

    const currentTechnology = periodCredits
      .filter(c => c.category === CLECategory.TECHNOLOGY)
      .reduce((sum, c) => sum + c.credits, 0);

    const currentDiversity = periodCredits
      .filter(c => c.category === CLECategory.DIVERSITY)
      .reduce((sum, c) => sum + c.credits, 0);

    const compliant =
      currentTotal >= requirements.totalRequired &&
      currentEthics >= requirements.ethicsRequired &&
      (!requirements.technologyRequired || currentTechnology >= requirements.technologyRequired) &&
      (!requirements.diversityRequired || currentDiversity >= requirements.diversityRequired);

    const deficiency = compliant ? 0 : requirements.totalRequired - currentTotal;

    return {
      jurisdiction,
      reportingPeriod,
      totalRequired: requirements.totalRequired,
      ethicsRequired: requirements.ethicsRequired,
      technologyRequired: requirements.technologyRequired,
      diversityRequired: requirements.diversityRequired,
      currentTotal,
      currentEthics,
      currentTechnology,
      currentDiversity,
      compliant,
      deficiency: deficiency > 0 ? deficiency : undefined,
    };
  }

  /**
   * Get jurisdiction-specific CLE requirements
   */
  private getJurisdictionRequirements(jurisdiction: string): {
    totalRequired: number;
    ethicsRequired: number;
    technologyRequired?: number;
    diversityRequired?: number;
  } {
    const requirements: Record<
      string,
      {
        totalRequired: number;
        ethicsRequired: number;
        technologyRequired?: number;
        diversityRequired?: number;
      }
    > = {
      CA: { totalRequired: 25, ethicsRequired: 4, technologyRequired: 1 },
      NY: { totalRequired: 24, ethicsRequired: 4, diversityRequired: 1 },
      TX: { totalRequired: 15, ethicsRequired: 3 },
      FL: { totalRequired: 30, ethicsRequired: 5, technologyRequired: 3 },
      IL: { totalRequired: 30, ethicsRequired: 6 },
      PA: { totalRequired: 12, ethicsRequired: 2 },
      OH: { totalRequired: 24, ethicsRequired: 2.5 },
      GA: { totalRequired: 12, ethicsRequired: 1 },
      NC: { totalRequired: 12, ethicsRequired: 2 },
      NJ: { totalRequired: 24, ethicsRequired: 4 },
    };

    return requirements[jurisdiction] || { totalRequired: 15, ethicsRequired: 3 };
  }

  /**
   * Get credits for attorney
   */
  async getCredits(
    attorneyId: string,
    filters?: {
      jurisdiction?: string;
      category?: CLECategory;
      startDate?: Date;
      endDate?: Date;
      approvedOnly?: boolean;
    },
  ): Promise<CLECredit[]> {
    let credits = this.credits.get(attorneyId) || [];

    if (filters?.jurisdiction) {
      credits = credits.filter(c => c.jurisdiction === filters.jurisdiction);
    }

    if (filters?.category) {
      credits = credits.filter(c => c.category === filters.category);
    }

    if (filters?.startDate) {
      credits = credits.filter(c => c.completionDate >= filters.startDate!);
    }

    if (filters?.endDate) {
      credits = credits.filter(c => c.completionDate <= filters.endDate!);
    }

    if (filters?.approvedOnly) {
      credits = credits.filter(c => c.approved);
    }

    return credits.sort((a, b) => b.completionDate.getTime() - a.completionDate.getTime());
  }

  /**
   * Get CLE summary for attorney
   */
  async getSummary(
    attorneyId: string,
    jurisdiction: string,
  ): Promise<{
    currentYear: CLERequirement;
    totalCredits: number;
    totalEthics: number;
    creditsByCategory: Record<CLECategory, number>;
    creditsByMethod: Record<CLEDeliveryMethod, number>;
    recentCredits: CLECredit[];
  }> {
    const now = new Date();
    const currentYear = {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear(), 11, 31),
    };

    const currentYearReq = await this.calculateRequirements(
      attorneyId,
      jurisdiction,
      currentYear,
    );

    const allCredits = await this.getCredits(attorneyId, {
      jurisdiction,
      approvedOnly: true,
    });

    const totalCredits = allCredits.reduce((sum, c) => sum + c.credits, 0);
    const totalEthics = allCredits
      .filter(
        c =>
          c.category === CLECategory.ETHICS ||
          c.category === CLECategory.PROFESSIONAL_RESPONSIBILITY,
      )
      .reduce((sum, c) => sum + c.credits, 0);

    // Credits by category
    const creditsByCategory: Record<CLECategory, number> = {} as any;
    Object.values(CLECategory).forEach(cat => {
      creditsByCategory[cat] = allCredits
        .filter(c => c.category === cat)
        .reduce((sum, c) => sum + c.credits, 0);
    });

    // Credits by method
    const creditsByMethod: Record<CLEDeliveryMethod, number> = {} as any;
    Object.values(CLEDeliveryMethod).forEach(method => {
      creditsByMethod[method] = allCredits
        .filter(c => c.deliveryMethod === method)
        .reduce((sum, c) => sum + c.credits, 0);
    });

    const recentCredits = allCredits.slice(0, 10);

    return {
      currentYear: currentYearReq,
      totalCredits,
      totalEthics,
      creditsByCategory,
      creditsByMethod,
      recentCredits,
    };
  }

  /**
   * Add CLE provider
   */
  async addProvider(providerData: Omit<CLEProvider, 'id'>): Promise<CLEProvider> {
    const provider: CLEProvider = {
      id: `provider-${Date.now()}`,
      ...providerData,
    };

    this.providers.set(provider.id, provider);
    this.logger.log(`Added CLE provider: ${provider.name}`);

    return provider;
  }

  /**
   * Get approved providers
   */
  async getProviders(jurisdiction?: string): Promise<CLEProvider[]> {
    let providers = Array.from(this.providers.values()).filter(p => p.approved);

    if (jurisdiction) {
      providers = providers.filter(
        p => p.jurisdiction.includes(jurisdiction) || p.jurisdiction.includes('ALL'),
      );
    }

    return providers;
  }

  /**
   * Add CLE course
   */
  async addCourse(courseData: Omit<CLECourse, 'id'>): Promise<CLECourse> {
    const course: CLECourse = {
      id: `course-${Date.now()}`,
      ...courseData,
    };

    this.courses.set(course.id, course);
    this.logger.log(`Added CLE course: ${course.title}`);

    return course;
  }

  /**
   * Search CLE courses
   */
  async searchCourses(criteria: {
    jurisdiction?: string;
    category?: CLECategory;
    deliveryMethod?: CLEDeliveryMethod;
    providerId?: string;
    keyword?: string;
  }): Promise<CLECourse[]> {
    let courses = Array.from(this.courses.values()).filter(c => c.approved);

    if (criteria.jurisdiction) {
      courses = courses.filter(c => c.jurisdiction.includes(criteria.jurisdiction!));
    }

    if (criteria.category) {
      courses = courses.filter(c => c.category === criteria.category);
    }

    if (criteria.deliveryMethod) {
      courses = courses.filter(c => c.deliveryMethods.includes(criteria.deliveryMethod!));
    }

    if (criteria.providerId) {
      courses = courses.filter(c => c.providerId === criteria.providerId);
    }

    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase();
      courses = courses.filter(
        c =>
          c.title.toLowerCase().includes(keyword) ||
          c.description.toLowerCase().includes(keyword),
      );
    }

    return courses;
  }

  /**
   * Import credits from state bar
   */
  async importCreditsFromStateBar(
    attorneyId: string,
    jurisdiction: string,
    barNumber: string,
  ): Promise<number> {
    // In production, integrate with state bar APIs
    // For now, simulate import
    this.logger.log(
      `Importing CLE credits for attorney ${attorneyId} from ${jurisdiction} bar`,
    );

    return 0; // Would return number of imported credits
  }

  /**
   * Export credits for reporting
   */
  async exportCredits(
    attorneyId: string,
    jurisdiction: string,
    reportingPeriod: { start: Date; end: Date },
  ): Promise<string> {
    const credits = await this.getCredits(attorneyId, {
      jurisdiction,
      startDate: reportingPeriod.start,
      endDate: reportingPeriod.end,
      approvedOnly: true,
    });

    const requirements = await this.calculateRequirements(
      attorneyId,
      jurisdiction,
      reportingPeriod,
    );

    // Generate CSV export
    const lines = [
      'Title,Provider,Category,Method,Credits,Completion Date,Certificate Number',
      ...credits.map(c =>
        [
          c.title,
          c.provider,
          c.category,
          c.deliveryMethod,
          c.credits,
          c.completionDate.toLocaleDateString(),
          c.certificateNumber || '',
        ].join(','),
      ),
      '',
      `Total Credits,${requirements.currentTotal}`,
      `Ethics Credits,${requirements.currentEthics}`,
      `Required Total,${requirements.totalRequired}`,
      `Required Ethics,${requirements.ethicsRequired}`,
      `Compliant,${requirements.compliant ? 'Yes' : 'No'}`,
    ];

    return lines.join('\n');
  }

  /**
   * Delete credit
   */
  async deleteCredit(creditId: string): Promise<void> {
    for (const [attorneyId, credits] of this.credits.entries()) {
      const index = credits.findIndex(c => c.id === creditId);
      if (index !== -1) {
        credits.splice(index, 1);
        this.credits.set(attorneyId, credits);
        this.logger.log(`Deleted CLE credit ${creditId}`);
        return;
      }
    }
  }
}
