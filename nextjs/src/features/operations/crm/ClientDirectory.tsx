import { useState, useMemo } from 'react';
import { Client, ClientStatus } from '@/types';
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Currency } from '@/components/ui/atoms/Currency';
import { Lock, MoreVertical } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useMutation } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { useNotify } from '@/hooks/useNotify';
import { useClients } from '@/hooks/useDomainData';
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
               const client = clientsToRender.find(c => c.id === clientId);
               if (client) onOpenPortal(client);
          }
      }
  );

  // Ensure clientsToRender is always an array
  const clientsToRender = Array.isArray(propClients)
    ? propClients
    : Array.isArray(fetchedClients)
      ? fetchedClients
      : [];

  const filteredClients = useMemo(() => {
    return clientsToRender.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clientsToRender, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <SearchToolbar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search clients..."
          className="w-full max-w-lg"
        />
        <div className={cn("flex bg-slate-100 p-1 rounded-lg border", theme.border.default)}>
          <button
            onClick={() => setViewMode('grid')}
            className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", viewMode === 'list' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
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
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border", theme.primary.light, theme.primary.text, theme.primary.border)}>
                      {(client.name || '').substring(0, 2)}
                    </div>
                    <span className={cn("font-medium", theme.text.primary)}>{client.name}</span>
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
                    <Button size="sm" variant="ghost" className={theme.text.secondary} icon={Lock} onClick={() => generateToken(client.id)}>Portal</Button>
                    <button className={cn("p-1.5 rounded hover:bg-slate-100", theme.text.tertiary)}>
                      <MoreVertical className="h-4 w-4"/>
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

