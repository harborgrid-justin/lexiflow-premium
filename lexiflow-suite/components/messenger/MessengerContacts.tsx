
import { Briefcase, MessageSquare, Search, User } from 'lucide-react';
import React, { useDeferredValue, useMemo } from 'react';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../common/Table.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';

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
  onMessageClick: (id: string) => void;
}

export const MessengerContacts: React.FC<MessengerContactsProps> = ({ contacts, searchTerm, setSearchTerm, onMessageClick }) => {
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c =>
      c.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(deferredSearchTerm.toLowerCase())
    );
  }, [contacts, deferredSearchTerm]);

  return (
    <div style={{ backgroundColor: 'var(--color-surface)' }} className="w-full flex flex-col h-full">
      <div style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)' }} className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2"><User className="h-5 w-5 text-slate-500" /> Firm & Client Directory</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            className="w-full pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-auto flex-1 p-0">
        <TableContainer className="border-0 shadow-none rounded-none h-full">
          <TableHeader>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department / Entity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableHeader>
          <TableBody>
            {filteredContacts.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={c.name} size="sm" className="ring-2 ring-white shadow-sm" />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                      <span className="text-[10px] text-slate-500">{c.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-700">{c.role}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    {c.department !== 'Internal' && <Briefcase className="h-3 w-3 text-slate-400" />}
                    {c.department}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={c.status === 'online' ? 'success' : 'neutral'}>{c.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" icon={MessageSquare} onClick={() => onMessageClick(c.id)}>Message</Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableContainer>
      </div>
    </div>
  );
};
