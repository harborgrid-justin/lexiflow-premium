import React, { useState } from 'react';
import { Plus, X, Save, Settings } from 'lucide-react';

interface WidgetConfig {
  type: string;
  title: string;
  dataSource: string;
  size: 'small' | 'medium' | 'large';
}

interface CustomWidgetBuilderProps {
  onSave: (config: WidgetConfig) => void;
  onCancel: () => void;
}

const WIDGET_TYPES = [
  { value: 'kpi_card', label: 'KPI Card', description: 'Display a single metric with trend' },
  { value: 'line_chart', label: 'Line Chart', description: 'Show data trends over time' },
  { value: 'bar_chart', label: 'Bar Chart', description: 'Compare values across categories' },
  { value: 'pie_chart', label: 'Pie Chart', description: 'Show proportional distribution' },
  { value: 'table', label: 'Data Table', description: 'Display detailed tabular data' },
  { value: 'gauge', label: 'Gauge Chart', description: 'Show progress toward a target' },
];

const DATA_SOURCES = [
  { value: 'revenue', label: 'Revenue Metrics' },
  { value: 'cases', label: 'Case Analytics' },
  { value: 'clients', label: 'Client Data' },
  { value: 'attorneys', label: 'Attorney Performance' },
  { value: 'financial', label: 'Financial Data' },
  { value: 'utilization', label: 'Utilization Rates' },
];

export const CustomWidgetBuilder: React.FC<CustomWidgetBuilderProps> = ({
  onSave,
  onCancel,
}) => {
  const [config, setConfig] = useState<WidgetConfig>({
    type: 'kpi_card',
    title: '',
    dataSource: 'revenue',
    size: 'medium',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSave = () => {
    if (!config.title) {
      alert('Please enter a widget title');
      return;
    }
    onSave(config);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Custom Widget</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Widget Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Widget Title *
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter widget title..."
          />
        </div>

        {/* Widget Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Widget Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {WIDGET_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setConfig({ ...config, type: type.value })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  config.type === type.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{type.label}</p>
                <p className="text-xs text-gray-600 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Data Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Source *
          </label>
          <select
            value={config.dataSource}
            onChange={(e) => setConfig({ ...config, dataSource: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {DATA_SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>

        {/* Widget Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Widget Size
          </label>
          <div className="flex gap-3">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => setConfig({ ...config, size: size as any })}
                className={`flex-1 px-4 py-2 border-2 rounded-md transition-all ${
                  config.size === size
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  min="30"
                  step="30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Auto-refresh interval"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">Enable drill-down</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">Show export button</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Widget
        </button>
      </div>
    </div>
  );
};
