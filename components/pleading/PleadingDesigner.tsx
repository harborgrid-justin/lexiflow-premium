
import React, { useState, useEffect } from 'react';
import { 
    Layout, Layers, Printer, CheckCircle, AlertTriangle, Share2, 
    ArrowLeft, Wand2, Target, Link as LinkIcon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { PleadingCanvas } from './Canvas/PleadingCanvas';
import { ContextPanel } from './Sidebar/ContextPanel';
import { ComplianceHUD } from './Tools/ComplianceHUD';
import { LogicOverlay } from './Visual/LogicOverlay';
import { AIDraftingAssistant } from './modules/AIDraftingAssistant';
import { ArgumentSelector } from './modules/ArgumentSelector';
import { Button } from '../common/Button';
import { DataService } from '../../services/dataService';
import { PleadingDocument, FormattingRule, PleadingSection } from '../../types/pleadingTypes';
import { Case } from '../../types';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

interface PleadingDesignerProps {
    pleadingId: string;
    onBack: () => void;
}

const DEFAULT_RULES: FormattingRule = {
    id: 'fed-civil',
    name: 'Federal Civil Rules',
    fontFamily: 'Times New Roman',
    fontSize: 12,
    lineHeight: 2.0, 
    marginTop: '1in',
    marginBottom: '1in',
    marginLeft: '1.25in', 
    marginRight: '1in',
    showLineNumbers: true,
    paperSize: 'Letter',
    captionStyle: 'Boxed'
};

export const PleadingDesigner: React.FC<PleadingDesignerProps> = ({ pleadingId, onBack }) => {
    const { theme } = useTheme();
    const [viewMode, setViewMode] = useState<'write' | 'logic' | 'preview'>('write');
    const [sidebarMode, setSidebarMode] = useState<'context' | 'ai' | 'arguments'>('context');
    const [document, setDocument] = useState<PleadingDocument | null>(null);
    const [complianceScore, setComplianceScore] = useState(92);
    const [relatedCase, setRelatedCase] = useState<Case | null>(null);

    // Enterprise Data Access
    const { data: rules = DEFAULT_RULES } = useQuery<FormattingRule>(
        ['pleading', 'rules'],
        DataService.pleadings.getFormattingRules
    );

    // Load Document
    useEffect(() => {
        // Mock Load logic simulating DataService fetch
        const load = async () => {
             // In real app: const doc = await DataService.pleadings.getById(pleadingId);
             const mockDoc: PleadingDocument = {
                id: pleadingId,
                caseId: '1:24-cv-01442' as any, // This might be a temp ID if pre-filing
                title: 'Motion for Summary Judgment',
                status: 'Draft',
                filingStatus: 'Pre-Filing', // Default to pre-filing for demo
                version: 1,
                jurisdictionRulesId: 'fed-civil',
                sections: [
                    { id: 'b1', type: 'Caption', content: '', order: 0 },
                    { id: 'b2', type: 'Heading', content: 'I. INTRODUCTION', order: 1 },
                    { id: 'b3', type: 'Paragraph', content: 'Plaintiff brings this motion because the undisputed facts show no genuine issue for trial.', order: 2 },
                ],
                links: []
            };
            setDocument(mockDoc);
            
            if (mockDoc.caseId) {
                const c = await DataService.cases.getById(mockDoc.caseId);
                if (c) setRelatedCase(c);
            }
        };
        load();
    }, [pleadingId]);

    const handleUpdateSection = (id: string, updates: Partial<PleadingSection>) => {
        if (!document) return;
        const newSections = document.sections.map(s => s.id === id ? { ...s, ...updates } : s);
        setDocument({ ...document, sections: newSections });
    };
    
    const handleAddSection = (content: string, type: 'Paragraph' | 'Heading' = 'Paragraph', linkedArgId?: string) => {
        if (!document) return;
        const newSection: PleadingSection = {
            id: `sec-${Date.now()}`,
            type,
            content,
            order: document.sections.length,
            linkedArgumentId: linkedArgId
        };
        setDocument({ ...document, sections: [...document.sections, newSection] });
    };

    if (!document) return <div className="flex h-full items-center justify-center">Loading Studio...</div>;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* 1. Top Bar */}
            <header className={cn("h-16 border-b flex items-center justify-between px-4 shrink-0 z-50", theme.surface, theme.border.default)}>
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className={cn("p-2 rounded-full", theme.surfaceHighlight, theme.text.secondary)}>
                        <ArrowLeft className="h-5 w-5"/>
                    </button>
                    <div>
                        <h2 className={cn("text-sm font-bold flex items-center gap-2", theme.text.primary)}>
                            {document.title}
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase border", document.filingStatus === 'Pre-Filing' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200")}>
                                {document.filingStatus}
                            </span>
                        </h2>
                        <p className={cn("text-xs", theme.text.secondary)}>{rules.name} • {relatedCase ? relatedCase.title : 'Unassigned Matter'}</p>
                    </div>
                </div>

                <div className={cn("flex p-1 rounded-lg border", theme.surfaceHighlight, theme.border.default)}>
                    <button onClick={() => setViewMode('write')} className={cn("px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all", viewMode === 'write' ? cn(theme.surface, "shadow text-blue-600") : "text-slate-500 hover:text-slate-700")}>
                        <Layout className="h-4 w-4"/> Write
                    </button>
                    <button onClick={() => setViewMode('logic')} className={cn("px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all", viewMode === 'logic' ? cn(theme.surface, "shadow text-purple-600") : "text-slate-500 hover:text-slate-700")}>
                        <Layers className="h-4 w-4"/> Logic Map
                    </button>
                    <button onClick={() => setViewMode('preview')} className={cn("px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all", viewMode === 'preview' ? cn(theme.surface, "shadow text-green-600") : "text-slate-500 hover:text-slate-700")}>
                        <Printer className="h-4 w-4"/> Print
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border", complianceScore === 100 ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700")}>
                        {complianceScore === 100 ? <CheckCircle className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
                        <span className="text-xs font-bold">{complianceScore}% Compliant</span>
                    </div>
                    <Button variant="primary" icon={Share2}>Share</Button>
                </div>
            </header>

            {/* 2. Main Workspace */}
            <div className={cn("flex-1 flex overflow-hidden relative", theme.background)}>
                
                {/* Left Sidebar: Context / AI / Args */}
                <div className={cn("w-80 border-r flex flex-col z-20 transition-all", theme.surface, theme.border.default)}>
                    {/* Tab Switcher */}
                    <div className={cn("flex border-b", theme.border.default)}>
                        <button onClick={() => setSidebarMode('context')} className={cn("flex-1 py-3 text-xs font-bold uppercase border-b-2 transition-colors", sidebarMode === 'context' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500")}>Context</button>
                        <button onClick={() => setSidebarMode('ai')} className={cn("flex-1 py-3 text-xs font-bold uppercase border-b-2 transition-colors flex justify-center items-center gap-1", sidebarMode === 'ai' ? "border-purple-600 text-purple-600" : "border-transparent text-slate-500")}>
                            <Wand2 className="h-3 w-3"/> AI
                        </button>
                        <button onClick={() => setSidebarMode('arguments')} className={cn("flex-1 py-3 text-xs font-bold uppercase border-b-2 transition-colors flex justify-center items-center gap-1", sidebarMode === 'arguments' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500")}>
                            <Target className="h-3 w-3"/> Args
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {sidebarMode === 'context' && <ContextPanel caseId={document.caseId} />}
                        {sidebarMode === 'ai' && (
                            <AIDraftingAssistant 
                                onInsert={(text) => handleAddSection(text)} 
                                caseContext={{ title: relatedCase?.title || '', summary: relatedCase?.description }}
                            />
                        )}
                        {sidebarMode === 'arguments' && (
                            <ArgumentSelector 
                                caseId={document.caseId}
                                onInsertArgument={(arg) => handleAddSection(arg.description, 'Paragraph', arg.id)}
                            />
                        )}
                    </div>
                </div>

                {/* Center: The Canvas */}
                <div className={cn("flex-1 overflow-y-auto relative flex justify-center p-8 custom-scrollbar", theme.surfaceHighlight)}>
                    <div className="relative">
                        <PleadingCanvas 
                            document={document} 
                            rules={rules} 
                            readOnly={viewMode === 'preview'}
                            viewMode={viewMode}
                            onUpdateSection={handleUpdateSection}
                            relatedCase={relatedCase}
                        />
                        {/* Logic Overlay (BPM Lines) */}
                        {viewMode === 'logic' && (
                            <LogicOverlay document={document} />
                        )}
                    </div>
                </div>

                {/* Right: Linter */}
                <div className={cn("w-72 border-l flex flex-col z-20", theme.surface, theme.border.default)}>
                     <ComplianceHUD 
                        rules={rules} 
                        sections={document.sections} 
                        score={complianceScore} 
                    />
                </div>
            </div>
        </div>
    );
};
