"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Clock,
  Play,
  Pause,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  DollarSign,
  Calendar,
  FileText,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Separator } from "@/components/ui/shadcn/separator";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Alert, AlertDescription } from "@/components/ui/shadcn/alert";

interface TimeEntry {
  id: string;
  matterId: string;
  matterName: string;
  date: Date;
  hours: number;
  description: string;
  billable: boolean;
  rate: number;
  status: "draft" | "submitted" | "approved" | "billed";
  activityCode?: string;
}

interface RunningTimer {
  matterId: string;
  matterName: string;
  startTime: Date;
  description: string;
  billable: boolean;
  activityCode?: string;
}

interface Matter {
  id: string;
  name: string;
  client: string;
  defaultRate: number;
}

interface QuickEntryTemplate {
  id: string;
  label: string;
  description: string;
  hours: number;
  activityCode?: string;
}

interface BillingLayoutProps {
  entries: TimeEntry[];
  runningTimer: RunningTimer | null;
  matters: Matter[];
  quickEntryTemplates?: QuickEntryTemplate[];
  onTimerToggle: (timer: Partial<RunningTimer> | null) => Promise<void>;
  onEntrySubmit: (entry: Partial<TimeEntry>) => Promise<void>;
  onEntryUpdate: (id: string, updates: Partial<TimeEntry>) => Promise<void>;
  onEntryDelete: (ids: string[]) => Promise<void>;
  onBulkSubmit?: (ids: string[]) => Promise<void>;
}

export function BillingLayout({
  entries,
  runningTimer,
  matters,
  quickEntryTemplates = [],
  onTimerToggle,
  onEntrySubmit,
  onEntryUpdate,
  onEntryDelete,
  onBulkSubmit,
}: BillingLayoutProps) {
  const [selectedMatter, setSelectedMatter] = useState<string>("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [billable, setBillable] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update elapsed time for running timer
  useEffect(() => {
    if (runningTimer) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - runningTimer.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [runningTimer]);

  // Format elapsed time
  const formatElapsedTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate totals
  const todayEntries = entries.filter(
    (entry) => entry.date.toDateString() === new Date().toDateString()
  );
  const thisWeekEntries = entries.filter((entry) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entry.date >= weekAgo;
  });

  const calculateTotal = (entriesList: TimeEntry[]) => {
    return entriesList.reduce((sum, entry) => sum + entry.hours * entry.rate, 0);
  };

  const totalHoursToday = todayEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalHoursWeek = thisWeekEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalAmountToday = calculateTotal(todayEntries);
  const totalAmountWeek = calculateTotal(thisWeekEntries);

  // Timer handlers
  const handleStartTimer = async () => {
    if (!selectedMatter) return;

    const matter = matters.find((m) => m.id === selectedMatter);
    if (!matter) return;

    await onTimerToggle({
      matterId: selectedMatter,
      matterName: matter.name,
      startTime: new Date(),
      description,
      billable,
    });
  };

  const handleStopTimer = async () => {
    if (runningTimer) {
      const hours = elapsedTime / 3600;
      const matter = matters.find((m) => m.id === runningTimer.matterId);

      await onEntrySubmit({
        matterId: runningTimer.matterId,
        matterName: runningTimer.matterName,
        date: new Date(),
        hours: parseFloat(hours.toFixed(2)),
        description: runningTimer.description,
        billable: runningTimer.billable,
        rate: matter?.defaultRate || 0,
        status: "draft",
      });

      await onTimerToggle(null);
      setElapsedTime(0);
    }
  };

  // Entry handlers
  const handleManualEntry = async () => {
    if (!selectedMatter || !hours) return;

    const matter = matters.find((m) => m.id === selectedMatter);
    if (!matter) return;

    setIsSubmitting(true);
    try {
      await onEntrySubmit({
        matterId: selectedMatter,
        matterName: matter.name,
        date: new Date(),
        hours: parseFloat(hours),
        description,
        billable,
        rate: matter.defaultRate,
        status: "draft",
      });

      // Reset form
      setDescription("");
      setHours("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickEntry = async (template: QuickEntryTemplate) => {
    if (!selectedMatter) return;

    const matter = matters.find((m) => m.id === selectedMatter);
    if (!matter) return;

    await onEntrySubmit({
      matterId: selectedMatter,
      matterName: matter.name,
      date: new Date(),
      hours: template.hours,
      description: template.description,
      billable: true,
      rate: matter.defaultRate,
      status: "draft",
      activityCode: template.activityCode,
    });
  };

  const handleToggleSelection = (entryId: string) => {
    const newSelection = new Set(selectedEntries);
    if (newSelection.has(entryId)) {
      newSelection.delete(entryId);
    } else {
      newSelection.add(entryId);
    }
    setSelectedEntries(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(new Set(entries.filter((e) => e.status === "draft").map((e) => e.id)));
    } else {
      setSelectedEntries(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.size > 0) {
      await onEntryDelete(Array.from(selectedEntries));
      setSelectedEntries(new Set());
    }
  };

  const handleBulkSubmit = async () => {
    if (onBulkSubmit && selectedEntries.size > 0) {
      await onBulkSubmit(Array.from(selectedEntries));
      setSelectedEntries(new Set());
    }
  };

  const renderTimeEntryRow = (entry: TimeEntry) => {
    const isSelected = selectedEntries.has(entry.id);
    const canSelect = entry.status === "draft";

    return (
      <TableRow key={entry.id} className={isSelected ? "bg-accent" : ""}>
        <TableCell className="w-12">
          {canSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleToggleSelection(entry.id)}
            />
          )}
        </TableCell>
        <TableCell>
          <div className="font-medium">{entry.matterName}</div>
          <div className="text-sm text-muted-foreground">{entry.description}</div>
        </TableCell>
        <TableCell>{entry.date.toLocaleDateString()}</TableCell>
        <TableCell className="text-right">{entry.hours.toFixed(2)}</TableCell>
        <TableCell className="text-right">${entry.rate.toFixed(2)}</TableCell>
        <TableCell className="text-right">
          ${(entry.hours * entry.rate).toFixed(2)}
        </TableCell>
        <TableCell>
          {entry.billable ? (
            <Badge variant="default">Billable</Badge>
          ) : (
            <Badge variant="secondary">Non-Billable</Badge>
          )}
        </TableCell>
        <TableCell>
          <Badge
            variant={
              entry.status === "approved"
                ? "default"
                : entry.status === "submitted"
                ? "secondary"
                : "outline"
            }
          >
            {entry.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                /* Edit entry */
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEntryDelete([entry.id])}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar - Timer and Quick Entry */}
      <div className="border-b p-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timer Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Tracker
                </CardTitle>
                <CardDescription>Track time for billable work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {runningTimer ? (
                  <Alert className="bg-green-50 border-green-200">
                    <Clock className="h-4 w-4 text-green-600" />
                    <AlertDescription className="ml-2">
                      <div className="font-semibold text-green-900">
                        Timer running: {runningTimer.matterName}
                      </div>
                      <div className="text-3xl font-mono font-bold text-green-700 my-2">
                        {formatElapsedTime(elapsedTime)}
                      </div>
                      <div className="text-sm text-green-800">{runningTimer.description}</div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    <Select value={selectedMatter} onValueChange={setSelectedMatter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select matter" />
                      </SelectTrigger>
                      <SelectContent>
                        {matters.map((matter) => (
                          <SelectItem key={matter.id} value={matter.id}>
                            {matter.name} - {matter.client}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="What are you working on?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="timer-billable"
                        checked={billable}
                        onCheckedChange={(checked) => setBillable(checked as boolean)}
                      />
                      <label htmlFor="timer-billable" className="text-sm font-medium">
                        Billable
                      </label>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  variant={runningTimer ? "destructive" : "default"}
                  onClick={runningTimer ? handleStopTimer : handleStartTimer}
                  disabled={!runningTimer && !selectedMatter}
                >
                  {runningTimer ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Timer
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Timer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Manual Entry Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Manual Entry
                </CardTitle>
                <CardDescription>Add time entry manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Select value={selectedMatter} onValueChange={setSelectedMatter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select matter" />
                    </SelectTrigger>
                    <SelectContent>
                      {matters.map((matter) => (
                        <SelectItem key={matter.id} value={matter.id}>
                          {matter.name} - {matter.client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  <Input
                    type="number"
                    step="0.25"
                    placeholder="Hours (e.g., 1.5)"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="manual-billable"
                      checked={billable}
                      onCheckedChange={(checked) => setBillable(checked as boolean)}
                    />
                    <label htmlFor="manual-billable" className="text-sm font-medium">
                      Billable
                    </label>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleManualEntry}
                  disabled={!selectedMatter || !hours || isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Adding..." : "Add Entry"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Entry Templates */}
          {quickEntryTemplates.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">Quick Entry Templates</h3>
              <div className="flex flex-wrap gap-2">
                {quickEntryTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickEntry(template)}
                    disabled={!selectedMatter}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {template.label} ({template.hours}h)
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Time Entries */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto p-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Time Entries</CardTitle>
                  <CardDescription>Manage and submit your time entries</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{totalHoursToday.toFixed(2)}h</div>
                    <div className="text-sm text-muted-foreground">Today</div>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{totalHoursWeek.toFixed(2)}h</div>
                    <div className="text-sm text-muted-foreground">This Week</div>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${totalAmountWeek.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Week Total</div>
                  </div>
                </div>
              </div>

              {selectedEntries.size > 0 && (
                <div className="flex items-center gap-2 pt-4">
                  <Badge variant="secondary">
                    {selectedEntries.size} {selectedEntries.size === 1 ? "entry" : "entries"} selected
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                  {onBulkSubmit && (
                    <Button variant="default" size="sm" onClick={handleBulkSubmit}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden">
              <Tabs defaultValue="today" className="h-full flex flex-col">
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="all">All Entries</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                selectedEntries.size > 0 &&
                                todayEntries.every((e) => selectedEntries.has(e.id))
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Matter / Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Hours</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todayEntries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No entries for today
                            </TableCell>
                          </TableRow>
                        ) : (
                          todayEntries.map(renderTimeEntryRow)
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="week" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                selectedEntries.size > 0 &&
                                thisWeekEntries.every((e) => selectedEntries.has(e.id))
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Matter / Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Hours</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {thisWeekEntries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No entries for this week
                            </TableCell>
                          </TableRow>
                        ) : (
                          thisWeekEntries.map(renderTimeEntryRow)
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="all" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                selectedEntries.size > 0 &&
                                entries.every((e) => selectedEntries.has(e.id))
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Matter / Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Hours</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No entries found
                            </TableCell>
                          </TableRow>
                        ) : (
                          entries.map(renderTimeEntryRow)
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
