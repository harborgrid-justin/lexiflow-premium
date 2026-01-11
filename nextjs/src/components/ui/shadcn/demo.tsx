"use client";

/**
 * Enterprise shadcn/ui Components Demo
 * Comprehensive examples of all advanced components
 *
 * This file demonstrates production-ready usage patterns
 */

import * as React from "react";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Search, User, Settings, Home } from "lucide-react";

// Command
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "./command";

// Calendar & Date Picker
import { Calendar } from "./calendar";
import { DatePicker, DateRangePicker } from "./date-picker";

// Breadcrumb
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb";

// Pagination
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

// Drawer
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

// Input OTP
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./input-otp";

// Other UI
import { Button } from "./button";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";

// Hooks
import { useMobile } from "@/hooks/use-mobile";

/**
 * Command Palette Demo
 * Press Cmd+K to open
 */
export function CommandDemo() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Press{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>{" "}
          to open command palette
        </p>
        <Button onClick={() => setOpen(true)}>Open Command Menu</Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => toast.success("Calendar opened")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem onSelect={() => toast.success("Search users")}>
              <Search className="mr-2 h-4 w-4" />
              <span>Search Users</span>
              <CommandShortcut>⌘U</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

/**
 * Calendar Demo
 * Single, range, and multiple date selection
 */
export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to?: Date | undefined }>();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Single Date Selection</h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        {date && (
          <p className="mt-2 text-sm text-muted-foreground">
            Selected: {date.toLocaleDateString()}
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Date Range Selection</h3>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
          className="rounded-md border"
        />
        {dateRange?.from && (
          <p className="mt-2 text-sm text-muted-foreground">
            From: {dateRange.from.toLocaleDateString()}
            {dateRange.to && ` - To: ${dateRange.to.toLocaleDateString()}`}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Date Picker Demo
 * Popover-based date pickers
 */
export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>();
  const [range, setRange] = React.useState<{ from: Date | undefined; to?: Date | undefined }>();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">Single Date Picker</h3>
        <DatePicker
          date={date}
          onSelect={setDate}
          placeholder="Pick a date"
          dateFormat="PPP"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Date Range Picker</h3>
        <DateRangePicker
          dateRange={range}
          onSelect={setRange}
          placeholder="Select date range"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">With Constraints</h3>
        <DatePicker
          date={date}
          onSelect={setDate}
          placeholder="Future dates only"
          fromDate={new Date()}
          disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Only future weekdays allowed
        </p>
      </div>
    </div>
  );
}

/**
 * Breadcrumb Demo
 */
export function BreadcrumbDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Simple Breadcrumb</h3>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cases">Cases</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Case #12345</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">With Ellipsis (Long Path)</h3>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cases/123/documents">
                Documents
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Evidence.pdf</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}

/**
 * Pagination Demo
 */
export function PaginationDemo() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = 10;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">
          Table Pagination (Page {currentPage} of {totalPages})
        </h3>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(Math.max(1, currentPage - 1));
                }}
              />
            </PaginationItem>
            {currentPage > 2 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(1);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </>
            )}
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(currentPage - 1);
                  }}
                >
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(currentPage + 1);
                  }}
                >
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(Math.min(totalPages, currentPage + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

/**
 * Toast Demo (Sonner)
 */
export function ToastDemo() {
  return (
    <div className="space-y-2">
      <h3 className="mb-3 text-sm font-medium">Toast Notifications</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => toast("Event has been created")}
        >
          Default Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success("Case saved successfully")}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("Failed to save document")}
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.promise(
              new Promise((resolve) => setTimeout(resolve, 2000)),
              {
                loading: "Saving...",
                success: "Saved!",
                error: "Failed to save",
              }
            )
          }
        >
          Promise Toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Case archived", {
              action: {
                label: "Undo",
                onClick: () => toast.success("Undo successful"),
              },
            })
          }
        >
          With Action
        </Button>
      </div>
    </div>
  );
}

/**
 * Drawer Demo
 * Mobile-first bottom sheet
 */
export function DrawerDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Mobile Drawer</h3>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Confirm Action</DrawerTitle>
            <DrawerDescription>
              Are you sure you want to archive this case?
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              This action will move the case to the archive. You can restore it later.
            </p>
          </div>
          <DrawerFooter>
            <Button onClick={() => {
              toast.success("Case archived");
              setOpen(false);
            }}>
              Confirm
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

/**
 * Input OTP Demo
 * One-time password input
 */
export function InputOTPDemo() {
  const [value, setValue] = React.useState("");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">6-Digit OTP</h3>
        <InputOTP maxLength={6} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="mt-2 text-sm text-muted-foreground">
          Value: {value || "Empty"}
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">With Separator</h3>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="mt-2 text-xs text-muted-foreground">
          Try pasting a 6-digit code
        </p>
      </div>
    </div>
  );
}

/**
 * Responsive Demo
 * Uses useMobile hook to show different components
 */
export function ResponsiveDemo() {
  const isMobile = useMobile();
  const [open, setOpen] = React.useState(false);

  if (isMobile === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">
        Responsive Component (Currently: {isMobile ? "Mobile" : "Desktop"})
      </h3>
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button>Open Mobile Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Mobile View</DrawerTitle>
              <DrawerDescription>
                This is a drawer on mobile
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Open Desktop Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Desktop View</h3>
              <p className="text-sm text-muted-foreground">
                This is a dialog on desktop
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
