"use client";

import * as React from "react";
import { format } from "date-fns";
import { FileDown, Printer, Clock, Calendar, ChevronLeft, ChevronRight, Save, Play } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Separator } from "@/components/ui/shadcn/separator";
import { Badge } from "@/components/ui/shadcn/badge";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/shadcn/dialog";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/shadcn/collapsible";
import { cn } from "@/lib/utils";

export interface ReportParameter {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "multiselect" | "daterange";
  value: any;
  options?: { label: string; value: string }[];
  required?: boolean;
  description?: string;
}

export interface ReportMetadata {
  title: string;
  description?: string;
  lastRun?: Date;
  nextScheduled?: Date;
  generatedBy?: string;
  format?: string;
  status?: "draft" | "published" | "scheduled";
}

export interface ReportSection {
  id: string;
  title?: string;
  type: "text" | "table" | "chart" | "metric" | "divider";
  content: any;
  layout?: "full" | "half" | "third";
}

export interface ReportData {
  metadata: ReportMetadata;
  sections: ReportSection[];
}

export interface ReportLayoutProps {
  reportData: ReportData;
  parameters: ReportParameter[];
  onParameterChange?: (parameterId: string, value: any) => void;
  onExport?: (format: "pdf" | "excel" | "csv") => void;
  onPrint?: () => void;
  onSave?: (name: string, description?: string) => void;
  onSchedule?: (schedule: ScheduleConfig) => void;
  onRunReport?: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface ScheduleConfig {
  frequency: "once" | "daily" | "weekly" | "monthly";
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients?: string[];
}

const ExportDialog: React.FC<{
  onExport: (format: "pdf" | "excel" | "csv") => void;
}> = ({ onExport }) => {
  const [open, setOpen] = React.useState(false);

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    onExport(format);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>Choose the format for your report export</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleExport("pdf")}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export as PDF
            <span className="ml-auto text-xs text-muted-foreground">Print-ready</span>
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleExport("excel")}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export as Excel
            <span className="ml-auto text-xs text-muted-foreground">Data analysis</span>
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleExport("csv")}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export as CSV
            <span className="ml-auto text-xs text-muted-foreground">Raw data</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ScheduleDialog: React.FC<{
  onSchedule: (schedule: ScheduleConfig) => void;
}> = ({ onSchedule }) => {
  const [open, setOpen] = React.useState(false);
  const [frequency, setFrequency] = React.useState<ScheduleConfig["frequency"]>("weekly");
  const [time, setTime] = React.useState("09:00");
  const [dayOfWeek, setDayOfWeek] = React.useState(1);
  const [dayOfMonth, setDayOfMonth] = React.useState(1);
  const [recipients, setRecipients] = React.useState("");

  const handleSchedule = () => {
    onSchedule({
      frequency,
      time,
      dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
      dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
      recipients: recipients.split(",").map((r) => r.trim()).filter(Boolean),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Report</DialogTitle>
          <DialogDescription>
            Configure automatic report generation and delivery
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {frequency === "weekly" && (
            <div className="grid gap-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select value={String(dayOfWeek)} onValueChange={(v) => setDayOfWeek(Number(v))}>
                <SelectTrigger id="dayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                  <SelectItem value="0">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="grid gap-2">
              <Label htmlFor="dayOfMonth">Day of Month</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="recipients">Email Recipients</Label>
            <Textarea
              id="recipients"
              placeholder="email1@example.com, email2@example.com"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated email addresses
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>Schedule Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SaveTemplateDialog: React.FC<{
  onSave: (name: string, description?: string) => void;
}> = ({ onSave }) => {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, description || undefined);
      setOpen(false);
      setName("");
      setDescription("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Report Template</DialogTitle>
          <DialogDescription>
            Save this report configuration as a reusable template
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Monthly Revenue Report"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed monthly breakdown of revenue by practice area"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ReportLayout: React.FC<ReportLayoutProps> = ({
  reportData,
  parameters,
  onParameterChange,
  onExport,
  onPrint,
  onSave,
  onSchedule,
  onRunReport,
  isLoading = false,
  className,
}) => {
  const [isParameterPanelOpen, setIsParameterPanelOpen] = React.useState(true);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const { metadata, sections } = reportData;

  const renderParameterInput = (param: ReportParameter) => {
    switch (param.type) {
      case "select":
        return (
          <Select
            value={param.value}
            onValueChange={(value) => onParameterChange?.(param.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "date":
        return (
          <Input
            type="date"
            value={param.value || ""}
            onChange={(e) => onParameterChange?.(param.id, e.target.value)}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={param.value || ""}
            onChange={(e) => onParameterChange?.(param.id, Number(e.target.value))}
          />
        );
      case "text":
      default:
        return (
          <Input
            type="text"
            value={param.value || ""}
            onChange={(e) => onParameterChange?.(param.id, e.target.value)}
          />
        );
    }
  };

  const getSectionGridClass = (layout?: string): string => {
    switch (layout) {
      case "half":
        return "col-span-12 md:col-span-6";
      case "third":
        return "col-span-12 md:col-span-4";
      case "full":
      default:
        return "col-span-12";
    }
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header Toolbar */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{metadata.title}</h1>
              {metadata.status && (
                <Badge
                  variant={
                    metadata.status === "published"
                      ? "default"
                      : metadata.status === "scheduled"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {metadata.status}
                </Badge>
              )}
            </div>
            {metadata.description && (
              <p className="mt-1 text-sm text-muted-foreground">{metadata.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {metadata.lastRun && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last run: {format(metadata.lastRun, "MMM d, yyyy 'at' h:mm a")}
                </div>
              )}
              {metadata.nextScheduled && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Next scheduled: {format(metadata.nextScheduled, "MMM d, yyyy 'at' h:mm a")}
                </div>
              )}
              {metadata.generatedBy && <div>Generated by: {metadata.generatedBy}</div>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onRunReport && (
              <Button size="sm" onClick={onRunReport} disabled={isLoading}>
                <Play className="mr-2 h-4 w-4" />
                {isLoading ? "Running..." : "Run Report"}
              </Button>
            )}
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            )}
            {onExport && <ExportDialog onExport={onExport} />}
            {onSchedule && <ScheduleDialog onSchedule={onSchedule} />}
            {onSave && <SaveTemplateDialog onSave={onSave} />}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Parameter Panel */}
        <Collapsible
          open={isParameterPanelOpen}
          onOpenChange={setIsParameterPanelOpen}
          className="border-r border-border"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 top-1/2 z-10 h-16 w-6 -translate-y-1/2 rounded-l-none border border-l-0 border-border bg-background hover:bg-accent"
            >
              {isParameterPanelOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="w-80">
            <ScrollArea className="h-full">
              <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Parameters</h3>
                <div className="space-y-4">
                  {parameters.map((param) => (
                    <div key={param.id} className="space-y-2">
                      <Label htmlFor={param.id}>
                        {param.label}
                        {param.required && <span className="ml-1 text-red-500">*</span>}
                      </Label>
                      {renderParameterInput(param)}
                      {param.description && (
                        <p className="text-xs text-muted-foreground">{param.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Report Content */}
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div
              ref={contentRef}
              className="mx-auto max-w-6xl space-y-6 p-6 print:max-w-none print:p-8"
            >
              {/* Report Sections */}
              <div className="grid grid-cols-12 gap-6">
                {sections.map((section) => {
                  if (section.type === "divider") {
                    return <Separator key={section.id} className="col-span-12" />;
                  }

                  return (
                    <div key={section.id} className={getSectionGridClass(section.layout)}>
                      {section.title && (
                        <h2 className="mb-4 text-xl font-semibold">{section.title}</h2>
                      )}
                      {section.type === "text" && (
                        <div className="prose prose-sm max-w-none">{section.content}</div>
                      )}
                      {section.type === "table" && (
                        <Card>
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">{section.content}</div>
                          </CardContent>
                        </Card>
                      )}
                      {section.type === "chart" && (
                        <Card>
                          <CardContent className="pt-6">{section.content}</CardContent>
                        </Card>
                      )}
                      {section.type === "metric" && section.content}
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:p-8 {
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportLayout;
