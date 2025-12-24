/**
 * CaseArgumentManager.tsx
 * 
 * Legal argument construction and management with search, filtering,
 * and evidence linking capabilities.
 * 
 * @module components/case-detail/CaseArgumentManager
 * @category Case Management - Arguments & Evidence
 */

// External Dependencies
import React, { useState } from 'react';
import { Target, Plus, Filter } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '../../common/Button';
import { ArgumentList } from './arguments/ArgumentList';
import { ArgumentDetail } from './arguments/ArgumentDetail';
import { SearchToolbar } from '../../common/SearchToolbar';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../providers/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { Case, LegalArgument, EvidenceItem } from '../../../types';

interface CaseArgumentManagerProps {
  caseData: Case;
  evidence: EvidenceItem[];
}

export const CaseArgumentManager: React.FC<CaseArgumentManagerProps> = ({ caseData, evidence }) => {
  const { theme } = useTheme();
  const [activeArgumentId, setActiveArgumentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Initialize from caseData (which is populated via DataService in parent)
  const [argumentsList, setArgumentsList] = useState<LegalArgument[]>(caseData.arguments || []);

  const filteredArguments = argumentsList.filter(arg => {
    const matchesSearch = arg.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || arg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeArgument = argumentsList.find(a => a.id === activeArgumentId) || null;

  const handleAddArgument = () => {
    const newArg: LegalArgument = {
      id: `arg-${Date.now()}`,
      title: 'New Legal Argument',
      description: 'Describe the legal basis...',
      strength: 50,
      status: 'Draft',
      relatedCitationIds: [],
      relatedEvidenceIds: []
    };
    setArgumentsList([newArg, ...argumentsList]);
    setActiveArgumentId(newArg.id);
  };

  const handleUpdateArgument = (updatedArg: LegalArgument) => {
    setArgumentsList(argumentsList.map(a => a.id === updatedArg.id ? updatedArg : a));
  };

  const handleDeleteArgument = (id: string) => {
    setArgumentsList(argumentsList.filter(a => a.id !== id));
    if (activeArgumentId === id) setActiveArgumentId(null);
  };

  return (
    <div className={cn("flex flex-col h-full rounded-lg shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
      {/* Header Toolbar */}
      <div className={cn("p-4 border-b flex justify-between items-center gap-4", theme.surface.highlight, theme.border.default)}>
        <div className="flex items-center gap-4 flex-1">
            <div className={cn("p-2 rounded-lg border", theme.surface.highlight, theme.text.link, theme.border.default)}>
                <Target className="h-5 w-5"/>
            </div>
            <div>
                <h3 className={cn("font-bold text-lg whitespace-nowrap", theme.text.primary)}>Argument Builder</h3>
                <p className={cn("text-xs hidden md:block", theme.text.secondary)}>Construct and strengthen core case theories.</p>
            </div>
            <div className={cn("h-8 w-px mx-2 hidden md:block", theme.border.default)}></div>
            <SearchToolbar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Search arguments..." 
                className="w-full max-w-md border-none shadow-none p-0 bg-transparent hidden md:flex"
            />
        </div>
        <div className="flex gap-2">
            <div className={cn("hidden md:flex items-center border rounded-lg px-3", theme.surface.default, theme.border.default)}>
                <Filter className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
                <select 
                    className={cn("text-sm bg-transparent outline-none py-1.5", theme.text.primary)}
                    value={filterStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                    aria-label="Filter arguments by status"
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Dismissed">Dismissed</option>
                </select>
            </div>
            <Button variant="primary" icon={Plus} onClick={handleAddArgument}>New Argument</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left List */}
        <div className={cn("flex-1 flex flex-col overflow-hidden", activeArgumentId ? "hidden lg:flex lg:w-1/2 border-r" : "w-full", theme.border.default)}>
             <ArgumentList 
                argumentsList={filteredArguments} 
                selectedId={activeArgumentId} 
                onSelect={setActiveArgumentId}
             />
        </div>

        {/* Right Inspector */}
        {activeArgumentId && activeArgument && (
            <div className={cn("flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200", theme.surface.default)}>
                <ArgumentDetail 
                    argument={activeArgument} 
                    onUpdate={handleUpdateArgument}
                    onDelete={handleDeleteArgument}
                    onClose={() => setActiveArgumentId(null)}
                    allEvidence={evidence}
                    allCitations={caseData.citations || []}
                />
            </div>
        )}
        
        {!activeArgumentId && (
            <div className={cn("hidden lg:flex flex-1 items-center justify-center", theme.surface.highlight, theme.text.tertiary)}>
                <div className="text-center">
                    <Target className="h-16 w-16 mx-auto mb-4 opacity-20"/>
                    <h3 className="text-lg font-medium">Select an argument to refine</h3>
                    <p className="text-sm max-w-xs mx-auto mt-2 opacity-70">Link evidence, citations, and use AI to stress-test your legal theory.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
