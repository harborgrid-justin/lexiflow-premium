import React, { useRef, useEffect, useState } from 'react';
import { FormattingRule } from '@/types';
import { cn } from '@/utils/cn';

interface PleadingPaperProps {
    rules: FormattingRule;
    children: React.ReactNode;
    className?: string;
}

const PleadingPaper: React.FC<PleadingPaperProps> = ({ rules, children, className }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [lineNumbers, setLineNumbers] = useState<number[]>([]);
    
    // Calculate actual line numbers based on content height
    useEffect(() => {
        if (!contentRef.current || !rules.showLineNumbers) return;
        
        const updateLineNumbers = () => {
            const contentHeight = contentRef.current!.scrollHeight;
            const lineHeight = parseFloat(rules.fontSize.toString()) * parseFloat(rules.lineHeight.toString());
            const lineCount = Math.ceil(contentHeight / lineHeight);
            
            // Generate line numbers array
            const numbers = Array.from({ length: Math.max(lineCount, 28) }, (_, i) => i + 1);
            setLineNumbers(numbers);
        };
        
        // Initial calculation
        updateLineNumbers();
        
        // Create a ResizeObserver to recalculate when content changes
        const resizeObserver = new ResizeObserver(() => {
            updateLineNumbers();
        });
        
        resizeObserver.observe(contentRef.current);
        
        return () => {
            resizeObserver.disconnect();
        };
    }, [rules.fontSize, rules.lineHeight, rules.showLineNumbers, children]);

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
            {/* Pleading Margins (Visual Guide) - Dynamic Line Numbers */}
            {rules.showLineNumbers && lineNumbers.length > 0 && (
                <div 
                    className="absolute top-0 left-0 border-r-2 border-double border-slate-300 flex flex-col pointer-events-none select-none print:border-black"
                    style={{ 
                        paddingTop: rules.marginTop, 
                        width: rules.marginLeft,
                        height: 'fit-content'
                    }}
                >
                    {lineNumbers.map(n => (
                        <div 
                            key={n} 
                            style={{ 
                                height: `calc(${rules.fontSize}pt * ${rules.lineHeight})`,
                                lineHeight: `calc(${rules.fontSize}pt * ${rules.lineHeight})`
                            }} 
                            className="flex items-center justify-center w-full text-xs text-slate-400 print:text-black"
                        >
                            {n}
                        </div>
                    ))}
                </div>
            )}
            
            <div 
                ref={contentRef}
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
