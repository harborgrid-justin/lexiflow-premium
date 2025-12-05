
import React, { useState } from 'react';
import { Laptop, Monitor, Smartphone, Plus, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { SearchToolbar } from '../common/SearchToolbar';
import { Modal } from '../common/Modal';
import { Input } from '../common/Inputs';
import { DataService } from '../../services/dataService';
import { FirmAsset } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery, useMutation } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { VirtualList } from '../common/VirtualList';

export const AssetManager: React.FC = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<FirmAsset>>({});

  // Enterprise Data Access
  const { data: assets = [], refetch } = useQuery<FirmAsset[]>(
      ['assets', 'all'],
      DataService.assets.getAll
  );

  const { mutate: addAsset } = useMutation(
      DataService.assets.add,
      {
          onSuccess: () => {
              setIsModalOpen(false);
              setNewAsset({});
              refetch(); // Re-fetch list
          }
      }
  );

  const { mutate: deleteAsset } = useMutation(
      DataService.assets.delete,
      { onSuccess: () => refetch() }
  );

  const handleAddAsset = () => {
      if (!newAsset.name) return;
      const asset: FirmAsset = {
          id: `AST-${Date.now()}`,
          name: newAsset.name,
          type: (newAsset.type as any) || 'Hardware',
          assignedTo: newAsset.assignedTo || 'Unassigned',
          status: (newAsset.status as any) || 'Active',
          purchaseDate: newAsset.purchaseDate || new Date().toISOString().split('T')[0],
          value: Number(newAsset.value) || 0,
          serialNumber: newAsset.serialNumber
      };
      addAsset(asset);
  };

  const handleDelete = (id: string) => {
      if (confirm('Delete this asset record?')) {
          deleteAsset(id);
      }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Hardware': return <Laptop className="h-4 w-4"/>;
      case 'Mobile': return <Smartphone className="h-4 w-4"/>;
      default: return <Monitor className="h-4 w-4"/>;
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Performance Engine: Virtual Row Renderer
  const renderRow = (asset: FirmAsset) => (
    <div key={asset.id} className={cn("flex items-center border-b hover:bg-slate-50 h-[60px] px-4 transition-colors", theme.border.light)}>
        <div className={cn("w-[15%] font-mono text-xs", theme.text.secondary)}>{asset.id}</div>
        <div className={cn("w-[25%] font-medium", theme.text.primary)}>{asset.name}</div>
        <div className="w-[15%]">
            <div className={cn("flex items-center gap-2 text-xs", theme.text.secondary)}>
                {getIcon(asset.type)} {asset.type}
            </div>
        </div>
        <div className="w-[20%] text-sm text-slate-600">{asset.assignedTo}</div>
        <div className={cn("w-[15%] text-xs", theme.text.secondary)}>{asset.purchaseDate}</div>
        <div className="w-[10%]">
            <Badge variant={asset.status === 'Active' ? 'success' : asset.status === 'Subscription' ? 'info' : 'warning'}>
                {asset.status}
            </Badge>
        </div>
        <div className="w-[10%] flex justify-end gap-2">
             <button className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="h-4 w-4"/></button>
             <button onClick={() => handleDelete(asset.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4"/></button>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className={cn("flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border shadow-sm shrink-0", theme.surface, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold text-lg", theme.text.primary)}>IT & Asset Management</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Track hardware, software licenses, and office inventory.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" icon={RefreshCw} onClick={() => refetch()}>Refresh</Button>
            <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Add Asset</Button>
        </div>
      </div>

      <div className="shrink-0">
        <SearchToolbar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search assets by tag or assignee..." 
        />
      </div>

      <div className={cn("flex-1 flex flex-col border rounded-lg overflow-hidden shadow-sm bg-white", theme.border.default)}>
          {/* Header */}
          <div className={cn("flex items-center px-4 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50 shrink-0", theme.border.default, theme.text.secondary)}>
             <div className="w-[15%]">Asset Tag</div>
             <div className="w-[25%]">Item Name</div>
             <div className="w-[15%]">Type</div>
             <div className="w-[20%]">Assigned To</div>
             <div className="w-[15%]">Purchase</div>
             <div className="w-[10%]">Status</div>
             <div className="w-[10%] text-right">Actions</div>
          </div>

          {/* Virtual List */}
          <div className="flex-1 relative">
            <VirtualList 
                items={filteredAssets}
                height="100%"
                itemHeight={60}
                renderItem={renderRow}
                emptyMessage="No assets found."
            />
          </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Asset">
          <div className="p-6 space-y-4">
              <Input label="Item Name" value={newAsset.name || ''} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="e.g. MacBook Pro M3"/>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                      <select 
                        className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default, theme.text.primary)}
                        value={newAsset.type}
                        onChange={e => setNewAsset({...newAsset, type: e.target.value as any})}
                      >
                          <option value="Hardware">Hardware</option>
                          <option value="Software">Software</option>
                          <option value="Mobile">Mobile</option>
                      </select>
                  </div>
                  <Input label="Serial Number" value={newAsset.serialNumber || ''} onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})}/>
              </div>
              <Input label="Assigned To" value={newAsset.assignedTo || ''} onChange={e => setNewAsset({...newAsset, assignedTo: e.target.value})} placeholder="Employee Name"/>
              <div className="grid grid-cols-2 gap-4">
                   <Input label="Purchase Date" type="date" value={newAsset.purchaseDate || ''} onChange={e => setNewAsset({...newAsset, purchaseDate: e.target.value})}/>
                   <Input label="Value" type="number" value={newAsset.value || ''} onChange={e => setNewAsset({...newAsset, value: Number(e.target.value)})}/>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleAddAsset}>Save Asset</Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};
