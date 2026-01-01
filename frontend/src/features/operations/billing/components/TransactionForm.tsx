import { Button } from '@/components/ui/atoms/Button/Button';
import { getTodayString } from '@/utils/dateUtils';
import { FileText } from 'lucide-react';
import React, { useState } from 'react';

interface TransactionFormProps {
  onSubmit: (data: TransactionData) => Promise<void>;
  onError: (message: string) => void;
}

export interface TransactionData {
  id: string;
  account: string;
  type: string;
  date: string;
  amount: number;
  description: string;
  receiptFile?: { name: string; size: number; type: string; data: string | null };
  createdAt: string;
  userId: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onError }) => {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [account, setAccount] = useState('Operating');
  const [type, setType] = useState('Income');
  const [date, setDate] = useState(getTodayString());
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onError('File size must be less than 5MB');
      return;
    }
    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      onError('Please enter a valid amount');
      return;
    }
    if (!description.trim()) {
      onError('Please enter a description');
      return;
    }

    await onSubmit({
      id: crypto.randomUUID(),
      account,
      type,
      date,
      amount: parseFloat(amount),
      description,
      receiptFile: receiptFile
        ? { name: receiptFile.name, size: receiptFile.size, type: receiptFile.type, data: receiptPreview }
        : undefined,
      createdAt: new Date().toISOString(),
      userId: 'current-user',
    });
  };

  return (
    <div className="p-6 bg-white h-full">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Account</label>
            <select value={account} onChange={(e) => setAccount(e.target.value)} className="w-full border rounded p-2 text-sm">
              <option>Operating</option>
              <option>Trust</option>
              <option>Retainer</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded p-2 text-sm">
              <option>Income</option>
              <option>Expense</option>
              <option>Transfer</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded p-2 text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="0.00" step="0.01" min="0" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded p-2 text-sm h-24" placeholder="Transaction details..." />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Receipt/Invoice</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full border rounded p-2 text-sm" onChange={handleFileChange} />
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
        <Button variant="primary" className="w-full" onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
};
