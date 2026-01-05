
import React, { useState, useTransition } from 'react';
import { Button } from '../common/Button.tsx';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export const StageEditor: React.FC = () => {
  const [stages, setStages] = useState(['Intake', 'Discovery', 'Pre-Trial', 'Trial', 'Closing']);
  const [isPending, startTransition] = useTransition();

  const removeStage = (index: number) => {
    startTransition(() => {
        setStages(stages.filter((_, i) => i !== index));
    });
  };

  const addStage = () => {
    startTransition(() => {
        setStages([...stages, 'New Stage']);
    });
  };

  return (
    <div className={`p-4 bg-slate-50 rounded-lg border border-slate-200 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
      <h4 className="font-bold text-slate-900 mb-3">Edit Workflow Stages</h4>
      <div className="space-y-2">
        {stages.map((stage, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200 shadow-sm group">
            <GripVertical className="h-4 w-4 text-slate-300 cursor-move" />
            <input 
              className="flex-1 text-sm bg-transparent outline-none font-medium text-slate-700"
              defaultValue={stage}
            />
            <button onClick={() => removeStage(idx)} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" icon={Plus} onClick={addStage} className="w-full border border-dashed border-slate-300">
          Add Stage
        </Button>
      </div>
    </div>
  );
};
