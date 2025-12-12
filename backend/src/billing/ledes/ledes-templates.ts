/**
 * LEDES Templates
 * Standard templates for LEDES file generation and UTBMS codes
 */

/**
 * UTBMS (Uniform Task-Based Management System) Task Codes
 * Standard billing codes used across the legal industry
 */
export const UTBMS_TASK_CODES = {
  // A - Case Assessment, Development and Administration
  A100: 'Case Assessment, Development and Administration',
  A101: 'Fact Investigation/Development',
  A102: 'Experts/Consultants',
  A103: 'Legal Research',
  A104: 'Analysis/Strategy',
  A105: 'Budgeting',

  // B - Business and Corporate Transactions
  B100: 'Business and Corporate Transactions',
  B101: 'Business Organization Formation and Maintenance',
  B102: 'Merger, Acquisitions and Divestitures',
  B103: 'Joint Ventures',
  B104: 'Securities',
  B105: 'Debt Instruments',

  // C - Counseling/Advice/Compliance and Risk Management
  C100: 'Counseling/Advice/Compliance and Risk Management',
  C101: 'Counseling and Advice',
  C102: 'Compliance Program Development and Implementation',
  C103: 'Risk Assessment',
  C104: 'Training',

  // D - Drafting
  D100: 'Drafting',
  D101: 'Agreements/Contracts',
  D102: 'Corporate Documents',
  D103: 'Opinion Letters',
  D104: 'Employee Benefit Plans',
  D105: 'Securities Documents',

  // E - Employment, Labor and ERISA
  E100: 'Employment, Labor and ERISA',
  E101: 'Employment Counseling and Advice',
  E102: 'Employment Litigation',
  E103: 'Labor Relations',
  E104: 'Employee Benefits',
  E105: 'ERISA Litigation',

  // F - File and Practice Management
  F100: 'File and Practice Management',
  F101: 'Client Communications',
  F102: 'File Administration',
  F103: 'Time Recording',

  // G - Government and Regulatory
  G100: 'Government and Regulatory',
  G101: 'Government Counseling and Advice',
  G102: 'Government Investigation/Inquiry',
  G103: 'Rulemaking',
  G104: 'Lobbying',

  // I - Intellectual Property
  I100: 'Intellectual Property',
  I101: 'Patent Prosecution',
  I102: 'Trademark Prosecution',
  I103: 'Copyright Prosecution',
  I104: 'IP Litigation',
  I105: 'IP Licensing',
  I106: 'Trade Secrets',

  // L - Litigation/Legal Procedures
  L100: 'Litigation/Legal Procedures - General',
  L110: 'Pleadings',
  L120: 'Discovery',
  L130: 'Depositions',
  L140: 'Experts/Consultants',
  L150: 'Motion Practice',
  L160: 'Trial Preparation and Attendance',
  L170: 'Post-Trial and Appeals',
  L180: 'Settlement/Disposition',
  L190: 'Other Legal Procedures',

  // R - Real Estate
  R100: 'Real Estate',
  R101: 'Real Estate Transactions',
  R102: 'Real Estate Financing',
  R103: 'Real Estate Leasing',
  R104: 'Real Estate Litigation',
  R105: 'Zoning/Land Use',

  // T - Tax
  T100: 'Tax',
  T101: 'Tax Planning and Advice',
  T102: 'Tax Compliance',
  T103: 'Tax Litigation',
};

/**
 * UTBMS Activity Codes
 */
export const UTBMS_ACTIVITY_CODES = {
  A101: 'Fact Investigation/Development',
  A102: 'Analysis/Strategy',
  A103: 'Pre-filing/Pre-investigation Negotiations',
  A104: 'Document/File Management',

  L110: 'Draft Pleadings/Motions',
  L120: 'Draft Discovery',
  L130: 'Review/Analyze Documents',
  L140: 'Factual Research/Investigation',
  L150: 'Legal Research',
  L160: 'Client Communications',
  L170: 'Opposing Counsel Communications',
  L180: 'Court Appearances',
  L190: 'Depositions',

  B101: 'Document Review/Analysis',
  B102: 'Legal Research',
  B103: 'Draft Documents',
  B104: 'Negotiate',
  B105: 'Client Communication',
};

/**
 * UTBMS Expense Codes
 */
export const UTBMS_EXPENSE_CODES = {
  E101: 'Court Fees',
  E102: 'Process Service',
  E103: 'Deposition Costs',
  E104: 'Expert Fees',
  E105: 'Investigation Costs',
  E106: 'On-Line Research',
  E107: 'Travel',
  E108: 'Courier/Messenger',
  E109: 'Photocopies',
  E110: 'Long Distance Telephone',
  E111: 'Postage',
  E112: 'Filing Fees',
  E113: 'Witness Fees',
  E114: 'Document Production',
  E115: 'Medical Records',
  E116: 'Translation Services',
  E117: 'Mediation Fees',
  E118: 'Arbitration Fees',
  E119: 'Litigation Support',
  E120: 'Other',
};

/**
 * Timekeeper Classifications
 */
export const TIMEKEEPER_CLASSIFICATIONS = {
  PARTNER: 'Partner',
  OF_COUNSEL: 'Of Counsel',
  SENIOR_COUNSEL: 'Senior Counsel',
  ASSOCIATE: 'Associate',
  SENIOR_ASSOCIATE: 'Senior Associate',
  JUNIOR_ASSOCIATE: 'Junior Associate',
  PARALEGAL: 'Paralegal',
  SENIOR_PARALEGAL: 'Senior Paralegal',
  LEGAL_ASSISTANT: 'Legal Assistant',
  LAW_CLERK: 'Law Clerk',
  SUMMER_ASSOCIATE: 'Summer Associate',
  CONTRACT_ATTORNEY: 'Contract Attorney',
};

/**
 * Standard LEDES 1998B Template
 */
export const LEDES_1998B_TEMPLATE = {
  fields: [
    'INVOICE_NUMBER',
    'CLIENT_MATTER_NUMBER',
    'LAW_FIRM_MATTER_NUMBER',
    'INVOICE_DATE',
    'INVOICE_DESCRIPTION',
    'LINE_ITEM_NUMBER',
    'EXP/FEE/INV_ADJ_DATE',
    'EXP/FEE/INV_ADJ_DESCRIPTION',
    'TIMEKEEPER_ID',
    'TIMEKEEPER_NAME',
    'TIMEKEEPER_CLASSIFICATION',
    'HOURS_WORKED',
    'HOURLY_RATE',
    'LINE_ITEM_NUMBER_OF_UNITS',
    'LINE_ITEM_UNIT_COST',
    'LINE_ITEM_ADJUSTMENT_AMOUNT',
    'LINE_ITEM_TOTAL',
    'LINE_ITEM_TASK_CODE',
    'LINE_ITEM_EXPENSE_CODE',
    'LINE_ITEM_ACTIVITY_CODE',
    'LINE_ITEM_ADJUSTMENT_REASON',
    'LAW_FIRM_ID',
    'LINE_ITEM_TAX_AMOUNT',
    'CLIENT_ID',
    'LAW_FIRM_NAME',
    'BILLING_AMOUNT',
  ],
  delimiter: '|',
  dateFormat: 'YYYYMMDD',
  version: '1998B',
};

/**
 * Standard LEDES 2000 Template
 */
export const LEDES_2000_TEMPLATE = {
  ...LEDES_1998B_TEMPLATE,
  fields: [
    ...LEDES_1998B_TEMPLATE.fields,
    'CURRENCY',
    'TAX_AMOUNT',
    'PREVIOUS_BALANCE',
    'PAYMENTS_RECEIVED',
    'CURRENT_AMOUNT_DUE',
    'LAW_FIRM_ADDRESS',
    'CLIENT_NAME',
    'INVOICE_TOTAL_AMOUNT',
    'INVOICE_DUE_DATE',
  ],
  version: '2000',
};

/**
 * E-Billing Platform Formats
 */
export const EBILLING_PLATFORM_FORMATS = {
  COUNSELLINK: {
    name: 'CounselLink',
    format: 'LEDES_1998B',
    delimiter: '|',
    requiresHeader: true,
    maxFileSize: 10485760, // 10MB
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
  },
  TYMETRIX: {
    name: 'Tymetrix 360',
    format: 'LEDES_1998B',
    delimiter: '|',
    requiresHeader: true,
    maxFileSize: 20971520, // 20MB
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    customFields: ['MATTER_STATUS', 'BUDGET_CODE'],
  },
  SERENGETI: {
    name: 'Serengeti Tracker',
    format: 'LEDES_1998B',
    delimiter: '|',
    requiresHeader: true,
    maxFileSize: 10485760, // 10MB
    supportedCurrencies: ['USD'],
  },
  LEGAL_TRACKER: {
    name: 'Legal Tracker',
    format: 'LEDES_1998B',
    delimiter: '|',
    requiresHeader: true,
    maxFileSize: 15728640, // 15MB
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    requiresEncryption: true,
  },
  BRIGHTFLAG: {
    name: 'BrightFlag',
    format: 'LEDES_2000',
    delimiter: '|',
    requiresHeader: true,
    maxFileSize: 20971520, // 20MB
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    supportsAPI: true,
  },
  APPERIO: {
    name: 'Apperio',
    format: 'LEDES_1998B',
    delimiter: '|',
    requiresHeader: true,
    maxFileSize: 10485760, // 10MB
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    supportsAPI: true,
  },
};

/**
 * Common LEDES Field Mappings
 */
export const FIELD_MAPPINGS = {
  invoiceNumber: 'INVOICE_NUMBER',
  clientMatter: 'CLIENT_MATTER_NUMBER',
  firmMatter: 'LAW_FIRM_MATTER_NUMBER',
  invoiceDate: 'INVOICE_DATE',
  lineNumber: 'LINE_ITEM_NUMBER',
  workDate: 'EXP/FEE/INV_ADJ_DATE',
  description: 'EXP/FEE/INV_ADJ_DESCRIPTION',
  timekeeperId: 'TIMEKEEPER_ID',
  timekeeperName: 'TIMEKEEPER_NAME',
  hours: 'HOURS_WORKED',
  rate: 'HOURLY_RATE',
  amount: 'LINE_ITEM_TOTAL',
  taskCode: 'LINE_ITEM_TASK_CODE',
  expenseCode: 'LINE_ITEM_EXPENSE_CODE',
  activityCode: 'LINE_ITEM_ACTIVITY_CODE',
};

/**
 * Sample LEDES Record Templates
 */
export const SAMPLE_TEMPLATES = {
  timeEntry: {
    invoiceNumber: 'INV-2024-001',
    clientMatterNumber: 'CLI-001-MAT-001',
    lawFirmMatterNumber: 'LF-2024-001',
    invoiceDate: '20240131',
    invoiceDescription: 'Legal Services - January 2024',
    lineItemNumber: 1,
    expenseDate: '20240115',
    expenseDescription: 'Review and analysis of discovery documents',
    timeKeeperID: 'ATT001',
    timeKeeperName: 'Smith, John',
    timeKeeperClassification: 'PARTNER',
    hoursWorked: 2.5,
    hourlyRate: 450.00,
    lineItemTotal: 1125.00,
    taskCode: 'L130',
    activityCode: 'L130',
  },
  expense: {
    invoiceNumber: 'INV-2024-001',
    clientMatterNumber: 'CLI-001-MAT-001',
    lawFirmMatterNumber: 'LF-2024-001',
    invoiceDate: '20240131',
    invoiceDescription: 'Legal Services - January 2024',
    lineItemNumber: 2,
    expenseDate: '20240116',
    expenseDescription: 'Court filing fees',
    timeKeeperID: '',
    timeKeeperName: '',
    timeKeeperClassification: '',
    hoursWorked: 0,
    hourlyRate: 0,
    lineItemTotal: 450.00,
    expenseCode: 'E112',
    quantity: 1,
    unitCost: 450.00,
  },
};

/**
 * Validation Rules by Platform
 */
export const PLATFORM_VALIDATION_RULES = {
  COUNSELLINK: {
    maxDescriptionLength: 250,
    maxTimekeeperNameLength: 50,
    requiresTaskCode: true,
    allowsNegativeAmounts: false,
  },
  TYMETRIX: {
    maxDescriptionLength: 500,
    maxTimekeeperNameLength: 75,
    requiresTaskCode: true,
    allowsNegativeAmounts: true, // For adjustments
    requiresBudgetCode: true,
  },
  SERENGETI: {
    maxDescriptionLength: 200,
    maxTimekeeperNameLength: 50,
    requiresTaskCode: false,
    allowsNegativeAmounts: false,
  },
  LEGAL_TRACKER: {
    maxDescriptionLength: 300,
    maxTimekeeperNameLength: 60,
    requiresTaskCode: true,
    allowsNegativeAmounts: true,
    requiresEncryptedTransmission: true,
  },
};

/**
 * Helper function to get task code description
 */
export function getTaskCodeDescription(code: string): string {
  return UTBMS_TASK_CODES[code] || 'Unknown Task Code';
}

/**
 * Helper function to get activity code description
 */
export function getActivityCodeDescription(code: string): string {
  return UTBMS_ACTIVITY_CODES[code] || 'Unknown Activity Code';
}

/**
 * Helper function to get expense code description
 */
export function getExpenseCodeDescription(code: string): string {
  return UTBMS_EXPENSE_CODES[code] || 'Unknown Expense Code';
}

/**
 * Helper function to validate task code
 */
export function isValidTaskCode(code: string): boolean {
  return code in UTBMS_TASK_CODES;
}

/**
 * Helper function to get platform configuration
 */
export function getPlatformConfig(platformName: string): any {
  return EBILLING_PLATFORM_FORMATS[platformName] || null;
}

/**
 * Common date format for LEDES
 */
export function formatLEDESDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Parse LEDES date
 */
export function parseLEDESDate(ledesDate: string): Date | null {
  if (ledesDate.length !== 8) return null;

  const year = parseInt(ledesDate.substring(0, 4), 10);
  const month = parseInt(ledesDate.substring(4, 6), 10) - 1;
  const day = parseInt(ledesDate.substring(6, 8), 10);

  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
}
