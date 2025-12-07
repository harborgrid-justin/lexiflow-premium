
import React from 'react';
import { SearchResult } from '../../types';
import { ExternalLink } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface ResearchResultCardProps {
    source: SearchResult;
    onView: () => void;
}

export const ResearchResultCard: React.FC<ResearchResultCardProps> = ({ source, onView }) => {
    const { theme } = useTheme();

    return (
        <div 
            className={cn(
                "p-4 rounded-lg border transition-colors shadow-sm flex flex-col group cursor-pointer",
                theme.surface,
                theme.border.default,
                `hover:${theme.primary.border}`
            )}
            onClick={onView}
        >
            <div className="flex justify-between items-start">
                <div className={cn("text-sm font-bold hover:underline line-clamp-1 flex items-center", theme.primary.text)}>
                    {source.title} <ExternalLink className="h-3 w-3 ml-2 opacity-50"/>
                </div>
                <Badge variant="neutral">Web Source</Badge>
            </div>
            <p className={cn("text-xs mt-1 line-clamp-1 font-mono", theme.text.tertiary)}>{source.url}</p>
            <p className={cn("text-xs mt-2 line-clamp-2", theme.text.secondary)}>{source.snippet}</p>
        </div>
    );
};
