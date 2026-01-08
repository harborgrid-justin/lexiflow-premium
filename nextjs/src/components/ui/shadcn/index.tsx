/**
 * @module shadcn/ui Components
 * @description Enterprise-grade form and UI components built with Radix UI
 *
 * This module provides a comprehensive set of accessible, type-safe form components
 * that integrate seamlessly with react-hook-form and zod for enterprise applications.
 */

// Form Components
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormSection,
  FormGrid,
  FormActions,
  useFormField,
} from "./form";
export type { FormFieldContextValue } from "./form";

// Input Components
export { Input } from "./input";
export type { InputProps } from "./input";

export { Textarea } from "./textarea";
export type { TextareaProps } from "./textarea";

export { Label, labelVariants } from "./label";
export type { LabelProps } from "./label";

// Selection Components
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
export type { CheckboxProps } from "./checkbox";

export {
  RadioGroup,
  RadioGroupItem,
  radioGroupVariants,
  radioItemVariants,
} from "./radio-group";
export type { RadioGroupProps, RadioGroupItemProps } from "./radio-group";

// Toggle Components
export { Switch, switchVariants, switchThumbVariants } from "./switch";
export type { SwitchProps } from "./switch";

// Slider Component
export { Slider, sliderVariants } from "./slider";
export type { SliderProps } from "./slider";

// Additional UI Components
export { Button, buttonVariants } from "./button";
export { Badge, badgeVariants } from "./badge";
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
export { Alert, AlertTitle, AlertDescription } from "./alert";
export { Avatar, AvatarImage, AvatarFallback } from "./avatar";
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb";
export { Separator } from "./separator";
export { Skeleton } from "./skeleton";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./table";
export { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose, ToastAction } from "./toast";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";
export { Progress } from "./progress";
export { Spinner } from "./spinner";
export { Sonner } from "./sonner";
