import React, { useState, useCallback } from 'react';
import { Workflow, WorkflowStep, StepType, WorkflowTriggerType } from './types';

/**
 * WorkflowBuilder Component
 * Visual drag-and-drop workflow builder interface
 */
export const WorkflowBuilder: React.FC = () => {
  const [workflow, setWorkflow] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    trigger: WorkflowTriggerType.MANUAL,
    active: false,
    tags: [],
  });

  const [steps, setSteps] = useState<Partial<WorkflowStep>[]>([]);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const handleAddStep = useCallback((type: StepType) => {
    const newStep: Partial<WorkflowStep> = {
      name: `New ${type} Step`,
      type,
      order: steps.length,
      required: true,
      allowSkip: false,
      retryCount: 0,
      config: {},
    };

    setSteps([...steps, newStep]);
  }, [steps]);

  const handleUpdateStep = useCallback((index: number, updates: Partial<WorkflowStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
  }, [steps]);

  const handleRemoveStep = useCallback((index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Reorder steps
    newSteps.forEach((step, i) => {
      step.order = i;
    });
    setSteps(newSteps);
    setSelectedStep(null);
  }, [steps]);

  const handleMoveStep = useCallback((fromIndex: number, toIndex: number) => {
    const newSteps = [...steps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    // Reorder
    newSteps.forEach((step, i) => {
      step.order = i;
    });
    setSteps(newSteps);
  }, [steps]);

  const handleSave = async () => {
    try {
      const workflowData = {
        ...workflow,
        steps,
      };

      // API call would go here
      // await fetch('/api/workflows', { method: 'POST', body: workflowData });

      alert('Workflow saved successfully!');
      window.location.href = '/workflows';
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    }
  };

  const stepTypes = Object.values(StepType);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Step Library */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Step Types</h3>
        <div className="space-y-2">
          {stepTypes.map((type) => (
            <button
              key={type}
              className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200"
              onClick={() => handleAddStep(type)}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Center Panel - Workflow Canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Workflow Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Workflow Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workflow Name
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={workflow.trigger}
                onChange={(e) => setWorkflow({ ...workflow, trigger: e.target.value as WorkflowTriggerType })}
              >
                {Object.values(WorkflowTriggerType).map((trigger) => (
                  <option key={trigger} value={trigger}>
                    {trigger.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                value={workflow.description}
                onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                placeholder="Describe your workflow"
              />
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Workflow Steps</h2>

          {steps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No steps added yet</p>
              <p className="text-sm mt-2">Drag a step type from the left panel to begin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedStep === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStep(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveStep(index, index - 1);
                          }}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveStep(index, index + 1);
                          }}
                          disabled={index === steps.length - 1}
                        >
                          ↓
                        </button>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Step {index + 1}</span>
                        <h4 className="font-medium text-gray-900">{step.name}</h4>
                        <span className="text-sm text-gray-600">{step.type}</span>
                      </div>
                    </div>
                    <button
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStep(index);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => window.location.href = '/workflows'}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={handleSave}
          >
            Save Workflow
          </button>
        </div>
      </div>

      {/* Right Panel - Step Configuration */}
      {selectedStep !== null && (
        <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Step Configuration</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Name
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={steps[selectedStep].name}
                onChange={(e) => handleUpdateStep(selectedStep, { name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                value={steps[selectedStep].description || ''}
                onChange={(e) => handleUpdateStep(selectedStep, { description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={steps[selectedStep].required}
                onChange={(e) => handleUpdateStep(selectedStep, { required: e.target.checked })}
              />
              <label htmlFor="required" className="text-sm text-gray-700">
                Required Step
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowSkip"
                checked={steps[selectedStep].allowSkip}
                onChange={(e) => handleUpdateStep(selectedStep, { allowSkip: e.target.checked })}
              />
              <label htmlFor="allowSkip" className="text-sm text-gray-700">
                Allow Manual Skip
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retry Count
              </label>
              <input
                type="number"
                min="0"
                max="5"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={steps[selectedStep].retryCount}
                onChange={(e) => handleUpdateStep(selectedStep, { retryCount: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (seconds)
              </label>
              <input
                type="number"
                min="0"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={steps[selectedStep].timeoutSeconds || ''}
                onChange={(e) => handleUpdateStep(selectedStep, { timeoutSeconds: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;
