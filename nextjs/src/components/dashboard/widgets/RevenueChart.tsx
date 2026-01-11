'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { BarChart as BarChartIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ChartData {
  label: string;
  data: number[];
}

interface RevenueChartProps {
  data: ChartData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Transform data for Recharts if necessary
  // Assuming Backend sends { label: "Jan", value: 1000 } style or we transform here
  // The interface ChartData in DAL is { label: string, data: number[] } which seems like a series?
  // Let's assume for Revenue trend we get easier data or map it.

  const hasData = data && data.length > 0 && data.some(d => d.data.length > 0);

  // Flatten/Map data for the chart if needed.
  // For now, if no data, show empty state.

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChartIcon className="h-5 w-5" /> Revenue Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
              <BarChartIcon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No revenue data available.</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            {/* Placeholder for actual chart implementation once data structure is confirmed */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.map(d => ({ name: d.label, value: d.data[0] || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
