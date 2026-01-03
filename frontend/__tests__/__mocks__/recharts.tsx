import React from 'react';

/**
 * Mock Recharts components for testing
 * Recharts uses SVG and can be difficult to test, these mocks simplify testing
 */

// Mock chart components
export const LineChart = jest.fn(({ children, data, ...props }: any) => (
  <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} {...props}>
    {children}
  </div>
));

export const BarChart = jest.fn(({ children, data, ...props }: any) => (
  <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} {...props}>
    {children}
  </div>
));

export const PieChart = jest.fn(({ children, data, ...props }: any) => (
  <div data-testid="pie-chart" data-chart-data={JSON.stringify(data)} {...props}>
    {children}
  </div>
));

export const AreaChart = jest.fn(({ children, data, ...props }: any) => (
  <div data-testid="area-chart" data-chart-data={JSON.stringify(data)} {...props}>
    {children}
  </div>
));

export const ComposedChart = jest.fn(({ children, data, ...props }: any) => (
  <div data-testid="composed-chart" data-chart-data={JSON.stringify(data)} {...props}>
    {children}
  </div>
));

// Mock chart elements
export const Line = jest.fn((props: any) => (
  <div data-testid="line" data-line-props={JSON.stringify(props)} />
));

export const Bar = jest.fn((props: any) => (
  <div data-testid="bar" data-bar-props={JSON.stringify(props)} />
));

export const Pie = jest.fn((props: any) => (
  <div data-testid="pie" data-pie-props={JSON.stringify(props)} />
));

export const Area = jest.fn((props: any) => (
  <div data-testid="area" data-area-props={JSON.stringify(props)} />
));

// Mock axes
export const XAxis = jest.fn((props: any) => (
  <div data-testid="x-axis" data-axis-props={JSON.stringify(props)} />
));

export const YAxis = jest.fn((props: any) => (
  <div data-testid="y-axis" data-axis-props={JSON.stringify(props)} />
));

// Mock helper components
export const CartesianGrid = jest.fn((props: any) => (
  <div data-testid="cartesian-grid" data-grid-props={JSON.stringify(props)} />
));

export const Tooltip = jest.fn((props: any) => (
  <div data-testid="tooltip" data-tooltip-props={JSON.stringify(props)} />
));

export const Legend = jest.fn((props: any) => (
  <div data-testid="legend" data-legend-props={JSON.stringify(props)} />
));

export const ResponsiveContainer = jest.fn(({ children, ...props }: any) => (
  <div data-testid="responsive-container" {...props}>
    {children}
  </div>
));

export const Cell = jest.fn((props: any) => (
  <div data-testid="cell" data-cell-props={JSON.stringify(props)} />
));

export const Label = jest.fn((props: any) => (
  <div data-testid="label" data-label-props={JSON.stringify(props)} />
));

export const LabelList = jest.fn((props: any) => (
  <div data-testid="label-list" data-label-list-props={JSON.stringify(props)} />
));

export const ReferenceLine = jest.fn((props: any) => (
  <div data-testid="reference-line" data-reference-line-props={JSON.stringify(props)} />
));

export const ReferenceArea = jest.fn((props: any) => (
  <div data-testid="reference-area" data-reference-area-props={JSON.stringify(props)} />
));

// Helper to reset all Recharts mocks
export const resetRechartsNocks = () => {
  LineChart.mockClear();
  BarChart.mockClear();
  PieChart.mockClear();
  AreaChart.mockClear();
  ComposedChart.mockClear();
  Line.mockClear();
  Bar.mockClear();
  Pie.mockClear();
  Area.mockClear();
  XAxis.mockClear();
  YAxis.mockClear();
  CartesianGrid.mockClear();
  Tooltip.mockClear();
  Legend.mockClear();
  ResponsiveContainer.mockClear();
  Cell.mockClear();
  Label.mockClear();
  LabelList.mockClear();
  ReferenceLine.mockClear();
  ReferenceArea.mockClear();
};
