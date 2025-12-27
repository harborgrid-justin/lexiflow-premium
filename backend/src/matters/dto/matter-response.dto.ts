import { MatterStatus, MatterType, MatterPriority } from '@matters/entities/matter.entity';

export class MatterResponseDto {
  id!: string;
  matterNumber!: string;
  title!: string;
  description?: string;
  status!: MatterStatus;
  matterType!: MatterType;
  priority!: MatterPriority;
  
  // Client Information
  clientId?: string;
  clientName?: string;
  
  // Assignment
  leadAttorneyId!: string;
  leadAttorneyName!: string;
  originatingAttorneyId?: string;
  originatingAttorneyName?: string;
  
  // Jurisdictional Information
  jurisdiction?: string;
  venue?: string;
  
  // Financial
  billingType?: string;
  hourlyRate?: number;
  flatFee?: number;
  contingencyPercentage?: number;
  retainerAmount?: number;
  estimatedValue?: number;
  budgetAmount?: number;
  
  // Dates
  openedDate!: Date;
  targetCloseDate?: Date;
  closedDate?: Date;
  statute_of_limitations?: Date;
  
  // Practice Area & Tags
  practiceArea?: string;
  tags?: string[];
  
  // Opposing Party
  opposingCounsel?: Record<string, unknown> | null;

  // Risk & Conflict
  conflictCheckCompleted!: boolean;
  conflictCheckDate?: Date;
  conflictCheckNotes?: string;
  officeLocation?: string;

  // Resources
  relatedMatterIds?: string[];
  
  // Notes & Custom Fields
  internalNotes?: string;
  customFields?: Record<string, unknown>;
  
  // Metadata
  createdBy!: string;
  updatedBy?: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<MatterResponseDto>) {
    Object.assign(this, partial);
  }
}

export class MatterListResponseDto {
  matters!: MatterResponseDto[];
  total!: number;
  page!: number;
  pageSize!: number;

  constructor(matters: MatterResponseDto[], total: number, page: number, pageSize: number) {
    this.matters = matters;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
  }
}
