import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

export const TypewriterText: React.FC<{ text?: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    const { theme } = useTheme();
    const index = useRef(0);

    useEffect(() => {
        if (!text) {
            setDisplayedText('');
            return;
        }

        setDisplayedText('');
        index.current = 0;

        const intervalId = setInterval(() => {
            if (index.current < text.length) {
                // Add chunks for faster "streaming" feel
                const chunk = text.slice(index.current, index.current + 3);
                setDisplayedText((prev) => prev + chunk);
                index.current += 3;
            } else {
                clearInterval(intervalId);
            }
        }, 15); // Speed of typing

        return () => clearInterval(intervalId);
    }, [text]);

    if (!text) {
        return null;
    }

    return (
        <div className={cn("prose prose-sm max-w-none leading-relaxed whitespace-pre-line font-serif", theme.text.primary)}>
            {displayedText}
            {index.current < text.length && <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse align-middle"></span>}
        </div>
    );
};
