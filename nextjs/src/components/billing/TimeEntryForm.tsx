/**
 * TimeEntryForm Component
 * Form for creating/editing time entries with built-in timer
 * Includes LEDES code support and validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Form } from 'react-router';
import { RunningTimer } from './RunningTimer';
import { Timer } from 'lucide-react';

import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import { Switch } from '@/components/ui/shadcn/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';

interface TimeEntryFormProps {
  entry?: any;
  onCancel?: () => void;
  actionError?: string;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  entry,
  onCancel,
  actionError,
}) => {
  const [useTimer, setUseTimer] = useState(false);
  const [hours, setHours] = useState(entry?.duration || 0);
  const [selectedCase, setSelectedCase] = useState(entry?.caseId || '');
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(entry?.description || '');
  const [billable, setBillable] = useState(entry?.billable ?? true);
  const [rate, setRate] = useState(entry?.rate || 450);
  const [taskCode, setTaskCode] = useState(entry?.taskCode || '');
  const [activityType, setActivityType] = useState(entry?.activityType || '');

  // LEDES activity codes
  const LEDES_CODES = [
    { code: 'L100', name: 'Case Assessment, Development and Administration' },
    { code: 'L110', name: 'Factual Investigation' },
    { code: 'L200', name: 'Legal Research' },
    { code: 'L300', name: 'Document/File Management' },
    { code: 'L400', name: 'Court Appearances' },
    { code: 'L500', name: 'Depositions and Testimony' },
    { code: 'L600', name: 'Experts' },
    { code: 'A100', name: 'Administrative' },
  ];

  const ACTIVITY_TYPES = [
    'Research',
    'Drafting',
    'Court Appearance',
    'Client Meeting',
    'Deposition',
    'Discovery',
    'Negotiation',
    'Phone Call',
    'Email',
    'Review',
    'Other',
  ];

  const handleTimerComplete = (elapsedHours: number) => {
    setHours(elapsedHours);
    setUseTimer(false);
  };

  const total = hours * rate;

  return (
    <Card className="max-w-4xl border-none shadow-none">
      <CardContent className="p-0">
        <Form method="post" className="space-y-6">
          {/* Error Message */}
          {actionError && (
            <div className="rounded-md bg-destructive/15 p-4 border border-destructive/20">
              <p className="text-sm text-destructive">{actionError}</p>
            </div>
          )}

          {/* Timer Toggle */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Use Timer</h3>
                <p className="text-sm text-muted-foreground">
                  Track time in real-time with built-in timer
                </p>
              </div>
            </div>
            <Switch
              checked={useTimer}
              onCheckedChange={setUseTimer}
            />
          </div>

          {/* Running Timer */}
          {useTimer && (
            <RunningTimer
              onComplete={handleTimerComplete}
              caseId={selectedCase}
              description={description}
            />
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Case Selection */}
            <div className="space-y-2">
              <Label htmlFor="caseId">
                Case/Matter <span className="text-destructive">*</span>
              </Label>
              <Select
                name="caseId"
                required
                value={selectedCase}
                onValueChange={setSelectedCase}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a case..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C-2024-001">Martinez v. TechCorp</SelectItem>
                  <SelectItem value="C-2024-112">OmniGlobal Merger</SelectItem>
                  <SelectItem value="C-2023-892">StartUp Inc - Series A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User (hidden, would come from auth) */}
            <input type="hidden" name="userId" value="usr-admin-justin" />

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                name="date"
                id="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Time and Rate */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Hours */}
            <div className="space-y-2">
              <Label htmlFor="hours">
                Hours <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                name="hours"
                id="hours"
                required
                min="0.1"
                step="0.1"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                disabled={useTimer}
                className="disabled:bg-muted"
              />
              <p className="text-xs text-muted-foreground">Minimum 0.1 (6 minutes)</p>
            </div>

            {/* Rate */}
            <div className="space-y-2">
              <Label htmlFor="rate">
                Rate ($/hr) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                name="rate"
                id="rate"
                required
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
              />
            </div>

            {/* Total (calculated) */}
            <div className="space-y-2">
              <Label>Total</Label>
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                ${total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              name="description"
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of work performed..."
            />
          </div>

          {/* LEDES and Activity Codes */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* LEDES Task Code */}
            <div className="space-y-2">
              <Label htmlFor="taskCode">LEDES Task Code</Label>
              <Select
                name="taskCode"
                value={taskCode}
                onValueChange={setTaskCode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select LEDES code..." />
                </SelectTrigger>
                <SelectContent>
                  {LEDES_CODES.map((code) => (
                    <SelectItem key={code.code} value={code.code}>
                      {code.code} - {code.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Activity Type */}
            <div className="space-y-2">
              <Label htmlFor="activityType">Activity Type</Label>
              <Select
                name="activityType"
                value={activityType}
                onValueChange={setActivityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity..." />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Billable and Status */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Billable */}
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                name="billable"
                id="billable"
                checked={billable}
                onCheckedChange={setBillable}
              />
              <Label htmlFor="billable" className="font-normal cursor-pointer">
                Billable to client
              </Label>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="Draft">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submit for Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button type="submit">
              {entry ? 'Update' : 'Create'} Time Entry
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};
