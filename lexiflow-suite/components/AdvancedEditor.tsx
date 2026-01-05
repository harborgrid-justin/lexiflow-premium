
import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Wand2, RotateCcw } from 'lucide-react';
import { GeminiService } from '../services/geminiService.ts';
import { EditorToolbar } from './common/EditorToolbar.tsx';

interface AdvancedEditorProps {
  initialContent: string;
  onSave?: (content: string) => void;
  placeholder?: string;
  onInsertRequest?: () => void;
}

export const AdvancedEditor: React.FC<AdvancedEditorProps> = ({ initialContent, onSave, placeholder, onInsertRequest }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showAiToolbar, setShowAiToolbar] = useState(false);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  
  // Guideline 3: Transition for AI update
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (editorRef.current && initialContent && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialContent.includes('<') ? initialContent : `<p>${initialContent.replace(/\n/g, '<br/>')}</p>`;
      updateStats();
    }
  }, []);

  const updateStats = () => {
    if (editorRef.current) {
        const text = editorRef.current.innerText || '';
        setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length);
    }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateStats();
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const container = editorRef.current;
      if (container && container.contains(range.commonAncestorContainer)) {
        setSelectionRange(range);
        setShowAiToolbar(true);
      }
    } else {
      setShowAiToolbar(false);
    }
    updateStats();
  };

  const handleAiEdit = async () => {
    if (!selectionRange || !aiPrompt) return;
    setIsAiLoading(true);
    
    // Guideline 6: Stale Closure Risk - capture current selection state before async
    const currentRange = selectionRange; 

    const selectedText = currentRange.toString();
    const refinedText = await GeminiService.generateDraft(`Rewrite this legal text: "${selectedText}". Instruction: ${aiPrompt}`, 'Text Fragment');
    
    startTransition(() => {
        if(currentRange) {
            currentRange.deleteContents();
            const newNode = document.createTextNode(refinedText);
            currentRange.insertNode(newNode);
            window.getSelection()?.removeAllRanges();
        }
        setIsAiLoading(false);
        setShowAiToolbar(false);
        setAiPrompt('');
        updateStats();
    });
  };

  useEffect(() => {
  }, [initialContent]);

  return (
    <div className={`flex flex-col h-full border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      <EditorToolbar 
        wordCount={wordCount}
        onCmd={execCmd}
        onSave={onSave ? () => onSave(editorRef.current?.innerHTML || '') : undefined}
      />

      <div className="relative flex-1 bg-white overflow-hidden group">
         <div 
            ref={editorRef}
            className="h-full w-full p-8 outline-none overflow-y-auto prose prose-slate max-w-none focus:bg-slate-50/10 transition-colors"
            contentEditable
            onMouseUp={handleSelection}
            onKeyUp={handleSelection}
            onInput={updateStats}
            spellCheck={false}
         />
         
         {!wordCount && placeholder && (
            <div className="absolute top-8 left-8 text-slate-300 pointer-events-none text-lg">
                {placeholder}
            </div>
         )}
         
         {showAiToolbar && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-96 bg-white rounded-lg shadow-2xl border border-slate-200 p-2 flex gap-2 animate-in fade-in slide-in-from-bottom-2 z-20">
                <div className="flex-1 relative">
                    <Wand2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600"/>
                    <input 
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="Ask AI to rewrite selection..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiEdit()}
                        autoFocus
                    />
                </div>
                <button 
                    onClick={handleAiEdit}
                    disabled={isAiLoading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center"
                >
                    {isAiLoading ? <RotateCcw className="h-3 w-3 animate-spin"/> : 'Refine'}
                </button>
            </div>
         )}
      </div>
    </div>
  );
};
