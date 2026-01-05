
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Button } from '../common/Button.tsx';
import { Plus } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar.tsx';

export const RateManager: React.FC = () => {
    const rates = [
        { name: 'Alexandra H.', role: 'Senior Partner', stdRate: 850, clientRate: 750, effective: '2024-01-01' },
        { name: 'James Doe', role: 'Associate', stdRate: 450, clientRate: 450, effective: '2024-01-01' },
        { name: 'Sarah Jenkins', role: 'Paralegal', stdRate: 250, clientRate: 225, effective: '2024-01-01' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Fee Schedule: TechCorp Industries</h2>
                <Button variant="primary" icon={Plus}>Add Exception</Button>
            </div>

            <TableContainer>
                <TableHeader>
                    <TableHead>Timekeeper</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Standard Rate</TableHead>
                    <TableHead>Approved Rate</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Effective Date</TableHead>
                </TableHeader>
                <TableBody>
                    {rates.map((r, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <UserAvatar name={r.name} size="sm"/> {r.name}
                                </div>
                            </TableCell>
                            <TableCell>{r.role}</TableCell>
                            <TableCell className="text-slate-500 line-through">${r.stdRate}</TableCell>
                            <TableCell className="font-bold text-slate-900">${r.clientRate}</TableCell>
                            <TableCell>
                                {r.stdRate > r.clientRate && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                                        {Math.round(((r.stdRate - r.clientRate) / r.stdRate) * 100)}% Off
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>{r.effective}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </div>
    );
};
