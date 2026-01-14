import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { DOCUMENT_TEMPLATES } from '../config/templates.config';
import { DocumentTemplate } from '../types';
import { DocumentsApiService } from '@/lib/frontend-api';
import { FileText } from 'lucide-react';

const documentsApi = new DocumentsApiService();

export function useDocumentTemplates() {
  const { data: backendTemplates, isLoading } = useQuery(
    queryKeys.documents.templates(),
    async () => {
      // Try to fetch from backend, fallback to local templates
      try {
        // Note: Backend may not have templates endpoint yet,
        // but we query documents with type filter as workaround
        const docs = await documentsApi.getAll({ type: 'Template' });
        if (docs && docs.length > 0) {
          // Map LegalDocument to DocumentTemplate format
          return docs.map(doc => ({
            name: doc.title,
            category: doc.sourceModule || 'General',
            description: doc.content?.substring(0, 100) || '',
            icon: FileText // Use lucide-react icon component
          })) as DocumentTemplate[];
        }
        return DOCUMENT_TEMPLATES;
      } catch (error) {
        console.warn('Failed to fetch templates from backend, using local templates:', error);
        return DOCUMENT_TEMPLATES;
      }
    },
    { staleTime: 10 * 60 * 1000 } // Cache for 10 minutes
  );

  const templates = (backendTemplates || DOCUMENT_TEMPLATES) as DocumentTemplate[];

  return {
    templates,
    isLoading
  };
}
