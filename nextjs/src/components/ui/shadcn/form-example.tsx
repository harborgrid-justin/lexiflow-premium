/**
 * Form Components Usage Examples
 *
 * This file demonstrates how to use all the form components together
 * with react-hook-form and zod validation for a legal tech application.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Checkbox } from "./checkbox";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Switch } from "./switch";
import { Slider } from "./slider";
import { Label } from "./label";

// Define validation schema
const legalCaseFormSchema = z.object({
  caseName: z.string().min(3, "Case name must be at least 3 characters"),
  caseNumber: z.string().min(1, "Case number is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  caseType: z.string().min(1, "Please select a case type"),
  priority: z.string().min(1, "Please select a priority level"),
  assignedAttorney: z.string().optional(),
  billable: z.boolean().default(true),
  confidential: z.boolean().default(false),
  notifyClient: z.boolean().default(false),
  budgetPercentage: z.number().min(0).max(100).default(50),
  status: z.enum(["active", "pending", "closed"]).default("active"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type LegalCaseFormValues = z.infer<typeof legalCaseFormSchema>;

export function FormExample() {
  const form = useForm<LegalCaseFormValues>({
    defaultValues: {
      caseName: "",
      caseNumber: "",
      description: "",
      caseType: "",
      priority: "",
      assignedAttorney: "",
      billable: true,
      confidential: false,
      notifyClient: false,
      budgetPercentage: 50,
      status: "active",
      termsAccepted: false,
    },
  });

  function onSubmit(values: LegalCaseFormValues) {
    console.log("Form submitted:", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Input Field Example */}
        <FormField
          control={form.control}
          name="caseName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Case Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter case name"
                  error={!!form.formState.errors.caseName}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The full name or title of the legal case
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Input with Size Variant */}
        <FormField
          control={form.control}
          name="caseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Case Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., CV-2024-001"
                  inputSize="lg"
                  error={!!form.formState.errors.caseNumber}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Textarea Example */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Case Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed description of the case"
                  autoResize
                  error={!!form.formState.errors.description}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include key facts, parties involved, and case overview
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Select Example */}
        <FormField
          control={form.control}
          name="caseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Case Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    error={!!form.formState.errors.caseType}
                    fullWidth
                  >
                    <SelectValue placeholder="Select a case type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="civil">Civil Litigation</SelectItem>
                  <SelectItem value="criminal">Criminal Defense</SelectItem>
                  <SelectItem value="corporate">Corporate Law</SelectItem>
                  <SelectItem value="family">Family Law</SelectItem>
                  <SelectItem value="employment">Employment Law</SelectItem>
                  <SelectItem value="ip">Intellectual Property</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Select with Groups */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Priority Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    error={!!form.formState.errors.priority}
                    selectSize="md"
                  >
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Radio Group Example */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Case Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  orientation="horizontal"
                  error={!!form.formState.errors.status}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="status-active" />
                    <Label htmlFor="status-active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="status-pending" />
                    <Label htmlFor="status-pending">Pending</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="closed" id="status-closed" />
                    <Label htmlFor="status-closed">Closed</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checkbox Examples */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="billable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Billable Case</FormLabel>
                  <FormDescription>
                    This case will be billed to the client
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confidential"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    size="md"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Confidential</FormLabel>
                  <FormDescription>
                    Mark this case as highly confidential
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Switch Example */}
        <FormField
          control={form.control}
          name="notifyClient"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Client Notifications</FormLabel>
                <FormDescription>
                  Send automatic email notifications to the client
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  size="md"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Slider Example */}
        <FormField
          control={form.control}
          name="budgetPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Utilization</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                  showValue
                  formatValue={(val) => `${val}%`}
                  size="md"
                />
              </FormControl>
              <FormDescription>
                Current budget utilization percentage
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms and Conditions Checkbox (Required) */}
        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  error={!!form.formState.errors.termsAccepted}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel required>Terms and Conditions</FormLabel>
                <FormDescription>
                  I agree to the terms and conditions for case management
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit">Create Case</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}

/**
 * Example: Simple Login Form
 */
const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginFormExample() {
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: LoginFormValues) {
    console.log("Login submitted:", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="attorney@lawfirm.com"
                  error={!!form.formState.errors.email}
                  fullWidth
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  error={!!form.formState.errors.password}
                  fullWidth
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Remember me</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </Form>
  );
}
