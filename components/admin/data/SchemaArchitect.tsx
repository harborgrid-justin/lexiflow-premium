
import React, { useState } from 'react';
import { Code, Save, Table, GitBranch, RefreshCw } from 'lucide-react';
import { Button } from '../../common/Button';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Modal } from '../../common/Modal';
import { Input } from '../../common/Inputs';
import { SchemaVisualizer } from './schema/SchemaVisualizer';
import { SchemaCodeEditor } from './schema/SchemaCodeEditor';

export const SchemaArchitect: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'history'>('visual');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tables, setTables] = useState([
      { name: 'cases', columns: [ { name: 'id', type: 'UUID', pk: true }, { name: 'title', type: 'VARCHAR(255)', pk: false }, { name: 'status', type: 'VARCHAR(50)', pk: false } ] },
      { name: 'documents', columns: [ { name: 'id', type: 'UUID', pk: true }, { name: 'case_id', type: 'UUID', pk: false, fk: 'cases.id' }, { name: 'content', type: 'TEXT', pk: false } ] }
  ]);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'VARCHAR(255)' });

  const generatedDDL = tables.map(t => {
      const cols = t.columns.map(c => `  ${c.name} ${c.type}${c.pk ? ' PRIMARY KEY' : ''}${c.fk ? ` REFERENCES ${c.fk.split('.')[0]}(${c.fk.split('.')[1]})` : ''}`).join(',\n');
      return `CREATE TABLE ${t.name} (\n${cols}\n);`;
  }).join('\n\n');

  const handleAddColumn = () => {
      if(selectedTable && newColumn.name) {
          setTables(prev => prev.map(t => t.name === selectedTable ? { ...t, columns: [...t.columns, { name: newColumn.name, type: newColumn.type, pk: false }] } : t));
          setIsAddColumnModalOpen(false);
          setNewColumn({ name: '', type: 'VARCHAR(255)' });
      }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
        <div className={cn("p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 shrink-0", theme.surface, theme.border.default)}>
            <div className={cn("flex p-1 rounded-lg border", theme.surfaceHighlight, theme.border.default)}>
                <button onClick={() => setActiveTab('visual')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'visual' ? cn(theme.surface, "shadow", theme.primary.text) : theme.text.secondary)}><Table className="h-3 w-3 mr-2"/> Visual</button>
                <button onClick={() => setActiveTab('code')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'code' ? cn(theme.surface, "shadow", theme.primary.text) : theme.text.secondary)}><Code className="h-3 w-3 mr-2"/> Code</button>
                <button onClick={() => setActiveTab('history')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'history' ? cn(theme.surface, "shadow", theme.primary.text) : theme.text.secondary)}><GitBranch className="h-3 w-3 mr-2"/> Migrations</button>
            </div>
            <div className="flex gap-2 w-full md:w-auto"><Button variant="outline" size="sm" icon={RefreshCw}>Sync DB</Button><Button variant="primary" size="sm" icon={Save}>Apply</Button></div>
        </div>

        <div className={cn("flex-1 overflow-hidden relative", theme.background)}>
            {activeTab === 'visual' && <SchemaVisualizer tables={tables} onAddColumn={(t) => { setSelectedTable(t); setIsAddColumnModalOpen(true); }} onRemoveColumn={(t, c) => setTables(prev => prev.map(tbl => tbl.name === t ? { ...tbl, columns: tbl.columns.filter(col => col.name !== c) } : tbl))} onCreateTable={() => alert("Create Table")} />}
            {activeTab === 'code' && <SchemaCodeEditor ddl={generatedDDL} />}
            {activeTab === 'history' && <div className="p-6 text-center text-sm text-slate-400">No history available</div>}
        </div>

        <Modal isOpen={isAddColumnModalOpen} onClose={() => setIsAddColumnModalOpen(false)} title={`Add Column to ${selectedTable}`}>
            <div className="p-6 space-y-4">
                <Input label="Column Name" value={newColumn.name} onChange={e => setNewColumn({...newColumn, name: e.target.value})} placeholder="e.g. created_at"/>
                <Button variant="primary" onClick={handleAddColumn}>Add Column</Button>
            </div>
        </Modal>
    </div>
  );
};
