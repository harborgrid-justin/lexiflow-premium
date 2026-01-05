
import React from 'react';
import { Card } from './Card.tsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  bg?: string;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color = 'text-blue-600', bg = 'bg-blue-50', trend }) => {
  return (
    <Card className="flex items-center justify-between" noPadding={false}>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
        {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
      </div>
      <div className={`p-3 rounded-full ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </Card>
  );
};
