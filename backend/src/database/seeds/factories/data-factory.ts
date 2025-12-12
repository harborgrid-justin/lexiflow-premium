import { faker } from '@faker-js/faker';

export class DataFactory {
  /**
   * Generate realistic case numbers
   */
  static generateCaseNumber(year: number, sequence: number): string {
    const courtType = faker.helpers.arrayElement(['CV', 'CR', 'FAM', 'PROB']);
    return `${courtType}-${year}-${String(sequence).padStart(5, '0')}`;
  }

  /**
   * Generate realistic client numbers
   */
  static generateClientNumber(sequence: number): string {
    return `CL-${String(sequence).padStart(6, '0')}`;
  }

  /**
   * Generate realistic invoice numbers
   */
  static generateInvoiceNumber(year: number, month: number, sequence: number): string {
    return `INV-${year}-${String(month).padStart(2, '0')}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Generate realistic evidence numbers
   */
  static generateEvidenceNumber(caseNum: number, itemNum: number): string {
    return `EV-${String(caseNum).padStart(3, '0')}-${String(itemNum).padStart(3, '0')}`;
  }

  /**
   * Generate realistic Bates numbers
   */
  static generateBatesNumber(prefix: string, sequence: number): string {
    return `${prefix}${String(sequence).padStart(8, '0')}`;
  }

  /**
   * Generate date within range
   */
  static generateDateInRange(startDate: Date, endDate: Date): Date {
    return faker.date.between({ from: startDate, to: endDate });
  }

  /**
   * Generate realistic legal case titles
   */
  static generateCaseTitle(type: string): string {
    const plaintiff = faker.person.fullName();
    const defendant = faker.person.fullName();

    switch (type) {
      case 'civil':
        return `${plaintiff} v. ${defendant}`;
      case 'criminal':
        return `State v. ${defendant}`;
      case 'family':
        return `In re Marriage of ${plaintiff.split(' ')[1]} and ${defendant.split(' ')[1]}`;
      case 'corporate':
        return `${faker.company.name()} v. ${faker.company.name()}`;
      case 'bankruptcy':
        return `In re ${plaintiff}`;
      case 'probate':
        return `In re Estate of ${plaintiff}`;
      default:
        return `${plaintiff} v. ${defendant}`;
    }
  }

  /**
   * Generate realistic billing rates
   */
  static generateBillingRate(role: string): number {
    const rates = {
      partner: faker.number.int({ min: 500, max: 750 }),
      senior_associate: faker.number.int({ min: 350, max: 500 }),
      associate: faker.number.int({ min: 250, max: 350 }),
      junior_associate: faker.number.int({ min: 175, max: 250 }),
      paralegal: faker.number.int({ min: 100, max: 175 }),
      legal_assistant: faker.number.int({ min: 75, max: 125 }),
      clerk: faker.number.int({ min: 50, max: 100 }),
    };
    return rates[role] || 200;
  }

  /**
   * Generate realistic time entry descriptions
   */
  static generateTimeEntryDescription(): string {
    const activities = [
      'Review and analyze case documents',
      'Draft motion for summary judgment',
      'Client conference regarding case strategy',
      'Legal research on jurisdictional issues',
      'Prepare deposition outline',
      'Review discovery responses',
      'Draft memorandum of law',
      'Conference with opposing counsel',
      'Prepare for court hearing',
      'Review and revise settlement agreement',
      'Research case law precedents',
      'Draft interrogatories',
      'Review expert witness reports',
      'Prepare trial exhibits',
      'Client communication via email',
      'Review and analyze financial documents',
      'Draft complaint',
      'Prepare witness examination outline',
      'Review contract provisions',
      'Legal research on damages calculation',
    ];
    return faker.helpers.arrayElement(activities);
  }

  /**
   * Generate realistic document titles
   */
  static generateDocumentTitle(type: string): string {
    const titles = {
      contract: [
        'Service Agreement',
        'Employment Contract',
        'Non-Disclosure Agreement',
        'Purchase Agreement',
        'Licensing Agreement',
      ],
      motion: [
        'Motion to Dismiss',
        'Motion for Summary Judgment',
        'Motion in Limine',
        'Motion to Compel Discovery',
        'Motion for Continuance',
      ],
      brief: [
        'Memorandum in Support of Motion',
        'Opposition Brief',
        'Reply Brief',
        'Trial Brief',
        'Appellate Brief',
      ],
      pleading: [
        'Complaint',
        'Answer',
        'Cross-Claim',
        'Third-Party Complaint',
        'Amended Complaint',
      ],
      discovery: [
        'Interrogatories',
        'Requests for Production',
        'Requests for Admission',
        'Deposition Notice',
        'Subpoena Duces Tecum',
      ],
    };
    const typeList = titles[type] || titles.contract;
    return faker.helpers.arrayElement(typeList);
  }

  /**
   * Generate realistic legal addresses
   */
  static generateLegalAddress(): string {
    return `${faker.location.buildingNumber()} ${faker.location.street()}, ${faker.location.city()}, ${faker.location.state({ abbreviated: true })} ${faker.location.zipCode()}`;
  }

  /**
   * Generate realistic court names
   */
  static generateCourtName(): string {
    const courts = [
      'United States District Court, Southern District of New York',
      'Superior Court of California, County of Los Angeles',
      'Circuit Court, Cook County, Illinois',
      'District Court, Harris County, Texas',
      'King County Superior Court, Washington',
      'United States District Court, Northern District of California',
      'New York Supreme Court, New York County',
      'Circuit Court of the Eleventh Judicial Circuit, Miami-Dade County',
      'Superior Court of Arizona, Maricopa County',
      'District Court of Massachusetts, Suffolk County',
    ];
    return faker.helpers.arrayElement(courts);
  }

  /**
   * Generate realistic judge names
   */
  static generateJudgeName(): string {
    const titles = ['Hon.', 'Judge'];
    return `${faker.helpers.arrayElement(titles)} ${faker.person.firstName()} ${faker.person.lastName()}`;
  }

  /**
   * Generate practice areas
   */
  static generatePracticeAreas(): string[] {
    const areas = [
      'Civil Litigation',
      'Corporate Law',
      'Criminal Defense',
      'Family Law',
      'Estate Planning',
      'Intellectual Property',
      'Real Estate',
      'Employment Law',
      'Tax Law',
      'Immigration Law',
      'Bankruptcy',
      'Environmental Law',
      'Securities Law',
      'Healthcare Law',
      'Technology Law',
    ];
    return faker.helpers.arrayElements(areas, faker.number.int({ min: 1, max: 3 }));
  }

  /**
   * Generate realistic expense descriptions
   */
  static generateExpenseDescription(category: string): string {
    const descriptions = {
      travel: [
        'Airfare to client meeting',
        'Hotel accommodation for deposition',
        'Taxi to courthouse',
        'Rental car for site visit',
        'Parking fees at court',
      ],
      meals: [
        'Client dinner meeting',
        'Working lunch with opposing counsel',
        'Business meal during trial',
      ],
      filing_fees: [
        'Court filing fee - Complaint',
        'Court filing fee - Motion',
        'Appeal filing fee',
        'Document recording fee',
      ],
      expert_fees: [
        'Expert witness consultation',
        'Forensic analysis fee',
        'Medical expert report',
        'Technical expert testimony',
      ],
      research: [
        'Westlaw legal research',
        'LexisNexis database access',
        'Court records research',
      ],
      copying: [
        'Document copying and printing',
        'Color copies for trial exhibits',
        'Large format printing',
      ],
      postage: [
        'Certified mail - service of process',
        'Overnight delivery to court',
        'Priority mail to client',
      ],
    };
    const categoryDescriptions = descriptions[category] || ['Miscellaneous expense'];
    return faker.helpers.arrayElement(categoryDescriptions);
  }

  /**
   * Generate realistic notification messages
   */
  static generateNotificationMessage(type: string): { title: string; message: string } {
    const messages = {
      case_update: {
        title: 'Case Status Updated',
        message: 'The status of your case has been updated. Please review the latest developments.',
      },
      deadline_reminder: {
        title: 'Upcoming Deadline',
        message: 'You have a deadline approaching. Please ensure all required actions are completed on time.',
      },
      task_assigned: {
        title: 'New Task Assigned',
        message: 'A new task has been assigned to you. Please review the details and take appropriate action.',
      },
      document_shared: {
        title: 'Document Shared',
        message: 'A new document has been shared with you. Please review at your earliest convenience.',
      },
      court_date: {
        title: 'Court Date Scheduled',
        message: 'A court date has been scheduled for your case. Please mark your calendar.',
      },
      motion_filed: {
        title: 'Motion Filed',
        message: 'A motion has been filed in your case. Please review the filing.',
      },
    };
    return messages[type] || messages.case_update;
  }
}
