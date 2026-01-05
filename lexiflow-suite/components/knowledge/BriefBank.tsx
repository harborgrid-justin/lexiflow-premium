
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Search, FileText, Tag, Filter } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const BriefBank: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-xl text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Firm Knowledge & Brief Bank</h2>
                <div className="max-w-2xl mx-auto relative">
                    <input className="w-full py-3 pl-12 pr-4 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search precedents, motions, and memos..."/>
                    <Search className="absolute left-4 top-3.5 text-slate-400 h-5 w-5"/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2"><Filter size={16}/> Filters</h4>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Practice Area</label>
                                <select className="w-full text-sm border rounded p-2"><option>Litigation</option><option>Corporate</option></select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Document Type</label>
                                <select className="w-full text-sm border rounded p-2"><option>Motion</option><option>Memo</option><option>Agreement</option></select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Jurisdiction</label>
                                <select className="w-full text-sm border rounded p-2"><option>Federal</option><option>California</option><option>New York</option></select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <h4 className="font-bold text-slate-700">Top Results</h4>
                    {[1, 2, 3].map(i => (
                        <Card key={i} noPadding className="hover:border-blue-300 transition-colors cursor-pointer">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="text-blue-600 h-5 w-5"/>
                                        <h5 className="font-bold text-slate-900 text-sm">Motion for Summary Judgment - Employment Discrimination</h5>
                                    </div>
                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold border border-green-100">Won</span>
                                </div>
                                <p className="text-xs text-slate-600 mb-3 line-clamp-2">Successful MSJ arguing lack of pretext in age discrimination claim. Includes detailed analysis of McDonnell Douglas framework.</p>
                                <div className="flex gap-2">
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600"><Tag size={10}/> Discrimination</span>
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600"><Tag size={10}/> Federal</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
