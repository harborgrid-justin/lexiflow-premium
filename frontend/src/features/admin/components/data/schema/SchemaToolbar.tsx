
import { Button } from '@/components/ui/atoms/Button';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { BrainCircuit as Brain, Code, GitBranch, History, RefreshCw, Save, Table } from 'lucide-react';
import React from 'react';

interface SchemaToolbarProps {
  activeTab: string;
  setActiveTab: (tab: 'visual' | 'code' | 'history' | 'snapshots') => void;
  onAutoArrange: () => void;
}

/**
 * SchemaToolbar - React 18 optimized with React.memo
 */
export const SchemaToolbar = React.memo<SchemaToolbarProps>(({ activeTab, setActiveTab, onAutoArrange }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 shrink-0", theme.surface.default, theme.border.default)}>
      <div className={cn("flex p-1 rounded-lg border", theme.surface.highlight, theme.border.default)}>
        <button onClick={() => setActiveTab('visual')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'visual' ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.secondary)}><Table className="h-3 w-3 mr-2" /> Visual</button>
        <button onClick={() => setActiveTab('code')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'code' ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.secondary)}><Code className="h-3 w-3 mr-2" /> Generate SQL</button>
        <button onClick={() => setActiveTab('history')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'history' ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.secondary)}><GitBranch className="h-3 w-3 mr-2" /> Migrations</button>
        <button onClick={() => setActiveTab('snapshots')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'snapshots' ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.secondary)}><History className="h-3 w-3 mr-2" /> Snapshots</button>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        {activeTab === 'visual' && <Button variant="secondary" size="sm" icon={Brain} onClick={onAutoArrange}>Auto-Arrange</Button>}
        <Button variant="outline" size="sm" icon={RefreshCw}>Sync DB</Button>
        <Button variant="primary" size="sm" icon={Save}>Apply to Staging</Button>
      </div>
    </div>
  );
});
