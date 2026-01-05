
import React, { useState, useTransition } from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Plus, Filter, CheckSquare, Trash2, Edit2 } from 'lucide-react';
import { EvidenceItem } from '../../types.ts';
import { EvidenceFilters } from '../../hooks/useEvidenceVault.ts';
import { TaskCreationModal } from '../common/TaskCreationModal.tsx';
import { EvidenceTypeIcon } from '../common/EvidenceTypeIcon.tsx';
import { FilterPanel } from '../common/FilterPanel.tsx';

interface EvidenceInventoryProps {
  filteredItems: EvidenceItem[];
  filters: EvidenceFilters;
  setFilters: React.Dispatch<React.SetStateAction<EvidenceFilters>>;
  onItemClick: (item: EvidenceItem) => void;
  onIntakeClick: () => void;
  onDelete?: (id: string) => void;
}

export const EvidenceInventory: React.FC<EvidenceInventoryProps> = ({ 
  filteredItems = [], 
  filters, setFilters, onItemClick, onIntakeClick, onDelete 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [taskModalEvidence, setTaskModalEvidence] = useState<EvidenceItem | null>(null);
  
  const [isPending, startTransition] = useTransition();

  const handleToggleFilters = () => {
      startTransition(() => {
          setShowFilters(prev => !prev);
      });
  };

  const handleFilterChange = (key: keyof EvidenceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '', type: '', admissibility: '', caseId: '', custodian: '',
      dateFrom: '', dateTo: '', location: '', tags: '', collectedBy: '', hasBlockchain: false
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {taskModalEvidence && (
        <TaskCreationModal 
            isOpen={true} 
            onClose={() => setTaskModalEvidence(null)} 
            initialTitle={`Audit Evidence: ${taskModalEvidence.title}`}
            relatedModule="Evidence"
            relatedItemId={taskModalEvidence.id}
            relatedItemTitle={taskModalEvidence.title}
        />
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Evidence Vault</h2>
          <p className="text-slate-500 mt-1">Master Index & Chain of Custody Management</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" icon={Filter} onClick={handleToggleFilters}>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button variant="primary" icon={Plus} onClick={onIntakeClick}>Log New Item</Button>
        </div>
      </div>

      <div className={`transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} onClear={clearFilters}>
            <input className="p-2 border rounded text-sm w-full" placeholder="Search Title/Desc" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
            <select className="p-2 border rounded text-sm w-full" value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}>
                <option value="">All Types</option>
                <option value="Physical">Physical</option>
                <option value="Digital">Digital</option>
                <option value="Document">Document</option>
                <option value="Forensic">Forensic</option>
            </select>
            <select className="p-2 border rounded text-sm w-full" value={filters.admissibility} onChange={e => handleFilterChange('admissibility', e.target.value)}>
                <option value="">Any Admissibility</option>
                <option value="Admissible">Admissible</option>
                <option value="Challenged">Challenged</option>
                <option value="Pending">Pending</option>
            </select>
            <input className="p-2 border rounded text-sm w-full" placeholder="Case ID" value={filters.caseId} onChange={e => handleFilterChange('caseId', e.target.value)} />
            <input className="p-2 border rounded text-sm w-full" placeholder="Custodian" value={filters.custodian} onChange={e => handleFilterChange('custodian', e.target.value)} />
            <input type="date" className="p-2 border rounded text-sm w-full" placeholder="Collected From" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} />
            <input type="date" className="p-2 border rounded text-sm w-full" placeholder="Collected To" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} />
            <input className="p-2 border rounded text-sm w-full" placeholder="Storage Location" value={filters.location} onChange={e => handleFilterChange('location', e.target.value)} />
            <input className="p-2 border rounded text-sm w-full" placeholder="Filter by Tag" value={filters.tags} onChange={e => handleFilterChange('tags', e.target.value)} />
            <div className="flex items-center">
                <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" className="mr-2 rounded text-blue-600" checked={filters.hasBlockchain} onChange={e => handleFilterChange('hasBlockchain', e.target.checked)} />
                    Blockchain Verified
                </label>
            </div>
        </FilterPanel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card noPadding className="border-l-4 border-l-blue-500">
            <div className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Filtered Items</p>
                <p className="text-2xl font-bold text-slate-900">{filteredItems.length}</p>
            </div>
        </Card>
        <Card noPadding className="border-l-4 border-l-amber-500">
            <div className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Challenged (Visible)</p>
                <p className="text-2xl font-bold text-slate-900">{filteredItems.filter(e => e.admissibility === 'Challenged').length}</p>
            </div>
        </Card>
        <Card noPadding className="border-l-4 border-l-green-500">
            <div className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Secure Storage</p>
                <p className="text-2xl font-bold text-slate-900">100%</p>
            </div>
        </Card>
        <Card noPadding className="border-l-4 border-l-purple-500">
            <div className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Digital Assets</p>
                <p className="text-2xl font-bold text-slate-900">{filteredItems.filter(e => e.type === 'Digital').length}</p>
            </div>
        </Card>
      </div>

      <TableContainer>
          <TableHeader>
              <TableHead>Evidence ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Custodian</TableHead>
              <TableHead>Collection Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
          </TableHeader>
          <TableBody>
            {filteredItems.map(item => (
                <TableRow key={item.id} onClick={() => onItemClick(item)} className="cursor-pointer group">
                    <TableCell className="font-mono font-medium text-slate-600">{item.id}</TableCell>
                    <TableCell>
                        <div className="flex items-center">
                            <div className="mr-3 p-1.5 bg-slate-100 rounded border border-slate-200"><EvidenceTypeIcon type={item.type}/></div>
                            <div>
                                <div className="font-medium text-slate-900">{item.title}</div>
                                <div className="text-xs text-slate-500 truncate max-w-xs">{item.description}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell><span className="text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">{item.type}</span></TableCell>
                    <TableCell>{item.custodian}</TableCell>
                    <TableCell>{item.collectionDate}</TableCell>
                    <TableCell>
                        <Badge variant={item.admissibility === 'Admissible' ? 'success' : item.admissibility === 'Challenged' ? 'warning' : 'neutral'}>
                            {item.admissibility}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600" onClick={() => setTaskModalEvidence(item)} title="Create Task"><CheckSquare size={14}/></button>
                            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600" onClick={() => onItemClick(item)} title="Edit / View"><Edit2 size={14}/></button>
                            {onDelete && (
                                <button className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600" onClick={() => onDelete(item.id)} title="Delete"><Trash2 size={14}/></button>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            ))}
            {filteredItems.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">No evidence found matching your filters.</TableCell>
                </TableRow>
            )}
          </TableBody>
      </TableContainer>
    </div>
  );
};
