
import React, { useState } from 'react';
import { Search, Plus, X, Filter } from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { Card } from '../common/Card.tsx';

export const AdvancedSearch: React.FC = () => {
  const [terms, setTerms] = useState([{ field: 'All Fields', op: 'Contains', value: '' }]);

  const addTerm = () => setTerms([...terms, { field: 'All Fields', op: 'Contains', value: '' }]);
  const removeTerm = (idx: number) => setTerms(terms.filter((_, i) => i !== idx));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Advanced Query Builder</h2>
            <p className="text-slate-500">Construct complex boolean searches across all case data.</p>
        </div>

        <Card className="overflow-visible">
            <div className="space-y-4 p-4">
                {terms.map((term, i) => (
                    <div key={i} className="flex items-center gap-2">
                        {i > 0 && (
                            <select className="w-20 p-2 border rounded bg-slate-50 text-sm font-bold">
                                <option>AND</option>
                                <option>OR</option>
                                <option>NOT</option>
                            </select>
                        )}
                        <select className="w-40 p-2 border rounded bg-white text-sm">
                            <option>All Fields</option>
                            <option>Case Name</option>
                            <option>Document Content</option>
                            <option>Date Filed</option>
                            <option>Judge</option>
                        </select>
                        <select className="w-32 p-2 border rounded bg-white text-sm">
                            <option>Contains</option>
                            <option>Exact Match</option>
                            <option>Starts With</option>
                            <option>Is Empty</option>
                        </select>
                        <input className="flex-1 p-2 border rounded text-sm" placeholder="Value..."/>
                        <button onClick={() => removeTerm(i)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                    </div>
                ))}
                
                <button onClick={addTerm} className="flex items-center gap-1 text-sm text-blue-600 font-bold hover:bg-blue-50 px-2 py-1 rounded w-fit">
                    <Plus size={14}/> Add Condition
                </button>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Filter size={16}/>
                    <span>Filters: <span className="bg-white border px-1 rounded mx-1">Open Cases</span> <span className="bg-white border px-1 rounded">Last 1 Year</span></span>
                </div>
                <Button variant="primary" icon={Search} size="lg">Run Search</Button>
            </div>
        </Card>

        <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Saved Queries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3].map(i => (
                    <div key={i} className="bg-white p-3 border rounded-lg hover:border-blue-300 cursor-pointer shadow-sm flex justify-between items-center">
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Summary Judgment Precendents</div>
                            <div className="text-xs text-slate-500 font-mono mt-1">type:Motion AND status:Granted AND text:"summary judgment"</div>
                        </div>
                        <Button size="sm" variant="ghost">Run</Button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
