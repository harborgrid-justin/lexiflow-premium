
import { CopyButton } from '@/components/ui/atoms/CopyButton/CopyButton';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { encodeHtmlEntities } from '@/utils/sanitize';
import React from 'react';

interface SchemaCodeEditorProps {
    ddl: string;
}

/**
 * SchemaCodeEditor - React 18 optimized with React.memo
 */
export const SchemaCodeEditor = React.memo<SchemaCodeEditorProps>(function SchemaCodeEditor({ ddl }) {
    const { theme, mode } = useTheme();

    const keywordColor = mode === 'dark' ? 'text-sky-400' : 'text-blue-600 font-medium';
    const typeColor = mode === 'dark' ? 'text-teal-300' : 'text-teal-600';
    const specialColor = mode === 'dark' ? 'text-purple-400' : 'text-purple-600';
    const commentColor = mode === 'dark' ? 'text-green-500' : 'text-green-600';
    const stringColor = mode === 'dark' ? 'text-amber-400' : 'text-amber-600';

    return (
        <div className="h-full p-6">
            <div className={cn("h-full rounded-lg border shadow-inner flex flex-col overflow-hidden", theme.border.default, theme.surface.default)}>
                <div className={cn("px-4 py-2 border-b flex justify-between items-center", theme.border.default, theme.surface.highlight)}>
                    <span className={cn("text-xs font-mono", theme.text.secondary)}>schema.sql</span>
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-green-500 flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>Valid</span>
                        <CopyButton text={ddl} label="Copy DDL" />
                    </div>
                </div>
                <pre className={cn("flex-1 p-4 font-mono text-sm overflow-auto leading-relaxed selection:bg-blue-500/30", theme.text.primary)}>
                    {/* SECURITY: dangerouslySetInnerHTML justified - content is sanitized via encodeHtmlEntities */}
                    <code dangerouslySetInnerHTML={{
                        __html: encodeHtmlEntities(ddl)
                            .replace(/--.*/g, `<span class="${commentColor}">$&</span>`)
                            .replace(/CREATE|TABLE|RETURNS|AS|BEGIN|END;|LANGUAGE|FUNCTION|RETURNS|TRIGGER|BEFORE|UPDATE|ON|FOR|EACH|ROW|EXECUTE|PROCEDURE|INDEX/g, `<span class="${keywordColor}">$&</span>`)
                            .replace(/VARCHAR|UUID|TIMESTAMP|WITH|TIME|ZONE|DEFAULT|BOOLEAN|TEXT|NUMERIC|DATE|INTEGER|TRIGGER/g, `<span class="${typeColor}">$&</span>`)
                            .replace(/PRIMARY KEY|REFERENCES|ON DELETE CASCADE|NOT NULL|UNIQUE/g, `<span class="${specialColor}">$&</span>`)
                            .replace(/&#039;[^&]*&#039;/g, `<span class="${stringColor}">$&</span>`)
                    }} />
                </pre>
            </div>
        </div>
    );
});
