
import React, { useState, useDeferredValue } from 'react';
import { 
  Users, Briefcase, FileText, Book, Building, 
  Plus, Search, Trash2, Edit2, Save, Database
} from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { Modal } from '../common/Modal.tsx';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Badge } from '../common/Badge.tsx';

// Mock Data Imports
import { MOCK_USERS } from '../../data/mockUsers.ts';
import { MOCK_CASES } from '../../data/mockCases.ts';
import { MOCK_CLIENTS } from '../../data/mockClients.ts';
import { MOCK_CLAUSES } from '../../data/mockClauses.ts';
import { MOCK_DOCUMENTS } from '../../data/mockDocuments.ts';

type Category = 'users' | 'cases' | 'clients' | 'clauses' | 'documents';

export const AdminPlatformManager: React.FC = () => {
  // Local state to simulate database
  const [data, setData] = useState({
    users: MOCK_USERS,
    cases: MOCK_CASES,
    clients: MOCK_CLIENTS,
    clauses: MOCK_CLAUSES,
    documents: MOCK_DOCUMENTS,
  });

  const [activeCategory, setActiveCategory] = useState<Category>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);

  const categories = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'cases', label: 'Cases', icon: Briefcase },
    { id: 'clients', label: 'Clients', icon: Building },
    { id: 'clauses', label: 'Clauses', icon: Book },
    { id: 'documents', label: 'Docs', icon: FileText },
  ];

  const getCurrentList = () => {
    const list = data[activeCategory] as any[];
    if (!deferredSearchTerm) return list;
    return list.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(deferredSearchTerm.toLowerCase())
      )
    );
  };

  const handleEdit = (item: any) => {
    setEditingItem({ ...item });
    setIsNewItem(false);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    // Create empty template based on category
    const templates: any = {
      users: { id: `u-${Date.now()}`, name: '', role: 'Associate', office: '' },
      cases: { id: `C-${Date.now()}`, title: '', client: '', status: 'Discovery', value: 0 },
      clients: { id: `cli-${Date.now()}`, name: '', industry: '', status: 'Active', totalBilled: 0 },
      clauses: { id: `cl-${Date.now()}`, name: '', category: '', riskRating: 'Low', content: '' },
      documents: { id: `doc-${Date.now()}`, title: '', type: 'General', uploadDate: new Date().toISOString().split('T')[0] },
    };
    setEditingItem(templates[activeCategory]);
    setIsNewItem(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      setData(prev => ({
        ...prev,
        [activeCategory]: (prev[activeCategory] as any[]).filter(item => item.id !== id)
      }));
    }
  };

  const handleSave = () => {
    if (isNewItem) {
      setData(prev => ({
        ...prev,
        [activeCategory]: [editingItem, ...(prev[activeCategory] as any[])]
      }));
    } else {
      setData(prev => ({
        ...prev,
        [activeCategory]: (prev[activeCategory] as any[]).map(item => item.id === editingItem.id ? editingItem : item)
      }));
    }
    setIsModalOpen(false);
  };

  const renderFormFields = () => {
    if (!editingItem) return null;
    return Object.keys(editingItem).map(key => {
      if (key === 'id' || key === 'parties' || key === 'versions' || key === 'matters') return null; // Skip complex/auto fields
      return (
        <div key={key} className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{key}</label>
          <input
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={editingItem[key]}
            onChange={e => setEditingItem({ ...editingItem, [key]: e.target.value })}
          />
        </div>
      );
    });
  };

  const listItems = getCurrentList();

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isNewItem ? 'Create Record' : 'Edit Record'}>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-1 max-h-[60vh] overflow-y-auto">
            {renderFormFields()}
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t mt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={Save} onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 hidden md:block">
            <h3 className="font-bold text-slate-800 flex items-center text-sm uppercase tracking-wide">
              <Database className="h-4 w-4 mr-2 text-blue-600"/> Data Entities
            </h3>
          </div>
          <nav className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-2 space-x-2 md:space-x-0 md:space-y-1">
            {categories.map(cat => {
              const Icon = cat.icon;
              const count = (data[cat.id as Category] as any[]).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as Category)}
                  className={`flex-shrink-0 w-auto md:w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`h-4 w-4 mr-2 md:mr-3 ${activeCategory === cat.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    {cat.label}
                  </div>
                  <span className="hidden md:inline-block bg-white text-slate-500 px-2 py-0.5 rounded-full text-xs border border-slate-100 shadow-sm">{count}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div className="relative flex-1 md:max-w-xs mr-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder={`Search ${activeCategory}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleCreate} className="whitespace-nowrap">Add New</Button>
          </div>

          <div className="flex-1 overflow-auto p-0 md:p-4">
            <TableContainer>
              <TableHeader>
                <TableHead>ID</TableHead>
                {activeCategory === 'users' && <><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Office</TableHead></>}
                {activeCategory === 'cases' && <><TableHead>Title</TableHead><TableHead>Client</TableHead><TableHead>Status</TableHead><TableHead>Value</TableHead></>}
                {activeCategory === 'clients' && <><TableHead>Name</TableHead><TableHead>Industry</TableHead><TableHead>Status</TableHead></>}
                {activeCategory === 'clauses' && <><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Risk</TableHead></>}
                {activeCategory === 'documents' && <><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead></>}
                <TableHead className="text-right">Actions</TableHead>
              </TableHeader>
              <TableBody>
                {listItems.map((item: any) => (
                <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-slate-500">{item.id}</TableCell>
                    
                    {activeCategory === 'users' && (
                    <>
                        <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                        <TableCell><Badge variant="neutral">{item.role}</Badge></TableCell>
                        <TableCell>{item.office}</TableCell>
                    </>
                    )}

                    {activeCategory === 'cases' && (
                    <>
                        <TableCell className="font-medium text-slate-900 max-w-xs truncate">{item.title}</TableCell>
                        <TableCell>{item.client}</TableCell>
                        <TableCell><Badge variant="info">{item.status}</Badge></TableCell>
                        <TableCell className="font-mono">${item.value?.toLocaleString()}</TableCell>
                    </>
                    )}

                    {activeCategory === 'clients' && (
                    <>
                        <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                        <TableCell>{item.industry}</TableCell>
                        <TableCell><Badge variant={item.status === 'Active' ? 'success' : 'neutral'}>{item.status}</Badge></TableCell>
                    </>
                    )}

                    {activeCategory === 'clauses' && (
                    <>
                        <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell><Badge variant={item.riskRating === 'High' ? 'error' : 'success'}>{item.riskRating}</Badge></TableCell>
                    </>
                    )}

                    {activeCategory === 'documents' && (
                    <>
                        <TableCell className="font-medium text-slate-900 max-w-xs truncate">{item.title}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.uploadDate}</TableCell>
                    </>
                    )}

                    <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="h-4 w-4"/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="h-4 w-4"/></button>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </TableContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
