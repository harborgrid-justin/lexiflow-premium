
import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const StageEditor: React.FC = () => {
  const { theme } = useTheme();
  const [stages, setStages] = useState(['Intake', 'Discovery', 'Pre-Trial', 'Trial', 'Closing']);

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const addStage = () => {
    setStages([...stages, 'New Stage']);
  };

  return (
    <div className={cn("p-4 rounded-lg border", theme.surfaceHighlight, theme.border.default)}>
      <h4 className={cn("font-bold mb-3", theme.text.primary)}>Edit Workflow Stages</h4>
      <div className="space-y-2">
        {stages.map((stage, idx) => (
          <div key={idx} className={cn("flex items-center gap-2 p-2 rounded border shadow-sm group", theme.surface.default, theme.border.default)}>
            <GripVertical className={cn("h-4 w-4 cursor-move", theme.text.tertiary)} />
            <input 
              className={cn("flex-1 text-sm bg-transparent outline-none font-medium", theme.text.primary)}
              defaultValue={stage}
            />
            <button onClick={() => removeStage(idx)} className={cn("p-1 opacity-0 group-hover:opacity-100 transition-opacity", theme.text.tertiary, `hover:${theme.status.error.text}`)}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" icon={Plus} onClick={addStage} className={cn("w-full border border-dashed", theme.border.default)}>
          Add Stage
        </Button>
      </div>
    </div>
  );
};
