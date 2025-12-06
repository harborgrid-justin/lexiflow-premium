import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Plus, Filter, CheckSquare } from 'lucide-react';
import { EvidenceItem } from '../../types';
import { EvidenceFilters } from '../../hooks/useEvidenceVault';
import { TaskCreationModal } from '../common/TaskCreationModal';
import { EvidenceTypeIcon } from '../common/EvidenceTypeIcon';
import { FilterPanel } from '../common/FilterPanel';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';

interface EvidenceInventoryProps {
  items: EvidenceItem[];
  filteredItems: EvidenceItem[];
  filters: EvidenceFilters;
  setFilters: React.Dispatch<React.SetStateAction<EvidenceFilters>>;
  onItemClick: (item: EvidenceItem) => void;
  onIntakeClick: () => void;
}

export const EvidenceInventory: React.FC<EvidenceInventoryProps> = ({ 
  items, filteredItems, filters, setFilters, onItemClick, onIntakeClick 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [taskModalEvidence, setTaskModalEvidence] = useState<EvidenceItem | null>(null);
  const { theme } = useTheme();
  
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
    <div className="space-y-4 h-full flex flex-col">
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

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-2 shrink-0">
        <div>
          <h2 className={cn("text-2xl font-bold tracking-tight", theme.text.primary)}>Inventory Index</h2>
          <p className={cn("mt-1 text-sm", theme.text.secondary)}>Master Chain of Custody & Asset Tracking</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <Button variant="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)} className="w-full md:w-auto justify-center">
                {showFilters ? 'Hide Filters' : 'Filters'}
            </Button>
            <Button variant="primary" icon={Plus} onClick={onIntakeClick} className="w-full md:w-auto justify-center">Log New Item</Button>
        </div>
      </div>

      <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} onClear={clearFilters}>
          <input className={cn("p-2 border rounded text-sm w-full outline-none", theme.border.default, theme.surface)} placeholder="Search..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
          <select className={cn("p-2 border rounded text-sm w-full outline-none", theme.border.default, theme.surface)} value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}>
              <option value="">All Types</option>
              <option value="Physical">Physical</option>
              <option value="Digital">Digital</option>
              <option value="Document">Document</option>
          </select>
          <input className={cn("p-2 border rounded text-sm w-full outline-none", theme.border.default, theme.surface)} placeholder="Case ID" value={filters.caseId} onChange={e => handleFilterChange('caseId', e.target.value)} />
          <input className={cn("p-2 border rounded text-sm w-full outline-none", theme.border.default, theme.surface)} placeholder="Custodian" value={filters.custodian} onChange={e => handleFilterChange('custodian', e.target.value)} />
          <label className={cn("flex items-center text-sm cursor-pointer", theme.text.primary)}>
              <input type="checkbox" className="mr-2 rounded text-blue-600" checked={filters.hasBlockchain} onChange={e => handleFilterChange('hasBlockchain', e.target.checked)} />
              Blockchain Verified
          </label>
      </FilterPanel>

      <TableContainer responsive="card" className="flex-1 min-h-0">
        <TableHeader>
          <TableHead>Evidence ID</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Custodian</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
                <TableCell colSpan={7} className="text-center py-12 italic text-slate-500">
                    No evidence found matching your criteria.
                </TableCell>
            </TableRow>
          ) : (
            filteredItems.map(item => (
                <TableRow key={item.id} onClick={() => onItemClick(item)}>
                    <TableCell className={cn("font-mono", theme.text.secondary)}>{item.id}</TableCell>
                    <TableCell>
                        <div className="flex items-center">
                            <div className={cn("mr-3 p-1.5 rounded border self-start md:self-center", theme.surfaceHighlight, theme.border.default)}><EvidenceTypeIcon type={item.type}/></div>
                            <div className="min-w-0">
                                <div className={cn("font-medium", theme.text.primary)}>{item.title}</div>
                                <div className={cn("text-xs text-slate-400 md:truncate")}>{item.description}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.custodian}</TableCell>
                    <TableCell>{item.collectionDate}</TableCell>
                    <TableCell>
                        <Badge variant={item.admissibility === 'Admissible' ? 'success' : item.admissibility === 'Challenged' ? 'warning' : 'neutral'}>
                            {item.admissibility}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" className={theme.text.tertiary} icon={CheckSquare} onClick={() => setTaskModalEvidence(item)} title="Create Task" />
                            <Button size="sm" variant="ghost" className={theme.primary.text} onClick={() => onItemClick(item)}>Manage</Button>
                        </div>
                    </TableCell>
                </TableRow>
            ))
          )}
        </TableBody>
      </TableContainer>
    </div>
  );
};