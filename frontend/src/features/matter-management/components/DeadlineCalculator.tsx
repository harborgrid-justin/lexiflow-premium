import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Calculator, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface DeadlineCalculatorProps {
  caseId?: string;
  onSaveDeadline?: (deadline: any) => void;
}

export const DeadlineCalculator: React.FC<DeadlineCalculatorProps> = ({
  caseId,
  onSaveDeadline,
}) => {
  const [triggerDate, setTriggerDate] = useState<Date>();
  const [jurisdiction, setJurisdiction] = useState('');
  const [deadlineRule, setDeadlineRule] = useState('');
  const [customDays, setCustomDays] = useState<number>(30);
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [excludeHolidays, setExcludeHolidays] = useState(true);
  const [calculatedDeadline, setCalculatedDeadline] = useState<Date | null>(null);
  const [calculating, setCalculating] = useState(false);

  const jurisdictions = [
    { id: 'federal', name: 'Federal Courts' },
    { id: 'ca', name: 'California State Courts' },
    { id: 'ny', name: 'New York State Courts' },
    { id: 'tx', name: 'Texas State Courts' },
  ];

  const deadlineRules = [
    { id: 'frcp-12', name: 'FRCP 12(a)(1) - Answer to Complaint (21 days)', days: 21 },
    { id: 'frcp-26', name: 'FRCP 26(a)(1) - Initial Disclosures (14 days)', days: 14 },
    { id: 'frcp-56', name: 'FRCP 56 - Summary Judgment Response (21 days)', days: 21 },
    { id: 'frap-4', name: 'FRAP 4 - Notice of Appeal (30 days)', days: 30 },
    { id: 'custom', name: 'Custom Deadline', days: 0 },
  ];

  const handleCalculate = async () => {
    if (!triggerDate) {
      alert('Please select a trigger date');
      return;
    }

    setCalculating(true);

    try {
      // API call would go here
      // const response = await fetch('/api/deadlines/calculate', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     triggerDate,
      //     jurisdictionId: jurisdiction,
      //     deadlineRuleId: deadlineRule,
      //     customDaysCount: customDays,
      //     excludeWeekends,
      //     excludeHolidays,
      //   }),
      // });
      // const result = await response.json();
      // setCalculatedDeadline(new Date(result.deadlineDate));

      // Mock calculation for demonstration
      const selectedRule = deadlineRules.find((r) => r.id === deadlineRule);
      const days = selectedRule?.days || customDays;
      const deadline = new Date(triggerDate);
      let daysToAdd = days;

      while (daysToAdd > 0) {
        deadline.setDate(deadline.getDate() + 1);
        const dayOfWeek = deadline.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (excludeWeekends) {
          if (!isWeekend) {
            daysToAdd--;
          }
        } else {
          daysToAdd--;
        }
      }

      setCalculatedDeadline(deadline);
    } catch (error) {
      console.error('Failed to calculate deadline:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = () => {
    if (!calculatedDeadline) return;

    const deadline = {
      caseId,
      title: deadlineRules.find((r) => r.id === deadlineRule)?.name || 'Custom Deadline',
      deadlineDate: calculatedDeadline,
      triggerDate,
      jurisdiction,
      businessDaysOnly: excludeWeekends,
    };

    onSaveDeadline?.(deadline);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Deadline Calculator
        </CardTitle>
        <CardDescription>
          Calculate deadlines based on jurisdiction-specific rules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Jurisdiction Selection */}
          <div className="space-y-2">
            <Label htmlFor="jurisdiction">Jurisdiction</Label>
            <Select value={jurisdiction} onValueChange={setJurisdiction}>
              <SelectTrigger id="jurisdiction">
                <SelectValue placeholder="Select jurisdiction..." />
              </SelectTrigger>
              <SelectContent>
                {jurisdictions.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rule Selection */}
          <div className="space-y-2">
            <Label htmlFor="rule">Deadline Rule</Label>
            <Select value={deadlineRule} onValueChange={setDeadlineRule}>
              <SelectTrigger id="rule">
                <SelectValue placeholder="Select deadline rule..." />
              </SelectTrigger>
              <SelectContent>
                {deadlineRules.map((rule) => (
                  <SelectItem key={rule.id} value={rule.id}>
                    {rule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Days Input */}
          {deadlineRule === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customDays">Number of Days</Label>
              <Input
                id="customDays"
                type="number"
                value={customDays}
                onChange={(e) => setCustomDays(parseInt(e.target.value))}
                placeholder="Enter number of days..."
              />
            </div>
          )}

          {/* Trigger Date */}
          <div className="space-y-2">
            <Label>Trigger Date (Event Date)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {triggerDate ? format(triggerDate, 'PPP') : 'Select date...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={triggerDate}
                  onSelect={setTriggerDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Options */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <Label className="text-sm font-semibold">Calculation Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="excludeWeekends"
                checked={excludeWeekends}
                onCheckedChange={(checked) => setExcludeWeekends(!!checked)}
              />
              <Label htmlFor="excludeWeekends" className="text-sm font-normal">
                Exclude weekends (business days only)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="excludeHolidays"
                checked={excludeHolidays}
                onCheckedChange={(checked) => setExcludeHolidays(!!checked)}
              />
              <Label htmlFor="excludeHolidays" className="text-sm font-normal">
                Exclude federal holidays
              </Label>
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={handleCalculate}
            disabled={!triggerDate || !jurisdiction || calculating}
            className="w-full"
          >
            {calculating ? 'Calculating...' : 'Calculate Deadline'}
          </Button>

          {/* Results */}
          {calculatedDeadline && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold text-green-900">
                    Calculated Deadline
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {format(calculatedDeadline, 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-sm text-green-800">
                    {Math.ceil(
                      (calculatedDeadline.getTime() - (triggerDate?.getTime() || 0)) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days from trigger date
                  </div>
                  <div className="pt-2">
                    <Button onClick={handleSave} size="sm" variant="outline">
                      Save to Case
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Information */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This calculator provides estimated deadlines based on jurisdiction rules.
              Always verify deadlines with court rules and local orders. Consult with
              an attorney for legal advice.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeadlineCalculator;
