
import React from 'react';
import { Card } from '../common/Card.tsx';
import { ProgressBar } from '../common/ProgressBar.tsx';
import { CheckCircle, Clock, Award } from 'lucide-react';

export const CLETracker: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-purple-100 rounded-full text-purple-700"><Award size={32}/></div>
                    <div>
                        <h3 className="font-bold text-xl text-slate-900">Compliance Status: <span className="text-amber-600">At Risk</span></h3>
                        <p className="text-sm text-slate-500">Deadline: Jan 31, 2025 (4 months left)</p>
                    </div>
                </div>
                <div className="w-full md:w-1/3">
                    <ProgressBar label="Total Credits" value={65} showValue/>
                    <p className="text-xs text-right mt-1 text-slate-400">16 / 25 Credits Earned</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Requirements Breakdown">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-700">Ethics</span>
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">4/4 Complete</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-700">Competence</span>
                            <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded">0/1 Missing</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-700">Elimination of Bias</span>
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">2/2 Complete</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-700">General</span>
                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">10/18 In Progress</span>
                        </div>
                    </div>
                </Card>

                <Card title="Recent Certificates" className="md:col-span-2">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100">
                            <CheckCircle className="text-green-500 h-5 w-5"/>
                            <div className="flex-1">
                                <h5 className="font-bold text-sm">Advanced E-Discovery Tactics</h5>
                                <p className="text-xs text-slate-500">Provider: PLI • Date: Oct 10, 2024</p>
                            </div>
                            <span className="font-mono font-bold text-slate-700">1.5 Cr</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100">
                            <CheckCircle className="text-green-500 h-5 w-5"/>
                            <div className="flex-1">
                                <h5 className="font-bold text-sm">Legal Ethics in AI</h5>
                                <p className="text-xs text-slate-500">Provider: State Bar • Date: Sep 15, 2024</p>
                            </div>
                            <span className="font-mono font-bold text-slate-700">1.0 Cr</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
