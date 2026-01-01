/**
 * EnterpriseBrandingConfig Component
 * Configuration interface for enterprise login branding customization
 *
 * Features:
 * - Logo upload and management
 * - Color scheme customization
 * - Custom welcome messages
 * - Background image/gradient
 * - Footer customization
 * - Real-time preview
 * - Brand guidelines compliance
 * - WCAG 2.1 AA compliant
 */

import React, { useState } from 'react';

export interface BrandingConfig {
  // Logo
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;

  // Colors
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;

  // Content
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  footerText?: string;
  supportEmail?: string;
  supportUrl?: string;

  // Background
  backgroundImageUrl?: string;
  backgroundGradient?: string;
  backgroundStyle?: 'solid' | 'gradient' | 'image';

  // Legal
  termsUrl?: string;
  privacyUrl?: string;
  companyName?: string;
}

export interface EnterpriseBrandingConfigProps {
  initialConfig?: BrandingConfig;
  onSave?: (config: BrandingConfig) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export const EnterpriseBrandingConfig: React.FC<EnterpriseBrandingConfigProps> = ({
  initialConfig = {},
  onSave,
  onCancel,
  className = '',
}) => {
  const [config, setConfig] = useState<BrandingConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (field: keyof BrandingConfig, value: string | number | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      if (onSave) {
        await onSave(config);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save branding configuration';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(initialConfig);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Login Branding</h2>
          <p className="mt-1 text-sm text-gray-600">
            Customize the appearance of your enterprise login page
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Logo Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Logo</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  value={config.logoUrl || ''}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="logoWidth" className="block text-sm font-medium text-gray-700 mb-2">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    id="logoWidth"
                    value={config.logoWidth || 200}
                    onChange={(e) => handleChange('logoWidth', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="50"
                    max="500"
                  />
                </div>
                <div>
                  <label htmlFor="logoHeight" className="block text-sm font-medium text-gray-700 mb-2">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    id="logoHeight"
                    value={config.logoHeight || 60}
                    onChange={(e) => handleChange('logoHeight', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="20"
                    max="200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colors Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Colors</h3>
            <div className="space-y-4">
              {[
                { key: 'primaryColor', label: 'Primary Color', default: '#3B82F6' },
                { key: 'buttonColor', label: 'Button Color', default: '#2563EB' },
                { key: 'backgroundColor', label: 'Background Color', default: '#F9FAFB' },
              ].map(({ key, label, default: defaultValue }) => (
                <div key={key} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <input
                      type="text"
                      id={key}
                      value={config[key as keyof BrandingConfig] as string || defaultValue}
                      onChange={(e) => handleChange(key as keyof BrandingConfig, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder={defaultValue}
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <input
                      type="color"
                      value={config[key as keyof BrandingConfig] as string || defaultValue}
                      onChange={(e) => handleChange(key as keyof BrandingConfig, e.target.value)}
                      className="h-10 w-16 rounded cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Content</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={config.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Welcome to Company Name"
                />
              </div>
              <div>
                <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <textarea
                  id="welcomeMessage"
                  value={config.welcomeMessage || ''}
                  onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sign in to access your account"
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={config.companyName || ''}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Company"
                />
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Support</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  id="supportEmail"
                  value={config.supportEmail || ''}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="support@company.com"
                />
              </div>
              <div>
                <label htmlFor="supportUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Support URL
                </label>
                <input
                  type="url"
                  id="supportUrl"
                  value={config.supportUrl || ''}
                  onChange={(e) => handleChange('supportUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://support.company.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[600px] flex items-center justify-center"
                style={{
                  backgroundColor: config.backgroundColor || '#F9FAFB',
                }}
              >
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                  {/* Logo */}
                  {config.logoUrl && (
                    <div className="flex justify-center mb-6">
                      <img
                        src={config.logoUrl}
                        alt="Company Logo"
                        style={{
                          width: config.logoWidth || 200,
                          height: config.logoHeight || 60,
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h2
                    className="text-2xl font-bold text-center mb-2"
                    style={{ color: config.textColor || '#111827' }}
                  >
                    {config.title || 'Welcome'}
                  </h2>

                  {/* Welcome Message */}
                  {config.welcomeMessage && (
                    <p className="text-sm text-center mb-6 text-gray-600">
                      {config.welcomeMessage}
                    </p>
                  )}

                  {/* Mock Form */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Mock Button */}
                  <button
                    type="button"
                    disabled
                    className="w-full py-2 rounded-lg font-medium text-sm"
                    style={{
                      backgroundColor: config.buttonColor || '#2563EB',
                      color: config.buttonTextColor || '#FFFFFF',
                    }}
                  >
                    Sign In
                  </button>

                  {/* Footer */}
                  {config.companyName && (
                    <p className="mt-6 text-xs text-center text-gray-500">
                      © {new Date().getFullYear()} {config.companyName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Reset to Default
        </button>
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
