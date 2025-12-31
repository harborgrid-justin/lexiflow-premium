
import { MessageSquare } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table/Table';
import { UserAvatar } from '@/components/ui/atoms/UserAvatar/UserAvatar';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Button } from '@/components/ui/atoms/Button/Button';
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { useTheme } from '@/providers/ThemeContext';
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
