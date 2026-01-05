
import React from 'react';
import { Card } from '../common/Card.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';
import { FileText, Mic, CheckCircle, AlertTriangle } from 'lucide-react';

export const WitnessPrep: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                <Card title="Witness List">
                    <div className="space-y-2">
                        {['John Doe', 'Jane Smith', 'Dr. Aris'].map((name, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200">
                                <UserAvatar name={name} size="sm"/>
                                <div>
                                    <div className="text-sm font-bold">{name}</div>
                                    <div className="text-xs text-slate-500">{i === 2 ? 'Expert' : 'Fact'} Witness</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            
            <div className="md:col-span-2 space-y-6">
                <Card title="Examination Outline: John Doe">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 uppercase border-b pb-1 mb-2">I. Introduction & Background</h4>
                            <ul className="list-disc pl-5 text-sm space-y-2 text-slate-700">
                                <li>State name and current occupation.</li>
                                <li>Relationship to the defendant (Tenure: 5 years).</li>
                                <li className="flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-amber-500"/>
                                    <span>Review Exhibit 12 (Employment Contract) - Focus on NDA clause.</span>
                                </li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="text-sm font-bold text-slate-800 uppercase border-b pb-1 mb-2">II. The Incident</h4>
                            <ul className="list-disc pl-5 text-sm space-y-2 text-slate-700">
                                <li>Where were you on the night of July 4th?</li>
                                <li>Did you communicate with Mr. Smith?</li>
                                <li className="bg-blue-50 p-2 rounded border border-blue-100">
                                    <span className="font-bold text-blue-800 text-xs block mb-1">Impeachment Opportunity</span>
                                    Compare with Deposition Page 42, Line 12. Contradiction regarding time of arrival.
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
