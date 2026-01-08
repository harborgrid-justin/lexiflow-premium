import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { MatterType, MatterPriority, MatterStatus } from '../types';

interface MatterCreationWizardProps {
  onComplete?: (matter: Partial<Matter>) => void;
  onCancel?: () => void;
}

interface Matter {
  title: string;
  description: string;
  matterType: MatterType;
  priority: MatterPriority;
  status: MatterStatus;
  clientId: string;
  clientName: string;
  leadAttorneyId: string;
  practiceArea: string;
  jurisdiction: string;
  venue: string;
  billingType: string;
  hourlyRate?: number;
  flatFee?: number;
  estimatedValue?: number;
  budgetAmount?: number;
  openedDate: Date;
  partiesInvolved: string[];
  opposingParties: string[];
  conflictCheckRequired: boolean;
}

const STEPS = [
  { id: 1, title: 'Basic Information', description: 'Matter details' },
  { id: 2, title: 'Client & Assignment', description: 'Client and attorney assignment' },
  { id: 3, title: 'Financial Details', description: 'Billing and budget' },
  { id: 4, title: 'Conflict Check', description: 'Conflict of interest check' },
  { id: 5, title: 'Review & Submit', description: 'Review and create matter' },
];

export const MatterCreationWizard: React.FC<MatterCreationWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Matter>>({
    status: MatterStatus.INTAKE,
    priority: MatterPriority.MEDIUM,
    matterType: MatterType.LITIGATION,
    openedDate: new Date(),
    partiesInvolved: [],
    opposingParties: [],
    conflictCheckRequired: true,
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onComplete?.(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Matter Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Smith v. Johnson - Contract Dispute"
                value={formData.title || ''}
                onChange={(e) => updateFormData('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the matter..."
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="matterType">Matter Type *</Label>
                <Select
                  value={formData.matterType}
                  onValueChange={(value) => updateFormData('matterType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MatterType.LITIGATION}>Litigation</SelectItem>
                    <SelectItem value={MatterType.TRANSACTIONAL}>
                      Transactional
                    </SelectItem>
                    <SelectItem value={MatterType.ADVISORY}>Advisory</SelectItem>
                    <SelectItem value={MatterType.CORPORATE}>Corporate</SelectItem>
                    <SelectItem value={MatterType.EMPLOYMENT}>Employment</SelectItem>
                    <SelectItem value={MatterType.REAL_ESTATE}>
                      Real Estate
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => updateFormData('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MatterPriority.LOW}>Low</SelectItem>
                    <SelectItem value={MatterPriority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={MatterPriority.HIGH}>High</SelectItem>
                    <SelectItem value={MatterPriority.URGENT}>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="practiceArea">Practice Area</Label>
                <Input
                  id="practiceArea"
                  placeholder="e.g., Commercial Litigation"
                  value={formData.practiceArea || ''}
                  onChange={(e) => updateFormData('practiceArea', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input
                  id="jurisdiction"
                  placeholder="e.g., California"
                  value={formData.jurisdiction || ''}
                  onChange={(e) => updateFormData('jurisdiction', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="Enter client name..."
                value={formData.clientName || ''}
                onChange={(e) => updateFormData('clientName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadAttorney">Lead Attorney *</Label>
              <Select
                value={formData.leadAttorneyId}
                onValueChange={(value) => updateFormData('leadAttorneyId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attorney..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atty-1">Jane Doe</SelectItem>
                  <SelectItem value="atty-2">John Smith</SelectItem>
                  <SelectItem value="atty-3">Sarah Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billingType">Billing Type</Label>
              <Select
                value={formData.billingType}
                onValueChange={(value) => updateFormData('billingType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="flat">Flat Fee</SelectItem>
                  <SelectItem value="contingency">Contingency</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.billingType === 'hourly' && (
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="350"
                  value={formData.hourlyRate || ''}
                  onChange={(e) =>
                    updateFormData('hourlyRate', parseFloat(e.target.value))
                  }
                />
              </div>
            )}
            {formData.billingType === 'flat' && (
              <div className="space-y-2">
                <Label htmlFor="flatFee">Flat Fee ($)</Label>
                <Input
                  id="flatFee"
                  type="number"
                  placeholder="10000"
                  value={formData.flatFee || ''}
                  onChange={(e) =>
                    updateFormData('flatFee', parseFloat(e.target.value))
                  }
                />
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  placeholder="500000"
                  value={formData.estimatedValue || ''}
                  onChange={(e) =>
                    updateFormData('estimatedValue', parseFloat(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetAmount">Budget ($)</Label>
                <Input
                  id="budgetAmount"
                  type="number"
                  placeholder="50000"
                  value={formData.budgetAmount || ''}
                  onChange={(e) =>
                    updateFormData('budgetAmount', parseFloat(e.target.value))
                  }
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="conflictCheck"
                checked={formData.conflictCheckRequired}
                onCheckedChange={(checked) =>
                  updateFormData('conflictCheckRequired', checked)
                }
              />
              <Label htmlFor="conflictCheck">
                Perform conflict check before opening matter
              </Label>
            </div>
            {formData.conflictCheckRequired && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="partiesInvolved">Parties Involved</Label>
                  <Textarea
                    id="partiesInvolved"
                    placeholder="Enter party names (one per line)..."
                    rows={4}
                    onChange={(e) =>
                      updateFormData(
                        'partiesInvolved',
                        e.target.value.split('\n').filter((s) => s.trim())
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opposingParties">Opposing Parties</Label>
                  <Textarea
                    id="opposingParties"
                    placeholder="Enter opposing party names (one per line)..."
                    rows={4}
                    onChange={(e) =>
                      updateFormData(
                        'opposingParties',
                        e.target.value.split('\n').filter((s) => s.trim())
                      )
                    }
                  />
                </div>
              </>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">Matter Details</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{formData.matterType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="font-medium">{formData.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{formData.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Practice Area:</span>
                  <span className="font-medium">{formData.practiceArea}</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">Financial Information</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Type:</span>
                  <span className="font-medium">{formData.billingType}</span>
                </div>
                {formData.estimatedValue && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Value:</span>
                    <span className="font-medium">
                      ${formData.estimatedValue.toLocaleString()}
                    </span>
                  </div>
                )}
                {formData.budgetAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">
                      ${formData.budgetAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {formData.conflictCheckRequired && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  A conflict check will be performed before creating this matter
                </span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Matter</CardTitle>
        <CardDescription>
          {STEPS[currentStep - 1].description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  step.id === currentStep
                    ? 'text-primary font-medium'
                    : step.id < currentStep
                    ? 'text-green-600'
                    : 'text-muted-foreground'
                }`}
              >
                <div className="text-xs mb-1">Step {step.id}</div>
                <div className="text-xs">{step.title}</div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStep()}</div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>
        {currentStep < STEPS.length ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Create Matter
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MatterCreationWizard;
