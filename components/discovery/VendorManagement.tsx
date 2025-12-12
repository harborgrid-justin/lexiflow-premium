import React, { useState } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Briefcase, Phone, Mail, Star, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { Vendor } from '../../types';
import { useQuery, useMutation } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { Modal } from '../common/Modal';
import { Input } from '../common/Inputs';

export const VendorManagement: React.FC = () => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({});

  const { data: vendors = [] } = useQuery<Vendor[]>(
      [STORES.VENDORS, 'all'],
      DataService.discovery.getVendors
  );

  const { mutate: addVendor } = useMutation(
      DataService.discovery.addVendor,
      {
          invalidateKeys: [[STORES.VENDORS, 'all']],
          onSuccess: () => { setIsModalOpen(false); setNewVendor({}); }
      }
  );

  const handleSave = () => {
      if (!newVendor.name) return;
      addVendor({
          id: `vnd-${Date.now()}`,
          name: newVendor.name,
          serviceType: newVendor.serviceType as any || 'Court Reporting',
          contactName: newVendor.contactName || '',
          phone: newVendor.phone || '',
          email: newVendor.email || '',
          status: 'Active',
          rating: 5
      } as Vendor);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
            <div>
                <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
                    <Briefcase className="h-5 w-5 mr-2 text-indigo-600"/> Vendor Management (Rule 28)
                </h3>
                <p className={cn("text-sm", theme.text.secondary)}>Court reporters, videographers, and interpreters.</p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Add Vendor</Button>
        </div>

        <TableContainer>
            <TableHeader>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Rating</TableHead>
            </TableHeader>
            <TableBody>
                {vendors.map(v => (
                    <TableRow key={v.id}>
                        <TableCell className={cn("font-bold", theme.text.primary)}>{v.name}</TableCell>
                        <TableCell>{v.serviceType}</TableCell>
                        <TableCell>
                            <div className="text-xs">
                                <p>{v.contactName}</p>
                                <p className={theme.text.secondary}>{v.phone}</p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={v.status === 'Preferred' ? 'success' : v.status === 'Blocked' ? 'error' : 'neutral'}>{v.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end items-center text-yellow-500 gap-1">
                                <span className={cn("font-bold text-sm", theme.text.primary)}>{v.rating}</span> <Star className="h-4 w-4 fill-current"/>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
                {vendors.length === 0 && (
                    <TableRow><TableCell colSpan={5} className={cn("text-center py-8 italic", theme.text.tertiary)}>No vendors listed.</TableCell></TableRow>
                )}
            </TableBody>
        </TableContainer>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vendor">
            <div className="p-6 space-y-4">
                <Input label="Vendor Name" value={newVendor.name || ''} onChange={e => setNewVendor({...newVendor, name: e.target.value})}/>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Service Type</label>
                         <select className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)} value={newVendor.serviceType} onChange={e => setNewVendor({...newVendor, serviceType: e.target.value as any})}>
                             <option value="Court Reporting">Court Reporting</option>
                             <option value="Videography">Videography</option>
                             <option value="Forensics">Forensics</option>
                             <option value="Translation">Translation</option>
                         </select>
                     </div>
                     <Input label="Contact Person" value={newVendor.contactName || ''} onChange={e => setNewVendor({...newVendor, contactName: e.target.value})}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <Input label="Phone" value={newVendor.phone || ''} onChange={e => setNewVendor({...newVendor, phone: e.target.value})}/>
                     <Input label="Email" value={newVendor.email || ''} onChange={e => setNewVendor({...newVendor, email: e.target.value})}/>
                </div>
                <div className="flex justify-end pt-4">
                    <Button variant="primary" onClick={handleSave}>Save Vendor</Button>
                </div>
            </div>
        </Modal>
    </div>
  );
};