import { faker } from '@faker-js/faker';
import { DataFactory } from './data-factory';

export interface CaseFactoryOptions {
  caseType?: string;
  status?: string;
  organizationId?: string;
}

export class CaseFactory {
  /**
   * Generate a random case
   */
  static generateCase(options: CaseFactoryOptions = {}): any {
    const year = faker.date.past({ years: 2 }).getFullYear();
    const sequence = faker.number.int({ min: 1, max: 9999 });
    const caseType = options.caseType || faker.helpers.arrayElement([
      'Civil',
      'Criminal',
      'Family',
      'Bankruptcy',
      'Immigration',
      'Intellectual Property',
      'Corporate',
      'Real Estate',
      'Labor',
      'Environmental',
      'Tax',
    ]);

    const status = options.status || faker.helpers.arrayElement([
      'Open',
      'Active',
      'Discovery',
      'Trial',
      'Settled',
      'Closed',
      'On Hold',
    ]);

    const filingDate = faker.date.past({ years: 2 });
    const trialDate = status === 'Trial' ? faker.date.future({ years: 1 }) : null;

    return {
      title: DataFactory.generateCaseTitle(caseType.toLowerCase()),
      caseNumber: DataFactory.generateCaseNumber(year, sequence),
      description: this.generateCaseDescription(caseType),
      type: caseType,
      status,
      practiceArea: this.getPracticeAreaForType(caseType),
      jurisdiction: faker.helpers.arrayElement([
        'Federal',
        'California',
        'New York',
        'Texas',
        'Illinois',
        'Florida',
      ]),
      court: DataFactory.generateCourtName(),
      judge: DataFactory.generateJudgeName(),
      filingDate: filingDate.toISOString().split('T')[0],
      trialDate: trialDate ? trialDate.toISOString().split('T')[0] : null,
      closeDate: status === 'Closed' || status === 'Settled' ? faker.date.recent({ days: 90 }).toISOString().split('T')[0] : null,
      metadata: {
        estimatedValue: faker.number.int({ min: 10000, max: 5000000 }),
        complexity: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Very High']),
        priority: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Urgent']),
      },
      isArchived: status === 'Closed' && faker.datatype.boolean({ probability: 0.3 }),
    };
  }

  /**
   * Generate multiple cases
   */
  static generateCases(count: number, options: CaseFactoryOptions = {}): any[] {
    const cases = [];
    for (let i = 0; i < count; i++) {
      cases.push(this.generateCase(options));
    }
    return cases;
  }

  /**
   * Generate case description
   */
  private static generateCaseDescription(caseType: string): string {
    const descriptions = {
      Civil: [
        'Breach of contract dispute involving commercial transaction',
        'Personal injury claim arising from automobile accident',
        'Property damage claim due to negligence',
        'Business dispute over partnership dissolution',
      ],
      Criminal: [
        'White-collar fraud charges involving securities violations',
        'Drug possession with intent to distribute',
        'DUI with aggravating circumstances',
        'Assault and battery charges',
      ],
      Family: [
        'Contested divorce with complex asset division',
        'Child custody modification proceedings',
        'Spousal support determination',
        'Domestic violence protective order',
      ],
      Bankruptcy: [
        'Chapter 7 bankruptcy liquidation',
        'Chapter 11 business reorganization',
        'Chapter 13 debt restructuring',
        'Creditor adversary proceeding',
      ],
      'Intellectual Property': [
        'Patent infringement action',
        'Trademark opposition proceedings',
        'Copyright violation claim',
        'Trade secret misappropriation',
      ],
      Corporate: [
        'Merger and acquisition transaction',
        'Securities compliance matter',
        'Corporate governance dispute',
        'Entity formation and structuring',
      ],
    };

    const typeDescriptions = descriptions[caseType] || [
      'General legal matter requiring comprehensive representation',
    ];

    return faker.helpers.arrayElement(typeDescriptions);
  }

  /**
   * Get practice area for case type
   */
  private static getPracticeAreaForType(caseType: string): string {
    const practiceAreas = {
      Civil: 'Civil Litigation',
      Criminal: 'Criminal Defense',
      Family: 'Family Law',
      Bankruptcy: 'Bankruptcy & Insolvency',
      Immigration: 'Immigration Law',
      'Intellectual Property': 'Intellectual Property',
      Corporate: 'Corporate & Securities',
      'Real Estate': 'Real Estate Law',
      Labor: 'Employment & Labor',
      Environmental: 'Environmental Law',
      Tax: 'Tax Law',
    };
    return practiceAreas[caseType] || 'General Practice';
  }
}
