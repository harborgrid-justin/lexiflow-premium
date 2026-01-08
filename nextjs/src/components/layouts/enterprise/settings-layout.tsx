"use client";

import * as React from "react";
import { Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card } from "@/components/ui/shadcn/card";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/shadcn/alert-dialog";
import { cn } from "@/lib/utils";

export interface SettingsSection {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
  component: React.ComponentType<any>;
}

export interface SettingsLayoutProps {
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  onSave?: (sectionId: string, data: any) => Promise<void>;
  onDiscard?: () => void;
  unsavedChanges?: boolean;
  isSaving?: boolean;
  className?: string;
}

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  variant = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            {variant === "destructive" && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            )}
            <div className="flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : ""
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  sections,
  activeSection,
  onSectionChange,
  onSave,
  onDiscard,
  unsavedChanges = false,
  isSaving = false,
  className,
}) => {
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false);
  const [pendingSectionId, setPendingSectionId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<any>({});

  const activeSettingsSection = React.useMemo(
    () => sections.find((section) => section.id === activeSection),
    [sections, activeSection]
  );

  const handleSectionClick = (sectionId: string) => {
    if (unsavedChanges) {
      setPendingSectionId(sectionId);
      setShowDiscardDialog(true);
    } else {
      onSectionChange(sectionId);
    }
  };

  const handleDiscardChanges = () => {
    if (onDiscard) {
      onDiscard();
    }
    if (pendingSectionId) {
      onSectionChange(pendingSectionId);
      setPendingSectionId(null);
    }
    setShowDiscardDialog(false);
  };

  const handleSaveChanges = async () => {
    if (onSave && activeSection) {
      await onSave(activeSection, formData);
    }
  };

  const handleFormChange = (data: any) => {
    setFormData(data);
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-border bg-muted/10">
          <ScrollArea className="h-full">
            <nav className="space-y-1 p-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {section.icon && <span className="shrink-0">{section.icon}</span>}
                  <div className="flex-1 truncate">
                    <div className="flex items-center gap-2">
                      <span>{section.label}</span>
                      {section.badge && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            activeSection === section.id
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {section.badge}
                        </span>
                      )}
                    </div>
                    {section.description && activeSection !== section.id && (
                      <p className="mt-0.5 text-xs text-muted-foreground/70">
                        {section.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="mx-auto max-w-3xl p-6">
              {activeSettingsSection && (
                <>
                  {/* Section Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      {activeSettingsSection.icon && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {activeSettingsSection.icon}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold">{activeSettingsSection.label}</h2>
                        {activeSettingsSection.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {activeSettingsSection.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  {/* Section Content */}
                  <div className="space-y-6">
                    <activeSettingsSection.component
                      onChange={handleFormChange}
                      data={formData}
                    />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Sticky Save Bar */}
      {unsavedChanges && (
        <div className="border-t border-border bg-background shadow-lg">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Unsaved Changes</p>
                  <p className="text-xs text-muted-foreground">
                    You have unsaved changes that will be lost if you navigate away
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiscardDialog(true)}
                  disabled={isSaving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Discard
                </Button>
                <Button size="sm" onClick={handleSaveChanges} disabled={isSaving}>
                  <Check className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discard Changes Dialog */}
      <ConfirmationDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to discard them? This action cannot be undone."
        onConfirm={handleDiscardChanges}
        variant="destructive"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </div>
  );
};

export default SettingsLayout;
