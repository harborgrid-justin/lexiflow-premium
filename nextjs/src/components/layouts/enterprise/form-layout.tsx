/**
 * @component FormLayout
 * @description Enterprise-grade form page layout with wizard support
 *
 * Features:
 * - Wizard steps indicator (if multi-step)
 * - Form sections with headers and descriptions
 * - Sticky action bar at bottom with Save/Cancel
 * - Unsaved changes warning (browser beforeunload)
 * - Validation error summary at top
 * - Field groups and fieldsets
 * - Progress tracking for multi-step forms
 * - Responsive design
 *
 * @example
 * ```tsx
 * <FormLayout
 *   title="Create New Case"
 *   description="Enter case details and client information"
 *   steps={[
 *     { id: "basic", label: "Basic Info" },
 *     { id: "parties", label: "Parties" },
 *     { id: "review", label: "Review" }
 *   ]}
 *   currentStep={currentStep}
 *   onStepChange={setCurrentStep}
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 *   isDirty={formState.isDirty}
 *   isSubmitting={isSubmitting}
 *   errors={formErrors}
 *   sections={[
 *     {
 *       title: "Case Information",
 *       description: "Basic details about the case",
 *       fields: <CaseInfoFields />
 *     },
 *     {
 *       title: "Client Details",
 *       fields: <ClientFields />
 *     }
 *   ]}
 * />
 * ```
 */

"use client"

import * as React from "react"
import { AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/shadcn/alert"
import { Separator } from "@/components/ui/shadcn/separator"
import { Progress } from "@/components/ui/shadcn/progress"
import { Skeleton } from "@/components/ui/shadcn/skeleton"

export interface FormLayoutStep {
  id: string
  label: string
  description?: string
  optional?: boolean
}

export interface FormLayoutSection {
  title: string
  description?: string
  fields: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}

export interface FormLayoutError {
  field?: string
  message: string
}

export interface FormLayoutProps {
  /**
   * Form title
   */
  title: string

  /**
   * Form description
   */
  description?: string

  /**
   * Wizard steps (multi-step form)
   */
  steps?: FormLayoutStep[]

  /**
   * Current step index (0-based)
   */
  currentStep?: number

  /**
   * Step change handler
   */
  onStepChange?: (step: number) => void

  /**
   * Form sections
   */
  sections?: FormLayoutSection[]

  /**
   * Direct children (alternative to sections)
   */
  children?: React.ReactNode

  /**
   * Form submit handler
   */
  onSubmit: (e?: React.FormEvent) => void | Promise<void>

  /**
   * Cancel/back handler
   */
  onCancel?: () => void

  /**
   * Form has unsaved changes
   */
  isDirty?: boolean

  /**
   * Form is submitting
   */
  isSubmitting?: boolean

  /**
   * Form is loading
   */
  isLoading?: boolean

  /**
   * Validation errors
   */
  errors?: FormLayoutError[]

  /**
   * Submit button text
   * @default "Save"
   */
  submitText?: string

  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string

  /**
   * Show previous button (multi-step)
   * @default true
   */
  showPrevious?: boolean

  /**
   * Previous button text
   * @default "Previous"
   */
  previousText?: string

  /**
   * Next button text (multi-step)
   * @default "Next"
   */
  nextText?: string

  /**
   * Disable form (read-only mode)
   */
  disabled?: boolean

  /**
   * Enable browser unsaved changes warning
   * @default true
   */
  warnUnsavedChanges?: boolean

  /**
   * Maximum form width
   * @default "4xl" (896px)
   */
  maxWidth?: "2xl" | "3xl" | "4xl" | "5xl" | "full"

  /**
   * Additional class names
   */
  className?: string

  /**
   * Custom footer content (replaces action bar)
   */
  customFooter?: React.ReactNode
}

const maxWidthClasses = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-full",
}

export function FormLayout({
  title,
  description,
  steps,
  currentStep = 0,
  onStepChange,
  sections,
  children,
  onSubmit,
  onCancel,
  isDirty = false,
  isSubmitting = false,
  isLoading = false,
  errors = [],
  submitText = "Save",
  cancelText = "Cancel",
  showPrevious = true,
  previousText = "Previous",
  nextText = "Next",
  disabled = false,
  warnUnsavedChanges = true,
  maxWidth = "4xl",
  className,
  customFooter,
}: FormLayoutProps) {
  const isMultiStep = steps && steps.length > 1
  const currentStepData = steps?.[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === (steps?.length ?? 1) - 1
  const progressPercentage = isMultiStep
    ? ((currentStep + 1) / steps.length) * 100
    : 100

  // Browser unsaved changes warning
  React.useEffect(() => {
    if (!warnUnsavedChanges || !isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
      return ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty, warnUnsavedChanges])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(e)
  }

  const handleNext = () => {
    if (isMultiStep && !isLastStep && onStepChange) {
      onStepChange(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (isMultiStep && !isFirstStep && onStepChange) {
      onStepChange(currentStep - 1)
    }
  }

  if (isLoading) {
    return <FormLayoutSkeleton maxWidth={maxWidth} />
  }

  return (
    <div className={cn("flex flex-col min-h-screen pb-24", className)}>
      <div className={cn("mx-auto w-full", maxWidthClasses[maxWidth])}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Multi-step Progress */}
        {isMultiStep && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                const isClickable = index < currentStep && onStepChange

                return (
                  <React.Fragment key={step.id}>
                    <button
                      type="button"
                      onClick={() => isClickable && onStepChange(index)}
                      disabled={!isClickable}
                      className={cn(
                        "flex flex-col items-center gap-2 flex-1 text-center transition-colors",
                        isClickable && "cursor-pointer hover:text-primary",
                        !isClickable && "cursor-default"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                          isActive &&
                            "border-primary bg-primary text-primary-foreground",
                          isCompleted &&
                            "border-primary bg-primary text-primary-foreground",
                          !isActive &&
                            !isCompleted &&
                            "border-muted-foreground/30 text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-semibold">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isActive && "text-primary",
                            isCompleted && "text-primary",
                            !isActive && !isCompleted && "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>
                        {step.optional && (
                          <span className="text-xs text-muted-foreground">
                            Optional
                          </span>
                        )}
                      </div>
                    </button>
                    {index < steps.length - 1 && (
                      <Separator
                        className={cn(
                          "flex-1 mx-2",
                          index < currentStep && "bg-primary"
                        )}
                      />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Validation Errors Summary */}
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Please fix the following errors:</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error.field ? `${error.field}: ${error.message}` : error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Step Description */}
        {isMultiStep && currentStepData?.description && (
          <p className="text-sm text-muted-foreground mb-6">
            {currentStepData.description}
          </p>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {sections ? (
            sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>{section.fields}</CardContent>
              </Card>
            ))
          ) : (
            children
          )}
        </form>
      </div>

      {/* Sticky Action Bar */}
      {customFooter || (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30">
          <div
            className={cn(
              "mx-auto flex items-center justify-between gap-4 p-4",
              maxWidthClasses[maxWidth]
            )}
          >
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  {cancelText}
                </Button>
              )}
              {isDirty && (
                <span className="text-sm text-muted-foreground">
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isMultiStep && !isFirstStep && showPrevious && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isSubmitting || disabled}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {previousText}
                </Button>
              )}

              {isMultiStep && !isLastStep ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting || disabled}
                >
                  {nextText}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || disabled}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    submitText
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Loading skeleton for FormLayout
 */
export function FormLayoutSkeleton({
  maxWidth = "4xl",
  className,
}: {
  maxWidth?: "2xl" | "3xl" | "4xl" | "5xl" | "full"
  className?: string
}) {
  return (
    <div className={cn("flex flex-col min-h-screen pb-24", className)}>
      <div className={cn("mx-auto w-full", maxWidthClasses[maxWidth])}>
        {/* Header skeleton */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-[400px]" />
          <Skeleton className="h-4 w-[600px]" />
        </div>

        {/* Form sections skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action bar skeleton */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
        <div
          className={cn(
            "mx-auto flex items-center justify-between",
            maxWidthClasses[maxWidth]
          )}
        >
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    </div>
  )
}
