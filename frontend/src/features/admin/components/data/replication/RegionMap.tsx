
import React from 'react';
import { Globe, ArrowRight, Server, Wifi } from 'lucide-react';
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '@/utils/cn';

interface RegionMapProps {
  primaryRegion: string;
}

export const RegionMap: React.FC<RegionMapProps> = ({ primaryRegion }) => {
  const { theme, mode } = useTheme();
  const isPrimaryEast = primaryRegion === 'US-East';

  return (
    <div className={cn("relative h-96 rounded-xl p-8 overflow-hidden flex items-center justify-center border shadow-2xl", theme.surface.overlay, theme.border.default, theme.text.primary)}>
        {/* Background Grid */}
        <div 
            className="absolute inset-0 opacity-10"
            style={{
                backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
                backgroundSize: '30px 30px'
            }}
        ></div>
        
        {/* World Map Stylized (SVG Overlay could go here, using CSS for now) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
             <Globe className="w-96 h-96"/>
        </div>

        <div className="flex items-center gap-32 relative z-10 w-full max-w-4xl justify-center">
            {/* US East Node */}
            <div className="text-center relative group">
                <div className={cn("absolute -inset-4 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity", theme.primary.light)}></div>
                <div className={cn(
                    "w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 relative border-4",
                    theme.surface.default,
                    isPrimaryEast ? cn(theme.border.focused, "scale-110") : cn(theme.border.default, "opacity-80")
                )}>
                    <Server className={cn("h-10 w-10 mb-1", isPrimaryEast ? theme.primary.text : theme.text.tertiary)}/>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme.text.secondary)}>US-East</span>
                </div>
                {isPrimaryEast && <div className={cn("absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg", theme.action.primary.bg, theme.action.primary.text)}>PRIMARY</div>}
            </div>

            {/* Connection Pipeline */}
            <div className={cn("flex-1 h-2 rounded-full relative overflow-hidden mx-4 max-w-xs", theme.surface.highlight)}>
                {/* Data Packets Animation */}
                <div className={cn("absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-current to-transparent opacity-50", theme.text.link, isPrimaryEast ? "animate-data-stream" : "animate-data-stream-reverse")}></div>
                
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full border flex items-center gap-2 shadow-sm z-10", theme.surface.default, theme.border.default)}>
                    <Wifi className={cn("h-3 w-3 animate-pulse", theme.status.success.text)}/>
                    <span className={cn("text-[10px] font-mono font-bold", theme.status.success.text)}>12ms</span>
                </div>
            </div>

            {/* EU West Node */}
            <div className="text-center relative group">
                 <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={cn(
                    "w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 relative border-4",
                    theme.surface.default,
                    !isPrimaryEast ? "border-purple-500 shadow-purple-500/50 scale-110" : cn(theme.border.default, "opacity-80")
                )}>
                    <Server className={cn("h-10 w-10 mb-1", !isPrimaryEast ? "text-purple-400" : theme.text.tertiary)}/>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme.text.secondary)}>EU-West</span>
                </div>
                {!isPrimaryEast && <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">PRIMARY</div>}
            </div>
        </div>
    </div>
  );
};
