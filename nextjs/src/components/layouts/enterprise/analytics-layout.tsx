"use client";

import * as React from "react";
import { format, subDays, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { Calendar as CalendarIcon, Download, TrendingUp, TrendingDown, Minus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/shadcn/popover";
import { Calendar } from "@/components/ui/shadcn/calendar";
import { Separator } from "@/components/ui/shadcn/separator";
import { Badge } from "@/components/ui/shadcn/badge";
import { Switch } from "@/components/ui/shadcn/switch";
import { Label } from "@/components/ui/shadcn/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/shadcn/dialog";
import { cn } from "@/lib/utils";

export type DateRangePreset = "today" | "week" | "month" | "quarter" | "year" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface MetricData {
  id: string;
  label: string;
  value: string | number;
  previousValue?: string | number;
  format?: "number" | "currency" | "percentage" | "duration";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  description?: string;
  type: "line" | "bar" | "area" | "pie" | "donut" | "radar";
  data: any[];
  layout?: "full" | "half" | "third" | "quarter";
  showLegend?: boolean;
  height?: number;
  component: React.ComponentType<any>;
}

export interface AnalyticsLayoutProps {
  metrics: MetricData[];
  charts: ChartConfig[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  comparisonMode?: boolean;
  onComparisonModeChange?: (enabled: boolean) => void;
  onExport?: (format: "pdf" | "png") => void;
  isExporting?: boolean;
  className?: string;
}

const DATE_PRESETS: Record<DateRangePreset, { label: string; getValue: () => DateRange }> = {
  today: {
    label: "Today",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  week: {
    label: "This Week",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  month: {
    label: "This Month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  quarter: {
    label: "This Quarter",
    getValue: () => ({
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date()),
    }),
  },
  year: {
    label: "This Year",
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
  custom: {
    label: "Custom Range",
    getValue: () => ({
      from: subMonths(new Date(), 1),
      to: new Date(),
    }),
  },
};

const formatMetricValue = (value: string | number, format?: string): string => {
  if (typeof value === "string") return value;

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "duration":
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return `${hours}h ${minutes}m`;
    case "number":
    default:
      return new Intl.NumberFormat("en-US").format(value);
  }
};

const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    case "neutral":
    default:
      return <Minus className="h-4 w-4 text-gray-400" />;
  }
};

const getTrendColor = (trend?: "up" | "down" | "neutral"): string => {
  switch (trend) {
    case "up":
      return "text-green-600";
    case "down":
      return "text-red-600";
    case "neutral":
    default:
      return "text-gray-500";
  }
};

export const AnalyticsLayout: React.FC<AnalyticsLayoutProps> = ({
  metrics,
  charts,
  dateRange,
  onDateRangeChange,
  comparisonMode = false,
  onComparisonModeChange,
  onExport,
  isExporting = false,
  className,
}) => {
  const [selectedPreset, setSelectedPreset] = React.useState<DateRangePreset>("month");
  const [customRange, setCustomRange] = React.useState<DateRange | undefined>();
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [drillDownChart, setDrillDownChart] = React.useState<ChartConfig | null>(null);

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    if (preset !== "custom") {
      const range = DATE_PRESETS[preset].getValue();
      onDateRangeChange(range);
    } else {
      setIsDatePickerOpen(true);
    }
  };

  const handleCustomRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      const newRange: DateRange = {
        from: startOfDay(range.from),
        to: endOfDay(range.to),
      };
      setCustomRange(newRange);
      onDateRangeChange(newRange);
      setIsDatePickerOpen(false);
    }
  };

  const getChartGridClass = (layout?: string): string => {
    switch (layout) {
      case "half":
        return "col-span-12 md:col-span-6";
      case "third":
        return "col-span-12 md:col-span-4";
      case "quarter":
        return "col-span-12 md:col-span-3";
      case "full":
      default:
        return "col-span-12";
    }
  };

  const handleExport = async (format: "pdf" | "png") => {
    if (onExport) {
      await onExport(format);
    }
  };

  const handleChartDrillDown = (chart: ChartConfig) => {
    setDrillDownChart(chart);
  };

  return (
    <div className={cn("flex flex-col gap-6 p-6", className)}>
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor key metrics and trends across your organization
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Comparison Mode Toggle */}
          {onComparisonModeChange && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Switch
                id="comparison-mode"
                checked={comparisonMode}
                onCheckedChange={onComparisonModeChange}
              />
              <Label htmlFor="comparison-mode" className="cursor-pointer text-sm">
                Compare Periods
              </Label>
            </div>
          )}

          {/* Date Range Selector */}
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATE_PRESETS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Date Range Picker */}
          {selectedPreset === "custom" && (
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customRange ? (
                    <>
                      {format(customRange.from, "MMM d, yyyy")} -{" "}
                      {format(customRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{
                    from: customRange?.from || dateRange.from,
                    to: customRange?.to || dateRange.to,
                  }}
                  onSelect={handleCustomRangeSelect}
                  numberOfMonths={2}
                  defaultMonth={customRange?.from || dateRange.from}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Export Button */}
          {onExport && (
            <Select onValueChange={handleExport}>
              <SelectTrigger className="w-[140px]" disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                <SelectValue placeholder={isExporting ? "Exporting..." : "Export"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">Export as PDF</SelectItem>
                <SelectItem value="png">Export as PNG</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Date Range Display */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Showing data from</span>
        <Badge variant="outline" className="font-mono">
          {format(dateRange.from, "MMM d, yyyy")}
        </Badge>
        <span>to</span>
        <Badge variant="outline" className="font-mono">
          {format(dateRange.to, "MMM d, yyyy")}
        </Badge>
        {comparisonMode && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs">vs previous period</span>
          </>
        )}
      </div>

      <Separator />

      {/* KPI Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              {metric.icon && <div className="text-muted-foreground">{metric.icon}</div>}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatMetricValue(metric.value, metric.format)}
              </div>
              {metric.description && (
                <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
              )}
              {metric.trend && metric.trendValue && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {getTrendIcon(metric.trend)}
                  <span className={getTrendColor(metric.trend)}>{metric.trendValue}</span>
                  {comparisonMode && metric.previousValue && (
                    <span className="text-muted-foreground">
                      vs {formatMetricValue(metric.previousValue, metric.format)}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-12 gap-4">
        {charts.map((chart) => {
          const ChartComponent = chart.component;
          return (
            <Card
              key={chart.id}
              className={cn(
                "transition-shadow hover:shadow-md",
                getChartGridClass(chart.layout)
              )}
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{chart.title}</CardTitle>
                  {chart.description && (
                    <CardDescription className="mt-1">{chart.description}</CardDescription>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleChartDrillDown(chart)}
                  className="h-8 w-8"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div style={{ height: chart.height || 300 }}>
                  <ChartComponent
                    data={chart.data}
                    showLegend={chart.showLegend}
                    comparisonMode={comparisonMode}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Drill-Down Modal */}
      <Dialog open={!!drillDownChart} onOpenChange={() => setDrillDownChart(null)}>
        <DialogContent className="max-w-5xl">
          {drillDownChart && (
            <>
              <DialogHeader>
                <DialogTitle>{drillDownChart.title}</DialogTitle>
                {drillDownChart.description && (
                  <DialogDescription>{drillDownChart.description}</DialogDescription>
                )}
              </DialogHeader>
              <div className="mt-4" style={{ height: 500 }}>
                <drillDownChart.component
                  data={drillDownChart.data}
                  showLegend={drillDownChart.showLegend}
                  comparisonMode={comparisonMode}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalyticsLayout;
