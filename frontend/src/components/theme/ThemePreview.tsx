/**
 * Theme Preview Component
 *
 * Demonstrates all theme properties in real-time as they are updated.
 * Shows colors, typography, spacing, shadows, and effects.
 */
import React from 'react';

import { useTheme } from "@/hooks/useTheme";

export const ThemePreview: React.FC = () => {
  const { tokens, theme } = useTheme();

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
      <div>
        <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">🎨 Live Theme Preview</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">All changes update in real-time</p>
      </div>

      {/* Colors Preview */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Brand Colors</h4>
        <div className="flex gap-2 flex-wrap">
          {['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'].map((color) => (
            <div key={color} className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-lg shadow-md"
                style={{ backgroundColor: tokens.colors[color as keyof typeof tokens.colors] as string }}
              />
              <span className="text-xs mt-1 text-slate-600 dark:text-slate-400">{color}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Typography Preview */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Typography Scale</h4>
        <div className="space-y-1">
          <p style={{ fontSize: tokens.typography.sizes.xs }}>Extra Small (xs)</p>
          <p style={{ fontSize: tokens.typography.sizes.sm }}>Small (sm)</p>
          <p style={{ fontSize: tokens.typography.sizes.base }}>Base</p>
          <p style={{ fontSize: tokens.typography.sizes.lg }}>Large (lg)</p>
          <p style={{ fontSize: tokens.typography.sizes.xl }}>Extra Large (xl)</p>
          <p style={{ fontSize: tokens.typography.sizes['2xl'] }}>2XL</p>
        </div>
      </div>

      {/* Shadows Preview */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Shadow Levels</h4>
        <div className="flex gap-4 flex-wrap">
          {['sm', 'md', 'lg', 'xl', 'xxl'].map((shadow) => (
            <div
              key={shadow}
              className="w-16 h-16 rounded-lg bg-white dark:bg-slate-800"
              style={{ boxShadow: tokens.shadows[shadow as keyof typeof tokens.shadows] }}
            >
              <span className="text-xs p-2">{shadow}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius Preview */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Border Radius</h4>
        <div className="flex gap-4 flex-wrap">
          {['sm', 'md', 'lg', 'xl', 'xxl'].map((radius) => (
            <div
              key={radius}
              className="w-16 h-16 bg-blue-500"
              style={{ borderRadius: tokens.borderRadius[radius as keyof typeof tokens.borderRadius] }}
            >
              <span className="text-xs p-2 text-white">{radius}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing Preview */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Spacing (Current Density)</h4>
        <div className="space-y-2">
          {Object.entries(tokens.spacing[tokens.fontMode === 'sans' ? 'normal' : 'normal']).slice(0, 6).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="bg-blue-500 h-4"
                style={{ width: val }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">{key}: {val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Elements */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Interactive Elements</h4>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: theme.button.primary,
              color: 'white',
              boxShadow: tokens.shadows.md
            }}
          >
            Primary Button
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: theme.button.secondary,
              color: 'white',
              boxShadow: tokens.shadows.md
            }}
          >
            Secondary Button
          </button>
          <input
            type="text"
            placeholder="Input field"
            className="px-4 py-2 rounded-lg border"
            style={{
              borderColor: theme.border.default,
              backgroundColor: tokens.colors.surfaceInput
            }}
          />
        </div>
      </div>

      {/* Status Colors */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Status Indicators</h4>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(theme.status).map(([key, status]) => (
            <div
              key={key}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: status.bg,
                color: 'white'
              }}
            >
              {key}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
