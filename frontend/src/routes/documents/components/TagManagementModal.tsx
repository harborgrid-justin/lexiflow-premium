import { Button } from '@/components/atoms/Button/Button';
import { Modal } from '@/components/molecules/Modal/Modal';
import { useTheme } from '@/theme';
import { LegalDocument } from '@/types';
import { cn } from '@/lib/cn';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface TagManagementModalProps {
    document: LegalDocument;
    onClose: () => void;
    onAddTag: (docId: string, tag: string) => void;
    onRemoveTag: (docId: string, tag: string) => void;
    allTags: string[];
}

export function TagManagementModal({
    document, onClose, onAddTag, onRemoveTag, allTags
}: TagManagementModalProps) {
    const { theme } = useTheme();
    const [newTagInput, setNewTagInput] = useState('');

    const handleAddTag = () => {
        if (newTagInput) {
            onAddTag(document.id, newTagInput);
            setNewTagInput('');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Manage Document Tags" size="sm">
            <div className="p-6">
                <div className="mb-4">
                    <label className={cn("block text-xs font-semibold uppercase mb-2", theme.text.secondary)}>Current Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {document.tags.length === 0 && <span className={cn("text-sm italic", theme.text.tertiary)}>No tags assigned.</span>}
                        {document.tags.map(tag => (
                            <span key={tag} className={cn("inline-flex items-center px-2 py-1 rounded text-sm border", theme.primary.light, theme.primary.text, theme.primary.border)}>
                                {tag}
                                <button onClick={() => onRemoveTag(document.id, tag)} className={cn("ml-2 hover:opacity-75", theme.primary.text)}><X className="h-3 w-3" /></button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className={cn("block text-xs font-semibold uppercase mb-2", theme.text.secondary)}>Add New Tag</label>
                    <div className="flex gap-2">
                        <input
                            className={cn("flex-1 px-3 py-2 border rounded-md text-sm outline-none transition-all", theme.border.default, theme.surface.default, "focus:ring-2 focus:ring-blue-500")}
                            placeholder="Type new tag name..."
                            value={newTagInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); }}
                        />
                        <Button size="sm" onClick={handleAddTag} disabled={!newTagInput.trim()}>Add</Button>
                    </div>
                </div>

                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-2", theme.text.secondary)}>Suggested / Recent</label>
                    <div className="flex flex-wrap gap-2">
                        {allTags.filter(t => !document.tags.includes(t)).slice(0, 8).map(t => (
                            <button
                                key={t}
                                onClick={() => onAddTag(document.id, t)}
                                className={cn("text-xs px-2 py-1 border rounded flex items-center transition-colors", theme.border.default, theme.text.secondary, `hover:${theme.surface.highlight}`)}
                            >
                                <Plus className="h-3 w-3 mr-1" /> {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
