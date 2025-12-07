
import React from 'react';
import { Badge } from '../../common/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { Category } from './EntitySidebar';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { VirtualList } from '../../common/VirtualList';

// Generic interface to cover the varying shapes of entities in the list
interface GenericRecord {
  id: string;
  name?: string;
  title?: string;
  role?: string;
  office?: string;
  client?: string;
  status?: string;
  value?: number;
  industry?: string;
  type?: string;
  category?: string;
  riskRating?: string;
  uploadDate?: string;
  company?: string;
  email?: string;
  roles?: string[];
  city?: string;
  state?: string;
}

interface EntityListProps {
  activeCategory: Category;
  items: GenericRecord[];
  onEdit: (item: GenericRecord) => void;
  onDelete: (id: string) => void;
}

export const EntityList: React.FC<EntityListProps> = ({ activeCategory, items, onEdit, onDelete }) => {
  const { theme } = useTheme();

  const renderRow = (item: GenericRecord) => {
    return (
        <div key={item.id} className={cn("flex items-center border-b h-[60px] px-6 transition-colors", theme.border.light, `hover:${theme.surfaceHighlight}`)}>
            <div className={cn("w-32 font-mono text-xs truncate pr-4", theme.text.tertiary)}>{item.id}</div>
            
            {activeCategory === 'users' && (
                <>
                    <div className={cn("flex-1 font-medium", theme.text.primary)}>{item.name}</div>
                    <div className="w-40"><Badge variant="neutral">{item.role || 'User'}</Badge></div>
                    <div className={cn("w-40 text-sm", theme.text.secondary)}>{item.office}</div>
                </>
            )}

            {activeCategory === 'cases' && (
                <>
                    <div className={cn("flex-1 font-medium truncate pr-4", theme.text.primary)}>{item.title}</div>
                    <div className={cn("w-48 text-sm truncate", theme.text.secondary)}>{item.client}</div>
                    <div className="w-32"><Badge variant="info">{item.status || 'Active'}</Badge></div>
                    <div className={cn("w-32 font-mono text-sm", theme.text.primary)}>${(item.value || 0).toLocaleString()}</div>
                </>
            )}

            {activeCategory === 'clients' && (
                <>
                    <div className={cn("flex-1 font-medium", theme.text.primary)}>{item.name}</div>
                    <div className={cn("w-48 text-sm", theme.text.secondary)}>{item.industry}</div>
                    <div className="w-32"><Badge variant={item.status === 'Active' ? 'success' : 'neutral'}>{item.status || 'Active'}</Badge></div>
                </>
            )}

            {activeCategory === 'clauses' && (
                <>
                    <div className={cn("flex-1 font-medium", theme.text.primary)}>{item.name}</div>
                    <div className={cn("w-48 text-sm", theme.text.secondary)}>{item.category}</div>
                    <div className="w-32"><Badge variant={item.riskRating === 'High' ? 'error' : 'success'}>{item.riskRating || 'Low'}</Badge></div>
                </>
            )}

            {activeCategory === 'documents' && (
                <>
                    <div className={cn("flex-1 font-medium truncate pr-4", theme.text.primary)}>{item.title}</div>
                    <div className={cn("w-32 text-sm", theme.text.secondary)}>{item.type}</div>
                    <div className={cn("w-32 text-sm", theme.text.tertiary)}>{item.uploadDate}</div>
                </>
            )}

            <div className="w-24 flex justify-end gap-2">
                <button onClick={() => onEdit(item)} className={cn("p-1.5 rounded transition-colors text-blue-600", `hover:${theme.surfaceHighlight}`)}><Edit2 className="h-4 w-4"/></button>
                <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="h-4 w-4"/></button>
            </div>
        </div>
    );
  };

  const renderHeader = () => {
     if (activeCategory === 'users') return <><div className="flex-1">Name</div><div className="w-40">Role</div><div className="w-40">Office</div></>;
     if (activeCategory === 'cases') return <><div className="flex-1">Title</div><div className="w-48">Client</div><div className="w-32">Status</div><div className="w-32">Value</div></>;
     if (activeCategory === 'clients') return <><div className="flex-1">Name</div><div className="w-48">Industry</div><div className="w-32">Status</div></>;
     if (activeCategory === 'clauses') return <><div className="flex-1">Name</div><div className="w-48">Category</div><div className="w-32">Risk</div></>;
     return <><div className="flex-1">Title</div><div className="w-32">Type</div><div className="w-32">Date</div></>;
  };

  return (
    <div className="flex flex-col h-full">
        {/* Desktop Virtual List */}
        <div className={cn("hidden md:flex flex-col h-full", theme.surface)}>
            <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider shrink-0", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
                <div className="w-32">ID</div>
                {renderHeader()}
                <div className="w-24 text-right">Actions</div>
            </div>
            <div className="flex-1 relative">
                <VirtualList 
                    items={items}
                    height="100%"
                    itemHeight={60}
                    renderItem={renderRow}
                />
            </div>
        </div>

        {/* Mobile Card View (Simple map) */}
        <div className="md:hidden space-y-3 p-4 overflow-y-auto">
            {items.map((item) => (
            <div key={item.id} className={cn("p-4 rounded-lg shadow-sm border", theme.surface, theme.border.default)}>
                <div className="flex justify-between items-start mb-2">
                <span className={cn("text-xs font-mono", theme.text.secondary)}>{item.id}</span>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(item)} className="text-blue-600"><Edit2 className="h-4 w-4"/></button>
                    <button onClick={() => onDelete(item.id)} className="text-red-600"><Trash2 className="h-4 w-4"/></button>
                </div>
                </div>
                <h4 className={cn("font-bold text-sm mb-2", theme.text.primary)}>{item.name || item.title}</h4>
            </div>
            ))}
        </div>
    </div>
  );
};
