import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/theme';
import type { StoreRecord } from './types';

// interface IndexedDBDataTableProps {
//   data: StoreRecord[];
//   isLoading: boolean;
//   searchTerm: string;
//   setSearchTerm: (value: string) => void;
//   editingId: string | null;
//   editingData: StoreRecord | null;
//   setEditingData: (value: StoreRecord | null) => void;
//   onEdit: (item: StoreRecord) => void;
//   onSave: () => void;
//   onDelete: (id: string) => void;
//   onCancel: () => void;
// }

export function IndexedDBDataTable({
  data,
  isLoading,
  searchTerm,
  setSearchTerm,
  editingId,
  editingData,
  setEditingData,
  onEdit,
  onSave,
  onDelete,
  onCancel
}) {
  const { theme } = useTheme();

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className={cn(
            "w-full px-4 py-2 rounded-lg border",
            theme.border.default,
            theme.surface.default,
            theme.text.primary
          )}
        />
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading data...</div>
      ) : data.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No records found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={cn("border-b", theme.border.default)}>
              <tr>
                <th className={cn("text-left p-3 font-semibold", theme.text.secondary)}>ID</th>
                <th className={cn("text-left p-3 font-semibold", theme.text.secondary)}>Data</th>
                <th className={cn("text-right p-3 font-semibold", theme.text.secondary)}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: StoreRecord) => (
                <tr key={item.id} className={cn(
                  "border-b hover:bg-gray-50 dark:hover:bg-slate-800/50",
                  theme.border.default
                )}>
                  <td className={cn("p-3", theme.text.primary)}>
                    <code className="text-xs">{item.id}</code>
                  </td>
                  <td className={cn("p-3", theme.text.primary)}>
                    {editingId === item.id ? (
                      <textarea
                        value={JSON.stringify(editingData, null, 2)}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          try {
                            setEditingData(JSON.parse(e.target.value));
                          } catch {
                            // Keep previous value if invalid JSON
                          }
                        }}
                        className={cn(
                          "w-full p-2 rounded border font-mono text-xs",
                          theme.border.default,
                          theme.surface.default
                        )}
                        rows={5}
                        aria-label="Edit record data"
                      />
                    ) : (
                      <pre className="text-xs overflow-x-auto max-w-2xl">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {editingId === item.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={onSave}
                          className="px-3 py-1 text-xs rounded border bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                        >
                          Save
                        </button>
                        <button
                          onClick={onCancel}
                          className={cn("px-3 py-1 text-xs rounded border", theme.border.default, theme.text.secondary)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className={cn(
                            "px-3 py-1 text-xs rounded border hover:bg-gray-100 dark:hover:bg-slate-700",
                            theme.border.default,
                            theme.text.secondary
                          )}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className={cn(
                            "px-3 py-1 text-xs rounded border hover:bg-red-50 hover:text-red-600 hover:border-red-200",
                            theme.border.default,
                            theme.text.secondary
                          )}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
