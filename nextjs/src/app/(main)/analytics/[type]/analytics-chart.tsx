"use client";

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/shadcn/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

interface AnalyticsChartProps {
  data: any[];
  config: any;
  title: string;
  showRevenue?: boolean;
}

export function AnalyticsChart({ data, config, title, showRevenue }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-75 items-center justify-center text-muted-foreground">
        No data available for this period.
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="min-h-75 w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {/* @ts-expect-error ChartLegendContent types are inferred during render */}
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} name={title} />
        {showRevenue && (
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} name="Revenue" />
        )}
      </BarChart>
    </ChartContainer>
  );
}
