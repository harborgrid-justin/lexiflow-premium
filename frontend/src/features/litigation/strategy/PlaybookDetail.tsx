
/**
 * PlaybookDetail.tsx
 *
 * Detailed view of a litigation playbook, including workflow stages, strategy, and assets.
 *
 * @module components/litigation/PlaybookDetail
 */

import { BookOpen, CheckCircle, Clock, ExternalLink, FileText, Layers, Scale, Shield, Target } from 'lucide-react';
import React, { useState } from 'react';

import { useTheme } from '@/providers/ThemeContext';
import { useWindow } from '@/providers/WindowContext';
import { cn } from '@/utils/cn';

import { Button } from '@/components/ui/atoms/Button';
import { Tabs } from '@/components/ui/molecules/Tabs';
import { ResearchTool } from '@features/knowledge';
import { WarRoom } from '../war-room/WarRoom';
import { PlaybookDetailProps } from './types';

export const PlaybookDetail: React.FC<PlaybookDetailProps> = ({ playbook, onApply }) => {
    const { theme } = useTheme();
    const { openWindow } = useWindow();
    const [activeTab, setActiveTab] = useState('workflow');

    const handleLaunchResearch = (query: string) => {
        const winId = `research-${Date.now()}`;
        openWindow(
            winId,
            `Research: ${query}`,
            <div className="h-full bg-white dark:bg-slate-900">
                <ResearchTool initialTab="active" />
            </div>
        );
    };

    const handlePreviewWarRoom = () => {
        const winId = `warroom-preview-${playbook.id}`;
        openWindow(
            winId,
            `War Room Template: ${playbook.title}`,
            <div className="h-full bg-white dark:bg-slate-900">
                <WarRoom initialTab="command" />
            </div>
        );
    };

    return (
        <div className={cn("h-full flex flex-col bg-white dark:bg-slate-900", theme.text.primary)}>
            {/* Header */}
            <div className={cn("p-6 border-b flex justify-between items-start shrink-0", theme.border.default)}>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold border", theme.primary.light, theme.primary.border, theme.primary.text)}>
                            {playbook.category}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold border", theme.surface.highlight, theme.border.default)}>
                            {playbook.jurisdiction}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold">{playbook.title}</h2>
                    <p className={cn("text-sm mt-1 max-w-2xl", theme.text.secondary)}>{playbook.description}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handlePreviewWarRoom} icon={Target}>Preview War Room</Button>
                    <Button variant="primary" onClick={() => onApply(playbook)}>Apply to Canvas</Button>
                </div>
            </div>

            <div className={cn("px-6 border-b", theme.border.default)}>
                <Tabs
                    tabs={[
                        { id: 'workflow', label: 'Workflow Stages', icon: Layers },
                        { id: 'strategy', label: 'Legal Strategy & Authority', icon: Scale },
                        { id: 'assets', label: 'Documents & Evidence', icon: FileText },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'workflow' && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Estimated Lifecycle</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">Total Duration: ~18 Months • {playbook.stages?.length || 0} Phases</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-8 py-2">
                            {playbook.stages?.map((stage, i) => (
                                <div key={`stage-${stage.name}-${i}`} className="relative pl-8">
                                    <div className={cn("absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900", i === 0 ? "border-green-500" : "border-slate-300")}></div>
                                    <h4 className="text-lg font-bold mb-1">{stage.name}</h4>
                                    <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide font-bold">{stage.duration}</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {stage.criticalTasks.map((task, tIdx) => (
                                            <div key={tIdx} className={cn("p-3 rounded border flex items-center gap-3", theme.surface.default, theme.border.default)}>
                                                <CheckCircle className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm">{task}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'strategy' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-purple-600" /> Key Authorities
                            </h3>
                            <div className="space-y-3">
                                {playbook.authorities?.map((auth, i) => (
                                    <div key={`auth-${auth.citation}-${i}`} className={cn("p-4 rounded-lg border group hover:border-purple-300 transition-all cursor-pointer", theme.surface.default, theme.border.default)} onClick={() => handleLaunchResearch(auth.citation)}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold uppercase text-purple-600">{auth.type}</span>
                                            <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                                        </div>
                                        <h4 className="font-bold text-sm text-blue-700 hover:underline">{auth.citation}</h4>
                                        <p className="text-sm font-medium">{auth.title}</p>
                                        <p className="text-xs text-slate-500 mt-2 italic">{auth.relevance}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Shield className="h-5 w-5 text-amber-600" /> Strategic Notes
                            </h3>
                            <div className={cn("p-6 rounded-lg border bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800 text-sm leading-relaxed", theme.text.primary)}>
                                {playbook.strategyNotes}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
