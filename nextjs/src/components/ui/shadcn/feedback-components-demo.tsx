"use client"

import * as React from "react"
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  useToast,
  toast,
} from "./toast"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./alert-dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./accordion"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./collapsible"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "./hover-card"
import { Toggle } from "./toggle"
import { ToggleGroup, ToggleGroupItem } from "./toggle-group"
import { Button } from "./button"
import { ChevronDown, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Info } from "lucide-react"

/**
 * Enterprise Feedback Components Demo
 * Showcases all feedback and utility components from shadcn/ui
 *
 * Components included:
 * - Toast notifications with variants
 * - Alert dialogs for confirmations
 * - Tabs for content organization
 * - Accordion for collapsible sections
 * - Collapsible for simple expand/collapse
 * - Hover cards for contextual information
 * - Toggle buttons for binary state
 * - Toggle groups for multiple selections
 */
export function FeedbackComponentsDemo() {
  const { toast: showToast } = useToast()
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(false)
  const [textStyles, setTextStyles] = React.useState<string[]>([])
  const [alignment, setAlignment] = React.useState("left")

  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Enterprise Feedback Components</h1>
        <p className="text-muted-foreground">
          Production-ready UI components built with Radix UI and Tailwind CSS
        </p>
      </div>

      {/* Toast Notifications */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Toast Notifications</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => {
              showToast({
                title: "Case Updated",
                description: "Case #12345 has been successfully updated.",
              })
            }}
          >
            Default Toast
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              showToast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save document. Please try again.",
              })
            }}
          >
            Error Toast
          </Button>

          <Button
            onClick={() => {
              showToast({
                variant: "success",
                title: "Success",
                description: "Document uploaded successfully.",
              })
            }}
          >
            Success Toast
          </Button>

          <Button
            onClick={() => {
              showToast({
                title: "Confirm Action",
                description: "This action requires confirmation.",
                action: (
                  <ToastAction altText="Confirm">Confirm</ToastAction>
                ),
              })
            }}
          >
            Toast with Action
          </Button>
        </div>
      </section>

      {/* Alert Dialog */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Alert Dialog</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Delete Case</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the case
                and remove all associated data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tabs</h2>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="rounded-lg border border-border p-6">
              <h3 className="font-semibold mb-2">Case Overview</h3>
              <p className="text-muted-foreground">
                View high-level information about this case including status,
                parties, and key dates.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="documents" className="space-y-4">
            <div className="rounded-lg border border-border p-6">
              <h3 className="font-semibold mb-2">Documents</h3>
              <p className="text-muted-foreground">
                Access all case-related documents, pleadings, and evidence.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="timeline" className="space-y-4">
            <div className="rounded-lg border border-border p-6">
              <h3 className="font-semibold mb-2">Timeline</h3>
              <p className="text-muted-foreground">
                Chronological view of all case events and milestones.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="notes" className="space-y-4">
            <div className="rounded-lg border border-border p-6">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-muted-foreground">
                Internal notes and comments from the legal team.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Accordion */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Accordion</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Case Details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p><strong>Case Number:</strong> CV-2024-12345</p>
                <p><strong>Filed:</strong> January 15, 2024</p>
                <p><strong>Court:</strong> Superior Court of California</p>
                <p><strong>Judge:</strong> Hon. Jane Smith</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Parties Involved</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p><strong>Plaintiff:</strong> John Doe</p>
                <p><strong>Defendant:</strong> Acme Corporation</p>
                <p><strong>Plaintiff Counsel:</strong> Smith & Associates</p>
                <p><strong>Defense Counsel:</strong> Jones Legal Group</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Case Status</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> Active - Discovery Phase</p>
                <p><strong>Next Hearing:</strong> March 15, 2024</p>
                <p><strong>Trial Date:</strong> June 1, 2024</p>
                <p><strong>Discovery Deadline:</strong> April 30, 2024</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Collapsible */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Collapsible</h2>
        <Collapsible
          open={isCollapsibleOpen}
          onOpenChange={setIsCollapsibleOpen}
          className="w-full border border-border rounded-lg p-4"
        >
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left font-medium">
              <span>Advanced Filters</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isCollapsibleOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-2">
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <p className="text-sm text-muted-foreground">
                Filter cases by filing date or last modified date
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Case Status</label>
              <p className="text-sm text-muted-foreground">
                Filter by active, closed, or pending status
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Assigned Attorney</label>
              <p className="text-sm text-muted-foreground">
                Filter by responsible attorney or legal team
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* Hover Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Hover Card</h2>
        <div className="flex items-center gap-2">
          <p>Learn more about</p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" className="p-0">
                Discovery Process <Info className="ml-1 h-3 w-3" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Discovery Process</h4>
                <p className="text-sm text-muted-foreground">
                  The discovery process is a pretrial phase in a lawsuit where each party
                  can obtain evidence from the opposing party through various methods including
                  depositions, interrogatories, requests for production, and requests for admission.
                </p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Typical duration: 6-12 months
                  </span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </section>

      {/* Toggle */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Toggle Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Text Formatting</p>
            <ToggleGroup
              type="multiple"
              value={textStyles}
              onValueChange={setTextStyles}
            >
              <ToggleGroupItem value="bold" aria-label="Toggle bold">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Toggle italic">
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Toggle underline">
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Text Alignment</p>
            <ToggleGroup
              type="single"
              value={alignment}
              onValueChange={(value) => value && setAlignment(value)}
            >
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </section>

      {/* Case Status Toggle Group */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Toggle Group - Case Filters</h2>
        <ToggleGroup type="multiple" variant="outline">
          <ToggleGroupItem value="active">Active Cases</ToggleGroupItem>
          <ToggleGroupItem value="pending">Pending Review</ToggleGroupItem>
          <ToggleGroupItem value="closed">Closed Cases</ToggleGroupItem>
          <ToggleGroupItem value="archived">Archived</ToggleGroupItem>
        </ToggleGroup>
      </section>
    </div>
  )
}

export default FeedbackComponentsDemo
