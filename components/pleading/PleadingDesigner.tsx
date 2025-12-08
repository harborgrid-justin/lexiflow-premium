
import React, { useState, useEffect } from 'react';
import { 
    Layout, Database, Settings, Play, Save, ArrowLeft, 
    Share2, Printer, CheckCircle, AlertTriangle, Cpu, Layers 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { PleadingCanvas } from './Canvas/PleadingCanvas';
import { ContextPanel } from './Sidebar/ContextPanel';
import { ComplianceHUD } from './Tools/ComplianceHUD';
import { LogicOverlay } from './Visual/LogicOverlay';
import { Button } from '../common/Button';
import { DataService } from '../../services/dataService';
import { PleadingDocument, PleadingSection, FormattingRule } from '../../types/pleadingTypes';

interface PleadingDesignerProps {
    pleadingId: string;
    onBack: () => void;
}

const MOCK_RULES: FormattingRule = {
    id: 'fed-civil',
    name: 'Federal Civil Rules',
    fontFamily: 'Times New Roman',
    fontSize: 12,
    lineHeight: 2.0, // Double spacing
    marginTop: '1in',
    marginBottom: '1in',
    marginLeft: '1.25in', // Left margin for binding
    marginRight: '1in',
    showLineNumbers: true,
    paperSize: 'Letter',
    captionStyle: 'Boxed'
};

export const PleadingDesigner: React.FC<PleadingDesignerProps> = ({ pleadingId, onBack }) => {
    const { theme } = useTheme();
    const [viewMode, setViewMode] = useState<'write' | 'logic' | 'preview'>('write');
    const [activeSidebar, setActiveSidebar] = useState<'context' | 'settings'>('context');
    const [document, setDocument] = useState<PleadingDocument | null>(null);
    const [rules, setRules] = useState<FormattingRule>(MOCK_RULES);
    const [complianceScore, setComplianceScore] = useState(92);

    // Load Document (Mock)
    useEffect(() => {
        // In real app: DataService.pleadings.getById(pleadingId).then(...)
        const mockDoc: PleadingDocument = {
            id: pleadingId,
            caseId: '1:24-cv-01442' as any,
            title: 'Motion for Summary Judgment',
            status: 'Draft',
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
    }, [pleadingId]);

    if (!document) return <div>Loading Studio...</div>;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* 1. Top Bar: The "IDE" Header */}
            <header className={cn("h-16 border-b flex items-center justify-between px-4 shrink-0 bg-white dark:bg-slate-900 z-50", theme.border.default)}>
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className={cn("p-2 rounded-full hover:bg-slate-100", theme.text.secondary)}>
                        <ArrowLeft className="h-5 w-5"/>
                    </button>
                    <div>
                        <h2 className={cn("text-sm font-bold flex items-center gap-2", theme.text.primary)}>
                            {document.title}
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] uppercase">Draft</span>
                        </h2>
                        <p className={cn("text-xs", theme.text.secondary)}>Federal District Court • {rules.name}</p>
                    </div>
                </div>

                {/* View Modes */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={() => setViewMode('write')}
                        className={cn("px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all", viewMode === 'write' ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700")}
                    >
                        <Layout className="h-4 w-4"/> Write
                    </button>
                    <button 
                        onClick={() => setViewMode('logic')}
                        className={cn("px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all", viewMode === 'logic' ? "bg-white shadow text-purple-600" : "text-slate-500 hover:text-slate-700")}
                    >
                        <Layers className="h-4 w-4"/> Logic Map
                    </button>
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={cn("px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all", viewMode === 'preview' ? "bg-white shadow text-green-600" : "text-slate-500 hover:text-slate-700")}
                    >
                        <Printer className="h-4 w-4"/> Print
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border", complianceScore === 100 ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700")}>
                        {complianceScore === 100 ? <CheckCircle className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
                        <span className="text-xs font-bold">{complianceScore}% Compliant</span>
                    </div>
                    <Button variant="primary" icon={Share2}>Collaborate</Button>
                </div>
            </header>

            {/* 2. Main Workspace */}
            <div className="flex-1 flex overflow-hidden relative bg-slate-100 dark:bg-slate-950">
                
                {/* Left: Context / Assets */}
                <div className={cn("w-80 border-r bg-white dark:bg-slate-900 flex flex-col z-20", theme.border.default)}>
                    <ContextPanel caseId={document.caseId} />
                </div>

                {/* Center: The Canvas */}
                <div className="flex-1 overflow-y-auto relative flex justify-center p-8 custom-scrollbar">
                    {/* The "Paper" */}
                    <div className="relative">
                        <PleadingCanvas 
                            document={document} 
                            rules={rules} 
                            readOnly={viewMode === 'preview'}
                            viewMode={viewMode}
                        />
                        {/* Logic Overlay (BPM Lines) */}
                        {viewMode === 'logic' && (
                            <LogicOverlay document={document} />
                        )}
                    </div>
                </div>

                {/* Right: Tools & Linter */}
                <div className={cn("w-72 border-l bg-white dark:bg-slate-900 flex flex-col z-20", theme.border.default)}>
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
