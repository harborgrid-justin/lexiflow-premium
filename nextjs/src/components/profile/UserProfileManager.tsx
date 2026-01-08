'use client';

import { Activity, Key, Lock, Mail, MapPin, Phone, Settings, Shield, Sliders, UserCircle, Briefcase, Building } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProfileDomain } from '@/services/domain/ProfileDomain';
import { ExtendedUserProfile } from '@/types';

// Mock Data
const MOCK_PROFILE = {
  id: '1',
  name: 'Jane Doe',
  role: 'Senior Partner',
  email: 'jane.doe@lexiflow.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, NY',
  avatar: null,
};

// Mock Sub-components
const ProfileOverview = ({ profile }: { profile: any }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-4xl font-bold">
        {profile.name.charAt(0)}
      </div>
      <div className="flex-1 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
          <p className="text-slate-500 dark:text-slate-400">{profile.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <Mail size={18} className="text-slate-400" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <Phone size={18} className="text-slate-400" />
            <span>{profile.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <MapPin size={18} className="text-slate-400" />
            <span>{profile.location}</span>
          </div>
        </div>

        <div className="pt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PreferencePane = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Preferences</h3>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">Theme</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred interface theme.</p>
        </div>
        <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm">
          <option>System Default</option>
          <option>Light</option>
          <option>Dark</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">Notifications</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your email and push notifications.</p>
        </div>
        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
          Configure
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">Language</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">Select your preferred language.</p>
        </div>
        <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm">
          <option>English (US)</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>
    </div>
  </div>
);

const AccessMatrixEditor = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Access Matrix</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
      View and manage your permissions across different modules.
    </p>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
          <tr>
            <th className="px-6 py-3">Module</th>
            <th className="px-6 py-3 text-center">Read</th>
            <th className="px-6 py-3 text-center">Write</th>
            <th className="px-6 py-3 text-center">Delete</th>
            <th className="px-6 py-3 text-center">Admin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {['Cases', 'Documents', 'Billing', 'Users'].map((module) => (
            <tr key={module} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{module}</td>
              <td className="px-6 py-4 text-center text-emerald-600">✓</td>
              <td className="px-6 py-4 text-center text-emerald-600">✓</td>
              <td className="px-6 py-4 text-center text-emerald-600">✓</td>
              <td className="px-6 py-4 text-center text-slate-300 dark:text-slate-600">-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SecurityPane = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Security Settings</h3>
    <div className="space-y-6">
      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white">Password</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Last changed 3 months ago</p>
          </div>
        </div>
        <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
          Change
        </button>
      </div>
      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enabled via Authenticator App</p>
          </div>
        </div>
        <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
          Configure
        </button>
      </div>
      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <Key size={20} />
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white">API Keys</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">2 active keys</p>
          </div>
        </div>
        <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
          Manage
        </button>
      </div>
    </div>
  </div>
);

export default function UserProfileManager() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserCircle },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'access', label: 'Access Matrix', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'audit', label: 'Audit Log', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Profile</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage identity, granular permissions, and workspace preferences.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'}
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <ProfileOverview profile={MOCK_PROFILE} />}
        {activeTab === 'preferences' && <PreferencePane />}
        {activeTab === 'access' && <AccessMatrixEditor />}
        {activeTab === 'security' && <SecurityPane />}
        {activeTab === 'audit' && (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            Audit logs visualization component placeholder.
          </div>
        )}
      </div>
    </div>
  );
}
