import React from 'react';
import { FormattingRule } from '../../../types';
import { cn } from '../../../utils/cn';
import { PleadingPaperProps } from '../types';

const PleadingPaper: React.FC<PleadingPaperProps> = ({ rules, children, className }) => {
    
    // Generate line numbers (usually 1-28 for pleading paper)
    const lineNumbers = Array.from({ length: 28 }, (_, i) => i + 1);

    return (
        <div 
            className={cn("bg-white shadow-2xl relative mx-auto", className)}
            style={{
                width: '8.5in',
                minHeight: '11in',
                fontFamily: rules.fontFamily,
                fontSize: `${rules.fontSize}pt`,
                lineHeight: rules.lineHeight,
                color: 'black'
            }}
        >
            {/* Pleading Margins (Visual Guide) */}
            {rules.showLineNumbers && (
                <div 
                    className="absolute top-0 left-0 bottom-0 border-r-2 border-double border-slate-300 flex flex-col items-center pointer-events-none select-none print:border-black"
                    style={{ paddingTop: rules.marginTop, width: rules.marginLeft }}
                >
                    {lineNumbers.map(n => (
                        <div key={n} style={{ height: `calc(${rules.fontSize}pt * ${rules.lineHeight})`}} className="flex items-center justify-center w-full text-xs text-slate-400 print:text-black">
                            {n}
                        </div>
                    ))}
                </div>
            )}
            
            <div 
                className="relative z-10 h-full"
                style={{
                    paddingTop: rules.marginTop,
                    paddingBottom: rules.marginBottom,
                    paddingLeft: rules.marginLeft,
                    paddingRight: rules.marginRight,
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PleadingPaper;
