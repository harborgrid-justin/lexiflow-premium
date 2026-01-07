/**
 * UserManagement - User management component
 */

import type { UserIdentity } from '../../../services/data/api/gateways/userGateway';
import { Button } from '../../../ui/components/Button';
import { Table, type Column } from '../../../ui/components/Table';
import { useAdmin } from '../hooks/useAdmin';

export function UserManagement() {
  const { users, loading, error, refresh } = useAdmin();

  const columns: Column<UserIdentity>[] = [
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'roles',
      header: 'Roles',
      render: (u) => u.roles.join(', ')
    }
  ];

  const handleAddUser = () => {
    // Navigate to create user page or open modal
    // Implementation pending robust modal system
    console.info('Add user action triggered');
  };

  if (loading) return <div>Loading users...</div>;

  if (error) return (
    <div className="error-state">
      <p>{error}</p>
      <Button onClick={refresh}>Retry</Button>
    </div>
  );

  return (
    <div className="user-management">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>User Management</h2>
        <Button onClick={handleAddUser}>Add User</Button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f5f5f5' }}>
          <p>No users found in the system.</p>
          <Button variant="secondary" onClick={handleAddUser}>
            Add First User
          </Button>
        </div>
      ) : (
        <Table
          data={users}
          columns={columns}
          keyExtractor={(u) => u.id}
        />
      )}
    </div>
  );
}
