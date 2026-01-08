"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Save,
  User,
  Briefcase,
  Shield,
  FileText,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Progress } from "@/components/ui/shadcn/progress";
import { Badge } from "@/components/ui/shadcn/badge";
import { Separator } from "@/components/ui/shadcn/separator";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/shadcn/alert";

interface IntakeStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: IntakeField[];
  validationRules?: ValidationRule[];
}

interface IntakeField {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "date" | "select" | "textarea" | "checkbox" | "radio";
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: string) => string | null;
}

interface ValidationRule {
  field: string;
  validate: (value: string, formData: Record<string, string>) => string | null;
}

interface MatterIntakeLayoutProps {
  steps: IntakeStep[];
  currentStep: number;
  formData: Record<string, string>;
  onStepChange: (step: number) => void;
  onFieldChange: (fieldName: string, value: string) => void;
  onSaveDraft?: () => Promise<void>;
  onSubmit: () => Promise<void>;
  validationErrors?: Record<string, string>;
}

export function MatterIntakeLayout({
  steps,
  currentStep,
  formData,
  onStepChange,
  onFieldChange,
  onSaveDraft,
  onSubmit,
  validationErrors = {},
}: MatterIntakeLayoutProps) {
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isReviewStep = currentStepData.id === "review";

  // Calculate progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};

    // Validate required fields
    currentStepData.fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }

      // Run field-specific validation
      if (field.validation && formData[field.name]) {
        const error = field.validation(formData[field.name]);
        if (error) {
          errors[field.name] = error;
        }
      }
    });

    // Run step-level validation rules
    currentStepData.validationRules?.forEach((rule) => {
      const error = rule.validate(formData[rule.field] || "", formData);
      if (error) {
        errors[rule.field] = error;
      }
    });

    return errors;
  }, [currentStepData, formData]);

  const stepErrors = useMemo(() => validateCurrentStep(), [validateCurrentStep]);
  const hasErrors = Object.keys(stepErrors).length > 0;

  const handleNext = () => {
    setShowValidation(true);
    if (!hasErrors) {
      onStepChange(currentStep + 1);
      setShowValidation(false);
    }
  };

  const handlePrevious = () => {
    onStepChange(currentStep - 1);
    setShowValidation(false);
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      setIsDraftSaving(true);
      try {
        await onSaveDraft();
      } finally {
        setIsDraftSaving(false);
      }
    }
  };

  const handleSubmit = async () => {
    setShowValidation(true);
    if (!hasErrors) {
      setIsSubmitting(true);
      try {
        await onSubmit();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getStepStatus = (stepIndex: number): "completed" | "current" | "upcoming" => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "upcoming";
  };

  const renderField = (field: IntakeField) => {
    const value = formData[field.name] || "";
    const error = showValidation ? (stepErrors[field.name] || validationErrors[field.name]) : null;

    return (
      <div key={field.id} className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </label>

        {field.type === "textarea" ? (
          <textarea
            className={`flex min-h-[80px] w-full rounded-md border ${
              error ? "border-destructive" : "border-input"
            } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
          />
        ) : field.type === "select" ? (
          <select
            className={`flex h-10 w-full rounded-md border ${
              error ? "border-destructive" : "border-input"
            } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            value={value}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === "checkbox" ? (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={value === "true"}
              onChange={(e) => onFieldChange(field.name, e.target.checked.toString())}
            />
            <span className="text-sm text-muted-foreground">{field.placeholder}</span>
          </div>
        ) : (
          <input
            type={field.type}
            className={`flex h-10 w-full rounded-md border ${
              error ? "border-destructive" : "border-input"
            } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
          />
        )}

        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            Please review all information before submitting. You can go back to any step to make changes.
          </AlertDescription>
        </Alert>

        {steps.slice(0, -1).map((step, stepIndex) => (
          <Card key={step.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <CardDescription className="text-sm">{step.description}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onStepChange(stepIndex)}>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {step.fields.map((field) => {
                  const value = formData[field.name];
                  if (!value) return null;

                  return (
                    <div key={field.id} className="space-y-1">
                      <p className="text-sm text-muted-foreground">{field.label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Matter Intake</h1>
          <p className="text-muted-foreground">Complete all steps to create a new matter</p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />

              {/* Step Indicators */}
              <div className="flex justify-between items-start mt-6">
                {steps.map((step, index) => {
                  const status = getStepStatus(index);
                  const StepIcon = step.icon;

                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1 relative">
                      {index > 0 && (
                        <div
                          className={`absolute right-1/2 top-5 w-full h-0.5 -z-10 ${
                            status === "completed" ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          status === "completed"
                            ? "bg-primary text-primary-foreground"
                            : status === "current"
                            ? "bg-primary/20 text-primary border-2 border-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {status === "completed" ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`text-xs text-center ${
                          status === "current" ? "font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <currentStepData.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
              {onSaveDraft && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isDraftSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isDraftSaving ? "Saving..." : "Save Draft"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {isReviewStep ? (
                renderReviewStep()
              ) : (
                <div className="space-y-6">
                  {currentStepData.fields.map(renderField)}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {showValidation && hasErrors && (
              <Alert variant="destructive" className="py-2 px-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm ml-2">
                  Please correct the errors before continuing
                </AlertDescription>
              </Alert>
            )}
          </div>

          {isLastStep ? (
            <Button onClick={handleSubmit} disabled={isSubmitting || hasErrors}>
              {isSubmitting ? "Submitting..." : "Submit Intake"}
              <Check className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Example usage helper
export const createDefaultIntakeSteps = (): IntakeStep[] => [
  {
    id: "client-info",
    title: "Client Info",
    description: "Enter client details and contact information",
    icon: User,
    fields: [
      {
        id: "client-first-name",
        name: "clientFirstName",
        label: "First Name",
        type: "text",
        required: true,
        placeholder: "John",
      },
      {
        id: "client-last-name",
        name: "clientLastName",
        label: "Last Name",
        type: "text",
        required: true,
        placeholder: "Doe",
      },
      {
        id: "client-email",
        name: "clientEmail",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "john.doe@example.com",
        validation: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value) ? null : "Invalid email address";
        },
      },
      {
        id: "client-phone",
        name: "clientPhone",
        label: "Phone",
        type: "phone",
        required: true,
        placeholder: "(555) 123-4567",
      },
    ],
  },
  {
    id: "matter-details",
    title: "Matter Details",
    description: "Provide information about the legal matter",
    icon: Briefcase,
    fields: [
      {
        id: "matter-title",
        name: "matterTitle",
        label: "Matter Title",
        type: "text",
        required: true,
        placeholder: "Smith v. Jones",
      },
      {
        id: "matter-type",
        name: "matterType",
        label: "Matter Type",
        type: "select",
        required: true,
        options: [
          { value: "litigation", label: "Litigation" },
          { value: "transactional", label: "Transactional" },
          { value: "advisory", label: "Advisory" },
        ],
      },
      {
        id: "matter-description",
        name: "matterDescription",
        label: "Matter Description",
        type: "textarea",
        required: true,
        placeholder: "Provide a detailed description of the matter...",
      },
    ],
  },
  {
    id: "conflicts-check",
    title: "Conflicts Check",
    description: "Verify potential conflicts of interest",
    icon: Shield,
    fields: [
      {
        id: "opposing-party",
        name: "opposingParty",
        label: "Opposing Party",
        type: "text",
        required: false,
        placeholder: "Name of opposing party",
      },
      {
        id: "conflicts-cleared",
        name: "conflictsCleared",
        label: "Conflicts Check Completed",
        type: "checkbox",
        required: true,
        placeholder: "I confirm that a conflicts check has been performed",
      },
    ],
  },
  {
    id: "fee-agreement",
    title: "Fee Agreement",
    description: "Set billing arrangement and rates",
    icon: FileText,
    fields: [
      {
        id: "billing-type",
        name: "billingType",
        label: "Billing Type",
        type: "select",
        required: true,
        options: [
          { value: "hourly", label: "Hourly" },
          { value: "flat_fee", label: "Flat Fee" },
          { value: "contingency", label: "Contingency" },
        ],
      },
      {
        id: "hourly-rate",
        name: "hourlyRate",
        label: "Hourly Rate",
        type: "text",
        required: false,
        placeholder: "$350",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    description: "Review and confirm all information",
    icon: Eye,
    fields: [],
  },
];
