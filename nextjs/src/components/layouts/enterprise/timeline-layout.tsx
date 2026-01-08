"use client";

import * as React from "react";
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";
import {
  FileText,
  Gavel,
  Calendar as CalendarIcon,
  AlertCircle,
  MessageSquare,
  Users,
  Plus,
  Download,
  Filter,
  ZoomIn,
  ZoomOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";

// Type definitions for timeline events
export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: Date;
  time?: string;
  location?: string;
  participants?: string[];
  attachments?: {
    id: string;
    name: string;
    type: string;
  }[];
  outcome?: string;
  metadata?: Record<string, unknown>;
  status?: "scheduled" | "completed" | "cancelled";
}

export type TimelineEventType =
  | "filing"
  | "hearing"
  | "deadline"
  | "motion"
  | "discovery"
  | "deposition"
  | "conference"
  | "trial"
  | "settlement"
  | "order"
  | "communication"
  | "other";

export interface TimelineFilters {
  eventTypes: TimelineEventType[];
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  participants?: string[];
  status?: ("scheduled" | "completed" | "cancelled")[];
}

export type TimelineZoomLevel = "day" | "week" | "month" | "year";

export interface TimelineLayoutProps {
  events: TimelineEvent[];
  filters: TimelineFilters;
  onFilterChange: (filters: TimelineFilters) => void;
  onAddEvent?: () => void;
  onEventClick?: (event: TimelineEvent) => void;
  onExportTimeline?: () => void;
  zoomLevel?: TimelineZoomLevel;
  onZoomChange?: (level: TimelineZoomLevel) => void;
  className?: string;
}

const eventTypeConfig: Record<
  TimelineEventType,
  { icon: typeof FileText; color: string; label: string }
> = {
  filing: {
    icon: FileText,
    color: "bg-blue-100 text-blue-700 border-blue-300",
    label: "Filing",
  },
  hearing: {
    icon: Gavel,
    color: "bg-purple-100 text-purple-700 border-purple-300",
    label: "Hearing",
  },
  deadline: {
    icon: AlertCircle,
    color: "bg-red-100 text-red-700 border-red-300",
    label: "Deadline",
  },
  motion: {
    icon: FileText,
    color: "bg-indigo-100 text-indigo-700 border-indigo-300",
    label: "Motion",
  },
  discovery: {
    icon: FileText,
    color: "bg-cyan-100 text-cyan-700 border-cyan-300",
    label: "Discovery",
  },
  deposition: {
    icon: Users,
    color: "bg-teal-100 text-teal-700 border-teal-300",
    label: "Deposition",
  },
  conference: {
    icon: Users,
    color: "bg-green-100 text-green-700 border-green-300",
    label: "Conference",
  },
  trial: {
    icon: Gavel,
    color: "bg-orange-100 text-orange-700 border-orange-300",
    label: "Trial",
  },
  settlement: {
    icon: MessageSquare,
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    label: "Settlement",
  },
  order: {
    icon: Gavel,
    color: "bg-violet-100 text-violet-700 border-violet-300",
    label: "Order",
  },
  communication: {
    icon: MessageSquare,
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    label: "Communication",
  },
  other: {
    icon: CalendarIcon,
    color: "bg-gray-100 text-gray-700 border-gray-300",
    label: "Other",
  },
};

const statusColors = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
};

export function TimelineLayout({
  events,
  filters,
  onFilterChange,
  onAddEvent,
  onEventClick,
  onExportTimeline,
  zoomLevel = "month",
  onZoomChange,
  className,
}: TimelineLayoutProps) {
  const [selectedEventTypes, setSelectedEventTypes] = React.useState<TimelineEventType[]>(
    filters.eventTypes
  );

  // Group events by date
  const groupedEvents = React.useMemo(() => {
    const filtered = events.filter((event) => {
      if (selectedEventTypes.length > 0 && !selectedEventTypes.includes(event.type)) {
        return false;
      }
      if (filters.dateRange?.from && event.date < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange?.to && event.date > filters.dateRange.to) {
        return false;
      }
      if (filters.status && filters.status.length > 0 && event.status && !filters.status.includes(event.status)) {
        return false;
      }
      return true;
    });

    const grouped = new Map<string, TimelineEvent[]>();
    filtered.forEach((event) => {
      const dateKey = format(event.date, "yyyy-MM-dd");
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });

    // Sort each group by time
    grouped.forEach((events) => {
      events.sort((a, b) => {
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });
    });

    // Convert to array and sort by date
    return Array.from(grouped.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, events]) => ({ date: new Date(date), events }));
  }, [events, selectedEventTypes, filters]);

  const handleEventTypeToggle = (type: TimelineEventType, checked: boolean) => {
    const newTypes = checked
      ? [...selectedEventTypes, type]
      : selectedEventTypes.filter((t) => t !== type);
    setSelectedEventTypes(newTypes);
    onFilterChange({ ...filters, eventTypes: newTypes });
  };

  const activeFilterCount = [
    selectedEventTypes.length > 0,
    filters.dateRange?.from || filters.dateRange?.to,
    filters.status && filters.status.length > 0,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSelectedEventTypes([]);
    onFilterChange({
      eventTypes: [],
      dateRange: { from: null, to: null },
      status: [],
    });
  };

  return (
    <div className={cn("flex flex-col h-full bg-gray-50", className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Case Timeline</h1>
            <p className="text-sm text-gray-600 mt-1">
              {events.length} total events • {groupedEvents.reduce((sum, g) => sum + g.events.length, 0)} visible
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => onZoomChange?.("day")}
                disabled={zoomLevel === "day"}
              >
                Day
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => onZoomChange?.("week")}
                disabled={zoomLevel === "week"}
              >
                Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => onZoomChange?.("month")}
                disabled={zoomLevel === "month"}
              >
                Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => onZoomChange?.("year")}
                disabled={zoomLevel === "year"}
              >
                Year
              </Button>
            </div>

            {/* Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 min-w-[1.25rem]">
                      {activeFilterCount}
                    </Badge>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold">Event Types</div>
                {(Object.keys(eventTypeConfig) as TimelineEventType[]).map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={selectedEventTypes.includes(type)}
                    onCheckedChange={(checked) => handleEventTypeToggle(type, checked)}
                  >
                    <Badge variant="outline" className={cn("text-xs mr-2", eventTypeConfig[type].color)}>
                      {eventTypeConfig[type].label}
                    </Badge>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}

            <Separator orientation="vertical" className="h-8" />

            {/* Export */}
            <Button variant="outline" onClick={onExportTimeline}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>

            {/* Add Event */}
            {onAddEvent && (
              <Button onClick={onAddEvent} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {groupedEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No events match your filters</p>
              {activeFilterCount > 0 && (
                <Button variant="link" onClick={handleClearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Timeline Events */}
              <div className="space-y-8">
                {groupedEvents.map(({ date, events: dateEvents }, groupIndex) => {
                  const isToday = isSameDay(date, new Date());
                  const isPast = date < startOfDay(new Date());

                  return (
                    <div key={format(date, "yyyy-MM-dd")} className="relative">
                      {/* Date Marker */}
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={cn(
                            "w-16 h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center flex-col z-10",
                            isToday
                              ? "bg-blue-500 text-white"
                              : isPast
                              ? "bg-gray-300 text-gray-600"
                              : "bg-white text-gray-900 border-gray-200"
                          )}
                        >
                          <span className="text-xs font-medium">{format(date, "MMM")}</span>
                          <span className="text-lg font-bold">{format(date, "d")}</span>
                        </div>
                        <div>
                          <p className={cn("font-semibold", isToday && "text-blue-600")}>
                            {format(date, "EEEE, MMMM d, yyyy")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {dateEvents.length} {dateEvents.length === 1 ? "event" : "events"}
                          </p>
                        </div>
                      </div>

                      {/* Events for this date */}
                      <div className="ml-24 space-y-3">
                        {dateEvents.map((event, eventIndex) => {
                          const config = eventTypeConfig[event.type];
                          const Icon = config.icon;
                          const isLast = groupIndex === groupedEvents.length - 1 && eventIndex === dateEvents.length - 1;

                          return (
                            <Card
                              key={event.id}
                              className="group hover:shadow-lg transition-all cursor-pointer"
                              onClick={() => onEventClick?.(event)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                      config.color
                                    )}
                                  >
                                    <Icon className="w-5 h-5" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                                            {event.title}
                                          </h3>
                                          <Badge variant="outline" className={cn("text-xs", config.color)}>
                                            {config.label}
                                          </Badge>
                                          {event.status && (
                                            <Badge variant="outline" className={cn("text-xs", statusColors[event.status])}>
                                              {event.status}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600">{event.description}</p>
                                      </div>
                                      {event.time && (
                                        <div className="text-right flex-shrink-0">
                                          <p className="text-sm font-medium text-gray-900">{event.time}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                      {event.location && (
                                        <div className="flex items-center gap-1">
                                          <CalendarIcon className="w-3 h-3" />
                                          <span>{event.location}</span>
                                        </div>
                                      )}
                                      {event.participants && event.participants.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          <span>{event.participants.length} participants</span>
                                        </div>
                                      )}
                                      {event.attachments && event.attachments.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <FileText className="w-3 h-3" />
                                          <span>{event.attachments.length} attachments</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Outcome */}
                                    {event.outcome && (
                                      <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                        <p className="text-xs font-medium text-gray-700">Outcome:</p>
                                        <p className="text-sm text-gray-600 mt-0.5">{event.outcome}</p>
                                      </div>
                                    )}

                                    {/* Participants */}
                                    {event.participants && event.participants.length > 0 && (
                                      <div className="flex items-center gap-1 mt-2">
                                        {event.participants.slice(0, 3).map((participant, i) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {participant}
                                          </Badge>
                                        ))}
                                        {event.participants.length > 3 && (
                                          <Badge variant="secondary" className="text-xs">
                                            +{event.participants.length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Floating Add Button (Mobile) */}
      {onAddEvent && (
        <Button
          onClick={onAddEvent}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
