
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Wand2, RotateCcw } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { EditorToolbar } from './common/EditorToolbar';

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

  // Debounce ref for stats calculation
  const statsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to track if the last update was internal (user typing)
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      
      // Only update if content is different AND we didn't just type it ourselves
      // or if the editor is not currently focused (e.g. loading a new doc)
      const isFocused = document.activeElement === editorRef.current;
      
      // Normalize for comparison (basic check)
      if (initialContent !== currentContent && (!isFocused || !isInternalUpdate.current)) {
          // Ensure clean HTML insertion
          const sanitizedContent = initialContent.includes('<') ? initialContent : `<p>${initialContent.replace(/\n/g, '<br/>')}</p>`;
          editorRef.current.innerHTML = sanitizedContent;
          updateStats();
      }
      
      // Reset flag after prop sync
      isInternalUpdate.current = false;
    }
  }, [initialContent]);

  // Debounced stats update to prevent layout thrashing on every keystroke
  const updateStats = useCallback(() => {
    if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
    
    statsTimeoutRef.current = setTimeout(() => {
        if (editorRef.current) {
            const text = editorRef.current.innerText || '';
            setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length);
        }
    }, 300); // 300ms delay
  }, []);

  const handleInput = useCallback(() => {
      isInternalUpdate.current = true;
      updateStats();
      if (onSave && editorRef.current) {
          // Debounce the save call slightly if needed, or pass raw
          onSave(editorRef.current.innerHTML); 
      }
  }, [onSave, updateStats]);

  const execCmd = useCallback((command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput(); // Trigger update after formatting
  }, [handleInput]);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const container = editorRef.current;
      
      if (container && container.contains(range.commonAncestorContainer)) {
        // Store range carefully; clone it to ensure stability if DOM changes
        setSelectionRange(range.cloneRange());
        setShowAiToolbar(true);
        return;
      }
    }
    
    // Clear selection if invalid or collapsed
    if (showAiToolbar) {
        setShowAiToolbar(false);
        setSelectionRange(null);
    }
  }, [showAiToolbar]);

  const handleAiEdit = async () => {
    if (!selectionRange || !aiPrompt) return;
    setIsAiLoading(true);
    
    try {
      const selectedText = selectionRange.toString();
      const refinedText = await GeminiService.generateDraft(`Rewrite this legal text: "${selectedText}". Instruction: ${aiPrompt}`, 'Text Fragment');
      
      // Restore selection before manipulating
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRange);
        
        // Perform replacement
        selectionRange.deleteContents();
        // Create an HTML fragment to support formatted return from AI
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = refinedText;
        
        // Insert nodes
        let lastNode;
        while (tempDiv.firstChild) {
            lastNode = tempDiv.firstChild;
            selectionRange.insertNode(lastNode);
        }
        
        // Cleanup
        selection.removeAllRanges();
        setSelectionRange(null); 
        
        // Notify parent of change
        handleInput();
      }
    } catch (e) {
      console.error("AI Edit failed", e);
    } finally {
      setIsAiLoading(false);
      setShowAiToolbar(false);
      setAiPrompt('');
    }
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
      return () => {
          if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
      };
  }, []);

  return (
    <div className="flex flex-col h-full border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
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
            onInput={handleInput}
            spellCheck={false}
            suppressContentEditableWarning={true}
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
