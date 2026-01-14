import type { LegalDocument } from '@/types/documents';

export type SortField = 'title' | 'type' | 'uploadDate' | 'lastModified' | 'fileSize' | 'status';
export type SortOrder = 'asc' | 'desc';

export const sortDocuments = (
  documents: LegalDocument[],
  sortField: SortField,
  sortOrder: SortOrder
): LegalDocument[] => {
  return [...documents].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortField) {
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'type':
        aVal = a.type.toLowerCase();
        bVal = b.type.toLowerCase();
        break;
      case 'uploadDate':
        aVal = new Date(a.uploadDate).getTime();
        bVal = new Date(b.uploadDate).getTime();
        break;
      case 'lastModified':
        aVal = new Date(a.lastModified).getTime();
        bVal = new Date(b.lastModified).getTime();
        break;
      case 'status':
        aVal = (a.status || '').toLowerCase();
        bVal = (b.status || '').toLowerCase();
        break;
      // Added missing fileSize case for completeness based on type definition, though original code missed it
      case 'fileSize': 
        aVal = a.fileSize || 0;
        bVal = b.fileSize || 0;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};
