/**
 * @module enterprise/ui/EnterpriseModal
 * @category Enterprise UI
 * @description Advanced modal system with multi-step wizards, drawers, and confirmation dialogs
 *
 * Features:
 * - Multi-step wizard support with progress tracking
 * - Drawer panel variant (slide from side)
 * - Confirmation dialogs with customizable actions
 * - Form validation integration
 * - Auto-save support
 * - Responsive sizing
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { Button } from '@/components/atoms/Button/Button';
import { useTheme } from '@/theme';
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isValid?: boolean;
  canSkip?: boolean;
  onEnter?: () => void | Promise<void>;
  onExit?: () => void | Promise<void>;
}

export type ModalVariant = 'modal' | 'drawer' | 'confirmation';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type DrawerPosition = 'left' | 'right';
export type ConfirmationType = 'info' | 'warning' | 'error' | 'success';

export interface EnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  variant?: ModalVariant;
  size?: ModalSize;
  className?: string;

  // Modal options
  footer?: React.ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;

  // Wizard options
  steps?: WizardStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void | Promise<void>;
  showProgress?: boolean;

  // Drawer options
  drawerPosition?: DrawerPosition;
  drawerWidth?: string;

  // Confirmation options
  confirmationType?: ConfirmationType;
  confirmationMessage?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const EnterpriseModal: React.FC<EnterpriseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'modal',
  size = 'md',
  className,
  footer,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  steps,
  currentStep: controlledStep,
  onStepChange,
  onComplete,
  showProgress = true,
  drawerPosition = 'right',
  drawerWidth = '32rem',
  confirmationType = 'info',
  confirmationMessage,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [internalStep, setInternalStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  const currentStepIndex = controlledStep ?? internalStep;

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setInternalStep(0);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Handle escape key
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClose = useCallback(() => {
    if (!isProcessing) {
      onClose();
    }
  }, [isProcessing, onClose]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, handleClose]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop) {
      handleClose();
    }
  }, [closeOnBackdrop, handleClose]);

  // Wizard navigation
  const goToStep = useCallback(
    async (stepIndex: number) => {
      if (!steps || stepIndex < 0 || stepIndex >= steps.length) return;

      const currentStepData = steps[currentStepIndex];
      if (currentStepData?.onExit) {
        await currentStepData.onExit();
      }

      const newStepData = steps[stepIndex];
      if (newStepData?.onEnter) {
        await newStepData.onEnter();
      }

      if (onStepChange) {
        onStepChange(stepIndex);
      } else {
        setInternalStep(stepIndex);
      }
    },
    [steps, currentStepIndex, onStepChange]
  );

  const handleNext = useCallback(async () => {
    if (!steps) return;

    if (currentStepIndex < steps.length - 1) {
      await goToStep(currentStepIndex + 1);
    } else {
      // Final step - complete wizard
      setIsProcessing(true);
      try {
        await onComplete?.();
        handleClose();
      } catch (error) {
        console.error('Wizard completion error:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [steps, currentStepIndex, goToStep, onComplete, handleClose]);

  const handlePrevious = useCallback(async () => {
    if (currentStepIndex > 0) {
      await goToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, goToStep]);

  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onConfirm?.();
      handleClose();
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onConfirm, handleClose]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    handleClose();
  }, [onCancel, handleClose]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getConfirmationIcon = () => {
    switch (confirmationType) {
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-amber-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-rose-500" />;
      case 'success':
        return <CheckCircle2 className="h-12 w-12 text-emerald-500" />;
      case 'info':
      default:
        return <Info className="h-12 w-12 text-blue-500" />;
    }
  };

  const renderWizardProgress = () => {
    if (!steps || !showProgress) return null;

    return (
      <div className={cn('px-6 py-4 border-b', theme.border.default)}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn('text-sm font-medium', theme.text.secondary)}>
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <span className={cn('text-sm', theme.text.tertiary)}>
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className={cn('h-2 rounded-full overflow-hidden', theme.surface.highlight)}>
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mt-4">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => index <= currentStepIndex && goToStep(index)}
              disabled={index > currentStepIndex}
              className={cn(
                'flex flex-col items-center gap-2 transition-opacity',
                index > currentStepIndex && 'opacity-40 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                  index < currentStepIndex
                    ? cn('text-white', theme.colors.primary, 'border-transparent')
                    : index === currentStepIndex
                      ? cn(theme.border.focus, theme.colors.primary)
                      : cn(theme.border.default, theme.text.tertiary)
                )}
              >
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              <span className={cn('text-xs max-w-20 text-center', theme.text.secondary)}>
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderWizardFooter = () => {
    if (!steps) return null;

    const currentStepData = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;
    const isValid = currentStepData?.isValid ?? true;

    return (
      <div className={cn('px-6 py-4 border-t flex items-center justify-between', theme.border.default, theme.surface.default)}>
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0 || isProcessing}
          icon={ChevronLeft}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStepData?.canSkip && !isLastStep && (
            <Button variant="ghost" onClick={handleNext} disabled={isProcessing}>
              Skip
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!isValid || isProcessing}
            isLoading={isProcessing}
            icon={isLastStep ? Check : ChevronRight}
          >
            {isLastStep ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    );
  };

  const renderConfirmationFooter = () => (
    <div className={cn('px-6 py-4 border-t flex items-center justify-end gap-3', theme.border.default, theme.surface.default)}>
      <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
        {cancelLabel}
      </Button>
      <Button
        variant={confirmationType === 'error' ? 'danger' : 'primary'}
        onClick={handleConfirm}
        isLoading={isProcessing}
      >
        {confirmLabel}
      </Button>
    </div>
  );

  // ============================================================================
  // SIZE CONFIGURATION
  // ============================================================================

  const sizes: Record<ModalSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw] min-h-[90vh]',
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!mounted || typeof document === 'undefined' || !isOpen) return null;

  // Drawer variant
  if (variant === 'drawer') {
    const drawerVariants = {
      left: {
        initial: { x: '-100%' },
        animate: { x: 0 },
        exit: { x: '-100%' },
      },
      right: {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
      },
    };

    const content = (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn('fixed inset-0 z-50 backdrop-blur-sm', theme.backdrop)}
              onClick={handleBackdropClick}
            />

            {/* Drawer */}
            <motion.div
              ref={modalRef}
              initial={drawerVariants[drawerPosition].initial}
              animate={drawerVariants[drawerPosition].animate}
              exit={drawerVariants[drawerPosition].exit}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'fixed top-0 z-50 h-full flex flex-col border shadow-2xl',
                drawerPosition === 'right' ? 'right-0 border-l' : 'left-0 border-r',
                theme.surface.default,
                theme.border.default,
                className
              )}
              style={{ width: drawerWidth }}
              aria-labelledby={titleId}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className={cn('flex items-center justify-between px-6 py-4 border-b', theme.border.default)}>
                <h3 className={cn('text-lg font-bold', theme.text.primary)} id={titleId}>
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    onClick={handleClose}
                    className={cn('p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800', theme.text.tertiary)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className={cn('px-6 py-4 border-t', theme.border.default)}>
                  {footer}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );

    return createPortal(content, document.body);
  }

  // Confirmation variant
  if (variant === 'confirmation') {
    const content = (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn('fixed inset-0 z-50 backdrop-blur-sm', theme.backdrop)}
              onClick={handleBackdropClick}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'w-full max-w-md rounded-xl border shadow-2xl',
                  theme.surface.default,
                  theme.border.default,
                  className
                )}
                aria-labelledby={titleId}
                role="alertdialog"
                aria-modal="true"
              >
                {/* Content */}
                <div className="flex flex-col items-center text-center p-6">
                  <div className="mb-4">{getConfirmationIcon()}</div>
                  <h3 className={cn('text-lg font-bold mb-2', theme.text.primary)} id={titleId}>
                    {title}
                  </h3>
                  {confirmationMessage && (
                    <p className={cn('text-sm', theme.text.secondary)}>
                      {confirmationMessage}
                    </p>
                  )}
                  {children && (
                    <div className="mt-4 w-full">
                      {children}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {renderConfirmationFooter()}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );

    return createPortal(content, document.body);
  }

  // Modal variant (default) with optional wizard
  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn('fixed inset-0 z-50 backdrop-blur-sm', theme.backdrop)}
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'w-full flex flex-col rounded-xl border shadow-2xl max-h-[calc(100vh-3rem)]',
                theme.surface.default,
                theme.border.default,
                sizes[size],
                className
              )}
              aria-labelledby={titleId}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              {title && (
                <div className={cn('flex items-center justify-between px-6 py-4 border-b', theme.border.default)}>
                  <h3 className={cn('text-lg font-bold', theme.text.primary)} id={titleId}>
                    {title}
                  </h3>
                  {showCloseButton && (
                    <button
                      onClick={handleClose}
                      className={cn('p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800', theme.text.tertiary)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Wizard Progress */}
              {steps && renderWizardProgress()}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {steps && steps[currentStepIndex] ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStepIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {steps[currentStepIndex].content}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  children
                )}
              </div>

              {/* Footer */}
              {steps ? renderWizardFooter() : footer && (
                <div className={cn('px-6 py-4 border-t flex justify-end gap-3', theme.border.default, theme.surface.default)}>
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

EnterpriseModal.displayName = 'EnterpriseModal';
export default EnterpriseModal;
