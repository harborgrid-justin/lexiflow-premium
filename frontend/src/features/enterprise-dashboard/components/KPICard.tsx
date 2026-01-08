import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { KPIData } from '../types';

interface KPICardProps {
  title: string;
  data: KPIData;
  format?: 'number' | 'currency' | 'percentage';
  prefix?: string;
  suffix?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  data,
  format = 'number',
  prefix = '',
  suffix = '',
}) => {
  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4" />;
      case 'down':
        return <ArrowDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {prefix}
            {formatValue(data.value)}
            {suffix}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm font-medium">{Math.abs(data.change)}%</span>
        </div>
      </div>
      {data.target && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Target</span>
            <span className="font-medium text-gray-900">
              {formatValue(data.target)}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((data.value / data.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
