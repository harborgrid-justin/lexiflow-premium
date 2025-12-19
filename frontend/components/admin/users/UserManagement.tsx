import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Shield, Mail, Search } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { PageHeader } from '../../common/PageHeader';
import { Modal } from '../../common/Modal';
import { Input } from '../../common/Inputs';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { useNotify } from '../../../hooks/useNotify';
import { useModalState } from '../../../hooks';
import { getTodayString } from '../../../utils/dateUtils';

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

const mockUsers: UserData[] = [
  { id: '1', email: 'admin@lexiflow.com', firstName: 'Admin', lastName: 'User', role: 'Administrator', status: 'Active', lastLogin: '2024-01-15T10:30:00Z', createdAt: '2023-01-01' },
  { id: '2', email: 'partner@lexiflow.com', firstName: 'John', lastName: 'Smith', role: 'Senior Partner', status: 'Active', lastLogin: '2024-01-14T16:45:00Z', createdAt: '2023-03-15' },
  { id: '3', email: 'associate@lexiflow.com', firstName: 'Sarah', lastName: 'Johnson', role: 'Associate', status: 'Active', lastLogin: '2024-01-15T09:15:00Z', createdAt: '2023-06-20' },
  { id: '4', email: 'paralegal@lexiflow.com', firstName: 'Mike', lastName: 'Brown', role: 'Paralegal', status: 'Inactive', createdAt: '2023-08-10' },
];

export const UserManagement: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const createModal = useModalState();
  const editModal = useModalState();
  const deleteModal = useModalState();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<Partial<UserData>>({});

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.role) {
      notify.error('Please fill in all required fields');
      return;
    }
    const newUser: UserData = {
      id: `user-${Date.now()}`,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role as UserData['role'],
      status: 'Pending',
      createdAt: getTodayString(),
    };
    setUsers([...users, newUser]);
    createModal.close();
    setFormData({});
    notify.success('User created successfully. Invitation sent.');
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    setUsers(users.map(u =>
      u.id === selectedUser.id ? { ...u, ...formData } : u
    ));
    editModal.close();
    setSelectedUser(null);
    setFormData({});
    notify.success('User updated successfully');
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    notify.success('User deleted successfully');
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData(user);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const getRoleVariant = (role: UserData['role']) => {
    switch (role) {
      case 'Administrator': return 'error';
      case 'Senior Partner': return 'warning';
      case 'Associate': return 'info';
      default: return 'default';
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
              onChange={e => setSearchQuery(e.target.value)}
              className={cn("pl-9 pr-4 py-2 rounded-lg border text-sm", theme.surface.default, theme.border.default)}
            />
          </div>
          <Button variant="primary" icon={Plus} onClick={() => { setFormData({}); setIsCreateModalOpen(true); }}>
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
                <Badge variant={user.status === 'Active' ? 'success' : user.status === 'Pending' ? 'warning' : 'default'}>
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
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New User">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            <Input label="Last Name" value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <Input label="Email Address" type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          <div>
            <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Role</label>
            <select
              className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
              value={formData.role || ''}
              onChange={e => setFormData({...formData, role: e.target.value as UserData['role']})}
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
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate}>Create & Send Invite</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            <Input label="Last Name" value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <Input label="Email Address" type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Role</label>
              <select
                className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
                value={formData.role || ''}
                onChange={e => setFormData({...formData, role: e.target.value as UserData['role']})}
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
                onChange={e => setFormData({...formData, status: e.target.value as UserData['status']})}
                aria-label="Status"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete User">
        <div className="p-6">
          <p className={cn("mb-6", theme.text.primary)}>
            Are you sure you want to delete <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleDelete}>Delete User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
