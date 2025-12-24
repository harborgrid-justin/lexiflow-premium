
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { UserAvatar } from '../../common/UserAvatar';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { SearchToolbar } from '../../common/SearchToolbar';
import { useTheme } from '../../../providers/ThemeContext';
import { cn } from '@/utils/cn';

interface Contact {
  id: string;
  name: string;
  role: string;
  status: string;
  email: string;
  department: string;
}

interface MessengerContactsProps {
  contacts: Contact[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onMessageClick: () => void;
}

export const MessengerContacts: React.FC<MessengerContactsProps> = ({ contacts, searchTerm, setSearchTerm, onMessageClick }) => {
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
                  <UserAvatar name={c.name} size="sm" indicatorStatus={c.status as any}/> {c.name}
                </TableCell>
                <TableCell>{c.role}</TableCell>
                <TableCell>{c.department}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'online' ? 'success' : 'neutral'}>{c.status}</Badge>
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
