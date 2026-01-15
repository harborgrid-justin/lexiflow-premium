import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Currency } from '@/components/atoms/Currency';
import { useTheme } from "@/hooks/useTheme";
import { useClients } from '@/hooks/useDomainData';
import { useNotify } from '@/hooks/useNotify';
import { useMutation } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { Client, ClientStatus } from '@/types';
import { cn } from '@/lib/cn';
import { Lock, MoreVertical } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ClientCard } from './ClientCard';

interface ClientDirectoryProps {
  clients?: Client[]; // Optional override props
  onOpenPortal: (client: Client) => void;
}

export function ClientDirectory({ clients: propClients, onOpenPortal }: ClientDirectoryProps) {
  const { theme } = useTheme();
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enterprise Data Access
  const { data: fetchedClients = [] } = useClients();

  const { mutate: generateToken } = useMutation(
    DataService.clients.generatePortalToken,
    {
      onSuccess: (token, clientId) => {
        const tokenStr = token as string;
        notify.success(`Portal Access Token Generated: ${tokenStr.substring(0, 12)}...`);
        const clientsToRender = Array.isArray(propClients)
          ? propClients
          : Array.isArray(fetchedClients)
            ? fetchedClients
            : [];
        const client = clientsToRender.find(c => c.id === clientId);
        if (client) onOpenPortal(client);
      }
    }
  );

  const filteredClients = useMemo(() => {
    // Ensure clientsToRender is always an array (moved inside useMemo)
    const clientsToRender = Array.isArray(propClients)
      ? propClients
      : Array.isArray(fetchedClients)
        ? fetchedClients
        : [];

    return clientsToRender.filter(c =>
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [propClients, fetchedClients, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <SearchToolbar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search clients..."
          className="w-full max-w-lg"
        />
        <div style={{
          display: 'flex',
          backgroundColor: theme.surface.muted,
          padding: '0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${theme.border.default}`,
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              borderRadius: '0.375rem',
              backgroundColor: viewMode === 'grid' ? theme.surface.base : 'transparent',
              color: viewMode === 'grid' ? theme.text.primary : theme.text.secondary,
              boxShadow: viewMode === 'grid' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
            }}
            className="transition-all"
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              borderRadius: '0.375rem',
              backgroundColor: viewMode === 'list' ? theme.surface.base : 'transparent',
              color: viewMode === 'list' ? theme.text.primary : theme.text.secondary,
              boxShadow: viewMode === 'list' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
            }}
            className="transition-all"
          >
            List
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onGenerateToken={generateToken}
            />
          ))}
        </div>
      ) : (
        <TableContainer>
          <TableHeader>
            <TableHead>Client Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active Matters</TableHead>
            <TableHead>Total Revenue</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableHeader>
          <TableBody>
            {filteredClients.map(client => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div style={{
                      height: '2rem',
                      width: '2rem',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      border: `1px solid ${theme.primary.DEFAULT}`,
                      backgroundColor: `${theme.primary.DEFAULT}15`,
                      color: theme.primary.DEFAULT,
                    }}>
                      {(client.name || '').substring(0, 2)}
                    </div>
                    <span style={{
                      fontWeight: '500',
                      color: theme.text.primary,
                    }}>{client.name}</span>
                  </div>
                </TableCell>
                <TableCell>{client.industry}</TableCell>
                <TableCell>
                  <Badge variant={client.status === ClientStatus.ACTIVE ? 'success' : 'neutral'}>{client.status}</Badge>
                </TableCell>
                <TableCell>{(client.matters || []).length}</TableCell>
                <TableCell><Currency value={client.totalBilled} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" style={{ color: theme.text.secondary }} icon={Lock} onClick={() => generateToken(client.id)}>Portal</Button>
                    <button style={{
                      padding: '0.375rem',
                      borderRadius: '0.25rem',
                      color: theme.text.muted,
                    }}
                      className="transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      )}
    </div>
  );
}
