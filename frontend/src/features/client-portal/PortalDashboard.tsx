import React, { useState, useEffect } from 'react';
import {
  Home,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Bell,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface DashboardSummary {
  unreadMessages: number;
  upcomingAppointments: number;
  pendingDocuments: number;
  unpaidInvoices: number;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
}

interface PortalDashboardProps {
  portalUserId: string;
  userName?: string;
}

export default function PortalDashboard({ portalUserId, userName }: PortalDashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [portalUserId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/client-portal/dashboard?portalUserId=${portalUserId}`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{userName ? `, ${userName}` : ''}
        </h1>
        <p className="mt-2 text-gray-600">Here's an overview of your matters and activities</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Unread Messages"
          value={summary?.unreadMessages || 0}
          icon={<Mail className="w-6 h-6" />}
          color="blue"
          link="/client-portal/messages"
        />
        <StatCard
          title="Upcoming Appointments"
          value={summary?.upcomingAppointments || 0}
          icon={<Calendar className="w-6 h-6" />}
          color="green"
          link="/client-portal/appointments"
        />
        <StatCard
          title="Pending Documents"
          value={summary?.pendingDocuments || 0}
          icon={<FileText className="w-6 h-6" />}
          color="yellow"
          link="/client-portal/documents"
        />
        <StatCard
          title="Unpaid Invoices"
          value={summary?.unpaidInvoices || 0}
          icon={<DollarSign className="w-6 h-6" />}
          color="red"
          link="/client-portal/invoices"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            icon={<Mail className="w-5 h-5" />}
            label="Send Message"
            onClick={() => (window.location.href = '/client-portal/messages?compose=true')}
          />
          <QuickActionButton
            icon={<Calendar className="w-5 h-5" />}
            label="Schedule Appointment"
            onClick={() => (window.location.href = '/client-portal/appointments?schedule=true')}
          />
          <QuickActionButton
            icon={<FileText className="w-5 h-5" />}
            label="View Documents"
            onClick={() => (window.location.href = '/client-portal/documents')}
          />
          <QuickActionButton
            icon={<DollarSign className="w-5 h-5" />}
            label="View Invoices"
            onClick={() => (window.location.href = '/client-portal/invoices')}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Recent Activity
        </h2>
        {summary?.recentActivity && summary.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {summary.recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No recent activity to display</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
  link: string;
}

function StatCard({ title, value, icon, color, link }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    red: 'bg-red-500 text-white',
  };

  return (
    <a
      href={link}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </a>
  );
}

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function QuickActionButton({ icon, label, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

interface ActivityItemProps {
  activity: {
    type: string;
    message: string;
    timestamp: Date;
  };
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'invoice':
        return <DollarSign className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">{getIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
      </div>
    </div>
  );
}
