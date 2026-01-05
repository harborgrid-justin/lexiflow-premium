
import React from "react";
import { useStrategy } from "../../logic/useStrategy.js";
import { BookOpen, Target, Shield, Plus, Scale } from "lucide-react";
import { Card } from "../common/Card.tsx";
import { Button } from "../common/Button.tsx";

export const CaseStrategy = () => {
  const { citations, argumentsList, addCitation, addArgument } = useStrategy();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="text-blue-600"/> Legal Strategy
          </h3>
          <p className="text-sm text-slate-500 font-medium">Precedent mapping and argument synthesis.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Plus}>Add Citation</Button>
          <Button variant="primary" size="sm" icon={Target}>New Argument</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
            <Target className="text-blue-600" size={14}/> Primary Arguments
          </h4>
          {argumentsList.map(arg => (
            <Card key={arg.id} title={arg.title} className="border-l-4 border-l-blue-500">
              <p className="text-xs text-slate-600">{arg.description}</p>
            </Card>
          ))}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
            <Scale className="text-purple-600" size={14}/> Citations & Authority
          </h4>
          <div className="bg-white border rounded-xl divide-y divide-slate-100 overflow-hidden shadow-sm">
            {citations.map(cit => (
               <div key={cit.id} className="p-4 hover:bg-slate-50">
                  <span className="text-blue-700 font-serif italic font-bold">{cit.citation}</span>
                  <p className="text-xs text-slate-500 mt-1">{cit.title}</p>
               </div>
            ))}
            {citations.length === 0 && <div className="p-12 text-center text-slate-400 italic">No citations linked.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
