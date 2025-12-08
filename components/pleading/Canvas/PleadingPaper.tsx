
import React from 'react';
import { FormattingRule } from '../../../types/pleadingTypes';
import { cn } from '../../../utils/cn';

interface PleadingPaperProps {
    rules: FormattingRule;
    children: React.ReactNode;
    className?: string;
}

export const PleadingPaper: React.FC<PleadingPaperProps> = ({ rules, children, className }) => {
    
    // Generate line numbers (usually 1-28 for pleading paper)
    const lineNumbers = Array.from({ length: 28 }, (_, i) => i + 1);

    return (
        <div 
            className={cn("bg-white shadow-2xl relative overflow-hidden transition-all duration-500 ease-in-out print:shadow-none print:m-0", className)}
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
                color: 'black'
            }}
        >
            {/* Pleading Margins (Visual Guide) */}
            {rules.showLineNumbers && (
                <div className="absolute top-0 left-0 bottom-0 w-[1in] border-r-2 border-double border-slate-300 flex flex-col items-center pt-[1in] pointer-events-none select-none print:border-black">
                    {lineNumbers.map(n => (
                        <div key={n} className="h-[2em] flex items-center justify-center w-full text-xs text-slate-400 print:text-black">
                            {n}
                        </div>
                    ))}
                </div>
            )}
            
            {/* Right Margin Guide (Visual Only) */}
            <div className="absolute top-0 right-[0.5in] bottom-0 w-px border-r border-slate-200 pointer-events-none print:hidden"></div>

            {/* Content Container */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};
