/**
 * Theme Demo Page
 *
 * Showcases the 150+ theme customization options in action
 */
import { useTheme } from '@/contexts/ThemeContext';
import { Info, Layout, Palette, Sparkles, Type } from 'lucide-react';

export default function ThemeDemo() {
  const { tokens, theme, density, mode } = useTheme();

  const demoSections = [
    {
      title: '🎨 Colors',
      icon: Palette,
      items: [
        { label: 'Primary', value: tokens.colors.primary },
        { label: 'Secondary', value: tokens.colors.secondary },
        { label: 'Success', value: tokens.colors.success },
        { label: 'Warning', value: tokens.colors.warning },
        { label: 'Error', value: tokens.colors.error },
      ]
    },
    {
      title: '✏️ Typography',
      icon: Type,
      items: [
        { label: 'Font Family', value: tokens.typography.fontSans },
        { label: 'Base Size', value: tokens.typography.sizes.base },
        { label: 'Line Height', value: tokens.typography.lineHeight.normal },
        { label: 'Letter Spacing', value: tokens.typography.letterSpacing.normal },
      ]
    },
    {
      title: '📐 Layout',
      icon: Layout,
      items: [
        { label: 'Density', value: density },
        { label: 'Gutter', value: tokens.spacing[density].gutter },
        { label: 'Border Radius', value: tokens.borderRadius.lg },
        { label: 'Shadow', value: tokens.shadows.md },
      ]
    },
    {
      title: '✨ Effects',
      icon: Sparkles,
      items: [
        { label: 'Blur', value: tokens.effects.blur.md },
        { label: 'Opacity Hover', value: tokens.effects.opacity.hover },
        { label: 'Transition', value: tokens.transitions.smooth },
        { label: 'Animation', value: tokens.animations.duration.normal },
      ]
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Theme Customizer Demo
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                150+ Theme Options • Real-time Preview • Enterprise Design System
              </p>
              <div className="flex gap-3 mt-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  Mode: {mode}
                </span>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                  Density: {density}
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  87 Colors • 38 Typography • 39 Layout
                </span>
              </div>
            </div>
            <div className="text-6xl">🎨</div>
          </div>
        </div>

        {/* Theme Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoSections.map(({ title, icon: Icon, items }) => (
            <div key={title} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
              </div>
              <div className="space-y-2">
                {items.map(({ label, value }) => (
                  <div key={label} className="text-xs">
                    <div className="text-slate-500 dark:text-slate-400">{label}</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 truncate bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded mt-1">
                      {String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Live Color Palette */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Live Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Object.entries({
              primary: tokens.colors.primary,
              secondary: tokens.colors.secondary,
              accent: tokens.colors.accent,
              success: tokens.colors.success,
              warning: tokens.colors.warning,
              error: tokens.colors.error,
              info: tokens.colors.info,
              slate500: tokens.colors.slate500,
            }).map(([name, color]) => (
              <div key={name} className="text-center">
                <div
                  className="w-full h-24 rounded-lg shadow-md mb-2 ring-1 ring-slate-200 dark:ring-slate-700"
                  style={{ backgroundColor: color }}
                />
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{name}</div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{color}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Scale */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Typography Scale</h2>
          <div className="space-y-4">
            {['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'].map((size) => (
              <div key={size} className="flex items-center gap-4">
                <span className="text-sm font-mono text-slate-500 dark:text-slate-400 w-16">{size}</span>
                <p
                  style={{ fontSize: tokens.typography.sizes[size as keyof typeof tokens.typography.sizes] }}
                  className="text-slate-900 dark:text-white"
                >
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Components */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Interactive Components</h2>
          <div className="space-y-6">

            {/* Buttons */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Buttons</h3>
              <div className="flex gap-3 flex-wrap">
                <button
                  className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: theme.button.primary,
                    color: 'white',
                    boxShadow: tokens.shadows.md
                  }}
                >
                  Primary Button
                </button>
                <button
                  className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: theme.button.secondary,
                    color: 'white',
                    boxShadow: tokens.shadows.md
                  }}
                >
                  Secondary Button
                </button>
                <button
                  className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 border-2"
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.text.primary,
                    borderColor: theme.border.default,
                  }}
                >
                  Ghost Button
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Input Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Text input"
                  className="px-4 py-3 rounded-lg border-2 transition-all focus:ring-2"
                  style={{
                    borderColor: theme.border.default,
                    backgroundColor: tokens.colors.surfaceInput,
                    color: theme.text.primary
                  }}
                />
                <input
                  type="email"
                  placeholder="Email input"
                  className="px-4 py-3 rounded-lg border-2 transition-all focus:ring-2"
                  style={{
                    borderColor: theme.border.default,
                    backgroundColor: tokens.colors.surfaceInput,
                    color: theme.text.primary
                  }}
                />
                <select
                  className="px-4 py-3 rounded-lg border-2 transition-all focus:ring-2"
                  style={{
                    borderColor: theme.border.default,
                    backgroundColor: tokens.colors.surfaceInput,
                    color: theme.text.primary
                  }}
                >
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>

            {/* Status Badges */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Status Indicators</h3>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(theme.status).map(([status, styles]) => (
                  <span
                    key={status}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: styles.bg,
                      color: 'white'
                    }}
                  >
                    {status}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Shadow Showcase */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Shadow Levels</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['sm', 'md', 'lg', 'xl', 'xxl'].map((shadow) => (
              <div key={shadow} className="text-center">
                <div
                  className="w-full h-32 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center mb-2"
                  style={{ boxShadow: tokens.shadows[shadow as keyof typeof tokens.shadows] }}
                >
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{shadow}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="flex gap-4">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                Customize Your Experience
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                Navigate to <strong>Settings → Theme Settings</strong> to access the full theme customizer with 150+ options.
                All changes update in real-time across the entire application and are automatically saved to your profile.
              </p>
              <a
                href="/settings/theme"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Open Theme Customizer →
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
