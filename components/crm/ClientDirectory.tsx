
import React, { useState, useMemo } from 'react';
import { Client } from '../../types';
import { SearchToolbar } from '../common/SearchToolbar';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Currency } from '../common/Primitives';
import { Lock, PieChart, MoreVertical, Building } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery, useMutation } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { DataService } from '../../services/dataService';
import { useNotify } from '../../hooks/useNotify';

interface ClientDirectoryProps {
  clients?: Client[]; // Optional override props
  onOpenPortal: (client: Client) => void;
}

export const ClientDirectory: React.FC<ClientDirectoryProps> = ({ clients: propClients, onOpenPortal }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enterprise Data Access: Use cached query if props not provided
  const { data: fetchedClients = [] } = useQuery<Client[]>(
      [STORES.CLIENTS, 'all'],
      DataService.clients.getAll,
      { enabled: !propClients }
  );

  const { mutate: generateToken } = useMutation(
      DataService.clients.generatePortalToken,
      {
          onSuccess: (token, clientId) => {
               // In real app, this might copy to clipboard or email
               const tokenStr = token as string;
               notify.success(`Portal Access Token Generated: ${tokenStr.substring(0, 12)}...`);
               // Then open portal view
               const client = clientsToRender.find(c => c.id === clientId);
               if (client) onOpenPortal(client);
          }
      }
  );

  const clientsToRender = propClients || fetchedClients;

  const filteredClients = useMemo(() => {
    return clientsToRender.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.industry.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div key={client.id} className={cn("p-6 rounded-lg border shadow-sm transition-all hover:shadow-md group", theme.surface, theme.border.default)}>
              <div className="flex justify-between items-start mb-4">
                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg border", theme.primary.light, theme.primary.text, theme.primary.border)}>
                  {client.name.substring(0, 2)}
                </div>
                <Badge variant={client.status === 'Active' ? 'success' : 'neutral'}>{client.status}</Badge>
              </div>
              
              <h3 className={cn("font-bold text-lg mb-1", theme.text.primary)}>{client.name}</h3>
              <p className={cn("text-sm flex items-center mb-4", theme.text.secondary)}>
                <Building className="h-3 w-3 mr-1"/> {client.industry}
              </p>
              
              <div className={cn("grid grid-cols-2 gap-4 text-sm pt-4 border-t", theme.border.light)}>
                <div>
                  <p className={cn("text-[10px] uppercase font-bold", theme.text.tertiary)}>Lifetime Billed</p>
                  <Currency value={client.totalBilled} className={cn("font-bold", theme.text.primary)} />
                </div>
                <div>
                  <p className={cn("text-[10px] uppercase font-bold", theme.text.tertiary)}>Active Matters</p>
                  <p className={cn("font-bold", theme.text.primary)}>{client.matters.length}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" className="flex-1" icon={Lock} onClick={() => generateToken(client.id)}>Portal</Button>
                <Button size="sm" variant="ghost" className="px-2" icon={PieChart} />
              </div>
            </div>
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
                      {client.name.substring(0, 2)}
                    </div>
                    <span className={cn("font-medium", theme.text.primary)}>{client.name}</span>
                  </div>
                </TableCell>
                <TableCell>{client.industry}</TableCell>
                <TableCell>
                  <Badge variant={client.status === 'Active' ? 'success' : 'neutral'}>{client.status}</Badge>
                </TableCell>
                <TableCell>{client.matters.length}</TableCell>
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
};
