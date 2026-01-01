/**
 * Theme Settings & Testing Dashboard
 *
 * Admin page for:
 * - Testing theme centralization
 * - Previewing color tokens in both light/dark modes
 * - Viewing all chart color palettes
 * - Testing component theme consistency
 */

import { useTheme } from '@/providers/ThemeContext';
import { ChartColorService } from '@/services/theme/chartColorService';
import { getChartTheme } from '@/utils/chartConfig';
import { cn } from '@/utils/cn';
import { CheckCircle2, Moon, Palette, Sun, XCircle } from 'lucide-react';
import React, { useCallback, useState, useTransition } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const ThemeSettingsPage: React.FC = () => {
  const { mode, toggleTheme, theme } = useTheme();
  const [selectedSection, setSelectedSection] = useState<'tokens' | 'charts' | 'components'>('tokens');
  const [isPending, startTransition] = useTransition();

  const handleSectionChange = useCallback((section: 'tokens' | 'charts' | 'components') => {
    startTransition(() => {
      setSelectedSection(section);
    });
  }, []);

  const chartTheme = getChartTheme(mode);
  const riskColors = ChartColorService.getRiskColors(mode);
  const statusColors = ChartColorService.getStatusColors(mode);
  const palette = ChartColorService.getPalette(mode);

  // Sample data for chart testing
  const mockRiskData = [
    { name: 'Low Risk', value: 12, color: riskColors.low },
    { name: 'Medium Risk', value: 8, color: riskColors.medium },
    { name: 'High Risk', value: 4, color: riskColors.high }
  ];

  const mockCategoryData = [
    { name: 'Tech', value: 40 },
    { name: 'Finance', value: 30 },
    { name: 'Healthcare', value: 20 },
    { name: 'Legal', value: 10 }
  ];

  return (
    <div className={cn("min-h-screen p-8", theme.background)}>
      {/* Header */}
      <div className={cn("mb-8 pb-6 border-b", theme.border.default)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={cn("text-3xl font-bold mb-2", theme.text.primary)}>
              <Palette className="inline h-8 w-8 mr-3" />
              Theme Settings & Testing
            </h1>
            <p className={cn("text-sm", theme.text.secondary)}>
              Test theme centralization and preview all color tokens across light/dark modes
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              theme.action.primary.bg,
              theme.action.primary.hover,
              theme.action.primary.text
            )}
          >
            {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            Toggle Theme
          </button>
        </div>

        {/* Current Theme Info */}
        <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-lg", theme.status.info.bg, theme.status.info.border, "border")}>
          <CheckCircle2 className={cn("h-4 w-4", theme.status.info.icon)} />
          <span className={cn("text-sm font-medium", theme.status.info.text)}>
            Current Mode: <strong>{mode.toUpperCase()}</strong>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={cn("flex gap-2 mb-6 border-b", theme.border.default)}>
        {[
          { key: 'tokens', label: 'Color Tokens' },
          { key: 'charts', label: 'Chart Colors' },
          { key: 'components', label: 'Component Test' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedSection(tab.key as 'tokens' | 'charts' | 'components')}
            className={cn(
              "px-4 py-2 font-medium transition-colors border-b-2",
              selectedSection === tab.key
                ? `${theme.action.primary.text} border-current`
                : `${theme.text.secondary} border-transparent hover:${theme.text.primary}`
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {selectedSection === 'tokens' && (
        <div className="space-y-6">
          {/* Text Colors */}
          <ColorTokenSection title="Text Colors" theme={theme}>
            <TokenDisplay label="Primary" value={theme.text.primary} />
            <TokenDisplay label="Secondary" value={theme.text.secondary} />
            <TokenDisplay label="Tertiary" value={theme.text.tertiary} />
            <TokenDisplay label="Link" value={theme.text.link} />
            <TokenDisplay label="Code" value={theme.text.code} />
          </ColorTokenSection>

          {/* Surface Colors */}
          <ColorTokenSection title="Surface Colors" theme={theme}>
            <TokenDisplay label="Default" value={theme.surface.default} />
            <TokenDisplay label="Raised" value={theme.surface.raised} />
            <TokenDisplay label="Overlay" value={theme.surface.overlay} />
            <TokenDisplay label="Highlight" value={theme.surface.highlight} />
            <TokenDisplay label="Active" value={theme.surface.active} />
          </ColorTokenSection>

          {/* Action Colors */}
          <ColorTokenSection title="Action Colors" theme={theme}>
            <div className="col-span-2">
              <h4 className={cn("font-semibold mb-2", theme.text.secondary)}>Primary Actions</h4>
              <div className={cn("flex gap-2 p-4 rounded-lg", theme.action.primary.bg)}>
                <span className={theme.action.primary.text}>Primary Button Text</span>
              </div>
            </div>
            <div className="col-span-2">
              <h4 className={cn("font-semibold mb-2", theme.text.secondary)}>Secondary Actions</h4>
              <div className={cn("flex gap-2 p-4 rounded-lg border", theme.action.secondary.bg, theme.action.secondary.border)}>
                <span className={theme.action.secondary.text}>Secondary Button Text</span>
              </div>
            </div>
          </ColorTokenSection>

          {/* Status Colors */}
          <ColorTokenSection title="Status Colors" theme={theme}>
            {Object.entries(theme.status).map(([key, value]) => (
              <div key={key} className={cn("p-4 rounded-lg border", value.bg, value.border)}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", value.icon)} />
                  <span className={cn("font-medium capitalize", value.text)}>{key}</span>
                </div>
              </div>
            ))}
          </ColorTokenSection>
        </div>
      )}

      {selectedSection === 'charts' && (
        <div className="space-y-8">
          {/* Risk Colors Chart */}
          <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
            <h3 className={cn("text-xl font-bold mb-4", theme.text.primary)}>Risk Distribution (Theme-Aware)</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockRiskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={entry => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockRiskData.map((entry, index) => (
                        <Cell key={`risk-cell-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTheme.tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className={cn("font-semibold mb-3", theme.text.secondary)}>Risk Color Palette</h4>
                <div className="space-y-2">
                  <ColorSwatch label="Low Risk" color={riskColors.low} />
                  <ColorSwatch label="Medium Risk" color={riskColors.medium} />
                  <ColorSwatch label="High Risk" color={riskColors.high} />
                </div>
              </div>
            </div>
          </div>

          {/* Category Colors Chart */}
          <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
            <h3 className={cn("text-xl font-bold mb-4", theme.text.primary)}>Category Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="name" tick={{ fill: chartTheme.text }} />
                  <YAxis tick={{ fill: chartTheme.text }} />
                  <Tooltip contentStyle={chartTheme.tooltipStyle} />
                  <Bar dataKey="value" fill={chartTheme.colors.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Colors */}
          <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
            <h3 className={cn("text-xl font-bold mb-4", theme.text.primary)}>Status Color Palette</h3>
            <div className="grid grid-cols-3 gap-4">
              <ColorSwatch label="Success" color={statusColors.success} />
              <ColorSwatch label="Warning" color={statusColors.warning} />
              <ColorSwatch label="Error" color={statusColors.error} />
              <ColorSwatch label="Info" color={statusColors.info} />
              <ColorSwatch label="Neutral" color={statusColors.neutral} />
            </div>
          </div>

          {/* Full Palette */}
          <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
            <h3 className={cn("text-xl font-bold mb-4", theme.text.primary)}>Complete Chart Palette</h3>
            <div className="grid grid-cols-6 gap-4">
              {palette.map((color, index) => (
                <div key={`palette-${color}`} className="text-center">
                  <div
                    className="w-full h-16 rounded-lg mb-2 border"
                    style={{ backgroundColor: color }}
                  />
                  <span className={cn("text-xs font-mono", theme.text.secondary)}>
                    {color}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedSection === 'components' && (
        <div className="space-y-6">
          {/* Button Styles */}
          <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
            <h3 className={cn("text-xl font-bold mb-4", theme.text.primary)}>Action Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className={cn("px-4 py-2 rounded-lg", theme.action.primary.bg, theme.action.primary.hover, theme.action.primary.text)}>
                Primary Action
              </button>
              <button className={cn("px-4 py-2 rounded-lg border", theme.action.secondary.bg, theme.action.secondary.hover, theme.action.secondary.text, theme.action.secondary.border)}>
                Secondary Action
              </button>
              <button className={cn("px-4 py-2 rounded-lg", theme.action.ghost.bg, theme.action.ghost.hover, theme.action.ghost.text)}>
                Ghost Action
              </button>
              <button className={cn("px-4 py-2 rounded-lg border", theme.action.danger.bg, theme.action.danger.hover, theme.action.danger.text, theme.action.danger.border)}>
                Danger Action
              </button>
            </div>
          </div>

          {/* Card Styles */}
          <div className="grid grid-cols-3 gap-4">
            <div className={cn("p-6 rounded-lg", theme.surface.default, theme.border.default, "border")}>
              <h4 className={cn("font-semibold mb-2", theme.text.primary)}>Default Surface</h4>
              <p className={theme.text.secondary}>Standard card background</p>
            </div>
            <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
              <h4 className={cn("font-semibold mb-2", theme.text.primary)}>Raised Surface</h4>
              <p className={theme.text.secondary}>Elevated card with shadow</p>
            </div>
            <div className={cn("p-6 rounded-lg", theme.surface.highlight)}>
              <h4 className={cn("font-semibold mb-2", theme.text.primary)}>Highlight Surface</h4>
              <p className={theme.text.secondary}>Hover/active state</p>
            </div>
          </div>

          {/* Status Banners */}
          <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
            <h3 className={cn("text-xl font-bold mb-4", theme.text.primary)}>Status Banners</h3>
            <div className="space-y-3">
              <div className={cn("p-4 rounded-lg border flex items-center gap-3", theme.status.success.bg, theme.status.success.border)}>
                <CheckCircle2 className={cn("h-5 w-5", theme.status.success.icon)} />
                <span className={theme.status.success.text}>Operation completed successfully!</span>
              </div>
              <div className={cn("p-4 rounded-lg border flex items-center gap-3", theme.status.warning.bg, theme.status.warning.border)}>
                <CheckCircle2 className={cn("h-5 w-5", theme.status.warning.icon)} />
                <span className={theme.status.warning.text}>Warning: This action requires confirmation.</span>
              </div>
              <div className={cn("p-4 rounded-lg border flex items-center gap-3", theme.status.error.bg, theme.status.error.border)}>
                <XCircle className={cn("h-5 w-5", theme.status.error.icon)} />
                <span className={theme.status.error.text}>Error: Operation failed. Please try again.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const ColorTokenSection: React.FC<{ title: string; theme: ReturnType<typeof useTheme>['theme']; children: React.ReactNode }> = ({ title, theme, children }) => (
  <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
    <h3 className={cn("text-xl font-bold mb-4", theme.text.primary)}>{title}</h3>
    <div className="grid grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const TokenDisplay: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  return (
    <div className={cn("p-3 rounded-lg border", theme.border.default)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", theme.text.secondary)}>{label}</span>
        <code className={cn("text-xs px-2 py-1 rounded", theme.surface.highlight, theme.text.code)}>
          {value}
        </code>
      </div>
      <div className={cn("mt-2 p-2 rounded", value)}>
        <span className={value}>Sample Text</span>
      </div>
    </div>
  );
};

const ColorSwatch: React.FC<{ label: string; color: string }> = ({ label, color }) => {
  const { theme } = useTheme();
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-lg border"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className={cn("font-medium", theme.text.primary)}>{label}</div>
        <code className={cn("text-xs", theme.text.secondary)}>{color}</code>
      </div>
    </div>
  );
};

export default ThemeSettingsPage;
