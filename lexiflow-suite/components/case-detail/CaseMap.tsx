
import React from 'react';
import { Card } from '../common/Card.tsx';
import { MapPin } from 'lucide-react';

export const CaseMap: React.FC = () => {
    return (
        <Card title="Geographic Case Data" className="h-[600px] flex flex-col">
            <div className="flex-1 bg-slate-100 relative rounded-lg border border-slate-200 overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <p className="text-sm font-medium">Interactive Map Component Placeholder</p>
                </div>
                
                {/* Mock Markers */}
                <div className="absolute top-1/3 left-1/4 group cursor-pointer">
                    <MapPin className="text-red-600 h-8 w-8 drop-shadow-md hover:-translate-y-1 transition-transform"/>
                    <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap hidden group-hover:block z-10">
                        Accident Site
                    </div>
                </div>

                <div className="absolute bottom-1/3 right-1/3 group cursor-pointer">
                    <MapPin className="text-blue-600 h-8 w-8 drop-shadow-md hover:-translate-y-1 transition-transform"/>
                    <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap hidden group-hover:block z-10">
                        TechCorp HQ
                    </div>
                </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs">
                <div className="flex items-center gap-1"><MapPin size={12} className="text-red-600"/> Incident Location</div>
                <div className="flex items-center gap-1"><MapPin size={12} className="text-blue-600"/> Party Address</div>
                <div className="flex items-center gap-1"><MapPin size={12} className="text-green-600"/> Court</div>
            </div>
        </Card>
    );
};
