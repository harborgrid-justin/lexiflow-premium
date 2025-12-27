import { faker } from '@faker-js/faker';
import { Case, CaseSummary } from '../../src/shared-types/entities/case.entity';
import { CaseStatus, CaseType } from '../../src/shared-types/enums/case.enums';

export interface CreateCaseOptions {
  id?: string;
  title?: string;
  caseNumber?: string;
  description?: string;
  type?: CaseType;
  status?: CaseStatus;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filingDate?: string;
  trialDate?: string;
  closeDate?: string;
  assignedTeamId?: string;
  leadAttorneyId?: string;
  clientId?: string;
  metadata?: Record<string, unknown>;
  isArchived?: boolean;
}

export interface PartyOptions {
  id?: string;
  caseId?: string;
  name?: string;
  type?: 'plaintiff' | 'defendant' | 'witness' | 'expert';
  email?: string;
  phone?: string;
  address?: string;
}

export interface DocumentOptions {
  id?: string;
  caseId?: string;
  title?: string;
  type?: string;
  fileUrl?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export class CaseFactory {
  static createCase(options: CreateCaseOptions = {}): Case {
    const caseNumber = options.caseNumber || this.generateCaseNumber();
    const filingDate = options.filingDate || faker.date.past({ years: 2 }).toISOString();
    const type = options.type || faker.helpers.arrayElement(Object.values(CaseType));

    return {
      id: options.id || faker.string.uuid(),
      title: options.title || this.generateCaseTitle(type),
      caseNumber,
      description: options.description || faker.lorem.paragraphs(2),
      type,
      status: options.status || CaseStatus.ACTIVE,
      practiceArea: options.practiceArea || this.getPracticeAreaForType(type),
      jurisdiction: options.jurisdiction || this.generateJurisdiction(),
      court: options.court || this.generateCourtName(),
      judge: options.judge || `Hon. ${faker.person.fullName()}`,
      filingDate,
      trialDate: options.trialDate,
      closeDate: options.closeDate,
      assignedTeamId: options.assignedTeamId,
      leadAttorneyId: options.leadAttorneyId || faker.string.uuid(),
      clientId: options.clientId || faker.string.uuid(),
      metadata: options.metadata || {},
      isArchived: options.isArchived ?? false,
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    };
  }

  static createCivilCase(options: CreateCaseOptions = {}): Case {
    return this.createCase({
      type: CaseType.CIVIL,
      practiceArea: 'Civil Litigation',
      ...options,
    });
  }

  static createCriminalCase(options: CreateCaseOptions = {}): Case {
    return this.createCase({
      type: CaseType.CRIMINAL,
      practiceArea: 'Criminal Defense',
      ...options,
    });
  }

  static createFamilyCase(options: CreateCaseOptions = {}): Case {
    return this.createCase({
      type: CaseType.FAMILY,
      practiceArea: 'Family Law',
      title: options.title || faker.helpers.arrayElement([
        'Divorce Proceedings',
        'Child Custody Matter',
        'Spousal Support Case',
        'Adoption Proceedings',
      ]),
      ...options,
    });
  }

  static createCorporateCase(options: CreateCaseOptions = {}): Case {
    return this.createCase({
      type: CaseType.CORPORATE,
      practiceArea: 'Corporate Law',
      title: options.title || faker.helpers.arrayElement([
        'Merger and Acquisition',
        'Corporate Governance Matter',
        'Securities Compliance',
        'Contract Dispute',
      ]),
      ...options,
    });
  }

  static createIntellectualPropertyCase(options: CreateCaseOptions = {}): Case {
    return this.createCase({
      type: CaseType.INTELLECTUAL_PROPERTY,
      practiceArea: 'Intellectual Property',
      title: options.title || faker.helpers.arrayElement([
        'Patent Infringement',
        'Trademark Dispute',
        'Copyright Violation',
        'Trade Secret Misappropriation',
      ]),
      ...options,
    });
  }

  static createOpenCase(options: CreateCaseOptions = {}): Case {
    return this.createCase({
      status: CaseStatus.OPEN,
      filingDate: faker.date.recent({ days: 30 }).toISOString(),
      ...options,
    });
  }

  static createActiveCase(options: CreateCaseOptions = {}): Case {
    return this.createCase({
      status: CaseStatus.ACTIVE,
      ...options,
    });
  }

  static createDiscoveryCase(options: CreateCaseOptions = {}): Case {
    return this.createCase({
      status: CaseStatus.DISCOVERY,
      ...options,
    });
  }

  static createTrialCase(options: CreateCaseOptions = {}): Case {
    const filingDate = faker.date.past({ years: 1 }).toISOString();
    const trialDate = faker.date.future({ years: 0.1 }).toISOString();

    return this.createCase({
      status: CaseStatus.TRIAL,
      filingDate,
      trialDate,
      ...options,
    });
  }

  static createSettledCase(options: CreateCaseOptions = {}): Case {
    const filingDate = faker.date.past({ years: 2 }).toISOString();
    const closeDate = faker.date.between({
      from: new Date(filingDate),
      to: new Date(),
    }).toISOString();

    return this.createCase({
      status: CaseStatus.SETTLED,
      filingDate,
      closeDate,
      ...options,
    });
  }

  static createClosedCase(options: CreateCaseOptions = {}): Case {
    const filingDate = faker.date.past({ years: 3 }).toISOString();
    const closeDate = faker.date.between({
      from: new Date(filingDate),
      to: new Date(),
    }).toISOString();

    return this.createCase({
      status: CaseStatus.CLOSED,
      filingDate,
      closeDate,
      ...options,
    });
  }

  static createArchivedCase(options: CreateCaseOptions = {}): Case {
    return this.createCase({
      status: CaseStatus.ARCHIVED,
      isArchived: true,
      closeDate: faker.date.past({ years: 2 }).toISOString(),
      ...options,
    });
  }

  static createMultipleCases(count: number, options: CreateCaseOptions = {}): Case[] {
    const cases: Case[] = [];
    for (let i = 0; i < count; i++) {
      cases.push(this.createCase(options));
    }
    return cases;
  }

  static createCaseSummary(caseData: Case): CaseSummary {
    return {
      id: caseData.id,
      title: caseData.title,
      caseNumber: caseData.caseNumber,
      status: caseData.status,
      type: caseData.type,
    };
  }

  static createParty(options: PartyOptions = {}): any {
    const type = options.type || faker.helpers.arrayElement(['plaintiff', 'defendant', 'witness', 'expert']);
    return {
      id: options.id || faker.string.uuid(),
      caseId: options.caseId || faker.string.uuid(),
      name: options.name || faker.person.fullName(),
      type,
      email: options.email || faker.internet.email().toLowerCase(),
      phone: options.phone || faker.phone.number('+1-###-###-####'),
      address: options.address || `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    };
  }

  static createDocument(options: DocumentOptions = {}): any {
    const docType = options.type || faker.helpers.arrayElement([
      'pleading',
      'motion',
      'brief',
      'evidence',
      'contract',
      'correspondence',
      'discovery',
    ]);

    return {
      id: options.id || faker.string.uuid(),
      caseId: options.caseId || faker.string.uuid(),
      title: options.title || this.generateDocumentTitle(docType),
      type: docType,
      fileUrl: options.fileUrl || faker.internet.url(),
      uploadedBy: options.uploadedBy || faker.string.uuid(),
      uploadedAt: options.uploadedAt || faker.date.recent().toISOString(),
      size: faker.number.int({ min: 1024, max: 10485760 }),
      mimeType: 'application/pdf',
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    };
  }

  static createCaseWithParties(caseOptions: CreateCaseOptions = {}): {
    case: Case;
    parties: any[];
  } {
    const caseData = this.createCase(caseOptions);
    const parties = [
      this.createParty({ caseId: caseData.id, type: 'plaintiff' }),
      this.createParty({ caseId: caseData.id, type: 'defendant' }),
    ];

    return { case: caseData, parties };
  }

  static createCaseWithDocuments(caseOptions: CreateCaseOptions = {}, documentCount: number = 3): {
    case: Case;
    documents: any[];
  } {
    const caseData = this.createCase(caseOptions);
    const documents = Array.from({ length: documentCount }, () =>
      this.createDocument({ caseId: caseData.id })
    );

    return { case: caseData, documents };
  }

  static createCompleteCaseData(caseOptions: CreateCaseOptions = {}): {
    case: Case;
    parties: any[];
    documents: any[];
  } {
    const caseData = this.createCase(caseOptions);
    const parties = [
      this.createParty({ caseId: caseData.id, type: 'plaintiff' }),
      this.createParty({ caseId: caseData.id, type: 'defendant' }),
      this.createParty({ caseId: caseData.id, type: 'witness' }),
    ];
    const documents = [
      this.createDocument({ caseId: caseData.id, type: 'pleading' }),
      this.createDocument({ caseId: caseData.id, type: 'motion' }),
      this.createDocument({ caseId: caseData.id, type: 'evidence' }),
    ];

    return { case: caseData, parties, documents };
  }

  private static generateCaseNumber(): string {
    const year = faker.date.past({ years: 3 }).getFullYear();
    const type = faker.helpers.arrayElement(['CV', 'CR', 'FAM', 'BK']);
    const number = faker.number.int({ min: 10000, max: 99999 });
    return `${year}-${type}-${number}`;
  }

  private static generateCaseTitle(type: CaseType): string {
    const plaintiff = faker.person.lastName();
    const defendant = faker.person.lastName();

    switch (type) {
      case CaseType.CIVIL:
        return `${plaintiff} v. ${defendant}`;
      case CaseType.CRIMINAL:
        return `State v. ${defendant}`;
      case CaseType.FAMILY:
        return `In re Marriage of ${plaintiff}`;
      case CaseType.BANKRUPTCY:
        return `In re: ${plaintiff}`;
      case CaseType.CORPORATE:
        return `${faker.company.name()} Matter`;
      case CaseType.INTELLECTUAL_PROPERTY:
        return `${faker.company.name()} v. ${faker.company.name()}`;
      default:
        return `${plaintiff} v. ${defendant}`;
    }
  }

  private static getPracticeAreaForType(type: CaseType): string {
    const practiceAreas: Record<CaseType, string> = {
      [CaseType.CIVIL]: 'Civil Litigation',
      [CaseType.CRIMINAL]: 'Criminal Defense',
      [CaseType.FAMILY]: 'Family Law',
      [CaseType.BANKRUPTCY]: 'Bankruptcy',
      [CaseType.IMMIGRATION]: 'Immigration',
      [CaseType.INTELLECTUAL_PROPERTY]: 'Intellectual Property',
      [CaseType.CORPORATE]: 'Corporate Law',
      [CaseType.REAL_ESTATE]: 'Real Estate',
      [CaseType.LABOR]: 'Labor and Employment',
      [CaseType.ENVIRONMENTAL]: 'Environmental Law',
      [CaseType.TAX]: 'Tax Law',
      [CaseType.LITIGATION]: 'General Litigation',
      [CaseType.MA]: 'Mergers and Acquisitions',
      [CaseType.IP]: 'Intellectual Property',
      [CaseType.GENERAL]: 'General Practice',
    };
    return practiceAreas[type] || 'General Practice';
  }

  private static generateJurisdiction(): string {
    return faker.helpers.arrayElement([
      'Federal',
      'State',
      `${faker.location.state()} State Court`,
      `${faker.location.county()} County`,
    ]);
  }

  private static generateCourtName(): string {
    const state = faker.location.state();
    const courtTypes = [
      `${state} Superior Court`,
      `${state} District Court`,
      `${state} Circuit Court`,
      `U.S. District Court for ${state}`,
      `${faker.location.county()} County Court`,
    ];
    return faker.helpers.arrayElement(courtTypes);
  }

  private static generateDocumentTitle(type: string): string {
    const titles: Record<string, string[]> = {
      pleading: ['Complaint', 'Answer', 'Reply', 'Cross-Complaint'],
      motion: ['Motion to Dismiss', 'Motion for Summary Judgment', 'Motion to Compel', 'Motion in Limine'],
      brief: ['Opening Brief', 'Opposition Brief', 'Reply Brief', 'Memorandum of Points and Authorities'],
      evidence: ['Exhibit A', 'Exhibit B', 'Deposition Transcript', 'Expert Report'],
      contract: ['Settlement Agreement', 'Retainer Agreement', 'Engagement Letter', 'Confidentiality Agreement'],
      correspondence: ['Demand Letter', 'Response to Demand', 'Notice of Appearance', 'Notice of Withdrawal'],
      discovery: ['Interrogatories', 'Request for Production', 'Request for Admissions', 'Deposition Notice'],
    };

    return faker.helpers.arrayElement(titles[type] || ['Legal Document']);
  }
}

export default CaseFactory;
