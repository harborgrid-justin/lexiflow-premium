
import { Folder, Clock, Star, LayoutTemplate, FileSignature, Eraser, Cpu } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

export type DocView = 'browse' | 'recent' | 'favorites' | 'templates' | 'drafts' | 'pending' | 'shared' | 'editor' | 'redaction' | 'signing' | 'batch';

export const DOCUMENT_MANAGER_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'files', label: 'Files', icon: Folder,
    subTabs: [
      { id: 'browse', label: 'Browse', icon: Folder },
      { id: 'recent', label: 'Recent', icon: Clock },
      { id: 'favorites', label: 'Favorites', icon: Star },
    ]
  },
  {
    id: 'drafting', label: 'Drafting', icon: LayoutTemplate,
    subTabs: [
      { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    ]
  },
  {
    id: 'tools', label: 'Tools', icon: Cpu,
    subTabs: [
      { id: 'signing', label: 'eSignature', icon: FileSignature },
      { id: 'redaction', label: 'Redaction', icon: Eraser },
      { id: 'batch', label: 'Batch Ops', icon: Cpu },
    ]
  }
];
