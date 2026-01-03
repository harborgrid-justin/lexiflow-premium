import { EmptyState } from '@/components/ui/molecules/EmptyState/EmptyState';
import { useTheme } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { CaseId, TaskId, TaskPriorityBackend, TaskStatusBackend, UserId, WorkflowTask } from '@/types';
import { PleadingComment } from '@/types';
import { cn } from '@/utils/cn';
import { CheckCircle, MessageSquare, MessagesSquare, Send } from 'lucide-react';
import React, { useState } from 'react';

interface ReviewPanelProps {
    comments: PleadingComment[];
    caseId: string;
    docId: string;
    onAddComment: (text: string) => void;
    onResolveComment: (id: string) => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({ comments, caseId, docId, onAddComment, onResolveComment }) => {
    const { theme } = useTheme();
    const [newComment, setNewComment] = useState('');

    // Cross-Module: Create Workflow Task
    const handleRequestReview = async () => {
        const task: WorkflowTask = {
            id: `t-${Date.now()}` as TaskId,
            title: 'Review Pleading Draft',
            caseId: caseId as CaseId,
            status: TaskStatusBackend.TODO,
            priority: TaskPriorityBackend.HIGH,
            assignee: 'Senior Partner',
            assigneeId: 'usr-partner-alex' as UserId,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: `Please review document ${docId}.`,
            relatedModule: 'Documents',
            relatedItemId: docId
        };
        await DataService.tasks.add(task);
        alert("Review task created for Senior Partner.");
    };

    const submitComment = () => {
        if (!newComment.trim()) return;
        onAddComment(newComment);
        setNewComment('');
    };

    return (
        <div className="flex flex-col h-full">
            <div className={cn("p-4 border-b", theme.border.default)}>
                <div className="flex justify-between items-center mb-3">
                    <h3 className={cn("text-sm font-bold flex items-center", theme.text.primary)}>
                        <MessageSquare className="h-4 w-4 mr-2" /> Review Studio
                    </h3>
                    <span className={cn("text-xs font-mono px-2 py-0.5 rounded", theme.surface.highlight)}>{comments.filter(c => !c.resolved).length} Open</span>
                </div>
                <button
                    onClick={handleRequestReview}
                    className={cn("w-full py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm flex items-center justify-center gap-2")}
                >
                    <CheckCircle className="h-3.5 w-3.5" /> Request Partner Review
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {comments.length === 0 ? (
                    <EmptyState
                        icon={MessagesSquare}
                        title="No comments"
                        description="Be the first to leave a comment on this document."
                        className="py-8"
                    />
                ) : (
                    comments.map(c => (
                        <div key={c.id} className={cn("p-3 rounded-lg border text-sm group", c.resolved ? "opacity-60 bg-slate-50 dark:bg-slate-900" : cn(theme.surface.default, "shadow-sm"), theme.border.default)}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                        {c.authorName.charAt(0)}
                                    </div>
                                    <span className={cn("font-bold text-xs", theme.text.primary)}>{c.authorName}</span>
                                </div>
                                <span className={cn("text-[10px] text-slate-400")}>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className={cn("text-xs leading-relaxed mb-2", c.resolved ? "line-through text-slate-400" : theme.text.secondary)}>{c.text}</p>
                            {!c.resolved && (
                                <button onClick={() => onResolveComment(c.id)} className="text-[10px] text-green-600 hover:underline flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className={cn("p-3 border-t", theme.border.default)}>
                <div className="relative">
                    <input
                        className={cn("w-full pl-3 pr-10 py-2 text-xs border rounded-md outline-none focus:ring-1 focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
                        placeholder="Add comment..."
                        value={newComment}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                    />
                    <button onClick={submitComment} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700">
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
