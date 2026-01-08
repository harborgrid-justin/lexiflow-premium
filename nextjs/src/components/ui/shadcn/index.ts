/**
 * shadcn/ui Components
 * Enterprise-grade UI component library for legal tech application
 */

// Layout Components
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
export { Button, buttonVariants } from "./button";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
export { ScrollArea, ScrollBar } from "./scroll-area";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

// Form Components
export { Checkbox, checkboxVariants } from "./checkbox";
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "./form";
export { Input } from "./input";
export { Label, labelVariants } from "./label";
export {
  RadioGroup,
  RadioGroupItem,
  radioGroupVariants,
  radioItemVariants,
} from "./radio-group";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
export { Slider, sliderVariants } from "./slider";
export { Switch, switchThumbVariants, switchVariants } from "./switch";
export { Textarea } from "./textarea";

// Feedback & Utility Components
export { Alert, AlertDescription, AlertTitle } from "./alert";
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
export { Progress } from "./progress";
export { Skeleton } from "./skeleton";
export { SonnerToaster } from "./sonner";
export { Spinner, spinnerVariants, type SpinnerProps } from "./spinner";
export { Toggle, toggleVariants } from "./toggle";
export { ToggleGroup, ToggleGroupItem } from "./toggle-group";

// Re-export toast utilities
export {
  Toaster,
  toast,
  useToast,
  type ToastActionElement,
  type ToastProps,
} from "./toast";

// Overlay Components
export { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

// Sidebar Components
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";

// Sidebar Types
export * from "./resizable";
export type {
  SidebarCSSProperties,
  SidebarCollapsible,
  SidebarConfig,
  SidebarContextValue,
  SidebarGroupLabelProps,
  SidebarGroup as SidebarGroupType,
  SidebarMenuActionProps,
  SidebarMenuButtonProps,
  SidebarMenuButtonSize,
  SidebarMenuButtonVariant,
  SidebarMenuItem,
  SidebarMenuItemClickEvent,
  SidebarMenuSkeletonProps,
  SidebarMenuSubButtonProps,
  SidebarNavigation,
  SidebarProps,
  SidebarProviderProps,
  SidebarSide,
  SidebarState,
  SidebarStateChangeEvent,
  SidebarTriggerProps,
  SidebarVariant,
} from "./sidebar.types";
