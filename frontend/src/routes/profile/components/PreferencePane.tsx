/**
 * @module components/profile/PreferencePane
 * @category User Profile
 * @description User preference management panel with appearance settings (light/dark/system theme),
 * regional settings (language, timezone), and notification preferences. Provides visual theme
 * selector and notification toggle switches.
 *
 * THEME SYSTEM USAGE:
 * - theme.surface.primary - Preference card backgrounds
 * - theme.text.primary/secondary - Setting labels and descriptions
 * - theme.border.default - Card borders and setting separators
 * - Theme switcher buttons use mode-specific styling (light/dark active states)
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { Bell, Monitor, Moon, Sun } from 'lucide-react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Components
import { Card } from '@/components/molecules/Card/Card';

// Hooks
import { useProfilePreferences } from '../hooks/useProfilePreferences';

// Utils & Constants
import { cn } from '@/lib/cn';

// Types
import { ExtendedUserProfile } from '@/types';


// ========================================
// TYPES & INTERFACES
// ========================================
interface PreferencePaneProps {
    profile: ExtendedUserProfile;
}

// ========================================
// COMPONENT
// ========================================
export function PreferencePane({ profile }: PreferencePaneProps) {
    // Refactored to use custom hook (Rules 41-60)
    const [
        { mode, locale, timezone, emailNotifications, pushNotifications },
        { setThemeMode, updateLocale, updateTimezone, toggleEmailNotifications, togglePushNotifications }
    ] = useProfilePreferences(profile);

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full animate-fade-in">
            <Card title="Appearance">
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => setThemeMode('light')}
                        className={cn(
                            "p-4 rounded-lg border-2 flex flex-col items-center gap-3 transition-all",
                            mode === 'light' ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                        )}
                    >
                        <Sun className="h-8 w-8 text-amber-500" />
                        <span className="text-sm font-bold">Light</span>
                    </button>
                    <button
                        onClick={() => setThemeMode('dark')}
                        style={mode === 'dark' ? { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' } : {}}
                        className={cn(
                            "p-4 rounded-lg border-2 flex flex-col items-center gap-3 transition-all",
                            mode === 'dark' ? "border-blue-600" : "border-slate-200 hover:border-blue-300"
                        )}
                    >
                        <Moon className="h-8 w-8 text-purple-500" />
                        <span className="text-sm font-bold">Dark</span>
                    </button>
                    <button
                        className={cn(
                            "p-4 rounded-lg border-2 flex flex-col items-center gap-3 transition-all border-slate-200 hover:border-blue-300 opacity-60"
                        )}
                    >
                        <Monitor style={{ color: 'var(--color-textMuted)' }} className="h-8 w-8" />
                        <span className="text-sm font-bold">System</span>
                    </button>
                </div>
            </Card>

            <Card title="Regional Settings">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label style={{ color: 'var(--color-textMuted)' }} className="block text-xs font-bold uppercase mb-2">Language</label>
                        <select
                            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                            className="w-full p-2 border rounded text-sm"
                            value={locale}
                            onChange={(e) => updateLocale(e.target.value)}
                        >
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español</option>
                            <option value="fr-FR">Français</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ color: 'var(--color-textMuted)' }} className="block text-xs font-bold uppercase mb-2">Timezone</label>
                        <select
                            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                            className="w-full p-2 border rounded text-sm"
                            value={timezone}
                            onChange={(e) => updateTimezone(e.target.value)}
                        >
                            <option value="America/New_York">Eastern Time (US & Canada)</option>
                            <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                            <option value="Europe/London">London</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card title="Notifications">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            <MailIcon style={{ color: 'var(--color-textMuted)' }} className="h-5 w-5" />
                            <div>
                                <p className="text-sm font-bold">Email Notifications</p>
                                <p style={{ color: 'var(--color-textMuted)' }} className="text-xs">Receive daily digests and critical alerts.</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => toggleEmailNotifications(e.target.checked)}
                            className="w-5 h-5 rounded text-blue-600"
                        />
                    </div>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            <Bell style={{ color: 'var(--color-textMuted)' }} className="h-5 w-5" />
                            <div>
                                <p className="text-sm font-bold">Push Notifications</p>
                                <p style={{ color: 'var(--color-textMuted)' }} className="text-xs">Real-time browser alerts.</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={pushNotifications}
                            onChange={(e) => togglePushNotifications(e.target.checked)}
                            className="w-5 h-5 rounded text-blue-600"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

const MailIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
);
