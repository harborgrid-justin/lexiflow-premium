
import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';

interface SchemaCodeEditorProps {
    ddl: string;
}

export const SchemaCodeEditor: React.FC<SchemaCodeEditorProps> = ({ ddl }) => {
  const { theme, mode } = useTheme();

  return (
    <div className="h-full p-6">
        <div className={cn("h-full rounded-lg border shadow-inner flex flex-col overflow-hidden", theme.border.default, mode === 'dark' ? "bg-[#1e1e1e]" : "bg-white")}>
            <div className={cn("px-4 py-2 border-b flex justify-between items-center", theme.border.default, mode === 'dark' ? "bg-[#252526]" : "bg-slate-50")}>
                <span className={cn("text-xs font-mono", theme.text.secondary)}>schema.sql</span>
                <span className="text-xs text-green-500 flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>Valid</span>
            </div>
            <pre className={cn("flex-1 p-4 font-mono text-sm overflow-auto leading-relaxed", mode === 'dark' ? "text-[#d4d4d4]" : "text-slate-800")}>
                <code dangerouslySetInnerHTML={{ 
                    __html: ddl
                        .replace(/CREATE/g, `<span class="${mode === 'dark' ? 'text-[#569cd6]' : 'text-blue-600 font-bold'}">CREATE</span>`)
                        .replace(/TABLE/g, `<span class="${mode === 'dark' ? 'text-[#569cd6]' : 'text-blue-600 font-bold'}">TABLE</span>`)
                        .replace(/VARCHAR/g, `<span class="${mode === 'dark' ? 'text-[#4ec9b0]' : 'text-teal-600'}">VARCHAR</span>`)
                        .replace(/UUID/g, `<span class="${mode === 'dark' ? 'text-[#4ec9b0]' : 'text-teal-600'}">UUID</span>`)
                        .replace(/PRIMARY KEY/g, `<span class="${mode === 'dark' ? 'text-[#c586c0]' : 'text-purple-600'}">PRIMARY KEY</span>`)
                }}/>
            </pre>
        </div>
    </div>
  );
};
