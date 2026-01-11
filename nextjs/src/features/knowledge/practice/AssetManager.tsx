/**
 * @module components/practice/AssetManager
 * @category Practice Management
 * @description IT asset tracking and management with off-thread search.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Edit2, Laptop, Loader2, Monitor, Plus, RefreshCw, Smartphone, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useModalState } from '@/hooks/core';
import { useWorkerSearch } from '@/hooks/useWorkerSearch';
import { useTheme } from '@/providers';
import { getTodayString } from '@/utils/dateUtils';

// Components
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { VirtualList } from '@/components/organisms/VirtualList/VirtualList';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Button } from '@/components/ui/atoms/Button/Button';
import { Input } from '@/components/ui/atoms/Input/Input';
import { ConfirmDialog } from '@/components/ui/molecules/ConfirmDialog/ConfirmDialog';
import { Modal } from '@/components/ui/molecules/Modal/Modal';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { FirmAsset } from '@/types';

// ============================================================================
// COMPONENT
// ============================================================================

export const AssetManager: React.FC = () => {
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const addModal = useModalState();
    const deleteModal = useModalState();
    const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
    const [newAsset, setNewAsset] = useState<Partial<FirmAsset>>({});

    // Enterprise Data Access
    const { data: rawAssets = [], refetch } = useQuery<FirmAsset[]>(
        ['assets', 'all'],
        DataService.assets.getAll
    );

    // Memoize assets to prevent re-creating array on every render
    const assets = useMemo(() => {
        return Array.isArray(rawAssets) ? rawAssets : [];
    }, [rawAssets]);

    const { mutate: addAsset } = useMutation(
        DataService.assets.add,
        {
            invalidateKeys: [['assets', 'all']],
            onSuccess: () => {
                addModal.close();
                setNewAsset({});
            }
        }
    );

    const { mutate: deleteAsset } = useMutation(
        DataService.assets.delete,
        { invalidateKeys: [['assets', 'all']] }
    );

    const handleAddAsset = () => {
        if (!newAsset.name) return;
        const asset: FirmAsset = {
            id: `AST-${new Date().getTime()}`,
            name: newAsset.name,
            type: (newAsset.type as string) || 'Hardware',
            assignedTo: newAsset.assignedTo || 'Unassigned',
            status: (newAsset.status as string) || 'Active',
            purchaseDate: newAsset.purchaseDate || getTodayString(),
            value: Number(newAsset.value) || 0,
            serialNumber: newAsset.serialNumber
        };
        addAsset(asset);
    };

    const handleDelete = (id: string) => {
        setAssetToDelete(id);
        deleteModal.open();
    };

    const confirmDeleteAsset = () => {
        if (assetToDelete) {
            deleteAsset(assetToDelete);
            setAssetToDelete(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Hardware': return <Laptop className="h-4 w-4" />;
            case 'Mobile': return <Smartphone className="h-4 w-4" />;
            default: return <Monitor className="h-4 w-4" />;
        }
    };

    // Off-Main-Thread Search
    const { filteredItems: filteredAssets, isSearching } = useWorkerSearch({
        items: assets,
        query: searchTerm,
        fields: ['name', 'assignedTo', 'serialNumber', 'type']
    });

    // Performance Engine: Virtual Row Renderer
    const renderRow = (asset: FirmAsset) => (
        <div key={asset.id} className={cn("flex items-center border-b hover:bg-slate-50 h-[60px] px-4 transition-colors", theme.border.default)}>
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
                <button title="Edit asset" className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="h-4 w-4" /></button>
                <button title="Delete asset" onClick={() => handleDelete(asset.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
            <div className={cn("flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border shadow-sm shrink-0", theme.surface.default, theme.border.default)}>
                <div>
                    <h3 className={cn("font-bold text-lg", theme.text.primary)}>IT & Asset Management</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Track hardware, software licenses, and office inventory.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={RefreshCw} onClick={() => refetch()}>Refresh</Button>
                    <Button variant="primary" icon={Plus} onClick={addModal.open}>Add Asset</Button>
                </div>
            </div>

            <div className="shrink-0 relative">
                <SearchToolbar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search assets by tag or assignee..."
                />
                {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 className="h-4 w-4 animate-spin text-blue-500" /></div>}
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
                        emptyMessage={isSearching ? "Searching..." : "No assets found."}
                    />
                </div>
            </div>

            <Modal isOpen={addModal.isOpen} onClose={addModal.close} title="Register Asset">
                <div className="p-6 space-y-4">
                    <Input label="Item Name" value={newAsset.name || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAsset({ ...newAsset, name: e.target.value })} placeholder="e.g. MacBook Pro M3" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                            <select
                                title="Select asset type"
                                className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                                value={newAsset.type}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewAsset({ ...newAsset, type: e.target.value as 'Hardware' | 'Software' | 'Mobile' })}
                            >
                                <option value="Hardware">Hardware</option>
                                <option value="Software">Software</option>
                                <option value="Mobile">Mobile</option>
                            </select>
                        </div>
                        <Input label="Serial Number" value={newAsset.serialNumber || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAsset({ ...newAsset, serialNumber: e.target.value })} />
                    </div>
                    <Input label="Assigned To" value={newAsset.assignedTo || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAsset({ ...newAsset, assignedTo: e.target.value })} placeholder="Employee Name" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Purchase Date" type="date" value={newAsset.purchaseDate || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })} />
                        <Input label="Value" type="number" value={newAsset.value || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAsset({ ...newAsset, value: Number(e.target.value) })} />
                    </div>
                    <ConfirmDialog
                        isOpen={deleteModal.isOpen}
                        onClose={deleteModal.close}
                        onConfirm={confirmDeleteAsset}
                        title="Delete Asset"
                        message="Are you sure you want to delete this asset record? This action cannot be undone."
                        variant="danger"
                        confirmText="Delete Asset"
                    />

                    <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                        <Button variant="secondary" onClick={addModal.close}>Cancel</Button>
                        <Button variant="primary" onClick={handleAddAsset}>Save Asset</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
