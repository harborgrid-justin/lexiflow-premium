
import React from 'react';
import { FormattingRule } from '../../../types/pleadingTypes';
import { cn } from '../../../utils/cn';
import { useTheme } from '../../../context/ThemeContext';

interface PleadingPaperProps {
    rules: FormattingRule;
    children: React.ReactNode;
    className?: string;
}

export const PleadingPaper: React.FC<PleadingPaperProps> = ({ rules, children, className }) => {
    const { theme } = useTheme();

    // Generate line numbers (usually 1-28 for pleading paper)
    const lineNumbers = Array.from({ length: 28 }, (_, i) => i + 1);

    return (
        <div 
            className={cn("shadow-2xl relative overflow-hidden transition-all duration-500 ease-in-out print:shadow-none print:m-0", theme.surface.default, theme.text.primary, className)}
            style={{
                width: '8.5in',
                minHeight: '11in',
                paddingTop: rules.marginTop,
                paddingBottom: rules.marginBottom,
                paddingLeft: rules.marginLeft,
                paddingRight: rules.marginRight,
                fontFamily: rules.fontFamily,
                fontSize: `${rules.fontSize}pt`,
                lineHeight: rules.lineHeight,
            }}
        >
            {/* Pleading Margins (Visual Guide) */}
            {rules.showLineNumbers && (
                <div className={cn("absolute top-0 left-0 bottom-0 w-[1in] border-r-2 border-double flex flex-col items-center pt-[1in] pointer-events-none select-none print:border-black", theme.border.default)}>
                    {lineNumbers.map(n => (
                        <div key={n} className={cn("h-[2em] flex items-center justify-center w-full text-xs print:text-black", theme.text.tertiary)}>
                            {n}
                        </div>
                    ))}
                </div>
            )}
            
            {/* Right Margin Guide (Visual Only) */}
            <div className={cn("absolute top-0 right-[0.5in] bottom-0 w-px border-r pointer-events-none print:hidden", theme.border.subtle)}></div>

            {/* Content Container */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};
