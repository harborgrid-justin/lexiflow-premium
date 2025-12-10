import React from 'react';
import { JurisdictionGeoMap } from '../jurisdiction/JurisdictionGeoMap';
import { Card } from '../common/Card';
import { STATE_JURISDICTIONS, StateJurisdiction } from '../../data/federalHierarchy';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { MapPin, Book } from 'lucide-react';

export const LocalRulesMap: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 h-full min-h-[500px] border rounded-lg shadow-sm overflow-hidden relative">
                <JurisdictionGeoMap />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg max-w-xs">
                    <h4 className="font-bold text-sm mb-2">Interactive Map</h4>
                    <p className="text-xs text-slate-600">Select a jurisdiction node to view local rules, fee schedules, and e-filing requirements.</p>
                </div>
            </div>
            
            <div className="flex flex-col gap-6 overflow-hidden">
                <Card title="Active Jurisdictions" className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        {(Object.values(STATE_JURISDICTIONS) as StateJurisdiction[]).map(state => (
                            <div key={state.id} className="border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 rounded-full text-green-700"><MapPin className="h-4 w-4"/></div>
                                    <h4 className={cn("font-bold", theme.text.primary)}>{state.name}</h4>
                                </div>
                                <div className="pl-11 space-y-1">
                                    {state.levels.slice(0,2).map((lvl, i) => (
                                        <div key={i} className="text-xs text-slate-600 flex items-center gap-2">
                                            <Book className="h-3 w-3 opacity-50"/>
                                            {lvl.name} Rules
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                         <div className="border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer group border-blue-200 bg-blue-50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 rounded-full text-blue-700"><MapPin className="h-4 w-4"/></div>
                                    <h4 className={cn("font-bold", theme.text.primary)}>Federal: 9th Circuit</h4>
                                </div>
                                <div className="pl-11 space-y-1">
                                    <div className="text-xs text-slate-600 flex items-center gap-2">
                                        <Book className="h-3 w-3 opacity-50"/>
                                        Local Rules (N.D. Cal)
                                    </div>
                                    <div className="text-xs text-slate-600 flex items-center gap-2">
                                        <Book className="h-3 w-3 opacity-50"/>
                                        Local Rules (C.D. Cal)
                                    </div>
                                </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};