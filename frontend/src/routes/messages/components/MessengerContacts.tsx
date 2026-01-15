import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';
import { UserAvatar } from '@/components/atoms/UserAvatar/UserAvatar';
import { useTheme } from '@/theme';
import { cn } from '@/lib/cn';
import { MessageSquare } from 'lucide-react';

import { Contact } from '@/lib/frontend-api';

interface MessengerContactsProps {
  contacts: Contact[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onMessageClick: () => void;
}

export const MessengerContacts = ({ contacts, searchTerm, setSearchTerm, onMessageClick }: MessengerContactsProps) => {
  const { theme } = useTheme();

  return (
    <div className="w-full flex flex-col h-full">
      <div className={cn("p-4 border-b", theme.border.default)}>
        <SearchToolbar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search directory..."
          className="border-none shadow-none p-0"
        />
      </div>
      <div className="overflow-auto flex-1">
        <TableContainer className="border-0 shadow-none rounded-none">
          <TableHeader>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableHeader>
          <TableBody>
            {contacts.map(c => (
              <TableRow key={c.id}>
                <TableCell className={cn("font-medium flex items-center gap-3", theme.text.primary)}>
                  <UserAvatar name={c.name} size="sm" indicatorStatus={c.isOnline ? 'online' : 'offline'} /> {c.name}
                </TableCell>
                <TableCell>{c.role || 'N/A'}</TableCell>
                <TableCell>{'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={c.isOnline ? 'success' : 'neutral'}>{c.isOnline ? 'Online' : 'Offline'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" icon={MessageSquare} onClick={onMessageClick}>Message</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </div>
    </div>
  );
};
