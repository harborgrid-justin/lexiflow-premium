
import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';

interface RegionMapProps {
  primaryRegion: string;
}

export const RegionMap: React.FC<RegionMapProps> = ({ primaryRegion }) => {
  const { theme, mode } = useTheme();
  const gridColor = mode === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className={cn("relative h-96 rounded-xl p-8 overflow-hidden flex items-center justify-center border shadow-2xl", theme.surface, theme.border.default)}>
        <div 
            className="absolute inset-0 opacity-20"
            style={{
                backgroundImage: `radial-gradient(${gridColor} 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
            }}
        ></div>
        
        <div className="flex items-center gap-16 relative z-10">
            <div className="text-center group">
                <div className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center shadow-lg mb-4 transition-all duration-500",
                    primaryRegion === 'US-East' 
                        ? cn(theme.primary.DEFAULT, "shadow-blue-500/50 scale-110 border-4 border-blue-400") 
                        : cn(theme.surfaceHighlight, "border-2", theme.border.default)
                )}>
                    <Globe className={cn("h-12 w-12", primaryRegion === 'US-East' ? theme.text.inverse : theme.text.tertiary)}/>
                </div>
                <p className={cn("font-bold text-lg", theme.text.primary)}>US-East</p>
                <p className={cn("text-xs mt-1 font-mono uppercase tracking-wide", primaryRegion === 'US-East' ? theme.status.success.text : theme.text.secondary)}>
                    {primaryRegion === 'US-East' ? 'Primary (Read/Write)' : 'Replica (Read-Only)'}
                </p>
            </div>

            <div className="flex flex-col gap-2 items-center">
                <div className={cn("h-1 w-48 rounded-full overflow-hidden relative", theme.surfaceHighlight)}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 animate-shimmer" style={{backgroundSize: '200% 100%'}}></div>
                </div>
                <span className={cn("text-xs text-center flex items-center justify-center px-3 py-1 rounded-full border", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
                    <ArrowRight className={cn("h-3 w-3 mr-1", theme.status.success.text)}/> 12ms Lag
                </span>
            </div>

            <div className="text-center group">
                <div className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center shadow-lg mb-4 transition-all duration-500",
                    primaryRegion === 'EU-West' 
                        ? cn(theme.primary.DEFAULT, "shadow-blue-500/50 scale-110 border-4 border-blue-400") 
                        : cn(theme.surfaceHighlight, "border-2", theme.border.default)
                )}>
                    <Globe className={cn("h-12 w-12", primaryRegion === 'EU-West' ? theme.text.inverse : theme.text.tertiary)}/>
                </div>
                <p className={cn("font-bold text-lg", theme.text.primary)}>EU-West</p>
                <p className={cn("text-xs mt-1 font-mono uppercase tracking-wide", primaryRegion === 'EU-West' ? theme.status.success.text : theme.text.secondary)}>
                    {primaryRegion === 'EU-West' ? 'Primary (Read/Write)' : 'Replica (Read-Only)'}
                </p>
            </div>
        </div>
    </div>
  );
};
