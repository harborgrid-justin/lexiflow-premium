"use client";

import * as React from "react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, AlertTriangle, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import { Calendar } from "@/components/ui/shadcn/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/shadcn/alert";
import { cn } from "@/lib/utils";

export type CalendarView = "month" | "week" | "day";

export type EventType =
  | "court_hearing"
  | "deposition"
  | "deadline"
  | "meeting"
  | "statute_limitation"
  | "filing"
  | "conference"
  | "trial"
  | "other";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: EventType;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
  caseId?: string;
  caseName?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: "scheduled" | "confirmed" | "cancelled" | "completed";
  courtRules?: string[];
  statuteDeadline?: {
    daysRemaining: number;
    jurisdiction: string;
    statute: string;
  };
}

export interface CalendarLayoutProps {
  events: CalendarEvent[];
  view: CalendarView;
  selectedDate: Date;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent?: () => void;
  statuteAlerts?: CalendarEvent[];
  upcomingDeadlines?: CalendarEvent[];
  className?: string;
}

const EVENT_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  court_hearing: { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" },
  deposition: { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300" },
  deadline: { bg: "bg-red-100", text: "text-red-900", border: "border-red-300" },
  meeting: { bg: "bg-green-100", text: "text-green-900", border: "border-green-300" },
  statute_limitation: { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-300" },
  filing: { bg: "bg-indigo-100", text: "text-indigo-900", border: "border-indigo-300" },
  conference: { bg: "bg-teal-100", text: "text-teal-900", border: "border-teal-300" },
  trial: { bg: "bg-rose-100", text: "text-rose-900", border: "border-rose-300" },
  other: { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-300" },
};

const EVENT_ICONS: Record<EventType, React.ReactNode> = {
  court_hearing: <Scale className="h-3 w-3" />,
  deposition: <FileText className="h-3 w-3" />,
  deadline: <AlertTriangle className="h-3 w-3" />,
  meeting: <Clock className="h-3 w-3" />,
  statute_limitation: <AlertTriangle className="h-3 w-3" />,
  filing: <FileText className="h-3 w-3" />,
  conference: <Clock className="h-3 w-3" />,
  trial: <Scale className="h-3 w-3" />,
  other: <CalendarIcon className="h-3 w-3" />,
};

const getPriorityColor = (priority?: string): string => {
  switch (priority) {
    case "critical":
      return "border-l-4 border-l-red-600";
    case "high":
      return "border-l-4 border-l-orange-500";
    case "medium":
      return "border-l-4 border-l-yellow-500";
    case "low":
    default:
      return "border-l-4 border-l-gray-300";
  }
};

const EventCard: React.FC<{
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  compact?: boolean;
}> = ({ event, onClick, compact = false }) => {
  const colors = EVENT_COLORS[event.type];

  if (compact) {
    return (
      <button
        onClick={() => onClick(event)}
        className={cn(
          "w-full rounded px-1.5 py-0.5 text-left text-xs font-medium transition-opacity hover:opacity-80",
          colors.bg,
          colors.text,
          getPriorityColor(event.priority)
        )}
      >
        <div className="flex items-center gap-1 truncate">
          {EVENT_ICONS[event.type]}
          <span className="truncate">{event.title}</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(event)}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-shadow hover:shadow-md",
        colors.bg,
        colors.border,
        getPriorityColor(event.priority)
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1", colors.text)}>
              {EVENT_ICONS[event.type]}
              <span className="font-semibold">{event.title}</span>
            </div>
            {event.priority === "critical" && (
              <Badge variant="destructive" className="text-xs">
                Critical
              </Badge>
            )}
          </div>
          {event.caseName && (
            <p className="mt-1 text-xs text-muted-foreground">{event.caseName}</p>
          )}
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {event.allDay ? (
              "All day"
            ) : (
              <>
                {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
              </>
            )}
          </div>
          {event.location && (
            <p className="mt-1 text-xs text-muted-foreground">{event.location}</p>
          )}
        </div>
        {event.status && (
          <Badge
            variant={
              event.status === "confirmed"
                ? "default"
                : event.status === "cancelled"
                ? "destructive"
                : "outline"
            }
            className="text-xs"
          >
            {event.status}
          </Badge>
        )}
      </div>
    </button>
  );
};

const MonthView: React.FC<{
  selectedDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}> = ({ selectedDate, events, onDateClick, onEventClick }) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.start, day));
  };

  return (
    <div className="rounded-lg border border-border">
      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="border-r border-border p-2 text-center text-sm font-semibold last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => onDateClick(day)}
              className={cn(
                "min-h-[120px] border-b border-r border-border p-2 text-left transition-colors hover:bg-accent last:border-r-0",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                isSelected && "bg-accent",
                isTodayDate && "bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
                  isTodayDate && "bg-primary text-primary-foreground",
                  isSelected && !isTodayDate && "bg-accent-foreground/10"
                )}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    compact
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const WeekView: React.FC<{
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}> = ({ selectedDate, events, onEventClick }) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      if (!isSameDay(event.start, day)) return false;
      const eventHour = event.start.getHours();
      return eventHour === hour;
    });
  };

  return (
    <div className="rounded-lg border border-border">
      {/* Week Days Header */}
      <div className="grid grid-cols-8 border-b border-border bg-muted/50">
        <div className="border-r border-border p-2 text-center text-sm font-semibold">Time</div>
        {weekDays.map((day) => (
          <div key={day.toString()} className="border-r border-border p-2 text-center last:border-r-0">
            <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
            <div className={cn("text-sm font-semibold", isToday(day) && "text-primary")}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      <ScrollArea className="h-[600px]">
        <div>
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border">
              <div className="border-r border-border p-2 text-xs text-muted-foreground">
                {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
              </div>
              {weekDays.map((day) => {
                const hourEvents = getEventsForDayAndHour(day, hour);
                return (
                  <div key={day.toString()} className="min-h-[60px] border-r border-border p-1 last:border-r-0">
                    <div className="space-y-1">
                      {hourEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={onEventClick}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const DayView: React.FC<{
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}> = ({ selectedDate, events, onEventClick }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter((event) => isSameDay(event.start, selectedDate));

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter((event) => {
      const eventHour = event.start.getHours();
      return eventHour === hour;
    });
  };

  return (
    <div className="rounded-lg border border-border">
      {/* Day Header */}
      <div className="border-b border-border bg-muted/50 p-4">
        <h3 className="text-lg font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
        <p className="text-sm text-muted-foreground">{dayEvents.length} events scheduled</p>
      </div>

      {/* Time Slots */}
      <ScrollArea className="h-[600px]">
        <div className="divide-y divide-border">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            return (
              <div key={hour} className="flex min-h-[80px]">
                <div className="w-24 shrink-0 border-r border-border p-2 text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
                </div>
                <div className="flex-1 p-2">
                  <div className="space-y-2">
                    {hourEvents.map((event) => (
                      <EventCard key={event.id} event={event} onClick={onEventClick} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export const CalendarLayout: React.FC<CalendarLayoutProps> = ({
  events,
  view,
  selectedDate,
  onViewChange,
  onDateChange,
  onEventClick,
  onCreateEvent,
  statuteAlerts = [],
  upcomingDeadlines = [],
  className,
}) => {
  const handlePrevious = () => {
    if (view === "month") {
      onDateChange(subMonths(selectedDate, 1));
    } else if (view === "week") {
      onDateChange(subWeeks(selectedDate, 1));
    } else {
      onDateChange(addDays(selectedDate, -1));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      onDateChange(addMonths(selectedDate, 1));
    } else if (view === "week") {
      onDateChange(addWeeks(selectedDate, 1));
    } else {
      onDateChange(addDays(selectedDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getHeaderTitle = () => {
    switch (view) {
      case "month":
        return format(selectedDate, "MMMM yyyy");
      case "week":
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "day":
        return format(selectedDate, "EEEE, MMMM d, yyyy");
    }
  };

  const todayEvents = events.filter((event) => isSameDay(event.start, new Date()));

  return (
    <div className={cn("flex h-full flex-col gap-6 p-6", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Legal Calendar</h1>
          <Button onClick={handleToday} variant="outline" size="sm">
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <Tabs value={view} onValueChange={(v) => onViewChange(v as CalendarView)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[200px] text-center text-sm font-semibold">
              {getHeaderTitle()}
            </div>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Create Event Button */}
          {onCreateEvent && (
            <Button onClick={onCreateEvent}>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          )}
        </div>
      </div>

      {/* Statute Alerts */}
      {statuteAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Statute of Limitations Alerts</AlertTitle>
          <AlertDescription>
            You have {statuteAlerts.length} approaching statute deadlines requiring immediate attention.
            <div className="mt-2 space-y-1">
              {statuteAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="text-xs">
                  <span className="font-semibold">{alert.caseName}:</span>{" "}
                  {alert.statuteDeadline?.daysRemaining} days remaining
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Main Calendar */}
        <div className="flex-1 overflow-auto">
          {view === "month" && (
            <MonthView
              selectedDate={selectedDate}
              events={events}
              onDateClick={onDateChange}
              onEventClick={onEventClick}
            />
          )}
          {view === "week" && (
            <WeekView selectedDate={selectedDate} events={events} onEventClick={onEventClick} />
          )}
          {view === "day" && (
            <DayView selectedDate={selectedDate} events={events} onEventClick={onEventClick} />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4">
          {/* Mini Calendar */}
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                className="rounded-md border-0"
              />
            </CardContent>
          </Card>

          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's Events</CardTitle>
              <CardDescription>{format(new Date(), "EEEE, MMMM d")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {todayEvents.length > 0 ? (
                  <div className="space-y-2">
                    {todayEvents.map((event) => (
                      <EventCard key={event.id} event={event} onClick={onEventClick} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No events scheduled for today</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {upcomingDeadlines.map((deadline) => (
                      <EventCard key={deadline.id} event={deadline} onClick={onEventClick} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Event Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(EVENT_COLORS).map(([type, colors]) => (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    <div className={cn("h-3 w-3 rounded-sm", colors.bg, `border ${colors.border}`)} />
                    <span className="capitalize">{type.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarLayout;
