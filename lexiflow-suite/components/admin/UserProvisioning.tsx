
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';
import { Badge } from '../common/Badge.tsx';

export const UserProvisioning: React.FC = () => {
    return (
        <TableContainer>
            <TableHeader>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Groups</TableHead>
                <TableHead>MFA Status</TableHead>
                <TableHead>Last Login</TableHead>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell><div className="flex items-center gap-2"><UserAvatar name="AH" size="sm"/> Alex Hamilton</div></TableCell>
                    <TableCell>Partner</TableCell>
                    <TableCell>Litigation, M&A</TableCell>
                    <TableCell><Badge variant="success">Enforced</Badge></TableCell>
                    <TableCell>Today 09:00 AM</TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell><div className="flex items-center gap-2"><UserAvatar name="Guest" size="sm"/> External Auditor</div></TableCell>
                    <TableCell>Guest</TableCell>
                    <TableCell>Read-Only (Limited)</TableCell>
                    <TableCell><Badge variant="warning">Optional</Badge></TableCell>
                    <TableCell>Yesterday</TableCell>
                </TableRow>
            </TableBody>
        </TableContainer>
    );
};
