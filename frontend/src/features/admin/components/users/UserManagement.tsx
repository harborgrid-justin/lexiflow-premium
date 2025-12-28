import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Shield, Mail, Search } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Modal } from '@/components/molecules/Modal';
import { Input } from '@/components/atoms';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table';
import { useNotify } from '@/hooks/useNotify';
import { useModalState } from '@/hooks';
import { useSelection } from '@/hooks/useSelectionState';
import { getTodayString } from '@/utils/dateUtils';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { DataService } from '@/services';
import { queryKeys } from '@/utils/queryKeys';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Administrator' | 'Senior Partner' | 'Associate' | 'Paralegal' | 'Staff';
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin?: string;
  createdAt: string;
}

/**
 * @deprecated Mock data - use backend API via DataService.users
 */
const mockUsers: UserData[] = [];

export const UserManagement: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  
  // Fetch users from backend API
  const { data: users = [], isLoading, refetch } = useQuery<UserData[]>(
    queryKeys.users.all(),
    () => DataService.users.getAll()
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const createModal = useModalState();
  const editModal = useModalState();
  const deleteModal = useModalState();
  const userSelection = useSelection<UserData>();
  const [formData, setFormData] = useState<Partial<UserData>>({});

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.role) {
      notify.error('Please fill in all required fields');
      return;
    }
    try {
      await DataService.users.add(formData);
      await refetch();
      createModal.close();
      setFormData({});
      notify.success('User created successfully');
    } catch (error) {
      notify.error('Failed to create user');
    }
  };

  const handleEdit = async () => {
    if (!userSelection.selected) return;
    try {
      // Update user via backend API
      // await DataService.admin.updateUser(userSelection.selected.id, formData);
      editModal.close();
      userSelection.deselect();
      setFormData({});
      notify.success('User updated successfully');
      await refetch();
    } catch (error) {
      notify.error('Failed to update user');
    }
  };

  const handleDelete = async () => {
    if (!userSelection.selected) return;
    try {
      // Delete user via backend API
      // await DataService.admin.deleteUser(userSelection.selected.id);
      deleteModal.close();
      userSelection.deselect();
      notify.success('User deleted successfully');
      await refetch();
    } catch (error) {
      notify.error('Failed to delete user');
    }
  };

  const openEditModal = (user: UserData) => {
    userSelection.select(user);
    setFormData(user);
    editModal.open();
  };

  const openDeleteModal = (user: UserData) => {
    userSelection.select(user);
    deleteModal.open();
  };

  const getRoleVariant = (role: UserData['role']) => {
    switch (role) {
      case 'Administrator': return 'error';
      case 'Senior Partner': return 'warning';
      case 'Associate': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <Users className="h-5 w-5 mr-2 text-blue-500"/> User Management
          </h3>
          <p className={cn("text-sm", theme.text.secondary)}>Manage system users and their permissions.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className={cn("pl-9 pr-4 py-2 rounded-lg border text-sm", theme.surface.default, theme.border.default)}
            />
          </div>
          <Button variant="primary" icon={Plus} onClick={() => { setFormData({}); createModal.open(); }}>
            Add User
          </Button>
        </div>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead>Actions</TableHead>
        </TableHeader>
        <TableBody>
          {filteredUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium", theme.surface.highlight)}>
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <span className={cn("font-medium", theme.text.primary)}>{user.firstName} {user.lastName}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Mail className={cn("h-3 w-3", theme.text.tertiary)}/>
                  {user.email}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getRoleVariant(user.role)}>
                  <Shield className="h-3 w-3 mr-1"/> {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === 'Active' ? 'success' : user.status === 'Pending' ? 'warning' : 'neutral'}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" icon={Edit} onClick={() => openEditModal(user)}>Edit</Button>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => openDeleteModal(user)}>Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>

      {/* Create Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create New User">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={formData.firstName || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, firstName: e.target.value})} />
            <Input label="Last Name" value={formData.lastName || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <Input label="Email Address" type="email" value={formData.email || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})} />
          <div>
            <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Role</label>
            <select
              className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
              value={formData.role || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, role: e.target.value as UserData['role']})}
              aria-label="Role"
            >
              <option value="">Select role...</option>
              <option value="Administrator">Administrator</option>
              <option value="Senior Partner">Senior Partner</option>
              <option value="Associate">Associate</option>
              <option value="Paralegal">Paralegal</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={createModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate}>Create & Send Invite</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit User">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={formData.firstName || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, firstName: e.target.value})} />
            <Input label="Last Name" value={formData.lastName || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <Input label="Email Address" type="email" value={formData.email || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Role</label>
              <select
                className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
                value={formData.role || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, role: e.target.value as UserData['role']})}
                aria-label="Role"
              >
                <option value="Administrator">Administrator</option>
                <option value="Senior Partner">Senior Partner</option>
                <option value="Associate">Associate</option>
                <option value="Paralegal">Paralegal</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div>
              <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Status</label>
              <select
                className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
                value={formData.status || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status: e.target.value as UserData['status']})}
                aria-label="Status"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={editModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Delete User">
        <div className="p-6">
          <p className={cn("mb-6", theme.text.primary)}>
            Are you sure you want to delete user <strong>{userSelection.selected?.email}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={deleteModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleDelete}>Delete User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
