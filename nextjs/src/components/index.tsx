/**
 * @module components
 * @category Components
 * @description Enterprise component library following Atomic Design principles
 *
 * COMPONENT ARCHITECTURE:
 * - atoms/      - Basic UI primitives (Button, Input, Badge, etc.)
 * - molecules/  - Simple composed components (Card, Modal, Tabs, etc.)
 * - organisms/  - Complex composed components (Sidebar, Table, Calendar, etc.)
 * - layouts/    - Page structure and content arrangement
 * - pages/      - Complete page compositions organized by domain
 * - theme/      - Design tokens and theming utilities
 *
 * ATOMIC DESIGN SYSTEM:
 * We follow the Atomic Design methodology for component organization:
 * Atoms → Molecules → Organisms → Layouts → Pages
 *
 * USAGE:
 * Import from the appropriate level or use barrel exports:
 * ```tsx
 * import { Button, Badge } from '@/components/atoms';
 * import { Card, Modal } from '@/components/molecules';
 * import { Sidebar, Table } from '@/components/organisms';
 * import { TabbedPageLayout } from '@/components/layouts';
 * import { CaseListPage } from '@/components/pages';
 * ```
 */

// ============================================================================
// ATOMIC DESIGN LAYERS
// ============================================================================
// NOTE: Commented out to prevent Vite ERR_INSUFFICIENT_RESOURCES
// Import directly from '@/components/ui/atoms', '@/components/ui/molecules', etc.
// export * from './atoms';
// export * from './molecules';
// export * from './organisms';
// export * from './layouts';

// ============================================================================
// UI COMPONENT LIBRARY
// ============================================================================
// NOTE: Commented out to prevent Vite ERR_INSUFFICIENT_RESOURCES
// Import directly from '@/components/ui/atoms', '@/components/ui/molecules', etc.
// export * from './ui';

// ============================================================================
// DESIGN SYSTEM
// ============================================================================
export * from './theme';

// ============================================================================
// ENTERPRISE COMPONENTS
// ============================================================================
// Export real NotificationCenter from enterprise/notifications
export { NotificationCenter } from './enterprise/notifications/NotificationCenter';

// ============================================================================
// STUB COMPONENTS (temporary - to be implemented)
// ============================================================================
import { DataService } from '@/services/data/dataService';
import React, { useCallback, useState } from 'react';

export const TaskCreationModal: React.FC<{
    isOpen?: boolean;
    onClose?: () => void;
    className?: string;
    caseId?: string;
}> = ({ isOpen, onClose, className, caseId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await DataService.tasks.add({
                id: `task-${Date.now()}`,
                title,
                description,
                priority,
                dueDate,
                assignedTo,
                caseId: caseId || '',
                status: 'Open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                userId: 'current-user', // Replace with actual user ID from auth
            });

            setTitle('');
            setDescription('');
            setPriority('Medium');
            setDueDate('');
            setAssignedTo('');

            if (onClose) onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
        } finally {
            setLoading(false);
        }
    }, [title, description, priority, dueDate, assignedTo, caseId, onClose]);

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className || ''}`}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create Task</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
                            placeholder="Task title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
                            placeholder="Task description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Assigned To
                        </label>
                        <input
                            type="text"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
                            placeholder="User ID or email"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
