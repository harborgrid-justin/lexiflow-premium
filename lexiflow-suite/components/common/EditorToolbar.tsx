
import { AlignCenter, AlignLeft, AlignRight, Bold, Highlighter, Italic, List, Save, Underline } from 'lucide-react';
import React from 'react';

interface EditorToolbarProps {
  wordCount: number;
  onCmd: (cmd: string, val?: string) => void;
  onSave?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ wordCount, onCmd, onSave }) => {
  const btnClass = "p-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors";

  return (
    <div style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)' }} className="flex items-center gap-1 p-2 border-b flex-wrap">
      <div className="flex items-center gap-0.5 border-r border-slate-300 pr-2 mr-2">
        <select style={{ backgroundColor: 'transparent', color: 'var(--color-text)' }} className="text-sm font-medium h-8 border-none outline-none cursor-pointer hover:bg-slate-200 rounded px-1" onChange={(e) => onCmd('formatBlock', e.target.value)}>
          <option value="p">Normal</option>
          <option value="h2">Heading 1</option>
          <option value="h3">Heading 2</option>
          <option value="h4">Heading 3</option>
        </select>
      </div>
      <div className="flex items-center gap-0.5 border-r border-slate-300 pr-2 mr-2">
        <button onClick={() => onCmd('bold')} className={btnClass} title="Bold"><Bold className="h-4 w-4" /></button>
        <button onClick={() => onCmd('italic')} className={btnClass} title="Italic"><Italic className="h-4 w-4" /></button>
        <button onClick={() => onCmd('underline')} className={btnClass} title="Underline"><Underline className="h-4 w-4" /></button>
        <button onClick={() => onCmd('hiliteColor', '#fef08a')} className={btnClass} title="Highlight"><Highlighter className="h-4 w-4" /></button>
      </div>
      <div className="flex items-center gap-0.5 border-r border-slate-300 pr-2 mr-2">
        <button onClick={() => onCmd('justifyLeft')} className={btnClass}><AlignLeft className="h-4 w-4" /></button>
        <button onClick={() => onCmd('justifyCenter')} className={btnClass}><AlignCenter className="h-4 w-4" /></button>
        <button onClick={() => onCmd('justifyRight')} className={btnClass}><AlignRight className="h-4 w-4" /></button>
        <button onClick={() => onCmd('insertUnorderedList')} className={btnClass}><List className="h-4 w-4" /></button>
      </div>

      <div className="flex-1"></div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-mono mr-2">{wordCount} words</span>
        {onSave && (
          <button onClick={onSave} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm transition-all">
            <Save className="h-3.5 w-3.5" /> Save
          </button>
        )}
      </div>
    </div>
  );
};
