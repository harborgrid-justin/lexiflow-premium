import { Button } from '@/components/ui/atoms/Button/Button';
import { useNotify } from '@/hooks/useNotify';
import { useTheme } from '@/providers/ThemeContext';
import { useWindow } from '@/providers/WindowContext';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { getTodayString } from '@/utils/dateUtils';
import { OperatingLedger, TrustLedger } from '@features/knowledge';
import { FileText, Plus } from 'lucide-react';
import React, { useCallback, useState } from 'react';

const BillingLedgerComponent: React.FC = () => {
    const { theme } = useTheme();
    const { openWindow, closeWindow } = useWindow();
    const { success: notifySuccess, error: notifyError } = useNotify();
    const [activeTab, setActiveTab] = useState<'operating' | 'trust'>('operating');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

    const handleRecordTransaction = useCallback(() => {
        const winId = `txn-new-${crypto.randomUUID()}`.slice(0, 32); // Stable deterministic window ID
        openWindow(
            winId,
            'Record Ledger Transaction',
            <div className="p-6 bg-white h-full">
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Account</label>
                            <select id="transaction-account" className="w-full border rounded p-2 text-sm" aria-label="Account">
                                <option>Operating</option>
                                <option>Trust</option>
                                <option>Retainer</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                            <select id="transaction-type" className="w-full border rounded p-2 text-sm" aria-label="Type">
                                <option>Income</option>
                                <option>Expense</option>
                                <option>Transfer</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                            <input type="date" className="w-full border rounded p-2 text-sm" defaultValue={getTodayString()} aria-label="Date" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Amount</label>
                            <input type="number" className="w-full border rounded p-2 text-sm" placeholder="0.00" step="0.01" min="0" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                        <textarea
                            className="w-full border rounded p-2 text-sm h-24"
                            placeholder="Transaction details..."
                            id="transaction-description"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Receipt/Invoice</label>
                        <input
                            type="file"
                            id="receipt-upload"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="w-full border rounded p-2 text-sm"
                            aria-label="Receipt or Invoice"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    if (file.size > 5 * 1024 * 1024) {
                                        notifyError('File size must be less than 5MB');
                                        return;
                                    }
                                    setReceiptFile(file);
                                    // Create preview for images
                                    if (file.type.startsWith('image/')) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setReceiptPreview(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    } else {
                                        setReceiptPreview(null);
                                    }
                                }
                            }}
                        />
                        {receiptFile && (
                            <div className="mt-2 text-xs text-slate-600">
                                <FileText className="inline h-3 w-3 mr-1" />
                                {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)
                            </div>
                        )}
                        {receiptPreview && (
                            <div className="mt-2 border rounded p-2">
                                <img src={receiptPreview} alt="Receipt preview" className="max-h-32 object-contain" />
                            </div>
                        )}
                    </div>
                    <Button
                        variant="primary"
                        className="w-full"
                        onClick={async () => {
                            try {
                                const accountSelect = document.querySelector<HTMLSelectElement>('#transaction-account');
                                const typeSelect = document.querySelector<HTMLSelectElement>('#transaction-type');
                                const dateInput = document.querySelector<HTMLInputElement>('input[type="date"]');
                                const amountInput = document.querySelector<HTMLInputElement>('input[type="number"]');
                                const descriptionTextarea = document.querySelector<HTMLTextAreaElement>('#transaction-description');

                                if (!amountInput?.value || parseFloat(amountInput.value) <= 0) {
                                    notifyError('Please enter a valid amount');
                                    return;
                                }

                                if (!descriptionTextarea?.value?.trim()) {
                                    notifyError('Please enter a description');
                                    return;
                                }

                                const transaction = {
                                    id: crypto.randomUUID(),
                                    account: accountSelect?.value || 'Operating',
                                    type: typeSelect?.value || 'Income',
                                    date: dateInput?.value || new Date().toISOString().split('T')[0],
                                    amount: parseFloat(amountInput.value),
                                    description: descriptionTextarea.value,
                                    receiptFile: receiptFile ? {
                                        name: receiptFile.name,
                                        size: receiptFile.size,
                                        type: receiptFile.type,
                                        data: receiptPreview || null
                                    } : undefined,
                                    createdAt: new Date().toISOString(),
                                    userId: 'current-user'
                                };

                                await DataService.transactions.add(transaction);

                                notifySuccess(`Transaction logged successfully${receiptFile ? ' with receipt' : ''}`);
                                setReceiptFile(null);
                                setReceiptPreview(null);
                                closeWindow(winId);
                            } catch (err: unknown) {
                                notifyError('Failed to log transaction');
                                console.error('Transaction error:', err);
                            }
                        }}
                    >
                        Save
                    </Button>
                </div>
            </div>
        );
    }, [openWindow, closeWindow, notifySuccess, notifyError]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
                <div className={cn("flex p-1 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                    <button
                        onClick={() => setActiveTab('operating')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all",
                            activeTab === 'operating'
                                ? cn(theme.primary.DEFAULT, theme.text.inverse)
                                : cn(theme.text.secondary, `hover:${theme.surface.highlight}`)
                        )}
                    >
                        Operating Expenses
                    </button>
                    <button
                        onClick={() => setActiveTab('trust')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all",
                            activeTab === 'trust'
                                ? "bg-green-600 text-white shadow"
                                : cn(theme.text.secondary, `hover:${theme.surface.highlight}`)
                        )}
                    >
                        Trust (IOLTA)
                    </button>
                </div>
                <div className="flex-1"></div>
                <Button variant="outline" size="sm" icon={Plus} onClick={handleRecordTransaction}>Log Transaction</Button>
            </div>

            {activeTab === 'operating' ? (
                <OperatingLedger />
            ) : (
                <TrustLedger />
            )}
        </div>
    );
};
export const BillingLedger = memo(BillingLedgerComponent);
BillingLedger.displayName = 'BillingLedger';
