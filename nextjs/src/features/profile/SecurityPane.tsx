/**
 * @module components/profile/SecurityPane
 * @category User Profile
 * @description Security management panel with MFA configuration, password management, and active
 * session monitoring. Displays device sessions with ability to revoke access remotely.
 *
 * THEME SYSTEM USAGE:
 * - theme.surface.primary - Card backgrounds and session rows
 * - theme.text.primary/secondary - Security labels and session details
 * - theme.border.default - Card borders and session dividers
 * - theme.status.success - MFA enabled indicator
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { Clock, Globe, Key, LogOut, Monitor, Smartphone } from 'lucide-react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Components
import { Button } from '@/components/ui/atoms/Button/Button';
import { Card } from '@/components/ui/molecules/Card/Card';

// Types
import { ExtendedUserProfile } from '@/types';

// ========================================
// TYPES & INTERFACES
// ========================================
interface SecurityPaneProps {
    profile: ExtendedUserProfile;
}

// ========================================
// COMPONENT
// ========================================
export const SecurityPane = ({ profile }: SecurityPaneProps) => {
    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Multi-Factor Authentication">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-full text-green-600 shadow-sm"><Smartphone className="h-6 w-6" /></div>
                            <div>
                                <h4 className="font-bold text-sm text-green-900">MFA Enabled</h4>
                                <p className="text-xs text-green-700">Method: Authenticator App</p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="bg-white border-green-300 text-green-800">Configure</Button>
                    </div>
                </Card>

                <Card title="Password & Recovery">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Last Changed</span>
                            <span className="font-medium">{profile.security.lastPasswordChange}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Expires</span>
                            <span className="font-medium text-amber-600">{profile.security.passwordExpiry}</span>
                        </div>
                        <Button className="w-full" variant="secondary" icon={Key}>Change Password</Button>
                    </div>
                </Card>
            </div>

            <Card title="Active Sessions">
                <div className="divide-y border rounded-lg overflow-hidden">
                    {profile.security.activeSessions.map(session => (
                        <div key={session.id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 rounded text-slate-600">
                                    {session.device.includes('iPhone') ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                        {session.device}
                                        {session.current && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase">Current</span>}
                                    </h4>
                                    <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                        <span className="flex items-center"><Globe className="h-3 w-3 mr-1" /> {session.ip}</span>
                                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {session.lastActive}</span>
                                    </div>
                                </div>
                            </div>
                            {!session.current && (
                                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">Revoke</Button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="danger" icon={LogOut}>Sign out all other sessions</Button>
                </div>
            </Card>
        </div>
    );
};
