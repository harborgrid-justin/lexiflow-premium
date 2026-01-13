import React from 'react';
import { useThemeCustomizer } from '../hooks/useThemeCustomizer';
import { ThemeDensity } from '../tokens';

export const ThemeCustomizer: React.FC = () => {
  // Updated Hook Usage (Rule 43: Stable/Tuple Return)
  const [
    { mode, density, customTokens, status, message }, // State
    { setTheme, setDensity, updateColor, saveChanges } // Actions
  ] = useThemeCustomizer();

  const isSaving = status === 'saving';

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Theme Customizer</h2>

      {message && (
        <div className={`p-4 mb-6 rounded ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b pb-2">Appearance</h3>

          <div className="flex items-center justify-between">
            <label className="font-medium text-slate-700 dark:text-slate-300">Theme Mode</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium text-slate-700 dark:text-slate-300">Density</label>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as ThemeDensity)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="comfortable">Comfortable</option>
            </select>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b pb-2">Brand Colors</h3>

          <div className="space-y-4">
            <ColorInput
              label="Primary Color"
              value={customTokens.colors.primary}
              onChange={(c) => updateColor(['colors', 'primary'], c)}
            />
            <ColorInput
              label="Secondary Color"
              value={customTokens.colors.secondary}
              onChange={(c) => updateColor(['colors', 'secondary'], c)}
            />
            <ColorInput
              label="Accent Color"
              value={customTokens.colors.accent}
              onChange={(c) => updateColor(['colors', 'accent'], c)}
            />
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b pb-2">Status Colors</h3>

          <div className="space-y-4">
            <ColorInput
              label="Success"
              value={customTokens.colors.success}
              onChange={(c) => updateColor(['colors', 'success'], c)}
            />
            <ColorInput
              label="Warning"
              value={customTokens.colors.warning}
              onChange={(c) => updateColor(['colors', 'warning'], c)}
            />
            <ColorInput
              label="Error"
              value={customTokens.colors.error}
              onChange={(c) => updateColor(['colors', 'error'], c)}
            />
          </div>
        </div>
      </div>

      {/* Preview Section - simple buttons */}
      <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Live Preview</h3>
        <div className="flex flex-wrap gap-4">
          <button
            style={{ backgroundColor: customTokens.colors.primary }}
            className="px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-transform active:scale-95"
          >
            Primary Button
          </button>
          <button
            style={{ backgroundColor: customTokens.colors.secondary }}
            className="px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-transform active:scale-95"
          >
            Secondary Button
          </button>
          <button
            style={{
              backgroundColor: customTokens.colors.surface,
              borderColor: customTokens.colors.border,
              color: customTokens.colors.text
            }}
            className="px-4 py-2 rounded-lg border font-medium shadow-sm transition-transform active:scale-95"
          >
            Outline Button
          </button>
        </div>
        <div className="mt-4 p-4 rounded-lg border-l-4" style={{ backgroundColor: `${customTokens.colors.info}20`, borderColor: customTokens.colors.info }}>
          <p style={{ color: customTokens.colors.info }} className="font-medium">Info Alert Title</p>
          <p style={{ color: customTokens.colors.text }} className="text-sm mt-1">This is how alert components will look with your theme selection.</p>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={saveChanges}
          disabled={isSaving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="flex items-center justify-between group">
    <div className="flex-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <p className="text-xs text-slate-500 font-mono mt-0.5">{value}</p>
    </div>
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 px-2 py-1 text-xs border border-slate-300 rounded focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white"
      />
      <div className="relative overflow-hidden w-10 h-10 rounded-lg shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 border-0 cursor-pointer"
        />
      </div>
    </div>
  </div>
);

export default ThemeCustomizer;
