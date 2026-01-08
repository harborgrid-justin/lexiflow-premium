import React, { useState } from 'react';
import { AutomationRule, AutomationAction } from './types';

/**
 * AutomationRuleEditor Component
 * Create and edit automation rules
 */
export const AutomationRuleEditor: React.FC<{ ruleId?: string }> = ({ ruleId }) => {
  const [rule, setRule] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    trigger: 'document_uploaded',
    conditions: [],
    actions: [],
    active: true,
    priority: 5,
  });

  const [currentAction, setCurrentAction] = useState<Partial<AutomationAction>>({
    type: 'send_email',
    config: {},
    order: 0,
  });

  const triggerTypes = [
    'document_uploaded',
    'document_approved',
    'matter_status_changed',
    'deadline_approaching',
    'invoice_generated',
    'task_completed',
    'client_created',
    'conflict_detected',
    'time_based',
    'manual_trigger',
  ];

  const actionTypes = [
    'send_email',
    'create_task',
    'update_status',
    'assign_user',
    'generate_document',
    'send_notification',
    'webhook',
    'run_workflow',
    'update_field',
  ];

  const handleAddAction = () => {
    const newAction: AutomationAction = {
      type: currentAction.type!,
      config: currentAction.config!,
      order: rule.actions?.length || 0,
      continueOnError: false,
    };

    setRule({
      ...rule,
      actions: [...(rule.actions || []), newAction],
    });

    setCurrentAction({
      type: 'send_email',
      config: {},
      order: 0,
    });
  };

  const handleRemoveAction = (index: number) => {
    const newActions = rule.actions?.filter((_, i) => i !== index) || [];
    // Reorder
    newActions.forEach((action, i) => {
      action.order = i;
    });
    setRule({ ...rule, actions: newActions });
  };

  const handleSave = async () => {
    try {
      // API call would go here
      // await fetch('/api/automation-rules', { method: 'POST', body: rule });
      alert('Automation rule saved successfully!');
      window.location.href = '/workflows/automation';
    } catch (error) {
      console.error('Failed to save rule:', error);
      alert('Failed to save rule');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {ruleId ? 'Edit' : 'Create'} Automation Rule
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Define triggers, conditions, and actions for automated workflows
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule Name
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={rule.name}
                onChange={(e) => setRule({ ...rule, name: e.target.value })}
                placeholder="Enter rule name"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                value={rule.description}
                onChange={(e) => setRule({ ...rule, description: e.target.value })}
                placeholder="Describe what this rule does"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Event
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={rule.trigger}
                onChange={(e) => setRule({ ...rule, trigger: e.target.value })}
              >
                {triggerTypes.map((trigger) => (
                  <option key={trigger} value={trigger}>
                    {trigger.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={rule.priority}
                onChange={(e) => setRule({ ...rule, priority: parseInt(e.target.value) })}
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={rule.active}
                onChange={(e) => setRule({ ...rule, active: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm text-gray-700">
                Rule is active
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

          {/* Existing Actions */}
          {rule.actions && rule.actions.length > 0 && (
            <div className="mb-4 space-y-3">
              {rule.actions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {action.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Order: {action.order + 1}
                    </div>
                  </div>
                  <button
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleRemoveAction(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Action */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add Action</h4>
            <div className="flex gap-3">
              <select
                className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                value={currentAction.type}
                onChange={(e) => setCurrentAction({ ...currentAction, type: e.target.value })}
              >
                {actionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleAddAction}
              >
                Add Action
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => window.location.href = '/workflows/automation'}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={handleSave}
          >
            Save Rule
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomationRuleEditor;
