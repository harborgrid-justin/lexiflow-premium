/**
 * shadcn/ui Components
 * Enterprise-grade UI component library for legal tech application
 */

// Layout Components
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./alert-dialog";
export { Button, buttonVariants } from "./button";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";
export { ScrollArea, ScrollBar } from "./scroll-area";
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./table";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription,
} from "./toast";
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./command";

// Form Components
export { Input } from "./input";
export { Label, labelVariants } from "./label";
export { Textarea } from "./textarea";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select";
export { Checkbox, checkboxVariants } from "./checkbox";
export { RadioGroup, RadioGroupItem, radioGroupVariants, radioItemVariants } from "./radio-group";
export { Switch, switchVariants, switchThumbVariants } from "./switch";
export { Slider, sliderVariants } from "./slider";
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "./form"

// Feedback & Utility Components
export { SonnerToaster } from "./sonner";
export { Alert, AlertTitle, AlertDescription } from "./alert";
export { Progress } from "./progress";
export { Skeleton } from "./skeleton";
export { Spinner, spinnerVariants, type SpinnerProps } from "./spinner";
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
export { Toggle, toggleVariants } from "./toggle";
export { ToggleGroup, ToggleGroupItem } from "./toggle-group";

// Re-export toast utilities
export { Toaster, useToast, toast, type ToastProps, type ToastActionElement } from "./toast";

// Overlay Components
export { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";

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
} from "./sidebar"

// Sidebar Types
export type {
  SidebarState,
  SidebarVariant,
  SidebarSide,
  SidebarCollapsible,
  SidebarMenuButtonSize,
  SidebarMenuButtonVariant,
  SidebarContextValue,
  SidebarProviderProps,
  SidebarProps,
  SidebarTriggerProps,
  SidebarMenuButtonProps,
  SidebarMenuActionProps,
  SidebarMenuSkeletonProps,
  SidebarMenuSubButtonProps,
  SidebarGroupLabelProps,
  SidebarConfig,
  SidebarMenuItem,
  SidebarGroup as SidebarGroupType,
  SidebarNavigation,
  SidebarStateChangeEvent,
  SidebarMenuItemClickEvent,
  SidebarCSSProperties,
} from "./sidebar.types"
