
import React, { useState, useMemo } from 'react';
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
import { VirtualList } from '../common/VirtualList';

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

  const renderRow = (item: EvidenceItem) => (
      <div 
        key={item.id} 
        onClick={() => onItemClick(item)} 
        className={cn(
            "flex items-center border-b h-[72px] px-6 cursor-pointer hover:bg-slate-50 transition-colors group",
            theme.border.light
        )}
      >
          <div className="w-[15%] font-mono font-medium text-slate-500">{item.id}</div>
          <div className="w-[30%]">
                <div className="flex items-center">
                    <div className={cn("mr-3 p-1.5 rounded border", theme.surfaceHighlight, theme.border.default)}><EvidenceTypeIcon type={item.type}/></div>
                    <div className="min-w-0">
                        <div className={cn("font-medium truncate", theme.text.primary)}>{item.title}</div>
                        <div className={cn("text-xs truncate text-slate-400")}>{item.description}</div>
                    </div>
                </div>
          </div>
          <div className="w-[10%]">
              <span className={cn("text-xs px-2 py-1 rounded border", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
                  {item.type}
              </span>
          </div>
          <div className="w-[15%] text-sm text-slate-600 truncate">{item.custodian}</div>
          <div className="w-[10%] text-sm text-slate-600">{item.collectionDate}</div>
          <div className="w-[10%]">
                <Badge variant={item.admissibility === 'Admissible' ? 'success' : item.admissibility === 'Challenged' ? 'warning' : 'neutral'}>
                    {item.admissibility}
                </Badge>
          </div>
          <div className="w-[10%] flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" className={theme.text.tertiary} icon={CheckSquare} onClick={() => setTaskModalEvidence(item)} title="Create Task" />
                <Button size="sm" variant="ghost" className={theme.primary.text} onClick={() => onItemClick(item)}>Manage</Button>
          </div>
      </div>
  );

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
          <p className={cn("mt-1", theme.text.secondary)}>Master Chain of Custody & Asset Tracking</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                {showFilters ? 'Hide Filters' : 'Filters'}
            </Button>
            <Button variant="primary" icon={Plus} onClick={onIntakeClick}>Log New Item</Button>
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

      <div className={cn("flex-1 border rounded-lg overflow-hidden flex flex-col bg-white", theme.border.default)}>
          <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50", theme.border.default, theme.text.secondary)}>
              <div className="w-[15%]">Evidence ID</div>
              <div className="w-[30%]">Description</div>
              <div className="w-[10%]">Type</div>
              <div className="w-[15%]">Custodian</div>
              <div className="w-[10%]">Date</div>
              <div className="w-[10%]">Status</div>
              <div className="w-[10%] text-right">Action</div>
          </div>
          
          <div className="flex-1 relative">
            <VirtualList 
                items={filteredItems}
                height="100%"
                itemHeight={72}
                renderItem={renderRow}
                emptyMessage="No evidence found matching your criteria."
            />
          </div>
      </div>
    </div>
  );
};
