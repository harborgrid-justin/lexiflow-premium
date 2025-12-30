/**
 * @module components/practice/KnowledgeCenter
 * @category Practice Management
 * @description Knowledge base with wiki, precedents, and CLE tracking.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { BarChart3, BookOpen, FileText, GraduationCap, Users } from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { Badge } from '@/components/atoms';
import { Tabs } from '@/components/molecules';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms';
import { KnowledgeAnalytics } from '../base/KnowledgeAnalytics';
import { PrecedentsView } from '../base/PrecedentsView';
import { QAView } from '../base/QAView';
import { WikiView } from '../base/WikiView';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================

export const KnowledgeCenter: React.FC = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('wiki');

    interface CleTrackerRow {
        id: string;
        attorney: string;
        req: number;
        completed: number;
        deadline: string;
        status: string;
    }

    const { data: cleTracker = [] } = useQuery<CleTrackerRow[]>(
        ['cle-tracking', 'all'],
        DataService.operations.getCleTracking
    );

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className={cn("p-4 border-b shrink-0", theme.border.default)}>
                <Tabs
                    tabs={[
                        { id: 'wiki', label: 'Firm Wiki & SOPs', icon: BookOpen },
                        { id: 'precedents', label: 'Precedents', icon: FileText },
                        { id: 'cle', label: 'CLE Tracker', icon: GraduationCap },
                        { id: 'qa', label: 'Q&A Forum', icon: Users },
                        { id: 'analytics', label: 'Usage Stats', icon: BarChart3 },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'wiki' && <div className="h-full overflow-hidden"><WikiView /></div>}

                {activeTab === 'precedents' && <div className="h-full overflow-y-auto p-6"><PrecedentsView /></div>}

                {activeTab === 'qa' && <div className="h-full overflow-y-auto p-6"><QAView /></div>}

                {activeTab === 'analytics' && <div className="h-full overflow-y-auto p-6"><KnowledgeAnalytics /></div>}

                {activeTab === 'cle' && (
                    <div className="h-full overflow-y-auto p-6 animate-fade-in">
                        <div className={cn("p-4 rounded-lg border mb-6 bg-blue-50 border-blue-200 text-blue-900")}>
                            <h4 className="font-bold text-sm">Continuing Legal Education (CLE) Compliance</h4>
                            <p className="text-xs mt-1">Overall Firm Compliance Rate: 84%. Next reporting deadline: June 30, 2024.</p>
                        </div>
                        <TableContainer>
                            <TableHeader>
                                <TableHead>Attorney</TableHead>
                                <TableHead>Required Hours</TableHead>
                                <TableHead>Completed</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Status</TableHead>
                            </TableHeader>
                            <TableBody>
                                {cleTracker.map(row => (
                                    <TableRow key={row.id}>
                                        <TableCell className={cn("font-medium", theme.text.primary)}>{row.attorney}</TableCell>
                                        <TableCell>{row.req}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                                                    <div className={cn("h-full", row.status === 'At Risk' ? 'bg-red-500' : 'bg-green-500')} style={{ width: `${(row.completed / row.req) * 100}%` }}></div>
                                                </div>
                                                {row.completed}
                                            </div>
                                        </TableCell>
                                        <TableCell>{row.deadline}</TableCell>
                                        <TableCell>
                                            <Badge variant={row.status === 'Completed' ? 'success' : row.status === 'At Risk' ? 'error' : 'warning'}>{row.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableContainer>
                    </div>
                )}
            </div>
        </div>
    );
};
