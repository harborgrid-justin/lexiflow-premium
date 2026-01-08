import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Bell, Shield, Save, CheckCircle } from 'lucide-react';

interface ClientProfileSettingsProps {
  portalUserId: string;
}

export default function ClientProfileSettings({ portalUserId }: ClientProfileSettingsProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [portalUserId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/client-portal/profile?portalUserId=${portalUserId}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updates: any) => {
    try {
      setSaving(true);
      await fetch(`/api/client-portal/profile?portalUserId=${portalUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchProfile();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account preferences and security</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <p className="text-green-800">Settings saved successfully!</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium ${
              activeTab === 'security'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'profile' && (
          <ProfileTab profile={profile} onSave={handleSaveProfile} saving={saving} />
        )}
        {activeTab === 'security' && (
          <SecurityTab portalUserId={portalUserId} profile={profile} onSave={handleSaveProfile} />
        )}
        {activeTab === 'notifications' && (
          <NotificationsTab profile={profile} onSave={handleSaveProfile} saving={saving} />
        )}
      </div>
    </div>
  );
}

function ProfileTab({ profile, onSave, saving }: any) {
  const [email, setEmail] = useState(profile?.email || '');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <button
          onClick={() => onSave({ email })}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}

function SecurityTab({ portalUserId, profile, onSave }: any) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setChanging(true);
      await fetch(`/api/client-portal/change-password?portalUserId=${portalUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      alert('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setChanging(false);
    }
  };

  const handleToggleMFA = async () => {
    try {
      const endpoint = profile?.mfaEnabled ? 'disable' : 'enable';
      await fetch(`/api/client-portal/mfa/${endpoint}?portalUserId=${portalUserId}`, {
        method: 'POST',
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to toggle MFA:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleChangePassword}
            disabled={changing || !currentPassword || !newPassword || !confirmPassword}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {changing ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>

      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Add an extra layer of security to your account
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Status: {profile?.mfaEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <button
            onClick={handleToggleMFA}
            className={`px-6 py-2 rounded-lg ${
              profile?.mfaEnabled
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {profile?.mfaEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({ profile, onSave, saving }: any) {
  const [settings, setSettings] = useState(
    profile?.notificationSettings || {
      email: true,
      sms: false,
      inApp: true,
      messageNotifications: true,
      documentNotifications: true,
      appointmentReminders: true,
      invoiceAlerts: true,
    }
  );

  const handleToggle = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Email Notifications</span>
            <input
              type="checkbox"
              checked={settings.email}
              onChange={() => handleToggle('email')}
              className="w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">SMS Notifications</span>
            <input
              type="checkbox"
              checked={settings.sms}
              onChange={() => handleToggle('sms')}
              className="w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">In-App Notifications</span>
            <input
              type="checkbox"
              checked={settings.inApp}
              onChange={() => handleToggle('inApp')}
              className="w-4 h-4"
            />
          </label>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">New Messages</span>
            <input
              type="checkbox"
              checked={settings.messageNotifications}
              onChange={() => handleToggle('messageNotifications')}
              className="w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Document Updates</span>
            <input
              type="checkbox"
              checked={settings.documentNotifications}
              onChange={() => handleToggle('documentNotifications')}
              className="w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Appointment Reminders</span>
            <input
              type="checkbox"
              checked={settings.appointmentReminders}
              onChange={() => handleToggle('appointmentReminders')}
              className="w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Invoice Alerts</span>
            <input
              type="checkbox"
              checked={settings.invoiceAlerts}
              onChange={() => handleToggle('invoiceAlerts')}
              className="w-4 h-4"
            />
          </label>
        </div>
      </div>

      <div>
        <button
          onClick={() => onSave({ notificationSettings: settings })}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );
}
