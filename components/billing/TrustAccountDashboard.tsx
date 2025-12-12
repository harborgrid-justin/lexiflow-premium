import React, { useState, useEffect } from 'react';
import { billingService, TrustAccount, TrustTransaction } from '../../services/billingService';
import { errorHandler } from '../../utils/errorHandler';

interface TrustAccountDashboardProps {
  clientId?: string;
}

export const TrustAccountDashboard: React.FC<TrustAccountDashboardProps> = ({ clientId }) => {
  const [accounts, setAccounts] = useState<TrustAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<TrustAccount | null>(null);
  const [transactions, setTransactions] = useState<TrustTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [depositForm, setDepositForm] = useState({
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    payor: '',
    referenceNumber: '',
    paymentMethod: '',
    notes: '',
  });
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    payee: '',
    checkNumber: '',
    notes: '',
  });

  useEffect(() => {
    loadAccounts();
  }, [clientId]);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount.id);
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await billingService.getTrustAccounts(clientId, 'Active');
      setAccounts(data);
      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0]);
      }
    } catch (err) {
      errorHandler.logError(err as Error, 'TrustAccountDashboard:loadAccounts');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (accountId: string) => {
    setLoadingTransactions(true);
    try {
      const data = await billingService.getTrustTransactions(accountId);
      setTransactions(data);
    } catch (err) {
      errorHandler.logError(err as Error, 'TrustAccountDashboard:loadTransactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const amount = parseFloat(depositForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await billingService.depositToTrustAccount(selectedAccount.id, {
        amount,
        transactionDate: depositForm.transactionDate,
        description: depositForm.description,
        payor: depositForm.payor || undefined,
        referenceNumber: depositForm.referenceNumber || undefined,
        paymentMethod: depositForm.paymentMethod || undefined,
        notes: depositForm.notes || undefined,
      });

      setShowDepositModal(false);
      setDepositForm({
        amount: '',
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
        payor: '',
        referenceNumber: '',
        paymentMethod: '',
        notes: '',
      });

      // Reload account and transactions
      await loadAccounts();
      await loadTransactions(selectedAccount.id);
      alert('Deposit recorded successfully!');
    } catch (err) {
      errorHandler.logError(err as Error, 'TrustAccountDashboard:handleDeposit');
      alert('Failed to record deposit');
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const amount = parseFloat(withdrawalForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > selectedAccount.balance) {
      alert('Insufficient funds in trust account');
      return;
    }

    try {
      await billingService.withdrawFromTrustAccount(selectedAccount.id, {
        amount,
        transactionDate: withdrawalForm.transactionDate,
        description: withdrawalForm.description,
        payee: withdrawalForm.payee || undefined,
        checkNumber: withdrawalForm.checkNumber || undefined,
        notes: withdrawalForm.notes || undefined,
      });

      setShowWithdrawalModal(false);
      setWithdrawalForm({
        amount: '',
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
        payee: '',
        checkNumber: '',
        notes: '',
      });

      // Reload account and transactions
      await loadAccounts();
      await loadTransactions(selectedAccount.id);
      alert('Withdrawal recorded successfully!');
    } catch (err) {
      errorHandler.logError(err as Error, 'TrustAccountDashboard:handleWithdrawal');
      alert('Failed to record withdrawal');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTransactionTypeClass = (type: string) => {
    const typeMap: Record<string, string> = {
      'Deposit': 'type-deposit',
      'Withdrawal': 'type-withdrawal',
      'Transfer': 'type-transfer',
      'Interest': 'type-interest',
      'Fee': 'type-fee',
      'Adjustment': 'type-adjustment',
    };
    return typeMap[type] || 'type-default';
  };

  if (loading) {
    return (
      <div className="trust-dashboard loading">
        <div className="spinner">Loading trust accounts...</div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="trust-dashboard empty">
        <div className="empty-state">
          <h3>No Trust Accounts</h3>
          <p>No active trust accounts found{clientId ? ' for this client' : ''}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trust-dashboard">
      <div className="dashboard-header">
        <h2>Trust Account Management</h2>
      </div>

      <div className="dashboard-content">
        <div className="accounts-sidebar">
          <h3>Accounts</h3>
          <div className="accounts-list">
            {accounts.map(account => (
              <div
                key={account.id}
                className={`account-card ${selectedAccount?.id === account.id ? 'active' : ''}`}
                onClick={() => setSelectedAccount(account)}
              >
                <div className="account-name">{account.accountName}</div>
                <div className="account-number">{account.accountNumber}</div>
                <div className="account-balance">{formatCurrency(account.balance)}</div>
                <div className="account-type">{account.accountType}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="account-details">
          {selectedAccount && (
            <>
              <div className="details-header">
                <div className="account-info">
                  <h3>{selectedAccount.accountName}</h3>
                  <p className="client-name">{selectedAccount.clientName}</p>
                  <div className="account-meta">
                    <span className="meta-item">
                      <strong>Account:</strong> {selectedAccount.accountNumber}
                    </span>
                    <span className="meta-item">
                      <strong>Type:</strong> {selectedAccount.accountType}
                    </span>
                    {selectedAccount.bankName && (
                      <span className="meta-item">
                        <strong>Bank:</strong> {selectedAccount.bankName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="balance-card">
                  <div className="balance-label">Current Balance</div>
                  <div className="balance-amount">{formatCurrency(selectedAccount.balance)}</div>
                  {selectedAccount.minimumBalance > 0 && (
                    <div className="balance-minimum">
                      Min: {formatCurrency(selectedAccount.minimumBalance)}
                    </div>
                  )}
                </div>
              </div>

              <div className="action-buttons">
                <button onClick={() => setShowDepositModal(true)} className="btn btn-success">
                  + Deposit
                </button>
                <button onClick={() => setShowWithdrawalModal(true)} className="btn btn-primary">
                  - Withdrawal
                </button>
                <button className="btn btn-secondary">
                  Reconcile
                </button>
                <button className="btn btn-secondary">
                  Export Report
                </button>
              </div>

              <div className="transactions-section">
                <h4>Transaction History</h4>
                {loadingTransactions ? (
                  <div className="loading-state">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="empty-state">No transactions found</div>
                ) : (
                  <div className="transactions-table-container">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Reference</th>
                          <th>Payor/Payee</th>
                          <th className="amount">Amount</th>
                          <th className="balance">Balance After</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(txn => (
                          <tr key={txn.id}>
                            <td>{new Date(txn.transactionDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`type-badge ${getTransactionTypeClass(txn.transactionType)}`}>
                                {txn.transactionType}
                              </span>
                            </td>
                            <td className="description-cell">{txn.description}</td>
                            <td>{txn.referenceNumber || txn.checkNumber || '-'}</td>
                            <td>{txn.payor || txn.payee || '-'}</td>
                            <td className={`amount ${
                              txn.transactionType === 'Deposit' || txn.transactionType === 'Interest'
                                ? 'positive'
                                : 'negative'
                            }`}>
                              {txn.transactionType === 'Deposit' || txn.transactionType === 'Interest' ? '+' : '-'}
                              {formatCurrency(txn.amount)}
                            </td>
                            <td className="balance">{formatCurrency(txn.balanceAfter)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record Deposit</h3>
              <button onClick={() => setShowDepositModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="depositAmount">Amount *</label>
                  <input
                    type="number"
                    id="depositAmount"
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                    step="0.01"
                    min="0.01"
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="depositDate">Date *</label>
                  <input
                    type="date"
                    id="depositDate"
                    value={depositForm.transactionDate}
                    onChange={(e) => setDepositForm({ ...depositForm, transactionDate: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="depositDescription">Description *</label>
                  <input
                    type="text"
                    id="depositDescription"
                    value={depositForm.description}
                    onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="depositPayor">Payor</label>
                  <input
                    type="text"
                    id="depositPayor"
                    value={depositForm.payor}
                    onChange={(e) => setDepositForm({ ...depositForm, payor: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="depositReference">Reference Number</label>
                  <input
                    type="text"
                    id="depositReference"
                    value={depositForm.referenceNumber}
                    onChange={(e) => setDepositForm({ ...depositForm, referenceNumber: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="depositMethod">Payment Method</label>
                  <select
                    id="depositMethod"
                    value={depositForm.paymentMethod}
                    onChange={(e) => setDepositForm({ ...depositForm, paymentMethod: e.target.value })}
                    className="form-control"
                  >
                    <option value="">Select method</option>
                    <option value="Check">Check</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="ACH">ACH</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="depositNotes">Notes</label>
                  <textarea
                    id="depositNotes"
                    value={depositForm.notes}
                    onChange={(e) => setDepositForm({ ...depositForm, notes: e.target.value })}
                    rows={2}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowDepositModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Record Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record Withdrawal</h3>
              <button onClick={() => setShowWithdrawalModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleWithdrawal}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="withdrawalAmount">Amount *</label>
                  <input
                    type="number"
                    id="withdrawalAmount"
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                    step="0.01"
                    min="0.01"
                    max={selectedAccount?.balance}
                    required
                    className="form-control"
                    placeholder={`Max: ${formatCurrency(selectedAccount?.balance || 0)}`}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="withdrawalDate">Date *</label>
                  <input
                    type="date"
                    id="withdrawalDate"
                    value={withdrawalForm.transactionDate}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, transactionDate: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="withdrawalDescription">Description *</label>
                  <input
                    type="text"
                    id="withdrawalDescription"
                    value={withdrawalForm.description}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, description: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="withdrawalPayee">Payee</label>
                  <input
                    type="text"
                    id="withdrawalPayee"
                    value={withdrawalForm.payee}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, payee: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="withdrawalCheck">Check Number</label>
                  <input
                    type="text"
                    id="withdrawalCheck"
                    value={withdrawalForm.checkNumber}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, checkNumber: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="withdrawalNotes">Notes</label>
                  <textarea
                    id="withdrawalNotes"
                    value={withdrawalForm.notes}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, notes: e.target.value })}
                    rows={2}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowWithdrawalModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .trust-dashboard {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .dashboard-header {
          padding: 1.5rem 2rem;
          background: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
        }

        .dashboard-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #1a1a1a;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          min-height: 600px;
        }

        .accounts-sidebar {
          background: #f8f9fa;
          padding: 1.5rem;
          border-right: 1px solid #e9ecef;
        }

        .accounts-sidebar h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          color: #495057;
        }

        .accounts-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .account-card {
          padding: 1rem;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .account-card:hover {
          border-color: #4a90e2;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .account-card.active {
          border-color: #4a90e2;
          background: #e7f3ff;
        }

        .account-name {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }

        .account-number {
          font-size: 0.875rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .account-balance {
          font-size: 1.25rem;
          font-weight: 700;
          color: #28a745;
          margin-bottom: 0.25rem;
        }

        .account-type {
          font-size: 0.75rem;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .account-details {
          padding: 2rem;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e9ecef;
        }

        .account-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          color: #1a1a1a;
        }

        .client-name {
          margin: 0 0 1rem 0;
          color: #6c757d;
          font-size: 1rem;
        }

        .account-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .meta-item {
          font-size: 0.875rem;
          color: #495057;
        }

        .balance-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1.5rem;
          border-radius: 8px;
          color: white;
          min-width: 250px;
          text-align: right;
        }

        .balance-label {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }

        .balance-amount {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .balance-minimum {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .transactions-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          color: #333;
        }

        .transactions-table-container {
          overflow-x: auto;
          border: 1px solid #e9ecef;
          border-radius: 4px;
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .transactions-table th {
          background: #f8f9fa;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #495057;
          font-size: 0.875rem;
          border-bottom: 2px solid #dee2e6;
        }

        .transactions-table th.amount,
        .transactions-table th.balance {
          text-align: right;
        }

        .transactions-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e9ecef;
          font-size: 0.875rem;
        }

        .transactions-table td.amount,
        .transactions-table td.balance {
          text-align: right;
        }

        .transactions-table td.amount.positive {
          color: #28a745;
          font-weight: 600;
        }

        .transactions-table td.amount.negative {
          color: #dc3545;
          font-weight: 600;
        }

        .description-cell {
          max-width: 250px;
        }

        .type-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .type-deposit {
          background: #d4edda;
          color: #155724;
        }

        .type-withdrawal {
          background: #f8d7da;
          color: #721c24;
        }

        .type-interest {
          background: #d1ecf1;
          color: #0c5460;
        }

        .type-fee {
          background: #fff3cd;
          color: #856404;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #4a90e2;
          color: white;
        }

        .btn-primary:hover {
          background: #357abd;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-success:hover {
          background: #218838;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6c757d;
          line-height: 1;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e9ecef;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .loading, .empty {
          padding: 3rem;
          text-align: center;
        }

        .loading-state, .empty-state {
          padding: 2rem;
          text-align: center;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};
