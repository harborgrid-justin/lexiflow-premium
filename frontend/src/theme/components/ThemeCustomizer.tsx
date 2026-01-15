import React, { useState } from 'react';
import { useThemeCustomizer } from '../hooks/useThemeCustomizer';
import { ThemeDensity } from '../tokens';

export const ThemeCustomizer: React.FC = () => {
  const [
    { mode, density, customTokens, status, message },
    { setTheme, setDensity, updateColor: updateValue, saveChanges }
  ] = useThemeCustomizer();

  const [activeTab, setActiveTab] = useState<'appearance' | 'colors' | 'typography' | 'layout' | 'effects'>('colors');

  const isSaving = status === 'saving';

  const formatKey = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  const renderSection = (title: string, children: React.ReactNode) => (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Theme Studio
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Beta</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time enterprise design system customizer</p>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm px-3 py-1 rounded-full ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </span>
          )}
          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2 active:scale-95"
          >
            {isSaving ? 'Saving...' : 'Publish Theme'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {['appearance', 'colors', 'typography', 'layout', 'effects'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === tab
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-5xl mx-auto">

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderSection("Global Settings", (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Color Mode</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <button
                        onClick={() => setTheme('light')}
                        className={`py-2 rounded-md text-sm font-medium transition-all ${mode === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        Light Mode
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`py-2 rounded-md text-sm font-medium transition-all ${mode === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        Dark Mode
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Information Density</label>
                    <select
                      value={density}
                      onChange={(e) => setDensity(e.target.value as ThemeDensity)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    >
                      <option value="compact">Compact (Data Heavy)</option>
                      <option value="normal">Normal (Standard)</option>
                      <option value="comfortable">Comfortable (Reader)</option>
                    </select>
                    <p className="text-xs text-slate-500">Adjusts spacing and sizing across the entire application.</p>
                  </div>
                </>
              ))}
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {renderSection("Brand Colors", (
                <>
                  {['primary', 'primaryDark', 'primaryLight', 'secondary', 'accent'].map(key => (
                    <ColorInput
                      key={key}
                      label={formatKey(key)}
                      value={customTokens.colors[key as keyof typeof customTokens.colors] as string}
                      onChange={(v) => updateValue(['colors', key], v)}
                    />
                  ))}
                </>
              ))}

              {renderSection("Semantic Colors", (
                <>
                  {['success', 'warning', 'error', 'info'].map(key => (
                    <ColorInput
                      key={key}
                      label={formatKey(key)}
                      value={customTokens.colors[key as keyof typeof customTokens.colors] as string}
                      onChange={(v) => updateValue(['colors', key], v)}
                    />
                  ))}
                </>
              ))}

              {renderSection("Surface & Text", (
                <>
                  {['background', 'surface', 'border', 'borderLight', 'text', 'textMuted'].map(key => (
                    <ColorInput
                      key={key}
                      label={formatKey(key)}
                      value={customTokens.colors[key as keyof typeof customTokens.colors] as string}
                      onChange={(v) => updateValue(['colors', key], v)}
                    />
                  ))}
                </>
              ))}

              {renderSection("Data Visualization", (
                <>
                  {Object.entries(customTokens.colors.charts).map(([key, val]) => (
                    <ColorInput
                      key={key}
                      label={`Chart ${formatKey(key)}`}
                      value={val as string}
                      onChange={(v) => updateValue(['colors', 'charts', key], v)}
                    />
                  ))}
                </>
              ))}

              {renderSection("Annotations", (
                <>
                  {Object.entries(customTokens.colors.annotations).map(([key, val]) => (
                    <ColorInput
                      key={key}
                      label={`Note ${formatKey(key)}`}
                      value={val as string}
                      onChange={(v) => updateValue(['colors', 'annotations', key], v)}
                    />
                  ))}
                </>
              ))}
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderSection("Font Families", (
                <>
                  {['fontSans', 'fontMono', 'fontSerif'].map(key => (
                    <TextInput
                      key={key}
                      label={formatKey(key)}
                      value={customTokens.typography[key as keyof typeof customTokens.typography] as string}
                      onChange={(v) => updateValue(['typography', key], v)}
                    />
                  ))}
                </>
              ))}

              {renderSection("Font Weights", (
                <>
                  {Object.entries(customTokens.typography.weights).map(([key, val]) => (
                    <TextInput
                      key={key}
                      label={formatKey(key)}
                      value={val as string}
                      onChange={(v) => updateValue(['typography', 'weights', key], v)}
                    />
                  ))}
                </>
              ))}

              {renderSection("Font Sizes", (
                <>
                  {Object.entries(customTokens.typography.sizes).map(([key, val]) => (
                    <TextInput
                      key={key}
                      label={key.toUpperCase()}
                      value={val as string}
                      onChange={(v) => updateValue(['typography', 'sizes', key], v)}
                    />
                  ))}
                </>
              ))}
            </div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderSection(`Spacing (${density})`, (
                <>
                  {Object.entries(customTokens.spacing[density]).map(([key, val]) => (
                    <TextInput
                      key={key}
                      label={formatKey(key)}
                      value={val as string}
                      onChange={(v) => updateValue(['spacing', density, key], v)}
                    />
                  ))}
                </>
              ))}

              {renderSection("Border Radius", (
                <>
                  {Object.entries(customTokens.borderRadius).map(([key, val]) => (
                    <TextInput
                      key={key}
                      label={key.toUpperCase()}
                      value={val as string}
                      onChange={(v) => updateValue(['borderRadius', key], v)}
                    />
                  ))}
                </>
              ))}

              {renderSection("Layout Dimensions", (
                <>
                  {Object.entries(customTokens.layout).map(([key, val]) => (
                    <TextInput
                      key={key}
                      type="number"
                      label={formatKey(key)}
                      value={String(val)}
                      onChange={(v) => updateValue(['layout', key], v)} // Note: logic might strip number type but API handles string injection to JS
                    />
                  ))}
                </>
              ))}
            </div>
          )}

          {/* Effects Tab */}
          {activeTab === 'effects' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderSection("Shadows", (
                <>
                  {Object.entries(customTokens.shadows).map(([key, val]) => (
                    <TextInput
                      key={key}
                      label={key.toUpperCase()}
                      value={val as string}
                      onChange={(v) => updateValue(['shadows', key], v)}
                    />
                  ))}
                </>
              ))}

              {renderSection("Transitions", (
                <>
                  {Object.entries(customTokens.transitions).map(([key, val]) => (
                    <TextInput
                      key={key}
                      label={formatKey(key)}
                      value={val as string}
                      onChange={(v) => updateValue(['transitions', key], v)}
                    />
                  ))}
                </>
              ))}

              {renderSection("Z-Index", (
                <>
                  {Object.entries(customTokens.zIndex).map(([key, val]) => (
                    <TextInput
                      key={key}
                      label={formatKey(key)}
                      value={val as string}
                      onChange={(v) => updateValue(['zIndex', key], v)}
                    />
                  ))}
                </>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
    <div className="flex-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">{label}</label>
      <span className="text-xs text-slate-400 font-mono hidden group-hover:block">{value}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="relative overflow-hidden w-8 h-8 rounded shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-shadow">
        <div className="absolute inset-0" style={{ backgroundColor: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-900 border-none rounded text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500 font-mono text-center"
      />
    </div>
  </div>
);

const TextInput = ({ label, value, onChange, type = 'text' }: { label: string, value: string, onChange: (val: string) => void, type?: string }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
    />
  </div>
);

export default ThemeCustomizer;
