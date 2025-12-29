/**
 * UserProfile Component
 * Comprehensive user profile settings and management panel
 *
 * Features:
 * - Personal information editing
 * - Password change functionality
 * - Avatar upload
 * - Contact information management
 * - Preference settings
 * - Account security settings
 * - Form validation with Zod
 * - WCAG 2.1 AA compliant
 */

import React, { useState, useRef } from 'react';
import { z } from 'zod';
import { UsersApiService } from '@/api/auth/users-api';
import { AuthApiService } from '@/api/auth/auth-api';
import type { User, UpdateUserDto } from '@/types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  mobilePhone: z.string().optional(),
  extension: z.string().optional(),
  office: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export interface UserProfileProps {
  user: User;
  onUpdate?: (user: User) => void;
  className?: string;
}

type ActiveTab = 'profile' | 'security' | 'preferences';

interface FormErrors {
  [key: string]: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user: initialUser,
  onUpdate,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [user, setUser] = useState<User>(initialUser);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: initialUser.firstName || '',
    lastName: initialUser.lastName || '',
    email: initialUser.email,
    phone: initialUser.phone || '',
    mobilePhone: initialUser.mobilePhone || '',
    extension: initialUser.extension || '',
    office: initialUser.office || '',
    department: initialUser.department || '',
    title: initialUser.title || '',
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialUser.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usersService = new UsersApiService();
  const authService = new AuthApiService();

  const handleProfileInputChange = (field: keyof ProfileFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileData((prev) => ({ ...prev, [field]: e.target.value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordInputChange = (field: keyof PasswordFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setProfileErrors({ avatar: 'Please select an image file' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setProfileErrors({ avatar: 'Image size must be less than 5MB' });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});
    setSuccessMessage('');

    try {
      profileSchema.parse(profileData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: FormErrors = {};
        err.issues.forEach((e: z.ZodIssue) => {
          const field = e.path[0] as string;
          errors[field] = e.message;
        });
        setProfileErrors(errors);
        return;
      }
    }

    setIsLoading(true);

    try {
      const updateDto: UpdateUserDto = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone || undefined,
        mobilePhone: profileData.mobilePhone || undefined,
        extension: profileData.extension || undefined,
        office: profileData.office || undefined,
        department: profileData.department || undefined,
        title: profileData.title || undefined,
        avatarUrl: avatarPreview || undefined,
      };

      const updatedUser = await usersService.update(user.id, updateDto);
      setUser(updatedUser);
      setSuccessMessage('Profile updated successfully');
      onUpdate?.(updatedUser);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setProfileErrors({ general: err.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setSuccessMessage('');

    try {
      passwordSchema.parse(passwordData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: FormErrors = {};
        err.errors.forEach((error) => {
          const field = error.path[0] as string;
          errors[field] = error.message;
        });
        setPasswordErrors(errors);
        return;
      }
    }

    setIsLoading(true);

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSuccessMessage('Password changed successfully');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setPasswordErrors({ general: err.message || 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: 'user' },
    { id: 'security' as const, label: 'Security', icon: 'lock' },
    { id: 'preferences' as const, label: 'Preferences', icon: 'settings' },
  ];

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>

                  {profileErrors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
                      <p className="text-sm text-red-800">{profileErrors.general}</p>
                    </div>
                  )}

                  <div className="flex items-start space-x-6 mb-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleAvatarClick}
                          className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          aria-label="Change avatar"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          aria-label="Upload avatar"
                        />
                      </div>
                      {profileErrors.avatar && (
                        <p className="mt-1 text-xs text-red-600">{profileErrors.avatar}</p>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        Upload a profile photo (JPG, PNG, or GIF, max 5MB)
                      </p>
                      <div className="text-xs text-gray-500">
                        <p>Role: <span className="font-medium">{user.role}</span></p>
                        {user.department && <p>Department: <span className="font-medium">{user.department}</span></p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileInputChange('firstName')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          profileErrors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                        required
                      />
                      {profileErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileInputChange('lastName')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          profileErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                        required
                      />
                      {profileErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.lastName}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profileData.email}
                        onChange={handleProfileInputChange('email')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          profileErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                        required
                      />
                      {profileErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={profileData.title}
                        onChange={handleProfileInputChange('title')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        id="department"
                        value={profileData.department}
                        onChange={handleProfileInputChange('department')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Office Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={profileData.phone}
                        onChange={handleProfileInputChange('phone')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="extension" className="block text-sm font-medium text-gray-700 mb-1">
                        Extension
                      </label>
                      <input
                        type="text"
                        id="extension"
                        value={profileData.extension}
                        onChange={handleProfileInputChange('extension')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="mobilePhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Phone
                      </label>
                      <input
                        type="tel"
                        id="mobilePhone"
                        value={profileData.mobilePhone}
                        onChange={handleProfileInputChange('mobilePhone')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="office" className="block text-sm font-medium text-gray-700 mb-1">
                        Office Location
                      </label>
                      <input
                        type="text"
                        id="office"
                        value={profileData.office}
                        onChange={handleProfileInputChange('office')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>

                  {passwordErrors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
                      <p className="text-sm text-red-800">{passwordErrors.general}</p>
                    </div>
                  )}

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange('currentPassword')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                        autoComplete="current-password"
                        required
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange('newPassword')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                        autoComplete="new-password"
                        required
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange('confirmPassword')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                        autoComplete="new-password"
                        required
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Contains uppercase and lowercase letters</li>
                        <li>• Contains at least one number</li>
                        <li>• Contains at least one special character</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Preferences</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Preference settings coming soon</p>
                <p className="text-xs text-gray-500 mt-1">Theme, notifications, and display options</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
