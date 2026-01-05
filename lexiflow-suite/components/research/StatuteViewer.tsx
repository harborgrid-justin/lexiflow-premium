
import React from 'react';
import { Book, ChevronRight, Search, Bookmark, FileText } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const StatuteViewer: React.FC = () => {
  return (
    <div className="flex h-[600px] border border-slate-200 rounded-lg bg-white overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
            <div className="p-3 border-b border-slate-200">
                <div className="relative">
                    <Search className="absolute left-2 top-2 h-3 w-3 text-slate-400"/>
                    <input className="w-full pl-7 pr-2 py-1.5 text-xs border rounded bg-white" placeholder="Search code..."/>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 text-xs">
                <div className="font-bold text-slate-700 mb-2 px-2">US Code Title 11</div>
                {[101, 102, 103, 104, 105].map(s => (
                    <div key={s} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${s === 101 ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-slate-100 text-slate-600'}`}>
                        <FileText size={12}/>
                        Section {s}
                    </div>
                ))}
                <div className="font-bold text-slate-700 mt-4 mb-2 px-2">US Code Title 28</div>
                {[1331, 1332, 1441, 1446].map(s => (
                    <div key={s} className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-100 text-slate-600">
                        <FileText size={12}/>
                        Section {s}
                    </div>
                ))}
            </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                <div>
                    <div className="flex items-center text-xs text-slate-500 mb-2">
                        <span>US Code</span> <ChevronRight size={12} className="mx-1"/> <span>Title 11</span> <ChevronRight size={12} className="mx-1"/> <span>Chapter 1</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">11 U.S.C. § 101 - Definitions</h2>
                </div>
                <Button variant="outline" size="sm" icon={Bookmark}>Save Section</Button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 prose prose-sm max-w-none text-slate-800">
                <p>In this title the following definitions shall apply:</p>
                <p>(1) The term "accountant" means accountant authorized under applicable law to practice public accounting, and includes professional accounting association, corporation, or partnership, if so authorized.</p>
                <p>(2) The term "affiliate" means—</p>
                <ul className="list-none pl-4">
                    <li>(A) entity that directly or indirectly owns, controls, or holds with power to vote, 20 percent or more of the outstanding voting securities of the debtor...</li>
                    <li>(B) corporation 20 percent or more of whose outstanding voting securities are directly or indirectly owned, controlled, or held with power to vote, by the debtor...</li>
                </ul>
            </div>
        </div>
    </div>
  );
};
