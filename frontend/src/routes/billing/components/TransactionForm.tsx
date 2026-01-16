export interface TransactionData {
  id?: string;
  amount: number;
  description: string;
}

export function TransactionForm({ onSubmit: _onSubmit, onCancel: _onCancel }: { onSubmit: (data: TransactionData) => void; onCancel: () => void }) {
  return null;
}
