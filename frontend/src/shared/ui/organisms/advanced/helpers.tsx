import { FileText, Users, Calendar, Tag, Hash, Search } from 'lucide-react';
import type { SearchCategory } from './types';
import * as styles from './helpers.styles';

export function getCategoryIcon(category: SearchCategory): React.ReactNode {
  switch (category) {
    case 'cases':
      return <Hash className={styles.categoryIcon} />;
    case 'documents':
      return <FileText className={styles.categoryIcon} />;
    case 'people':
      return <Users className={styles.categoryIcon} />;
    case 'dates':
      return <Calendar className={styles.categoryIcon} />;
    case 'tags':
      return <Tag className={styles.categoryIcon} />;
    default:
      return <Search className={styles.categoryIcon} />;
  }
}

export function sanitizeHtml(html: string): string {
  // Basic XSS protection - only allow <mark> tags for highlighting
  return html.replace(/<(?!\/?mark\b)[^>]*>/gi, '');
}
