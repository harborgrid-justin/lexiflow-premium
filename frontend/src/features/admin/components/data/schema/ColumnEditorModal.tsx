import { Button } from '@/shared/ui/atoms/Button/Button';
import { Input } from '@/shared/ui/atoms/Input/Input';
import { Modal } from '@/shared/ui/molecules/Modal/Modal';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
interface ColumnData {
    name?: string;
    type?: string;
    fk?: string;
    notNull?: boolean;
    unique?: boolean;
    pk?: boolean;
    index?: boolean;
}

interface ColumnEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    tableName?: string;
    columnName?: string;
    data: ColumnData;
    setData: (data: ColumnData) => void;
}

const dataTypes = ['UUID', 'VARCHAR(255)', 'TEXT', 'INTEGER', 'BIGINT', 'NUMERIC', 'BOOLEAN', 'TIMESTAMP WITH TIME ZONE', 'DATE'];

export const ColumnEditorModal: React.FC<ColumnEditorModalProps> = ({
    isOpen, onClose, onSave, tableName, columnName, data, setData
}) => {
    const { theme } = useTheme();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={columnName ? `Edit Column` : `Add Column to ${tableName}`}>
            <div className="p-6 space-y-4">
                <Input label="Column Name" value={data.name || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, name: e.target.value })} />
                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Data Type</label>
                    <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)} value={data.type || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData({ ...data, type: e.target.value })}>
                        {dataTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                </div>
                <Input label="Foreign Key (optional)" value={data.fk || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, fk: e.target.value })} placeholder="e.g. users.id" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={data.notNull || false} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, notNull: e.target.checked })} /> Not Null</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={data.unique || false} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, unique: e.target.checked })} /> Unique</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={data.pk || false} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, pk: e.target.checked })} /> Primary Key</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" checked={data.index || false} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, index: e.target.checked })} /> Create Index</label>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={onSave}>Save Column</Button>
                </div>
            </div>
        </Modal>
    );
};
