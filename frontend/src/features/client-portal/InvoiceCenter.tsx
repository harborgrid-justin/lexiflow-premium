import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  CreditCard,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: string;
  matterId?: string;
}

interface InvoiceSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  unpaidInvoiceCount: number;
  overdueInvoiceCount: number;
}

interface InvoiceCenterProps {
  portalUserId: string;
}

export default function InvoiceCenter({ portalUserId }: InvoiceCenterProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
  }, [portalUserId, filter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ portalUserId });
      if (filter !== 'all') {
        params.append('status', filter);
      }
      const response = await fetch(`/api/client-portal/invoices?${params}`);
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`/api/client-portal/invoices/summary/overview?portalUserId=${portalUserId}`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch invoice summary:', error);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(
        `/api/client-portal/invoices/${invoiceId}/download?portalUserId=${portalUserId}`
      );
      // Handle PDF download
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Center</h1>
        <p className="mt-2 text-gray-600">View and manage your invoices</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Outstanding"
            value={`$${summary.totalOutstanding.toFixed(2)}`}
            icon={<DollarSign className="w-6 h-6" />}
            color="blue"
          />
          <SummaryCard
            title="Total Paid"
            value={`$${summary.totalPaid.toFixed(2)}`}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <SummaryCard
            title="Overdue"
            value={`$${summary.overdueAmount.toFixed(2)}`}
            icon={<AlertCircle className="w-6 h-6" />}
            color="red"
          />
          <SummaryCard
            title="Total Invoices"
            value={summary.invoiceCount.toString()}
            icon={<FileText className="w-6 h-6" />}
            color="gray"
          />
        </div>
      )}

      {/* Overdue Alert */}
      {summary && summary.overdueInvoiceCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <p className="text-sm text-red-700">
                You have <strong>{summary.overdueInvoiceCount}</strong> overdue invoice
                {summary.overdueInvoiceCount !== 1 ? 's' : ''} totaling $
                {summary.overdueAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Invoices</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    onDownload={() => handleDownloadInvoice(invoice.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'gray';
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    gray: 'bg-gray-500 text-white',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

interface InvoiceRowProps {
  invoice: Invoice;
  onDownload: () => void;
}

function InvoiceRow({ invoice, onDownload }: InvoiceRowProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      paid: { text: 'Paid', class: 'bg-green-100 text-green-800' },
      unpaid: { text: 'Unpaid', class: 'bg-yellow-100 text-yellow-800' },
      overdue: { text: 'Overdue', class: 'bg-red-100 text-red-800' },
      partial: { text: 'Partial', class: 'bg-blue-100 text-blue-800' },
    };

    const badge = badges[status as keyof typeof badges] || badges.unpaid;

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.balance > 0;

  return (
    <tr className={isOverdue ? 'bg-red-50' : ''}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {new Date(invoice.invoiceDate).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {new Date(invoice.dueDate).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          ${invoice.totalAmount.toFixed(2)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">${invoice.amountPaid.toFixed(2)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">${invoice.balance.toFixed(2)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={onDownload}
            className="text-blue-600 hover:text-blue-900"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          {invoice.balance > 0 && (
            <button className="text-green-600 hover:text-green-900" title="Pay Now">
              <CreditCard className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
