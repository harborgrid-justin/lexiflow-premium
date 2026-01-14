/**
 * Profile Domain - View Component
 */

import { Briefcase, Building, Mail, Phone, User } from 'lucide-react';
import React from 'react';
import { PageHeader } from '../../components/organisms/PageHeader';
import { Button } from '../../components/organisms/_legacy/Button';
import { useProfile } from './ProfileProvider';

export function ProfileView() {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="Profile" subtitle="User profile and settings" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-600 dark:text-slate-400">
            No profile found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Profile"
        subtitle="User profile and settings"
        actions={
          <Button variant="primary" size="md">
            Edit Profile
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {profile.name}
              </h2>
              <div className="text-slate-600 dark:text-slate-400 mb-4">
                {profile.role}
              </div>
              {profile.bio && (
                <p className="text-slate-700 dark:text-slate-300">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
          <ProfileField
            icon={<Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
            label="Email"
            value={profile.email}
          />
          <ProfileField
            icon={<Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
            label="Phone"
            value={profile.phone}
          />
          <ProfileField
            icon={<Briefcase className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
            label="Role"
            value={profile.role}
          />
          <ProfileField
            icon={<Building className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
            label="Department"
            value={profile.department}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 flex items-center gap-4">
      {icon}
      <div className="flex-1">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
          {label}
        </div>
        <div className="font-medium text-slate-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  );
}
