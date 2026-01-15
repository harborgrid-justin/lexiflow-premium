import { EditorToolbar } from '@/routes/discovery/components/EditorToolbar/EditorToolbar';
import { GeminiService } from '@/services/features/research/geminiService';
import { useToggle } from '@/hooks/useToggle';
import { cn } from '@/lib/cn';
import { sanitizeHtml } from '@/lib/sanitize';
import { useTheme } from "@/hooks/useTheme";
import { RotateCcw, Wand2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface AdvancedEditorProps {
  initialContent: string;
  onSave?: (content: string) => void;
  placeholder?: string;
  onInsertRequest?: () => void;
}

export const AdvancedEditor = ({ initialContent, onSave, placeholder }: AdvancedEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const aiToolbarToggle = useToggle();
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Debounce ref for stats calculation
  const statsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to track if the last update was internal (user typing)
  const isInternalUpdate = useRef(false);

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

  useEffect(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;

      // Only update if content is different AND we didn't just type it ourselves
      // or if the editor is not currently focused (e.g. loading a new doc)
      const isFocused = document.activeElement === editorRef.current;

      // Normalize for comparison (basic check)
      if (initialContent !== currentContent && (!isFocused || !isInternalUpdate.current)) {
        // Sanitize and ensure clean HTML insertion
        const formattedContent = initialContent.includes('<') ? initialContent : `<p>${initialContent.replace(/\n/g, '<br/>')}</p>`;
        editorRef.current.innerHTML = sanitizeHtml(formattedContent);
        updateStats();
      }

      // Reset flag after prop sync
      isInternalUpdate.current = false;
    }
  }, [initialContent, updateStats]);

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
        aiToolbarToggle.open();
        return;
      }
    }

    // Clear selection if invalid or collapsed
    if (aiToolbarToggle.isOpen) {
      aiToolbarToggle.close();
      setSelectionRange(null);
    }
  }, [aiToolbarToggle]);

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
        // Sanitize AI response before inserting into DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizeHtml(refinedText);

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
      aiToolbarToggle.close();
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
    <div className={cn("flex flex-col h-full border rounded-lg shadow-sm overflow-hidden", theme.border.default, theme.surface.default)}>
      <EditorToolbar
        wordCount={wordCount}
        onCmd={execCmd}
        onSave={onSave ? () => onSave(editorRef.current?.innerHTML || '') : undefined}
      />

      <div className="relative flex-1 overflow-hidden group">
        <div
          ref={editorRef}
          className={cn("h-full w-full p-8 outline-none overflow-y-auto prose prose-slate max-w-none transition-colors", `focus:${theme.surface.highlight}`)}
          contentEditable
          onMouseUp={handleSelection}
          onKeyUp={handleSelection}
          onInput={handleInput}
          spellCheck={false}
          suppressContentEditableWarning={true}
        />

        {!wordCount && placeholder && (
          <div className={cn("absolute top-8 left-8 pointer-events-none text-lg", theme.text.tertiary)}>
            {placeholder}
          </div>
        )}

        {aiToolbarToggle.isOpen && (
          <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-96 rounded-lg shadow-2xl border p-2 flex gap-2 animate-in fade-in slide-in-from-bottom-2 z-20">
            <div className="flex-1 relative">
              <Wand2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600" />
              <input
                style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Ask AI to rewrite selection..."
                value={aiPrompt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiEdit()}
                autoFocus
              />
            </div>
            <button
              onClick={handleAiEdit}
              disabled={isAiLoading}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center"
            >
              {isAiLoading ? <RotateCcw className="h-3 w-3 animate-spin" /> : 'Refine'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
