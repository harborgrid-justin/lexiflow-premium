import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/organisms/Table/Table';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { Formatters } from '@/utils/formatters';
import { FileText, Landmark } from 'lucide-react';
import React from 'react';

interface TrustLedgerAccount {
    client: string;
    matterId: string;
    matter: string;
    lastTransaction: string;
    balance: number;
}

interface TrustLedgerProps {
    trustAccounts: TrustLedgerAccount[];
}

export const TrustLedger: React.FC<TrustLedgerProps> = ({ trustAccounts }) => {
    const { theme } = useTheme();

    const totalLiability = trustAccounts.reduce((acc: number, curr) => acc + curr.balance, 0);

    return (
        <div className="space-y-6">
            <div className={cn("rounded-lg p-6 flex flex-col md:flex-row justify-between items-center shadow-sm border", theme.status.success.bg, theme.status.success.border)}>
                <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-full bg-white/50 dark:bg-emerald-900/50", theme.status.success.text)}>
                        <Landmark className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className={cn("text-xl font-bold", theme.status.success.text)}>Total Trust Liability (IOLTA)</h3>
                        <p className={cn("text-sm mt-1 max-w-lg", theme.status.success.text)}>{'Client funds held in trust. Strictly regulated by State Bar. Daily reconciliation required.'}</p>
                    </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                    <p className={cn("text-4xl font-mono font-bold tracking-tight", theme.status.success.text)}>{Formatters.currency(totalLiability)}</p>
                    <p className={cn("text-xs font-bold uppercase mt-1 flex items-center justify-end", theme.status.success.text)}><FileText className="h-3 w-3 mr-1" /> Reconciled: Today 09:00 AM</p>
                </div>
            </div>

            <Card title="Client Trust Ledgers" noPadding>
                <TableContainer responsive="card" className="shadow-none border-0 rounded-none">
                    <TableHeader>
                        <TableHead>Client</TableHead>
                        <TableHead>Matter Reference</TableHead>
                        <TableHead>Last Transaction</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                    </TableHeader>
                    <TableBody>
                        {trustAccounts.map((c, i) => (
                            <TableRow key={c.matterId || `trust-account-${i}`}>
                                <TableCell className={cn("font-bold", theme.text.primary)}>{c.client}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className={cn("text-xs font-mono", theme.text.secondary)}>{c.matterId}</span>
                                        <span className={cn("text-sm", theme.text.primary)}>{c.matter}</span>
                                    </div>
                                </TableCell>
                                <TableCell className={theme.text.secondary}>{c.lastTransaction}</TableCell>
                                <TableCell className={cn("text-right font-mono font-bold", theme.text.primary)}>{Formatters.currency(c.balance)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </TableContainer>
            </Card>
        </div>
    );
};
