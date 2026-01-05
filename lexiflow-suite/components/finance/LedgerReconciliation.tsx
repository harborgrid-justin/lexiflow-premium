
import React from 'react';
import { Card } from '../common/Card.tsx';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { Check, AlertTriangle, RefreshCw } from 'lucide-react';

export const LedgerReconciliation: React.FC = () => {
    const txs = [
        { id: 'TX-901', date: '2024-03-01', desc: 'Settlement Deposit', amount: 50000, status: 'Matched' },
        { id: 'TX-902', date: '2024-03-02', desc: 'Filing Fee Withdrawal', amount: -450, status: 'Matched' },
        { id: 'TX-903', date: '2024-03-05', desc: 'Client Distribution', amount: -30000, status: 'Unmatched' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">Trust Account Reconciliation</h3>
                    <p className="text-slate-400 text-sm">Account ending in •••• 8842 (Chase)</p>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase font-bold text-slate-500">Unreconciled Difference</p>
                    <p className="text-2xl font-mono font-bold text-red-400">-$30,000.00</p>
                </div>
            </div>

            <Card title="Transaction Matcher">
                <TableContainer className="border-0 shadow-none">
                    <TableHeader>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Bank Status</TableHead>
                        <TableHead>Ledger Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableHeader>
                    <TableBody>
                        {txs.map(tx => (
                            <TableRow key={tx.id}>
                                <TableCell>{tx.date}</TableCell>
                                <TableCell className="font-medium text-slate-800">{tx.desc}</TableCell>
                                <TableCell className={`font-mono font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>${tx.amount.toLocaleString()}</TableCell>
                                <TableCell><span className="flex items-center text-xs text-slate-500"><Check size={12} className="mr-1"/> Cleared</span></TableCell>
                                <TableCell>
                                    {tx.status === 'Matched' ? <Badge variant="success">Matched</Badge> : <Badge variant="error">Pending</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                    {tx.status === 'Unmatched' && <Button size="sm" variant="outline">Reconcile</Button>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </TableContainer>
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                    <Button variant="primary" icon={RefreshCw}>Run Auto-Match</Button>
                </div>
            </Card>
        </div>
    );
};
