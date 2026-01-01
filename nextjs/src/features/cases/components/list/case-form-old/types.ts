import type { Matter, MatterStatus, MatterType, MatterPriority } from '@/types';

export interface MatterFormProps {
  matter?: Matter;
  onSave: (matter: Partial<Matter>) => Promise<void>;
  onCancel: () => void;
}

export interface MatterFormData {
  matterNumber: string;
  title: string;
  description: string;
  matterType: MatterType;
  status: MatterStatus;
  priority: MatterPriority;
  practiceArea: string;
  clientId: string;
  clientName: string;
  clientContact: string;
  leadAttorneyId: string;
  leadAttorneyName: string;
  originatingAttorneyId?: string;
  originatingAttorneyName?: string;
  conflictCheckCompleted: boolean;
  conflictCheckDate?: string;
  conflictCheckNotes: string;
  openedDate: string;
  targetCloseDate?: string;
  closedDate?: string;
  statute_of_limitations?: string;
  billingType: string;
  estimatedValue?: number;
  budgetAmount?: number;
  retainerAmount?: number;
  hourlyRate?: number;
  flatFee?: number;
  contingencyPercentage?: number;
  tags: string[];
  jurisdictions: string[];
  courtName: string;
  judgeAssigned: string;
  opposingCounsel: string[];
  teamMembers: string[];
  customFields: Record<string, unknown>;
}

export interface FormErrors {
  [key: string]: string;
}
