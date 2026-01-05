
import React from 'react';
import { Card } from '../common/Card.tsx';

export const KnowledgeGraph: React.FC = () => {
    return (
        <Card title="Case Entity Graph">
            <div className="h-[500px] bg-slate-50 relative overflow-hidden rounded-lg border border-slate-200 flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]"></div>
                
                {/* Simulated Graph Nodes */}
                <div className="relative w-full h-full">
                    {/* Center Node */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xl border-4 border-blue-100">TechCorp</div>
                    </div>
                    
                    {/* Connecting Lines (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="#cbd5e1" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="70%" y2="30%" stroke="#cbd5e1" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#cbd5e1" strokeWidth="2" />
                    </svg>

                    {/* Surrounding Nodes */}
                    <div className="absolute top-[30%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-12 h-12 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md">J. Doe</div>
                        <span className="text-[9px] bg-white px-1 rounded mt-1 shadow-sm">Plaintiff</span>
                    </div>

                    <div className="absolute top-[30%] left-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-12 h-12 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md">Contract</div>
                        <span className="text-[9px] bg-white px-1 rounded mt-1 shadow-sm">Exhibit A</span>
                    </div>

                    <div className="absolute top-[80%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-12 h-12 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md">Incident</div>
                        <span className="text-[9px] bg-white px-1 rounded mt-1 shadow-sm">Jul 4th</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
                Visualizing relationships between Parties, Documents, and Events extracted from discovery material.
            </div>
        </Card>
    );
};
