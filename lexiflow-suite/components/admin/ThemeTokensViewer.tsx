
import React, { useState, useTransition } from 'react';
import { useTheme, ThemeDensity } from '../providers/ThemeProvider.tsx';
import { 
  Palette, Type, Box, Layout, RefreshCw, Sun, Moon, 
  Save, Download, Check, AlertTriangle, Monitor, 
  Smartphone, MousePointer2, Layers, Type as TypeIcon,
  RotateCcw
} from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { Card } from '../common/Card.tsx';
import { TabNavigation } from '../common/TabNavigation.tsx';
import { Badge } from '../common/Badge.tsx';

interface ThemeTokensViewerProps {
  standalone?: boolean;
}

type TokenCategory = 'colors' | 'typography' | 'geometry' | 'layout';

// --- Helper Components ---

const ColorInput: React.FC<{ 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  description?: string;
}> = ({ label, value, onChange, description }) => (
  <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-all group">
    <div className="relative shrink-0">
      <div 
        className="w-10 h-10 rounded-lg shadow-sm border border-slate-200 ring-2 ring-transparent group-hover:ring-blue-100 transition-all"
        style={{ backgroundColor: value }}
      />
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-0.5">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase">{value}</span>
      </div>
      {description && <p className="text-[10px] text-slate-400 truncate">{description}</p>}
    </div>
  </div>
);

const RangeInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min, max, step = 1, unit = 'px' }) => {
  const numVal = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={numVal} 
        onChange={(e) => onChange(`${e.target.value}${unit}`)}
        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
};

const FontSelect: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-500 outline-none transition-shadow font-medium text-slate-700"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-3 pointer-events-none">
        <TypeIcon size={14} className="text-slate-400"/>
      </div>
    </div>
  </div>
);

// --- Main Component ---

export const ThemeTokensViewer: React.FC<ThemeTokensViewerProps> = ({ standalone }) => {
  const { tokens, density, setDensity, updateToken, resetTokens, isDark, toggleDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TokenCategory>('colors');
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog.');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: TokenCategory) => {
    startTransition(() => setActiveTab(tab));
  };

  const tabs = [
    { id: 'colors', label: 'Color Palette', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'geometry', label: 'Shapes & Effects', icon: Box },
    { id: 'layout', label: 'Layout & Density', icon: Layout },
  ];

  return (
    <div className={`h-full flex flex-col ${standalone ? 'bg-slate-50' : ''}`}>
      {standalone && (
        <div className="px-6 pt-6 pb-2 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
             <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Design System Studio</h1>
                <p className="text-sm text-slate-500 mt-1">Manage global theme tokens and visual primitives.</p>
             </div>
             <div className="flex gap-2">
                <Button variant="secondary" icon={isDark ? Sun : Moon} onClick={toggleDark}>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </Button>
                <Button variant="secondary" icon={RotateCcw} onClick={() => { if(confirm('Reset all tokens?')) resetTokens(); }}>Reset</Button>
                <Button variant="outline" icon={Download}>Export JSON</Button>
                <Button variant="primary" icon={Save}>Save Theme</Button>
             </div>
          </div>
          <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={(t) => handleTabChange(t as TokenCategory)} 
            className="bg-white rounded-xl border border-slate-200 p-1 shadow-sm mb-4"
          />
        </div>
      )}

      <div className={`flex-1 overflow-y-auto ${standalone ? 'px-6 pb-6' : ''}`}>
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Controls */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* COLORS TAB */}
                {activeTab === 'colors' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                        <Card title="Brand Identity">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <ColorInput label="Primary Brand" value={tokens.colors.primary} onChange={(v) => updateToken('colors', 'primary', v)} description="Main navigation, headings" />
                                <ColorInput label="Secondary Action" value={tokens.colors.secondary} onChange={(v) => updateToken('colors', 'secondary', v)} description="Primary buttons, links" />
                                <ColorInput label="Accent" value={tokens.colors.accent} onChange={(v) => updateToken('colors', 'accent', v)} description="Highlights, focus states" />
                            </div>
                        </Card>
                        
                        <Card title="Feedback & Status">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <ColorInput label="Success" value={tokens.colors.success} onChange={(v) => updateToken('colors', 'success', v)} />
                                <ColorInput label="Warning" value={tokens.colors.warning} onChange={(v) => updateToken('colors', 'warning', v)} />
                                <ColorInput label="Error" value={tokens.colors.error} onChange={(v) => updateToken('colors', 'error', v)} />
                                <ColorInput label="Info" value={tokens.colors.info} onChange={(v) => updateToken('colors', 'info', v)} />
                            </div>
                        </Card>

                        <Card title="Surface & UI">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <ColorInput label="Page Background" value={tokens.colors.background} onChange={(v) => updateToken('colors', 'background', v)} />
                                <ColorInput label="Card Surface" value={tokens.colors.surface} onChange={(v) => updateToken('colors', 'surface', v)} />
                                <ColorInput label="Border Color" value={tokens.colors.border} onChange={(v) => updateToken('colors', 'border', v)} />
                            </div>
                        </Card>
                    </div>
                )}

                {/* TYPOGRAPHY TAB */}
                {activeTab === 'typography' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card title="Font Families" className="md:col-span-2">
                                <div className="space-y-6">
                                    <FontSelect 
                                        label="Sans Serif (UI & Body)" 
                                        value={tokens.typography.fontSans} 
                                        onChange={(v) => updateToken('typography', 'fontSans', v)}
                                        options={[
                                            { label: 'Inter (Default)', value: "'Inter', sans-serif" },
                                            { label: 'Roboto', value: "'Roboto', sans-serif" },
                                            { label: 'System UI', value: "system-ui, sans-serif" },
                                            { label: 'Helvetica Neue', value: "'Helvetica Neue', sans-serif" }
                                        ]}
                                    />
                                    <FontSelect 
                                        label="Serif (Headings & Formal)" 
                                        value={tokens.typography.fontSerif} 
                                        onChange={(v) => updateToken('typography', 'fontSerif', v)}
                                        options={[
                                            { label: 'Merriweather (Default)', value: "'Merriweather', serif" },
                                            { label: 'Playfair Display', value: "'Playfair Display', serif" },
                                            { label: 'Georgia', value: "Georgia, serif" },
                                            { label: 'Times New Roman', value: "'Times New Roman', serif" }
                                        ]}
                                    />
                                    <FontSelect 
                                        label="Monospace (Code & Data)" 
                                        value={tokens.typography.fontMono} 
                                        onChange={(v) => updateToken('typography', 'fontMono', v)}
                                        options={[
                                            { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
                                            { label: 'Fira Code', value: "'Fira Code', monospace" },
                                            { label: 'Courier New', value: "'Courier New', monospace" }
                                        ]}
                                    />
                                </div>
                            </Card>

                            <Card title="Global Scale">
                                <div className="space-y-4">
                                    <RangeInput label="Base Size" value={tokens.typography.sizes.base} min={12} max={20} unit="px" step={1} onChange={(v) => updateToken('typography', 'sizes', v, 'base')} />
                                    <RangeInput label="Scale Ratio" value="1.2" min={1} max={1.5} step={0.05} unit="" onChange={() => {}} /> 
                                </div>
                            </Card>
                        </div>

                        {/* Real-time Type Tester */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <MousePointer2 size={14}/> Live Type Tester
                                </h3>
                            </div>
                            <div className="p-6">
                                <textarea 
                                    className="w-full text-3xl font-bold bg-transparent border-none outline-none resize-none placeholder:text-slate-200"
                                    rows={2}
                                    value={previewText}
                                    onChange={(e) => setPreviewText(e.target.value)}
                                    style={{ fontFamily: tokens.typography.fontSans }}
                                />
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Sans Serif Preview</span>
                                        <p className="text-base text-slate-600 leading-relaxed" style={{ fontFamily: tokens.typography.fontSans }}>
                                            {previewText}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Serif Preview</span>
                                        <p className="text-base text-slate-600 leading-relaxed" style={{ fontFamily: tokens.typography.fontSerif }}>
                                            {previewText}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* GEOMETRY TAB */}
                {activeTab === 'geometry' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                        <Card title="Border Radius">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <RangeInput label="Small" value={tokens.borderRadius.sm} min={0} max={10} unit="px" onChange={(v) => updateToken('borderRadius', 'sm', v)} />
                                <RangeInput label="Medium" value={tokens.borderRadius.md} min={0} max={20} unit="px" onChange={(v) => updateToken('borderRadius', 'md', v)} />
                                <RangeInput label="Large" value={tokens.borderRadius.lg} min={0} max={30} unit="px" onChange={(v) => updateToken('borderRadius', 'lg', v)} />
                                <RangeInput label="X-Large" value={tokens.borderRadius.xl} min={0} max={50} unit="px" onChange={(v) => updateToken('borderRadius', 'xl', v)} />
                            </div>
                        </Card>
                        <Card title="Depth & Elevation (Shadows)">
                            <div className="p-8 bg-slate-50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
                                {['sm', 'md', 'lg', 'xl'].map((size) => (
                                    <div key={size} className="w-24 h-24 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-slate-400" style={{ boxShadow: (tokens.shadows as any)[size] }}>
                                        {size.toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        </Card>
                     </div>
                )}

                {/* LAYOUT TAB */}
                {activeTab === 'layout' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                        <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center shadow-xl">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2"><Layers size={20}/> Density Strategy</h3>
                                <p className="text-slate-400 text-sm mt-1">Controls spacing, padding, and information density globally.</p>
                            </div>
                            <div className="flex bg-slate-800 p-1 rounded-xl mt-4 md:mt-0">
                                {(['compact', 'normal', 'comfortable'] as ThemeDensity[]).map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDensity(d)}
                                        className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${density === d ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Card title={`Spacing Tokens (${density})`}>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <RangeInput label="Base Unit" value={tokens.spacing[density].unit} min={2} max={12} unit="px" onChange={(v) => updateToken('spacing', density, v, 'unit')} />
                                <RangeInput label="Card Padding" value={tokens.spacing[density].cardPadding} min={8} max={48} unit="px" onChange={(v) => updateToken('spacing', density, v, 'cardPadding')} />
                                <RangeInput label="Input Padding" value={tokens.spacing[density].inputPadding.split(' ')[0]} min={4} max={24} unit="px" onChange={(v) => updateToken('spacing', density, `${v} ${parseInt(v)*2}px`, 'inputPadding')} />
                                <RangeInput label="Row Height" value={tokens.spacing[density].rowHeight} min={24} max={80} unit="px" onChange={(v) => updateToken('spacing', density, v, 'rowHeight')} />
                             </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Right Column: Sticky Preview */}
            <div className="xl:col-span-1">
                <div className="sticky top-6 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                        <div className="p-6 space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Live Preview</h3>
                            
                            {/* Buttons */}
                            <div className="space-y-3">
                                <Button variant="primary" className="w-full justify-center">Primary Action</Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="secondary" className="w-full justify-center">Secondary</Button>
                                    <Button variant="outline" className="w-full justify-center">Outline</Button>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Input Field</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Type here..."
                                        style={{ padding: tokens.spacing[density].inputPadding, borderRadius: tokens.borderRadius.md }}
                                    />
                                </div>
                            </div>

                            {/* Cards */}
                            <div 
                                className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                                style={{ 
                                    padding: tokens.spacing[density].cardPadding, 
                                    borderRadius: tokens.borderRadius.lg,
                                    backgroundColor: tokens.colors.background
                                }}
                            >
                                <h4 className="font-bold text-slate-900" style={{ fontFamily: tokens.typography.fontSans }}>Card Title</h4>
                                <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: tokens.typography.fontSans }}>
                                    This card reflects current padding, radius, and color tokens.
                                </p>
                            </div>

                            {/* Alerts */}
                            <div className="flex gap-2">
                                <Badge variant="success">Success</Badge>
                                <Badge variant="warning">Warning</Badge>
                                <Badge variant="error">Error</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-slate-400 p-4 rounded-xl text-xs font-mono border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-white">CSS Variables</span>
                            <span className="text-[10px] opacity-50">Generated</span>
                        </div>
                        <div className="space-y-1 opacity-80">
                            <p>--font-sans: {tokens.typography.fontSans}</p>
                            <p>--color-primary: {tokens.colors.primary}</p>
                            <p>--radius-lg: {tokens.borderRadius.lg}</p>
                            <p>--spacing-gutter: {tokens.spacing[density].gutter}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
