
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '../../common/Button';
import { RecordModal } from './RecordModal';
import { EntitySidebar, Category } from './EntitySidebar';
import { EntityList } from './EntityList';
import { TableContainer } from '../../common/Table';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useAdminData } from './useAdminData';
import { EMPTY_TEMPLATES } from './AdminConfig';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { useModalState } from '../../../hooks/useModalState';

export const AdminPlatformManager: React.FC = () => {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<Category>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<unknown>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const deleteModal = useModalState();
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const { items, counts, saveItem, deleteItem } = useAdminData(activeCategory);

  const filteredItems = items.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEdit = (item: unknown) => {
    setEditingItem({ ...item });
    setIsNewItem(false);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem({ ...EMPTY_TEMPLATES[activeCategory], id: `${activeCategory.substring(0,3)}-${Date.now()}` });
    setIsNewItem(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteItemId(id);
    deleteModal.open();
  };

  const confirmDelete = () => {
    if (deleteItemId) {
        deleteItem({ category: activeCategory, id: deleteItemId });
        setDeleteItemId(null);
    }
  };

  const handleSave = (formData: unknown) => {
    saveItem({ category: activeCategory, item: formData, isNew: isNewItem });
    setIsModalOpen(false);
  };

  return (
    <div className={cn("flex flex-col h-full rounded-lg overflow-hidden border", theme.surface.default, theme.border.default)}>
      <RecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isNewItem ? 'Create Record' : 'Edit Record'}
        item={editingItem}
        onSave={handleSave}
      />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <EntitySidebar 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory}
          counts={counts}
        />

        {/* Main Content */}
        <div className={cn("flex-1 flex flex-col overflow-hidden", theme.surface.default)}>
          <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surface.highlight)}>
            <div className="relative flex-1 md:max-w-xs mr-2">
              <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
              <input 
                className={cn("w-full pl-10 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
                placeholder={`Search ${activeCategory}...`}
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleCreate} className="whitespace-nowrap">Add New</Button>
          </div>

          <div className="flex-1 overflow-auto p-0 md:p-4">
             <EntityList 
                activeCategory={activeCategory}
                items={filteredItems}
                onEdit={handleEdit}
                onDelete={handleDelete}
             />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={confirmDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmText="Delete Record"
        variant="danger"
      />
    </div>
  );
};
