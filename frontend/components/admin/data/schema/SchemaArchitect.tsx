import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { Modal } from '../../../common/Modal';
import { ConfirmDialog } from '../../../common/ConfirmDialog';
import { AdaptiveLoader } from '../../../common/AdaptiveLoader';
import { useModalState } from '../../../../hooks/useModalState';
import { SchemaCodeEditor } from './SchemaCodeEditor';
import { MigrationHistory } from './MigrationHistory';
import { SchemaSnapshots } from './SchemaSnapshots';
import { SchemaVisualizer } from './SchemaVisualizer';
import { Button } from '../../../common/Button';
import { TableData, TableColumn } from './schemaTypes';
import { SchemaToolbar } from './SchemaToolbar';
import { useQuery } from '../../../../hooks/useQueryHooks';
import { dataPlatformApi } from '../../../../services/api/data-platform-api';
import { Loader2 } from 'lucide-react';
import { Input, TextArea } from '../../../common/Inputs';

interface SchemaArchitectProps {
  initialTab?: string;
}

export const SchemaArchitect: React.FC<SchemaArchitectProps> = ({ initialTab = 'designer' }) => {
  const { theme } = useTheme();
  
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
  
  // Use real backend API for schema tables
  const { data: fetchedTables = [], isLoading } = useQuery(
      ['schema', 'tables'],
      () => dataPlatformApi.schemaManagement.getTables()
  );
  
  const [tables, setTables] = useState<TableData[]>([]);

  useEffect(() => {
      if (fetchedTables.length > 0) {
          setTables(fetchedTables as TableData[]);
      }
  }, [fetchedTables]);
  
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<{tableName: string, columnName?: string, data: any} | null>(null);
  const deleteColumnModal = useModalState();
  const deleteTableModal = useModalState();
  const [deleteColumnData, setDeleteColumnData] = useState<{tableName: string, columnName: string} | null>(null);
  const [deleteTableName, setDeleteTableName] = useState<string | null>(null);

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
  
  const handleOpenColumnModal = (tableName: string, column?: TableColumn) => {
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
            if (existingIndex > -1) newColumns[existingIndex] = data as TableColumn; // Update
            else newColumns.push(data as TableColumn); // Add
            return { ...t, columns: newColumns };
        }
        return t;
    }));
    setIsColumnModalOpen(false);
    setEditingColumn(null);
  };

  const handleDeleteColumn = (tableName: string, columnName: string) => {
    setDeleteColumnData({ tableName, columnName });
    deleteColumnModal.open();
  };

  const confirmDeleteColumn = () => {
    if (deleteColumnData) {
      setTables(prev => prev.map(t => 
        t.name === deleteColumnData.tableName ? { ...t, columns: t.columns.filter(c => c.name !== deleteColumnData.columnName) } : t
      ));
      setDeleteColumnData(null);
    }
  };

  const handleRenameTable = (oldName: string) => {
    const newName = prompt(`Rename table "${oldName}":`, oldName);
    if (!newName || oldName === newName) return;
    setTables(prev => prev.map(t => t.name === oldName ? { ...t, name: newName } : t));
    setTables(prev => prev.map(t => ({
        ...t,
        columns: t.columns.map(c => (c.fk && c.fk.startsWith(oldName + '.')) ? { ...c, fk: c.fk.replace(oldName, newName) } : c)
    })));
  };
  
  const handleDeleteTable = (tableName: string) => {
      setDeleteTableName(tableName);
      deleteTableModal.open();
  };

  const confirmDeleteTable = () => {
      if (deleteTableName) {
          setTables(prev => prev.filter(t => t.name !== deleteTableName));
          setDeleteTableName(null);
      }
  };

  const handleCreateTable = () => {
    const name = prompt("Enter new table name:");
    if (name) {
        setTables(prev => [...prev, { name, x: 200, y: 200, columns: [{ name: 'id', type: 'UUID', pk: true, notNull: true, unique: true }] }]);
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

  if (isLoading) return <AdaptiveLoader contentType="dashboard" shimmer />;

  return (
    <div className="flex flex-col h-full min-h-0">
        <SchemaToolbar activeTab={activeTab} setActiveTab={setActiveTab} onAutoArrange={autoArrange} />

        <div className={cn("flex-1 overflow-hidden relative", theme.background)}>
            {activeTab === 'visual' && <SchemaVisualizer tables={tables} onAddColumn={handleOpenColumnModal} onEditColumn={handleOpenColumnModal} onRemoveColumn={handleDeleteColumn} onCreateTable={handleCreateTable} onRenameTable={handleRenameTable} onDeleteTable={handleDeleteTable} onUpdateTablePos={handleUpdateTablePos} />}
            {activeTab === 'code' && <SchemaCodeEditor ddl={generatedDDL} />}
            {activeTab === 'history' && <MigrationHistory />}
            {activeTab === 'snapshots' && <SchemaSnapshots />}
        </div>

        <Modal isOpen={isColumnModalOpen} onClose={() => setIsColumnModalOpen(false)} title={editingColumn?.columnName ? `Edit Column` : `Add Column to ${editingColumn?.tableName}`}>
            <div className="p-6 space-y-4">
                <Input label="Column Name" value={editingColumn?.data.name || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, name: e.target.value}} : null)} />
                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Data Type</label>
                    <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)} value={editingColumn?.data.type || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, type: e.target.value}} : null)}>
                        {dataTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                </div>
                <Input label="Foreign Key (optional)" value={editingColumn?.data.fk || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, fk: e.target.value}} : null)} placeholder="e.g. users.id"/>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={editingColumn?.data.notNull || false} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, notNull: e.target.checked}} : null)}/> Not Null</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={editingColumn?.data.unique || false} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, unique: e.target.checked}} : null)}/> Unique</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={editingColumn?.data.pk || false} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, pk: e.target.checked}} : null)}/> Primary Key</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={editingColumn?.data.index || false} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingColumn(prev => prev ? {...prev, data: {...prev.data, index: e.target.checked}} : null)}/> Create Index</label>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button variant="secondary" onClick={() => setIsColumnModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveColumn}>Save Column</Button>
                </div>
            </div>
        </Modal>

        <ConfirmDialog
          isOpen={deleteColumnModal.isOpen}
          onClose={deleteColumnModal.close}
          onConfirm={confirmDeleteColumn}
          title="Delete Column"
          message={`Delete column "${deleteColumnData?.columnName}" from table "${deleteColumnData?.tableName}"? This action cannot be undone.`}
          confirmText="Delete Column"
          variant="danger"
        />

        <ConfirmDialog
          isOpen={deleteTableModal.isOpen}
          onClose={deleteTableModal.close}
          onConfirm={confirmDeleteTable}
          title="Delete Table"
          message={`Are you sure you want to delete the table "${deleteTableName}"? This cannot be undone and will affect any related data.`}
          confirmText="Delete Table"
          variant="danger"
        />
    </div>
  );
};

export default SchemaArchitect;