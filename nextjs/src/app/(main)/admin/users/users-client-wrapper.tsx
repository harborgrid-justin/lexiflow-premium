'use client';

/**
 * Users Client Wrapper Component
 * Combines filters, table, stats, and modals into a single client component
 * Handles all CRUD modal operations with server action integration
 */

import { Search, Plus, X, AlertTriangle, Loader2, Users, Shield, Key, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition, useEffect } from 'react';
import { createUser, updateUser, deleteUser, deactivateUser, reactivateUser } from '../actions';
import type { AdminUser, CreateUserInput, UpdateUserInput, UserRole, UserStatus } from '../types';

// =============================================================================
// Types
// =============================================================================

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | '';
  status?: UserStatus;
  department?: string;
  phone?: string;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  general?: string;
}

interface UsersClientWrapperProps {
  users: AdminUser[];
}

// =============================================================================
// Form Validation
// =============================================================================

function validateUserForm(formData: UserFormData): FormErrors {
  const errors: FormErrors = {};

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // First name validation
  if (!formData.firstName) {
    errors.firstName = 'First name is required';
  } else if (formData.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  // Last name validation
  if (!formData.lastName) {
    errors.lastName = 'Last name is required';
  } else if (formData.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }

  // Role validation
  if (!formData.role) {
    errors.role = 'Please select a role';
  }

  return errors;
}

// =============================================================================
// Badge Helpers
// =============================================================================

function getStatusBadge(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return statusColors[status] || statusColors.inactive;
}

function getRoleBadge(role: string): string {
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    attorney: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    paralegal: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    staff: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    client: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return roleColors[role] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
}

// =============================================================================
// Modal Component
// =============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-xl transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Form Components
// =============================================================================

interface FormInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
}: FormInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-slate-300 dark:border-slate-600'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}

function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required,
  placeholder,
}: FormSelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-slate-300 dark:border-slate-600'
        }`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

// =============================================================================
// Options
// =============================================================================

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'attorney', label: 'Attorney' },
  { value: 'paralegal', label: 'Paralegal' },
  { value: 'staff', label: 'Staff' },
  { value: 'client', label: 'Client' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

// =============================================================================
// Create User Modal
// =============================================================================

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    department: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: '',
      department: '',
      phone: '',
    });
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateUserForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const input: CreateUserInput = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as UserRole,
        department: formData.department || undefined,
        phone: formData.phone || undefined,
        sendInvite: true,
      };

      const result = await createUser(input);

      if (result.success) {
        resetForm();
        onSuccess();
        onClose();
      } else {
        setErrors({ general: result.error || 'Failed to create user' });
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof UserFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New User">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.general}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="create-firstName"
              label="First Name"
              value={formData.firstName}
              onChange={updateField('firstName')}
              error={errors.firstName}
              placeholder="John"
              required
            />
            <FormInput
              id="create-lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={updateField('lastName')}
              error={errors.lastName}
              placeholder="Doe"
              required
            />
          </div>

          <FormInput
            id="create-email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={updateField('email')}
            error={errors.email}
            placeholder="john.doe@example.com"
            required
          />

          <FormSelect
            id="create-role"
            label="Role"
            value={formData.role}
            onChange={updateField('role')}
            options={roleOptions}
            error={errors.role}
            placeholder="Select a role..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="create-department"
              label="Department"
              value={formData.department || ''}
              onChange={updateField('department')}
              placeholder="Legal"
            />
            <FormInput
              id="create-phone"
              label="Phone"
              type="tel"
              value={formData.phone || ''}
              onChange={updateField('phone')}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create & Send Invite'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// =============================================================================
// Edit User Modal
// =============================================================================

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: AdminUser | null;
}

function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    status: 'active',
    department: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        department: user.department || '',
        phone: user.phone || '',
      });
      setErrors({});
    }
  }, [user]);

  const handleClose = useCallback(() => {
    setErrors({});
    onClose();
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const validationErrors = validateUserForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const input: UpdateUserInput = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as UserRole,
        status: formData.status,
        department: formData.department || undefined,
        phone: formData.phone || undefined,
      };

      const result = await updateUser(user.id, input);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setErrors({ general: result.error || 'Failed to update user' });
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof UserFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit User">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.general}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="edit-firstName"
              label="First Name"
              value={formData.firstName}
              onChange={updateField('firstName')}
              error={errors.firstName}
              required
            />
            <FormInput
              id="edit-lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={updateField('lastName')}
              error={errors.lastName}
              required
            />
          </div>

          <FormInput
            id="edit-email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={updateField('email')}
            error={errors.email}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              id="edit-role"
              label="Role"
              value={formData.role}
              onChange={updateField('role')}
              options={roleOptions}
              error={errors.role}
              required
            />
            <FormSelect
              id="edit-status"
              label="Status"
              value={formData.status || ''}
              onChange={updateField('status')}
              options={statusOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="edit-department"
              label="Department"
              value={formData.department || ''}
              onChange={updateField('department')}
              placeholder="Legal"
            />
            <FormInput
              id="edit-phone"
              label="Phone"
              type="tel"
              value={formData.phone || ''}
              onChange={updateField('phone')}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// =============================================================================
// Delete Confirmation Modal
// =============================================================================

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: AdminUser | null;
}

function DeleteUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteUser(user.id);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User">
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white">
              Are you sure you want to delete user{' '}
              <strong>{user?.email}</strong>?
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This action cannot be undone. All user data, including activity
              history and permissions, will be permanently removed.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isDeleting ? 'Deleting...' : 'Delete User'}
        </button>
      </div>
    </Modal>
  );
}

// =============================================================================
// User Avatar Component
// =============================================================================

function UserAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  return (
    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
      {initials || '?'}
    </div>
  );
}

// =============================================================================
// User Stats Component
// =============================================================================

function UserStats({ users }: { users: AdminUser[] }) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const mfaEnabled = users.filter((u) => u.mfaEnabled).length;
  const pendingUsers = users.filter((u) => u.status === 'pending').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalUsers}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
        <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">MFA Enabled</p>
        <p className="text-2xl font-bold text-blue-600">{mfaEnabled}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
        <p className="text-2xl font-bold text-yellow-600">{pendingUsers}</p>
      </div>
    </div>
  );
}

// =============================================================================
// Users Table Component
// =============================================================================

interface UsersTableProps {
  users: AdminUser[];
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  isToggling: string | null;
}

function UsersTable({ users, onEditUser, onDeleteUser, onToggleStatus, isToggling }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No users found
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              MFA
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <UserAvatar firstName={user.firstName} lastName={user.lastName} />
                  <div className="ml-4">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {user.firstName} {user.lastName}
                    </Link>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}
                >
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.mfaEnabled ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Enabled</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Key className="h-4 w-4" />
                    <span className="text-sm">Disabled</span>
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEditUser(user)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  {user.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => onToggleStatus(user)}
                      disabled={isToggling === user.id}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      {isToggling === user.id ? 'Processing...' : 'Deactivate'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleStatus(user)}
                      disabled={isToggling === user.id}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                    >
                      {isToggling === user.id ? 'Processing...' : 'Activate'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteUser(user)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Main Client Wrapper Component
// =============================================================================

export function UsersClientWrapper({ users }: UsersClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Toggle status loading state
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Debounce timeout
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      startTransition(() => {
        router.push(`/admin/users?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      updateFilters({ search: value });
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    updateFilters({ role: value });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    updateFilters({ status: value });
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  // Toggle user status (activate/deactivate)
  const handleToggleStatus = async (user: AdminUser) => {
    setIsToggling(user.id);
    try {
      if (user.status === 'active') {
        await deactivateUser(user.id);
      } else {
        await reactivateUser(user.id);
      }
      handleRefresh();
    } finally {
      setIsToggling(null);
    }
  };

  // Modal handlers
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const openDeleteModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <>
      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <label
              htmlFor="user-search"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="user-search"
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label
              htmlFor="role-filter"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Role
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="attorney">Attorney</option>
              <option value="paralegal">Paralegal</option>
              <option value="staff">Staff</option>
              <option value="client">Client</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Add User Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={openCreateModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {isPending && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <UserStats users={users} />

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-200 dark:border-slate-700">
        <UsersTable
          users={users}
          onEditUser={openEditModal}
          onDeleteUser={openDeleteModal}
          onToggleStatus={handleToggleStatus}
          isToggling={isToggling}
        />
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSuccess={handleRefresh}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSuccess={handleRefresh}
        user={selectedUser}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onSuccess={handleRefresh}
        user={selectedUser}
      />
    </>
  );
}
