
import React from 'react';
import { Globe, ArrowRight, Server, Wifi } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';

interface RegionMapProps {
  primaryRegion: string;
}

export const RegionMap: React.FC<RegionMapProps> = ({ primaryRegion }) => {
  const { theme, mode } = useTheme();
  const gridColor = mode === 'dark' ? '#334155' : '#e2e8f0';
  const isPrimaryEast = primaryRegion === 'US-East';

  return (
    <div className={cn("relative h-96 rounded-xl p-8 overflow-hidden flex items-center justify-center border shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white", theme.border.default)}>
        {/* Background Grid */}
        <div 
            className="absolute inset-0 opacity-10"
            style={{
                backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
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
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={cn(
                    "w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 relative border-4 bg-slate-900",
                    isPrimaryEast ? "border-blue-500 shadow-blue-500/50 scale-110" : "border-slate-600 opacity-80"
                )}>
                    <Server className={cn("h-10 w-10 mb-1", isPrimaryEast ? "text-blue-400" : "text-slate-500")}/>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">US-East</span>
                </div>
                {isPrimaryEast && <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">PRIMARY</div>}
            </div>

            {/* Connection Pipeline */}
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full relative overflow-hidden mx-4 max-w-xs">
                {/* Data Packets Animation */}
                <div className={cn("absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50", isPrimaryEast ? "animate-data-stream" : "animate-data-stream-reverse")}></div>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2 shadow-sm z-10">
                    <Wifi className="h-3 w-3 text-green-400 animate-pulse"/>
                    <span className="text-[10px] font-mono text-green-400 font-bold">12ms</span>
                </div>
            </div>

            {/* EU West Node */}
            <div className="text-center relative group">
                 <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={cn(
                    "w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 relative border-4 bg-slate-900",
                    !isPrimaryEast ? "border-purple-500 shadow-purple-500/50 scale-110" : "border-slate-600 opacity-80"
                )}>
                    <Server className={cn("h-10 w-10 mb-1", !isPrimaryEast ? "text-purple-400" : "text-slate-500")}/>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">EU-West</span>
                </div>
                {!isPrimaryEast && <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">PRIMARY</div>}
            </div>
        </div>
    </div>
  );
};
