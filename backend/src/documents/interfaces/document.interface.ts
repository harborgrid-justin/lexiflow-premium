export { DocumentType, DocumentStatus } from '../../common/enums/document.enum';

export interface DocumentMetadata {
  author?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
}
