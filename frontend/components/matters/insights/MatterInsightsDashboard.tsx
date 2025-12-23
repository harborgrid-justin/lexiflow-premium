/**
 * Matter Insights Dashboard - Strategic Intelligence & Predictions
 * 
 * @module MatterInsightsDashboard
 * @description AI-powered insights, risk assessment, and predictive analytics
 * 
 * Features:
 * - Risk assessment and scoring
 * - Outcome predictions
 * - Budget variance analysis
 * - Team performance metrics
 * - Client satisfaction tracking
 * - Predictive cost modeling
 * - Success probability analysis
 * - Resource optimization recommendations
 */

import React, { useState } from 'react';
import {
  TrendingUp, AlertTriangle, Target, Award, ThumbsUp, DollarSign,
  Brain, BarChart3, PieChart, Download, Filter
} from 'lucide-react';
import { useQuery } from '../../../hooks/useQueryHooks';
import { api } from '../../../services/api';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';

export const MatterInsightsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<'30d' | '90d' | 'ytd' | 'all'>('30d');

  return (
    <div className={cn('h-full flex flex-col', theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50')}>
      <div className={cn('border-b px-6 py-4', theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn('text-2xl font-bold', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
              Matter Insights
            </h1>
            <p className={cn('text-sm mt-1', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
              AI-powered analytics and strategic intelligence
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className={cn(
                'px-4 py-2 rounded-lg border text-sm',
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900'
              )}
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
              <option value="all">All Time</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <InsightCard
            icon={Brain}
            title="AI Success Probability"
            value="78.5%"
            subtitle="Based on historical data"
            theme={theme}
            color="blue"
          />
          <InsightCard
            icon={AlertTriangle}
            title="Risk Score"
            value="Medium"
            subtitle="4 matters need attention"
            theme={theme}
            color="amber"
          />
          <InsightCard
            icon={Target}
            title="Budget Accuracy"
            value="92.3%"
            subtitle="+5.2% vs last quarter"
            theme={theme}
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className={cn('text-lg font-semibold mb-4', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
              Risk Assessment
            </h3>
            <div className="space-y-3">
              <RiskItem
                title="Smith v. Acme Corp"
                level="high"
                score={7.8}
                reasons={['Budget overrun', 'Deadline at risk']}
                theme={theme}
              />
              <RiskItem
                title="Johnson Estate Planning"
                level="low"
                score={2.1}
                reasons={['On track', 'Well-resourced']}
                theme={theme}
              />
              <RiskItem
                title="Tech Startup M&A"
                level="medium"
                score={5.3}
                reasons={['Complex negotiations', 'Multiple parties']}
                theme={theme}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className={cn('text-lg font-semibold mb-4', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
              Budget Variance Analysis
            </h3>
            <div className="space-y-4">
              <BudgetVarianceItem
                matter="Smith v. Acme Corp"
                budget={150000}
                actual={178000}
                variance={18.7}
                theme={theme}
              />
              <BudgetVarianceItem
                matter="Johnson Estate"
                budget={50000}
                actual={45000}
                variance={-10}
                theme={theme}
              />
              <BudgetVarianceItem
                matter="Tech Startup M&A"
                budget={200000}
                actual={195000}
                variance={-2.5}
                theme={theme}
              />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h3 className={cn('text-lg font-semibold mb-4', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
              Team Performance Insights
            </h3>
            <div className="space-y-3">
              <TeamPerformanceItem
                name="Sarah Chen"
                matters={12}
                successRate={94}
                avgResolution={38}
                clientSat={4.8}
                theme={theme}
              />
              <TeamPerformanceItem
                name="Michael Rodriguez"
                matters={15}
                successRate={88}
                avgResolution={42}
                clientSat={4.6}
                theme={theme}
              />
              <TeamPerformanceItem
                name="Emily Parker"
                matters={10}
                successRate={91}
                avgResolution={35}
                clientSat={4.9}
                theme={theme}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className={cn('text-lg font-semibold mb-4', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
              Recommendations
            </h3>
            <div className="space-y-4">
              <RecommendationItem
                type="resource"
                title="Reassign Resources"
                description="Consider reallocating support to high-risk matters"
                theme={theme}
              />
              <RecommendationItem
                type="budget"
                title="Budget Adjustment"
                description="Review budget for Smith v. Acme Corp"
                theme={theme}
              />
              <RecommendationItem
                type="deadline"
                title="Deadline Extension"
                description="Request extension for discovery phase"
                theme={theme}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InsightCard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  theme: string;
  color: string;
}> = ({ icon: Icon, title, value, subtitle, theme, color }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className={cn('text-sm font-medium mb-1', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
          {title}
        </div>
        <div className={cn('text-2xl font-bold mb-1', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
          {value}
        </div>
        <div className={cn('text-xs', theme === 'dark' ? 'text-slate-500' : 'text-slate-500')}>
          {subtitle}
        </div>
      </div>
      <div className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100')}>
        <Icon className={cn('w-5 h-5', `text-${color}-500`)} />
      </div>
    </div>
  </Card>
);

const RiskItem: React.FC<{
  title: string;
  level: 'high' | 'medium' | 'low';
  score: number;
  reasons: string[];
  theme: string;
}> = ({ title, level, score, reasons, theme }) => (
  <div className={cn('p-4 rounded-lg border', theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white')}>
    <div className="flex items-start justify-between mb-2">
      <div className={cn('font-medium', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
        {title}
      </div>
      <Badge variant={level === 'high' ? 'error' : level === 'medium' ? 'warning' : 'success'}>
        {level} Risk
      </Badge>
    </div>
    <div className={cn('text-sm mb-2', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
      Risk Score: {score}/10
    </div>
    <div className="flex flex-wrap gap-1">
      {reasons.map((reason, idx) => (
        <span key={idx} className={cn('text-xs px-2 py-1 rounded', theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700')}>
          {reason}
        </span>
      ))}
    </div>
  </div>
);

const BudgetVarianceItem: React.FC<{
  matter: string;
  budget: number;
  actual: number;
  variance: number;
  theme: string;
}> = ({ matter, budget, actual, variance, theme }) => (
  <div className={cn('p-4 rounded-lg border', theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white')}>
    <div className={cn('font-medium mb-2', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
      {matter}
    </div>
    <div className="flex items-center justify-between text-sm">
      <div>
        <div className={cn(theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
          Budget: ${(budget / 1000).toFixed(0)}K
        </div>
        <div className={cn(theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
          Actual: ${(actual / 1000).toFixed(0)}K
        </div>
      </div>
      <div className={cn('text-lg font-semibold',
        variance > 0 ? 'text-red-500' : 'text-emerald-500'
      )}>
        {variance > 0 ? '+' : ''}{variance}%
      </div>
    </div>
  </div>
);

const TeamPerformanceItem: React.FC<{
  name: string;
  matters: number;
  successRate: number;
  avgResolution: number;
  clientSat: number;
  theme: string;
}> = ({ name, matters, successRate, avgResolution, clientSat, theme }) => (
  <div className={cn('p-4 rounded-lg border', theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white')}>
    <div className={cn('font-medium mb-3', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
      {name}
    </div>
    <div className="grid grid-cols-4 gap-2 text-center text-sm">
      <div>
        <div className={cn('text-xs mb-1', theme === 'dark' ? 'text-slate-500' : 'text-slate-500')}>Matters</div>
        <div className={cn('font-semibold', theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>{matters}</div>
      </div>
      <div>
        <div className={cn('text-xs mb-1', theme === 'dark' ? 'text-slate-500' : 'text-slate-500')}>Success</div>
        <div className={cn('font-semibold', theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>{successRate}%</div>
      </div>
      <div>
        <div className={cn('text-xs mb-1', theme === 'dark' ? 'text-slate-500' : 'text-slate-500')}>Avg Days</div>
        <div className={cn('font-semibold', theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>{avgResolution}</div>
      </div>
      <div>
        <div className={cn('text-xs mb-1', theme === 'dark' ? 'text-slate-500' : 'text-slate-500')}>Client</div>
        <div className={cn('font-semibold', theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>{clientSat}</div>
      </div>
    </div>
  </div>
);

const RecommendationItem: React.FC<{
  type: string;
  title: string;
  description: string;
  theme: string;
}> = ({ type, title, description, theme }) => (
  <div className={cn('p-4 rounded-lg border', theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50')}>
    <div className={cn('font-medium mb-1', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
      {title}
    </div>
    <div className={cn('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
      {description}
    </div>
  </div>
);
