
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Database, Settings, Plus, Key, Link as LinkIcon, X, Edit2, Trash2, Table, Code, GitBranch, History, BrainCircuit as Brain, RefreshCw, Save } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Modal } from '../../common/Modal';
import { Input } from '../../common/Inputs';
import { SchemaVisualizer } from './schema/SchemaVisualizer';
import { SchemaCodeEditor } from './schema/SchemaCodeEditor';
import { MigrationHistory } from './schema/MigrationHistory';
import { SchemaSnapshots } from './schema/SchemaSnapshots';
import { Button } from '../../common/Button';

interface SchemaArchitectProps {
  initialTab?: string;
}

export const SchemaArchitect: React.FC<SchemaArchitectProps> = ({ initialTab = 'designer' }) => {
  const { theme, mode } = useTheme();
  
  const mapInitialTabToState = (tab?: string): 'visual' | 'code' | 'history' | 'snapshots' => {
      switch (tab) {
          case 'designer': return 'visual';
          case 'migrations': return 'history';
          case 'snapshots': return 'snapshots';
          default: return 'visual';
      }
  };

  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'history' | 'snapshots'>(mapInitialTabToState(initialTab));
  
  useEffect(() => {
    setActiveTab(mapInitialTabToState(initialTab));
  }, [initialTab]);
  
  const [tables, setTables] = useState([
      { name: 'cases', x: 50, y: 50, columns: [ { name: 'id', type: 'UUID', pk: true, notNull: true, unique: true }, { name: 'title', type: 'VARCHAR(255)', pk: false }, { name: 'status', type: 'case_status', pk: false }, { name: 'client_id', type: 'UUID', fk: 'clients.id' } ] },
      { name: 'documents', x: 450, y: 50, columns: [ { name: 'id', type: 'UUID', pk: true }, { name: 'case_id', type: 'UUID', pk: false, fk: 'cases.id' }, { name: 'content', type: 'TEXT', pk: false } ] },
      { name: 'clients', x: 50, y: 400, columns: [ { name: 'id', type: 'UUID', pk: true }, { name: 'name', type: 'VARCHAR(255)', notNull: true }, { name: 'industry', type: 'VARCHAR(100)'} ]}
  ]);
  
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<{tableName: string, columnName?: string, data: any} | null>(null);

  const dataTypes = ['UUID', 'VARCHAR(255)', 'TEXT', 'INTEGER', 'BIGINT', 'NUMERIC', 'BOOLEAN', 'TIMESTAMP WITH TIME ZONE', 'DATE'];

  const generatedDDL = useMemo(() => tables.map(t => {
      const cols = t.columns.map(c => {
          let colDef = `  ${c.name} ${c.type}`;
          if (c.pk) colDef += ' PRIMARY KEY';
          if (c.notNull) colDef += ' NOT NULL';
          if (c.unique) colDef += ' UNIQUE';
          if (c.fk) colDef += ` REFERENCES ${c.fk.split('.')[0]}(${c.fk.split('.')[1]})`;
          return colDef;
      }).join(',\n');
      const indexes = t.columns.filter(c => (c as any).index && !c.pk).map(c => `CREATE INDEX idx_${t.name}_${c.name} ON ${t.name}(${c.name});`).join('\n');
      return `CREATE TABLE ${t.name} (\n${cols}\n);\n${indexes ? indexes + '\n' : ''}`;
  }).join('\n'), [tables]);
  
  const handleOpenColumnModal = (tableName: string, column?: any) => {
      setEditingColumn({ 
          tableName, 
          columnName: column?.name, 
          data: column ? {...column} : { name: '', type: 'VARCHAR(255)', pk: false, notNull: false, unique: false, index: false } 
      });
      setIsColumnModalOpen(true);
  };
  
  const handleSaveColumn = () => {
    if (!editingColumn || !editingColumn.data.name) return;
    const { tableName, columnName, data } = editingColumn;
    
    setTables(prev => prev.map(t => {
        if (t.name === tableName) {
            const newColumns = [...t.columns];
            const existingIndex = columnName ? newColumns.findIndex(c => c.name === columnName) : -1;
            if (existingIndex > -1) newColumns[existingIndex] = data; // Update
            else newColumns.push(data); // Add
            return { ...t, columns: newColumns };
        }
        return t;
    }));
    setIsColumnModalOpen(false);
    setEditingColumn(null);
  };

  const handleDeleteColumn = (tableName: string, columnName: string) => {
    if (confirm(`Delete column "${columnName}" from table "${tableName}"?`)) {
      setTables(prev => prev.map(t => 
        t.name === tableName ? { ...t, columns: t.columns.filter(c => c.name !== columnName) } : t
      ));
    }
  };

  const handleRenameTable = (oldName: string) => {
    const newName = prompt(`Rename table "${oldName}":`, oldName);
    if (!newName || oldName === newName) return;
    setTables(prev => prev.map(t => t.name === oldName ? { ...t, name: newName } : t));
    setTables(prev => prev.map(t => ({
        ...t,
        columns: t.columns.map(c => c.fk?.startsWith(oldName + '.') ? { ...c, fk: c.fk.replace(oldName, newName) } : c)
    })));
  };
  
  const handleDeleteTable = (tableName: string) => {
      if (confirm(`Are you sure you want to delete the table "${tableName}"? This cannot be undone.`)) {
          setTables(prev => prev.filter(t => t.name !== tableName));
      }
  };

  const handleCreateTable = () => {
    const name = prompt("Enter new table name:");
    if (name) {
        setTables(prev => [...prev, { name, x: 200, y: 200, columns: [{ name: 'id', type: 'UUID', pk: true, notNull: true, unique: true, fk: undefined }] }]);
    }
  };
  
  const handleUpdateTablePos = (tableName: string, pos: {x: number, y: number}) => {
      setTables(prev => prev.map(t => t.name === tableName ? { ...t, x: pos.x, y: pos.y } : t));
  };

  const autoArrange = () => {
    const PADDING = 80;
    const TABLE_WIDTH = 256;
    const TABLE_HEIGHT = 300;
    const containerWidth = 1600; 
    const tablesPerRow = Math.floor(containerWidth / (TABLE_WIDTH + PADDING));
    
    setTables(prev => prev.map((table, index) => {
        const row = Math.floor(index / tablesPerRow);
        const col = index % tablesPerRow;
        return { ...table, x: col * (TABLE_WIDTH + PADDING) + PADDING, y: row * (TABLE_HEIGHT + PADDING) + PADDING };
    }));
  };

  return (
    <div className="flex flex-col h-full min-h-0">
        <div className={cn("p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 shrink-0", theme.surface, theme.border.default)}>
            <div className={cn("flex p-1 rounded-lg border", theme.surfaceHighlight, theme.border.default)}>
                <button onClick={() => setActiveTab('visual')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'visual' ? cn(theme.surface, "shadow", theme.primary.text) : theme.text.secondary)}><Table className="h-3 w-3 mr-2"/> Visual</button>
                <button onClick={() => setActiveTab('code')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'code' ? cn(theme.surface, "shadow", theme.primary.text) : theme.text.secondary)}><Code className="h-3 w-3 mr-2"/> Generate SQL</button>
                <button onClick={() => setActiveTab('history')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'history' ? cn(theme.surface, "shadow", theme.primary.text) : theme.text.secondary)}><GitBranch className="h-3 w-3 mr-2"/> Migrations</button>
                <button onClick={() => setActiveTab('snapshots')} className={cn("px-4 py-1.5 text-xs font-medium rounded-md flex items-center", activeTab === 'snapshots' ? cn(theme.surface, "shadow", theme.primary.text) : theme.text.secondary)}><History className="h-3 w-3 mr-2"/> Snapshots</button>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                {activeTab === 'visual' && <Button variant="secondary" size="sm" icon={Brain} onClick={autoArrange}>Auto-Arrange</Button>}
                <Button variant="outline" size="sm" icon={RefreshCw}>Sync DB</Button>
                <Button variant="primary" size="sm" icon={Save}>Apply to Staging</Button>
            </div>
        </div>

        <div className={cn("flex-1 overflow-hidden relative", theme.background)}>
            {activeTab === 'visual' && <SchemaVisualizer tables={tables} onAddColumn={handleOpenColumnModal} onEditColumn={handleOpenColumnModal} onRemoveColumn={handleDeleteColumn} onCreateTable={handleCreateTable} onRenameTable={handleRenameTable} onDeleteTable={handleDeleteTable} onUpdateTablePos={handleUpdateTablePos} />}
            {activeTab === 'code' && <SchemaCodeEditor ddl={generatedDDL} />}
            {activeTab === 'history' && <MigrationHistory />}
            {activeTab === 'snapshots' && <SchemaSnapshots />}
        </div>

        {/* Column Edit/Add Modal */}
        <Modal isOpen={isColumnModalOpen} onClose={() => setIsColumnModalOpen(false)} title={editingColumn?.columnName ? `Edit Column` : `Add Column to ${editingColumn?.tableName}`}>
            <div className="p-6 space-y-4">
                <Input label="Column Name" value={editingColumn?.data.name || ''} onChange={e => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, name: e.target.value}} : null)} />
                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Data Type</label>
                    <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default)} value={editingColumn?.data.type || ''} onChange={e => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, type: e.target.value}} : null)}>
                        {dataTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                </div>
                <Input label="Foreign Key (optional)" value={editingColumn?.data.fk || ''} onChange={e => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, fk: e.target.value}} : null)} placeholder="e.g. users.id"/>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={editingColumn?.data.notNull || false} onChange={e => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, notNull: e.target.checked}} : null)}/> Not Null</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={editingColumn?.data.unique || false} onChange={e => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, unique: e.target.checked}} : null)}/> Unique</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={editingColumn?.data.pk || false} onChange={e => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, pk: e.target.checked}} : null)}/> Primary Key</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={editingColumn?.data.index || false} onChange={e => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, index: e.target.checked}} : null)}/> Create Index</label>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button variant="secondary" onClick={() => setIsColumnModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveColumn}>Save Column</Button>
                </div>
            </div>
        </Modal>
    </div>
  );
};
