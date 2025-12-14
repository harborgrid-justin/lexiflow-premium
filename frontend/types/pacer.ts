// types/pacer.ts

/**
 * PACER Case Locator (PCL) API Type Definitions
 * Based on PCL API User Guide (December 2022)
 */

// --- Enums & Appendices ---

export type PacerJurisdictionType = 'ap' | 'bk' | 'cr' | 'cv' | 'mdl';
export type PacerCaseStatus = 'O' | 'C'; // Open or Closed
export type PacerRequestType = 'Batch' | 'Immediate';
export type PacerRequestSource = 'Other' | 'PCL'; 

// Appendix A: Partial list of Court IDs for validation (Extensible)
export type PacerCourtId = 
  | '01ca' | '02ca' | '03ca' | '04ca' | '05ca' | '06ca' | '07ca' | '08ca' | '09ca' | '10ca' | '11ca' | 'cafc' | 'dcca' // Appellate
  | 'almbk' | 'cacbk' | 'debk' | 'nysbk' // Bankruptcy examples
  | 'dcd' | 'nysd' | 'cand' | 'vaed' // District examples
  | string; // Allow string for full coverage

// --- Search Criteria Objects ---

export interface PacerCaseSearchCriteria {
  jurisdictionType?: PacerJurisdictionType;
  caseId?: number;
  caseNumberFull?: string; // Format: o:yy-tp-nnnnn
  caseTitle?: string; // Max 254 chars
  caseOffice?: string; // 1 char
  caseNumber?: string; // 5 digits
  caseType?: string[]; // Max 6 chars per code
  caseYear?: string; // 2 or 4 digits
  courtId?: string[]; // See Appendix A
  
  // Date Ranges (yyyy-MM-dd)
  dateFiledFrom?: string;
  dateFiledTo?: string;
  effectiveDateClosedFrom?: string;
  effectiveDateClosedTo?: string;
  
  // Bankruptcy Specific
  federalBankruptcyChapter?: string[]; // '7', '11', '13', etc.
  dateDismissedFrom?: string;
  dateDismissedTo?: string;
  dateDischargedFrom?: string;
  dateDischargedTo?: string;
  dateReopenedFrom?: string; // Page 54
  dateReopenedTo?: string;   // Page 54
  
  // Joint Bankruptcy Specific (Page 54)
  dateDismissedJtFrom?: string;
  dateDismissedJtTo?: string;

  // Civil/Appellate
  natureOfSuit?: string[]; // 3 or 4 digits
  
  // JPML
  jpmlNumber?: number;

  // Batch Metadata (Page 29)
  requestType?: PacerRequestType;
  requestSource?: PacerRequestSource;
}

export interface PacerPartySearchCriteria extends PacerCaseSearchCriteria {
  reportId?: string; // User-supplied identifier
  lastName?: string; // Also used for non-person entity
  firstName?: string;
  middleName?: string;
  generation?: string; // e.g. 'Jr', 'III'
  partyType?: string; // 'pty', 'dft', etc.
  role?: string[]; // Court-assigned role codes
  exactNameMatch?: boolean;
  ssn?: string; // Bankruptcy only
  ssn4?: string; // Last 4 digits
  
  // Nested Case Search Object for refinement
  courtCase?: PacerCaseSearchCriteria;
}

// --- Response Objects ---

export interface PacerReceipt {
  transactionDate: string; // ISO Date
  billablePages: number;
  loginId: string;
  clientCode?: string; // Added based on Pg 53
  firmId?: string;     // Added based on Pg 53
  search: string; // Description of search params
  description: string;
  csoId: number;
  reportId?: string;
  searchFee: string;
}

export interface PacerPageInfo {
  number: number; // Current page index (0-based)
  size: number; // Page size (max 54)
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
}

export interface PacerCase {
  // Core Fields
  caseId: number; // Max 2,147,483,647
  caseNumberFull?: string;
  caseTitle: string;
  caseOffice?: string;
  caseNumber?: string;
  caseType?: string;
  caseYear?: number;
  courtId: string;
  jurisdictionType: PacerJurisdictionType;
  
  // Dates
  dateFiled: string;
  effectiveDateClosed?: string;
  dateReopened?: string; // Pg 54
  
  // Bankruptcy Specific
  dateDismissed?: string;
  dateDischarged?: string;
  federalBankruptcyChapter?: string;
  dispositionMethod?: string; // Pg 54
  dispoMethodJt?: string;     // Pg 54 - Joint disposition method
  dateDismissedJt?: string;   // Pg 54
  caseJoint?: string;         // Pg 54 - Single char
  jointBankruptcyFlag?: string; // Implied from sortable fields Pg 55
  jointDischargedDate?: string; // Implied from sortable fields Pg 55
  
  // Civil/Appellate
  natureOfSuit?: string; // Pg 51 - List[String] in criteria, usually single code in result
  
  // JPML / MDL Specific (Pg 51 & 55)
  jpmlNumber?: number;
  mdlCourtId?: string;
  mdlExtension?: string;
  mdlStatus?: string;
  mdlTransfereeDistrict?: string;
  mdlLittype?: string;
  mdlDateReceived?: string;
  mdlDateOrdered?: string;
  mdlTransferee?: string;
  
  // Civil Specific (Pg 55 Sortable Fields)
  civilDateInitiate?: string;
  civilDateDisposition?: string;
  civilDateTerminated?: string;
  civilStatInitiated?: string;
  civilStatDisposition?: string;
  civilStatTerminated?: string;
  civilCtoNumber?: string;
  civilTransferee?: string;

  // System
  caseLink?: string; // CM/ECF URL
  caseStatus?: PacerCaseStatus; // 'O' or 'C' (Pg 54)
}

export interface PacerParty {
  lastName: string;
  firstName?: string;
  middleName?: string;
  generation?: string;
  partyType?: string;
  partyRole?: string;
  
  // Context fields often flattened in Party Search results
  courtId?: string;
  caseId?: number;
  caseNumberFull?: string;
  courtCase?: PacerCase; // Full nested case object
}

// --- API Responses ---

export interface PacerCaseSearchResponse {
  receipt: PacerReceipt | null; // Nullable in Batch Lists (Pg 32)
  pageInfo: PacerPageInfo;
  content: PacerCase[];
}

export interface PacerPartySearchResponse {
  receipt: PacerReceipt | null;
  pageInfo: PacerPageInfo;
  content: PacerParty[];
}

// Batch Report Info (Pg 29)
export interface PacerReportInfo {
  reportId: number;
  status: 'WAITING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startTime?: string;
  endTime?: string;
  recordCount?: number;
  unbilledPageCount?: number;
  downloadFee?: number;
  pages?: number;
  criteria?: PacerCaseSearchCriteria | PacerPartySearchCriteria;
  searchType?: 'COURT_CASE' | 'PARTY';
}