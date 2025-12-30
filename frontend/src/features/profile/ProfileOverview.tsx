/**
 * @module components/profile/ProfileOverview
 * @category Profile
 * @description User profile overview with attorney information and credentials.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { MapPin, Mail, Phone, ShieldCheck, Scale } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { UserAvatar } from '@/components/atoms';
import { Card } from '@/components/molecules';
import { Badge } from '@/components/atoms';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { ExtendedUserProfile } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ProfileOverviewProps {
  /** Extended user profile data. */
  profile: ExtendedUserProfile;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ProfileOverview = ({ profile }: ProfileOverviewProps) => {
  const { theme } = useTheme();

  return (
    <div className="p-6 space-y-6 animate-fade-in overflow-y-auto h-full">
      <div className={cn("flex flex-col md:flex-row gap-6 items-start p-6 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
        <UserAvatar name={profile.name} size="xl" className="w-24 h-24 text-2xl border-4 border-white shadow-md" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h2 className={cn("text-2xl font-bold", theme.text.primary)}>{profile.name}</h2>
              <p className={cn("text-lg", theme.text.secondary)}>{profile.title} • {profile.department}</p>
            </div>
            <Badge variant={profile.status === 'online' ? 'success' : 'neutral'}>
               {profile.status === 'online' ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm mt-2">
            <div className="flex items-center gap-2 text-slate-500">
               <Mail className="h-4 w-4"/> {profile.email}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
               <Phone className="h-4 w-4"/> (555) 123-4567
            </div>
            <div className="flex items-center gap-2 text-slate-500">
               <MapPin className="h-4 w-4"/> {profile.office}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Professional Details">
           <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                 <span className="text-sm font-medium text-slate-500">Role</span>
                 <span className="text-sm font-bold">{profile.role}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                 <span className="text-sm font-medium text-slate-500">Entity ID</span>
                 <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{profile.entityId}</span>
              </div>
              <div className="py-2">
                  <span className="text-sm font-medium text-slate-500 block mb-2">Skills & Expertise</span>
                  <div className="flex flex-wrap gap-2">
                      {profile.skills.map(skill => (
                          <span key={skill} className={cn("px-2 py-1 rounded-full text-xs border font-medium", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                              {skill}
                          </span>
                      ))}
                  </div>
              </div>
           </div>
        </Card>

        <div className="space-y-6">
            <Card title="Credentials & Compliance">
                <div className="space-y-3">
                    {profile.barAdmissions.map((bar, idx) => (
                        <div key={idx} className={cn("flex items-center justify-between p-3 rounded border", theme.surface.highlight, theme.border.default)}>
                             <div className="flex items-center gap-3">
                                 <Scale className="h-5 w-5 text-purple-600"/>
                                 <div>
                                     <p className="text-sm font-bold">{bar.state} Bar Association</p>
                                     <p className="text-xs text-slate-500">Bar #{bar.number}</p>
                                 </div>
                             </div>
                             <Badge variant="success">{bar.status}</Badge>
                        </div>
                    ))}
                </div>
            </Card>

            <div className={cn("p-4 rounded-lg border flex items-center justify-between bg-blue-50 border-blue-100 text-blue-900")}>
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6"/>
                    <div>
                        <p className="font-bold text-sm">Security Compliance</p>
                        <p className="text-xs opacity-80">MFA Active • Password Secure</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold">100%</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
