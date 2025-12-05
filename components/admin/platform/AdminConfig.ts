
import { Category } from './EntitySidebar';

export const COLUMN_CONFIG: Record<Category, { header: string; key: string; type?: 'badge' | 'currency' | 'date' | 'default' }[]> = {
  users: [
    { header: 'Name', key: 'name' },
    { header: 'Role', key: 'role', type: 'badge' },
    { header: 'Office', key: 'office' }
  ],
  cases: [
    { header: 'Title', key: 'title' },
    { header: 'Client', key: 'client' },
    { header: 'Status', key: 'status', type: 'badge' },
    { header: 'Value', key: 'value', type: 'currency' }
  ],
  clients: [
    { header: 'Name', key: 'name' },
    { header: 'Industry', key: 'industry' },
    { header: 'Status', key: 'status', type: 'badge' }
  ],
  clauses: [
    { header: 'Name', key: 'name' },
    { header: 'Category', key: 'category' },
    { header: 'Risk', key: 'riskRating', type: 'badge' }
  ],
  documents: [
    { header: 'Title', key: 'title' },
    { header: 'Type', key: 'type' },
    { header: 'Date', key: 'uploadDate', type: 'date' }
  ]
};

export const EMPTY_TEMPLATES: any = {
  users: { id: '', name: '', role: 'Associate', office: '' },
  cases: { id: '', title: '', client: '', status: 'Discovery', value: 0 },
  clients: { id: '', name: '', industry: '', status: 'Active', totalBilled: 0 },
  clauses: { id: '', name: '', category: '', riskRating: 'Low', content: '' },
  documents: { id: '', title: '', type: 'General', uploadDate: new Date().toISOString().split('T')[0] },
};
