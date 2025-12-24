import React from 'react';
import { FileText, Users, Calendar, Tag, Hash, Search } from 'lucide-react';
import type { SearchCategory } from './types';

export function getCategoryIcon(category: SearchCategory): React.ReactNode {
  switch (category) {
    case 'cases':
      return <Hash className="h-4 w-4" />;
    case 'documents':
      return <FileText className="h-4 w-4" />;
    case 'people':
      return <Users className="h-4 w-4" />;
    case 'dates':
      return <Calendar className="h-4 w-4" />;
    case 'tags':
      return <Tag className="h-4 w-4" />;
    default:
      return <Search className="h-4 w-4" />;
  }
}

export function sanitizeHtml(html: string): string {
  // Basic XSS protection - only allow <mark> tags for highlighting
  return html.replace(/<(?!\/?mark\b)[^>]*>/gi, '');
}
