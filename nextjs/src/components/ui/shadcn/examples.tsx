/**
 * @file examples.tsx
 * @description Comprehensive examples demonstrating enterprise-grade form components
 *
 * This file provides production-ready examples of all form components with:
 * - react-hook-form integration
 * - Zod validation schemas
 * - Accessibility features
 * - Error handling
 * - Multiple size variants
 * - Complex form layouts
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormSection,
  FormGrid,
  FormActions,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Slider,
  Button,
} from "./index";

/**
 * Example 1: User Registration Form
 * Demonstrates: FormSection, FormGrid, validation, multiple input types
 */

const registrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),

  // Account Settings
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),

  // Preferences
  accountType: z.enum(["personal", "business", "enterprise"]),
  notifications: z.boolean().default(true),
  newsletter: z.boolean().default(false),

  // Bio
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export function RegistrationFormExample() {
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      confirmPassword: "",
      accountType: "personal",
      notifications: true,
      newsletter: false,
      bio: "",
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    console.log("Registration data:", data);
    // Handle form submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection
          title="Personal Information"
          description="Provide your basic personal details"
        >
          <FormGrid columns={2}>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
                      {...field}
                      error={!!form.formState.errors.firstName}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
                      {...field}
                      error={!!form.formState.errors.lastName}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                      error={!!form.formState.errors.email}
                    />
                  </FormControl>
                  <FormDescription>
                    We&apos;ll never share your email with anyone else.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      {...field}
                      error={!!form.formState.errors.phone}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        <FormSection
          title="Account Settings"
          description="Set up your account credentials"
        >
          <FormGrid columns={1}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      {...field}
                      error={!!form.formState.errors.username}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>

          <FormGrid columns={2}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      error={!!form.formState.errors.password}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      error={!!form.formState.errors.confirmPassword}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>

          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Account Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger
                      error={!!form.formState.errors.accountType}
                    >
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection
          title="Preferences"
          description="Customize your experience"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Push Notifications</FormLabel>
                    <FormDescription>
                      Receive notifications about your account activity
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newsletter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Subscribe to newsletter</FormLabel>
                    <FormDescription>
                      Receive updates about new features and offers
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      autoResize
                      {...field}
                      error={!!form.formState.errors.bio}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description for your profile (max 500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormActions align="between">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Registering..." : "Register"}
          </Button>
        </FormActions>
      </form>
    </Form>
  );
}

/**
 * Example 2: Settings Form
 * Demonstrates: Radio groups, sliders, size variants
 */

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  fontSize: z.number().min(12).max(24),
  autoSave: z.boolean(),
  language: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsFormExample() {
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      theme: "system",
      fontSize: 16,
      autoSave: true,
      language: "en",
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    console.log("Settings:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection title="Appearance" description="Customize the look and feel">
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Theme</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="light" />
                      </FormControl>
                      <FormLabel className="font-normal">Light</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="dark" />
                      </FormControl>
                      <FormLabel className="font-normal">Dark</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="system" />
                      </FormControl>
                      <FormLabel className="font-normal">System</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fontSize"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>Font Size: {value}px</FormLabel>
                <FormControl>
                  <Slider
                    min={12}
                    max={24}
                    step={1}
                    value={[value]}
                    onValueChange={(vals) => onChange(vals[0])}
                    showValue
                    valueFormatter={(val) => `${val}px`}
                  />
                </FormControl>
                <FormDescription>
                  Adjust the base font size for the interface
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormActions>
          <Button type="submit">Save Settings</Button>
        </FormActions>
      </form>
    </Form>
  );
}

/**
 * Example 3: Size Variants Showcase
 * Demonstrates: All size variants for inputs
 */

export function SizeVariantsExample() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Input Sizes</h3>
        <div className="space-y-2">
          <Input inputSize="sm" placeholder="Small input" />
          <Input inputSize="md" placeholder="Medium input (default)" />
          <Input inputSize="lg" placeholder="Large input" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Textarea Sizes</h3>
        <div className="space-y-2">
          <Textarea textareaSize="sm" placeholder="Small textarea" />
          <Textarea textareaSize="md" placeholder="Medium textarea (default)" />
          <Textarea textareaSize="lg" placeholder="Large textarea" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Sizes</h3>
        <div className="space-y-2">
          <Select>
            <SelectTrigger selectSize="sm">
              <SelectValue placeholder="Small select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger selectSize="md">
              <SelectValue placeholder="Medium select (default)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger selectSize="lg">
              <SelectValue placeholder="Large select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Checkbox Sizes</h3>
        <div className="flex items-center space-x-4">
          <Checkbox size="sm" />
          <Checkbox size="md" />
          <Checkbox size="lg" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Switch Sizes</h3>
        <div className="flex items-center space-x-4">
          <Switch size="sm" />
          <Switch size="md" />
          <Switch size="lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: Error States
 * Demonstrates: Error handling and validation display
 */

export function ErrorStatesExample() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Error States</h3>

      <div className="space-y-2">
        <Input error placeholder="Input with error" />
        <p className="text-sm text-destructive">This field is required</p>
      </div>

      <div className="space-y-2">
        <Textarea error placeholder="Textarea with error" />
        <p className="text-sm text-destructive">Please enter a valid description</p>
      </div>

      <div className="space-y-2">
        <Select>
          <SelectTrigger error>
            <SelectValue placeholder="Select with error" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-destructive">Please select an option</p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox error />
        <label className="text-sm text-destructive">Checkbox with error</label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch error />
        <label className="text-sm text-destructive">Switch with error</label>
      </div>
    </div>
  );
}
