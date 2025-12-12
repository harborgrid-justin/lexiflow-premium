import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ResourceForecast: React.FC = () => {
  const forecastData = [
    { week: 'Week 1', required: 8, current: 8, utilization: 75 },
    { week: 'Week 2', required: 9, current: 8, utilization: 82 },
    { week: 'Week 3', required: 10, current: 8, utilization: 88 },
    { week: 'Week 4', required: 11, current: 8, utilization: 95 },
    { week: 'Week 5', required: 12, current: 8, utilization: 102 },
    { week: 'Week 6', required: 11, current: 8, utilization: 95 },
    { week: 'Week 7', required: 10, current: 8, utilization: 88 },
    { week: 'Week 8', required: 9, current: 8, utilization: 82 },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Staffing Forecast - Next 8 Weeks
        </h3>
        <p className="text-sm text-gray-500">Projected resource needs vs current capacity</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis label={{ value: 'Attorneys', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="required"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Required Staff"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#10b981"
              strokeWidth={2}
              name="Current Staff"
              dot={{ r: 4 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="border rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Current Capacity</p>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-gray-600">Attorneys</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Peak Requirement</p>
            <p className="text-2xl font-bold text-orange-600">12</p>
            <p className="text-xs text-gray-600">Week 5</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Utilization</p>
            <p className="text-2xl font-bold text-blue-600">75%</p>
            <p className="text-xs text-gray-600">Current</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="p-3 bg-amber-50 rounded-lg flex gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Capacity Alert</p>
              <p className="text-xs text-amber-800">
                Projected 4 attorney shortage in Week 5. Consider hiring or reallocating resources.
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg flex gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Recommendation</p>
              <p className="text-xs text-blue-800">
                Hire 2 additional attorneys or engage contract attorneys for peak period.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
