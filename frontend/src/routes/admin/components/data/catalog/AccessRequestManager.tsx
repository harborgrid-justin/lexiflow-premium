import { AccessRequest } from '@/api/admin/access-requests-api';
import { useTheme } from '@/theme';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/atoms/Badge/Badge';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/organisms/Table/Table';
import { CheckCircle, Clock, Loader2, User, XCircle } from 'lucide-react';
export function AccessRequestManager() {
    const { theme } = useTheme();

    const { data: requests = [], isLoading } = useQuery<AccessRequest[]>(
        ['admin', 'access-requests'],
        async () => {
            // Safe access ignoring typed interface gaps
            const adminService = DataService.admin as unknown as { accessRequests: { getRequests: () => Promise<AccessRequest[]> } };
            return await adminService.accessRequests.getRequests();
        }
    );

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
        );
    }


    return (
        <div className="space-y-6 animate-fade-in p-6">
            <div className={cn("p-4 border rounded-lg flex justify-between items-center", theme.surface.default, theme.border.default)}>
                <h4 className={cn("font-bold", theme.text.primary)}>Pending Requests</h4>
                <Badge variant="warning">{requests.filter(r => r.status === 'Pending').length} Pending</Badge>
            </div>

            <TableContainer>
                <TableHeader>
                    <TableHead>User</TableHead>
                    <TableHead>Dataset</TableHead>
                    <TableHead>Justification</TableHead>
                    <TableHead>Request Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <TableBody>
                    {requests.map(req => (
                        <TableRow key={req.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <User className={cn("h-4 w-4", theme.text.tertiary)} />
                                    <span className={cn("font-medium", theme.text.primary)}>{req.user}</span>
                                </div>
                            </TableCell>
                            <TableCell>{req.dataset}</TableCell>
                            <TableCell className={cn("text-xs italic", theme.text.secondary)}>{req.purpose}</TableCell>
                            <TableCell>
                                <span className={cn("flex items-center text-xs", theme.text.tertiary)}>
                                    <Clock className="h-3 w-3 mr-1" /> {req.date}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'error' : 'warning'}>
                                    {req.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {req.status === 'Pending' && (
                                    <div className="flex justify-end gap-1">
                                        <button className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><CheckCircle className="h-4 w-4" /></button>
                                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><XCircle className="h-4 w-4" /></button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </div>
    );
};
