import type { CaseId } from '@/types/primitives';

export interface DocumentUploaderProps {
  caseId?: CaseId;
  onUpload: (files: File[], metadata: UploadMetadata) => Promise<void>;
  onCancel?: () => void;
  multiple?: boolean;
  acceptedTypes?: string[];
}

export interface UploadMetadata {
  caseId?: CaseId;
  type: string;
  tags: string[];
  description?: string;
  status: string;
}
