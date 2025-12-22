


/**
 * @module EvidenceDetail
 * @category Evidence
 * @description Detailed view for a single evidence item.
 * Orchestrates sub-views (Overview, Admissibility, Chain of Custody, Forensics) via tabs.
 */

import React from 'react';
import { ArrowLeft, FileSearch, Lock, ExternalLink, Stamp } from 'lucide-react';

// Common Components
import { Button } from '../common/Button';
import { Tabs } from '../common/Tabs';

// Sub-components
import { EvidenceOverview } from './EvidenceOverview';
import { EvidenceAdmissibility } from './EvidenceAdmissibility';
import { EvidenceStructure } from './EvidenceStructure';
import { EvidenceForensics } from './EvidenceForensics';
import { EvidenceChainOfCustody } from './EvidenceChainOfCustody';

// Context & Utils
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useNotify } from '../../hooks/useNotify';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

// Services & Types
import { DataService } from '../../services/data/dataService';
import { useMutation, queryClient } from '../../hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { EvidenceItem, ChainOfCustodyEvent, TrialExhibit } from '../../types';

interface EvidenceDetailProps {
  selectedItem: EvidenceItem;
  handleBack: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onNavigateToCase?: (caseId: string) => void;
  onCustodyUpdate?: (event: ChainOfCustodyEvent) => void;
}

export const EvidenceDetail: React.FC<EvidenceDetailProps> = ({ 
  selectedItem, handleBack, activeTab, setActiveTab, onNavigateToCase, onCustodyUpdate 
}) => {
  const { theme } = useTheme();
  const notify = useNotify();
  
  // Keyboard shortcuts for evidence detail operations
  useKeyboardShortcuts([
    {
      key: 'l',
      ctrlOrCmd: true,
      action: () => setActiveTab('custody'),
      description: 'Log custody transfer'
    },
    {
      key: 'v',
      ctrlOrCmd: true,
      action: () => setActiveTab('forensics'),
      description: 'View forensics'
    },
    {
      key: 'o',
      ctrlOrCmd: true,
      action: () => setActiveTab('overview'),
      description: 'View overview'
    },
    {
      key: 'Escape',
      action: handleBack,
      description: 'Go back to inventory'
    }
  ]);

  const { mutate: promoteToExhibit, isLoading: isPromoting } = useMutation(
      async () => {
          // 1. Create Exhibit
          const exhibit: TrialExhibit = {
              id: `ex-${Date.now()}` as any,
              caseId: selectedItem.caseId,
              exhibitNumber: `PX-${Date.now().toString().slice(-3)}`, // Auto-gen number
              title: selectedItem.title,
              description: selectedItem.description,
              fileType: selectedItem.fileType || 'PDF',
              party: 'Plaintiff', // Default, user would edit later
              status: 'Marked',
              dateMarked: new Date().toISOString().split('T')[0],
              tags: selectedItem.tags,
              uploadedBy: 'Current User'
          };
          await DataService.exhibits.add(exhibit);
          
          // 2. Update Evidence Status
          const updatedEvidence = { ...selectedItem, admissibility: 'Admissible' as const };
          await DataService.evidence.update(selectedItem.id, updatedEvidence);
          
          return exhibit;
      },
      {
          invalidateKeys: [['evidence', 'all'], ['exhibits', 'all']],
          onSuccess: (exhibit) => {
              notify.success(`Evidence promoted to Exhibit ${exhibit.exhibitNumber}. Admissibility updated.`);
          }
      }
  );

  return (
    <div className="h-full flex flex-col space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex items-center gap-4">
          <button title="Go back" onClick={handleBack} className={cn("p-2 rounded-full transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`)}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className={cn("text-2xl font-bold", theme.text.primary)}>{selectedItem.title}</h1>
              <span className={cn("font-mono text-sm px-2 py-0.5 rounded border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>{selectedItem.id}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className={cn("text-sm", theme.text.secondary)}>Associated Case: <span className={cn("font-medium", theme.primary.text)}>{selectedItem.caseId}</span></p>
              {onNavigateToCase && (
                <button 
                  onClick={() => onNavigateToCase(selectedItem.caseId)}
                  className={cn("text-xs flex items-center px-2 py-0.5 rounded hover:underline", theme.primary.text, theme.primary.light)}
                >
                  <ExternalLink className="h-3 w-3 mr-1"/> View Case
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            icon={Stamp} 
            onClick={() => promoteToExhibit(undefined)}
            disabled={isPromoting || selectedItem.admissibility === 'Admissible'}
          >
              {selectedItem.admissibility === 'Admissible' ? 'Marked as Exhibit' : 'Promote to Exhibit'}
          </Button>
          <Button variant="outline" icon={FileSearch}>Generate Report</Button>
          <Button variant="primary" icon={Lock} onClick={() => setActiveTab('custody')}>Log Transfer</Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div>
        <Tabs 
            tabs={['overview', 'structure', 'custody', 'admissibility', 'forensics']}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-8">
        {activeTab === 'overview' && <EvidenceOverview selectedItem={selectedItem} />}
        {activeTab === 'structure' && <EvidenceStructure selectedItem={selectedItem} />}
        {activeTab === 'custody' && <EvidenceChainOfCustody selectedItem={selectedItem} onCustodyUpdate={onCustodyUpdate} />}
        {activeTab === 'admissibility' && <EvidenceAdmissibility selectedItem={selectedItem} />}
        {activeTab === 'forensics' && <EvidenceForensics selectedItem={selectedItem} />}
      </div>
    </div>
  );
};

