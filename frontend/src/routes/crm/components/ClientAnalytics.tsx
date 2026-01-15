import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { Card } from '@/components/molecules/Card';
import { useChartTheme } from '@/components/organisms/ChartHelpers';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';

export function ClientAnalytics() {
  const { mode } = useTheme();
  const chartTheme = useChartTheme();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor container dimensions to prevent Recharts crash with 0/negative size
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // Only set dimensions if valid positive numbers
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);

    // Initial check and fallback
    updateDimensions();
    const timer = setTimeout(updateDimensions, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Enterprise Data Access
  const { data: analyticsData } = useQuery(
    ['crm', 'analytics'],
    () => DataService.crm.getAnalytics(mode)
  );

  // Type guard for analytics
  const analyticsRevenue = typeof analyticsData === 'object' && analyticsData !== null && 'revenue' in analyticsData && Array.isArray(analyticsData.revenue)
    ? analyticsData.revenue : [];
  const analyticsSources = typeof analyticsData === 'object' && analyticsData !== null && 'sources' in analyticsData && Array.isArray(analyticsData.sources)
    ? analyticsData.sources : [];

  const analytics = {
    revenue: analyticsRevenue,
    sources: analyticsSources
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Composition (Retained vs New)">
          <div className="h-80 w-full" ref={containerRef}>
            {dimensions.width > 0 && dimensions.height > 0 && (
              <BarChart width={dimensions.width} height={dimensions.height} data={analytics.revenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  cursor={{ fill: chartTheme.grid }}
                  formatter={(value: unknown) => {
                    const numValue = typeof value === 'number' ? value : 0;
                    return `$${numValue.toLocaleString()}`;
                  }}
                  contentStyle={chartTheme.tooltipStyle}
                />
                <Legend />
                <Bar dataKey="retained" name="Retained Revenue" stackId="a" fill={chartTheme.colors.blue} radius={[0, 0, 4, 4]} />
                <Bar dataKey="new" name="New Business" stackId="a" fill={chartTheme.colors.emerald} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </div>
        </Card>

        <Card title="Lead Source Efficiency">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.sources} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: chartTheme.text, fontSize: 12 }} />
                <Tooltip cursor={{ fill: chartTheme.grid }} contentStyle={chartTheme.tooltipStyle} />
                <Bar dataKey="value" fill={chartTheme.colors.purple} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
