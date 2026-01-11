import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { DollarSign } from 'lucide-react';
import { DataService } from '@/services/data/dataService';

interface LedgerProps {
    className?: string;
    type: 'operating' | 'trust';
    accountId?: string;
}

interface Transaction {
    id: string | number;
    desc: string;
    amount: number;
    type: 'credit' | 'debit';
    date: string;
}

const LedgerBase: React.FC<LedgerProps> = ({ className, type, accountId }) => {
    const isTrust = type === 'trust';
    const title = isTrust ? 'Trust Account Ledger' : 'Operating Account Ledger';
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLedger = async () => {
            if (!accountId) return;
            setLoading(true);
            try {
                // Real API Integration
                const data = await DataService.billing.getTrustTransactions(accountId);

                if (Array.isArray(data)) {
                    setTransactions(data.map((t) => ({
                        id: t.id,
                        desc: t.description,
                        amount: t.amount,
                        type: (t.amount || 0) >= 0 ? 'credit' : 'debit',
                        date: t.date ? new Date(t.date).toLocaleDateString() : 'N/A'
                    })));

                    // Calculate running balance
                    const total = data.reduce((acc: number, curr) => acc + (curr.amount || 0), 0);
                    setBalance(total);
                }
            } catch (err) {
                console.error("Failed to fetch ledger transactions", err);
            } finally {
                setLoading(false);
            }
        };

        if (accountId) fetchLedger();
    }, [type, accountId]);

    return (
        <div className={cn("flex flex-col h-full bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800", className)}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", isTrust ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400")}>
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                        <p className="text-xs text-slate-500">
                            {accountId ? `Account # ....${accountId.slice(-4)}` : 'Select Account'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500">Current Balance</p>
                    <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                        {balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Description</th>
                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                            <th className="px-4 py-3 font-medium text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading transactions...</td>
                            </tr>
                        )}
                        {!loading && transactions.length > 0 ? transactions.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.date}</td>
                                <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">{t.desc}</td>
                                <td className={cn("px-4 py-3 text-right font-mono", t.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400")}>
                                    {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-slate-500">--</td>
                            </tr>
                        )) : !loading && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                    {accountId ? "No transactions found for this period." : "No account selected."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const OperatingLedger: React.FC<{ className?: string; accountId?: string }> = (props) => <LedgerBase {...props} type="operating" />;
export const TrustLedger: React.FC<{ className?: string; accountId?: string }> = (props) => <LedgerBase {...props} type="trust" />;
