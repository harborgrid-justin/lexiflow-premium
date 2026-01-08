"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/shadcn/button";
import { Calendar } from "@/components/ui/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/shadcn/popover";

export interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /**
   * Date format string (date-fns format)
   * @default "PPP"
   */
  dateFormat?: string;
  /**
   * Minimum selectable date
   */
  fromDate?: Date;
  /**
   * Maximum selectable date
   */
  toDate?: Date;
  /**
   * Function to disable specific dates
   */
  disabledDates?: (date: Date) => boolean;
}

/**
 * DatePicker - Complete date picker with popover and calendar
 * Combines button, popover, and calendar for full date selection experience
 *
 * Features:
 * - Popover-based calendar display
 * - Customizable date format
 * - Date range constraints
 * - Disabled dates support
 * - Keyboard navigation
 * - Accessible label and description
 *
 * @example
 * ```tsx
 * const [date, setDate] = React.useState<Date>();
 *
 * <DatePicker
 *   date={date}
 *   onSelect={setDate}
 *   placeholder="Pick a date"
 *   dateFormat="MM/dd/yyyy"
 *   fromDate={new Date()}
 * />
 * ```
 */
export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  className,
  dateFormat = "PPP",
  fromDate,
  toDate,
  disabledDates,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={disabledDates}
          fromDate={fromDate}
          toDate={toDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export interface DateRangePickerProps {
  dateRange?: {
    from: Date | undefined;
    to?: Date | undefined;
  };
  onSelect?: (range: { from: Date | undefined; to?: Date | undefined } | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dateFormat?: string;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * DateRangePicker - Date range picker with start and end dates
 *
 * @example
 * ```tsx
 * const [range, setRange] = React.useState<{from: Date | undefined; to?: Date | undefined}>();
 *
 * <DateRangePicker
 *   dateRange={range}
 *   onSelect={setRange}
 *   placeholder="Select date range"
 * />
 * ```
 */
export function DateRangePicker({
  dateRange,
  onSelect,
  placeholder = "Pick a date range",
  disabled = false,
  className,
  dateFormat = "LLL dd, y",
  fromDate,
  toDate,
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !dateRange && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, dateFormat)} -{" "}
                {format(dateRange.to, dateFormat)}
              </>
            ) : (
              format(dateRange.from, dateFormat)
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={onSelect}
          numberOfMonths={2}
          fromDate={fromDate}
          toDate={toDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
