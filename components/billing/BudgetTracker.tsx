import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Clock } from 'lucide-react';

interface BudgetTrackerProps {
  matterId: string;
}

interface Budget {
  id: string;
  totalBudget: number;
  spentAmount: number;
  committedAmount: number;
  availableAmount: number;
  status: 'ACTIVE' | 'WARNING' | 'EXCEEDED';
  projectedSpend: number;
  daysRemaining: number;
  burnRate: number;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ matterId }) => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudget();
  }, [matterId]);

  const fetchBudget = async () => {
    // Mock data
    setBudget({
      id: '1',
      totalBudget: 100000,
      spentAmount: 65000,
      committedAmount: 15000,
      availableAmount: 20000,
      status: 'WARNING',
      projectedSpend: 98000,
      daysRemaining: 45,
      burnRate: 1444,
    });
    setLoading(false);
  };

  if (loading || !budget) return <div>Loading...</div>;

  const utilizationPercent = (budget.spentAmount / budget.totalBudget) * 100;
  const projectedPercent = (budget.projectedSpend / budget.totalBudget) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Budget Overview</span>
            <Badge variant={budget.status === 'EXCEEDED' ? 'destructive' : budget.status === 'WARNING' ? 'warning' : 'default'}>
              {budget.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Utilization</span>
              <span className="font-medium">${budget.spentAmount.toLocaleString()} / ${budget.totalBudget.toLocaleString()}</span>
            </div>
            <Progress value={utilizationPercent} className="h-3" />
            <p className="text-xs text-muted-foreground">{utilizationPercent.toFixed(1)}% utilized</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className="text-2xl font-bold">${(budget.spentAmount / 1000).toFixed(0)}k</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Committed</p>
              <p className="text-2xl font-bold">${(budget.committedAmount / 1000).toFixed(0)}k</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-green-600">${(budget.availableAmount / 1000).toFixed(0)}k</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Daily Burn</p>
              <p className="text-2xl font-bold">${budget.burnRate.toLocaleString()}</p>
            </div>
          </div>

          {projectedPercent > 100 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Projected to exceed budget by ${(budget.projectedSpend - budget.totalBudget).toLocaleString()} ({(projectedPercent - 100).toFixed(1)}% over)
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{budget.daysRemaining} days remaining</span>
            </div>
            <div className="flex items-center gap-2">
              {projectedPercent > utilizationPercent ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <span>Projected: ${budget.projectedSpend.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTracker;
