'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle,
  DollarSign,
  Shield,
  User,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Button } from '@/components/ui/shadcn/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/shadcn/alert';
import { Badge } from '@/components/ui/shadcn/badge';
import { Checkbox } from '@/components/ui/shadcn/checkbox';

type IntakeStep = 'client' | 'matter' | 'conflicts' | 'team' | 'financial' | 'review';

const STEPS = [
  { id: 'client', title: 'Client Information', icon: User },
  { id: 'matter', title: 'Matter Details', icon: Briefcase },
  { id: 'conflicts', title: 'Conflict Check', icon: Shield },
  { id: 'team', title: 'Team Assignment', icon: Users },
  { id: 'financial', title: 'Financial Setup', icon: DollarSign },
  { id: 'review', title: 'Review & Submit', icon: CheckCircle },
];

export function CaseIntake() {
  const [currentStep, setCurrentStep] = useState<IntakeStep>('client');
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientType: 'individual',
    matterTitle: '',
    matterType: '',
    practiceArea: '',
    description: '',
    jurisdiction: '',
    priority: 'medium',
    leadAttorneyId: '',
    billingType: 'hourly',
    hourlyRate: '',
    estimatedValue: '',
    retainerAmount: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id as IntakeStep);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id as IntakeStep);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'client':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="John Doe or Company Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientType">Client Type</Label>
                <Select
                  value={formData.clientType}
                  onValueChange={(value) => handleSelectChange('clientType', value)}
                >
                  <SelectTrigger id="clientType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        );
      case 'matter':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matterTitle">Matter Title</Label>
              <Input
                id="matterTitle"
                name="matterTitle"
                value={formData.matterTitle}
                onChange={handleInputChange}
                placeholder="e.g. Smith v. Jones"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="practiceArea">Practice Area</Label>
                <Select
                  value={formData.practiceArea}
                  onValueChange={(value) => handleSelectChange('practiceArea', value)}
                >
                  <SelectTrigger id="practiceArea">
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="litigation">Litigation</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="ip">Intellectual Property</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Brief description of the matter..."
              />
            </div>
          </div>
        );
      case 'conflicts':
        return (
          <div className="space-y-6">
            <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle className="text-emerald-900 dark:text-emerald-100">No Direct Conflicts Found</AlertTitle>
              <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                Automated check performed against 1,240 existing matters and 4,500 contacts.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Potential Name Matches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">John A. Doe (Defendant)</p>
                      <p className="text-xs text-muted-foreground">Matter: Doe v. City (Closed 2023)</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Review</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leadAttorneyId">Lead Attorney</Label>
              <Select
                value={formData.leadAttorneyId}
                onValueChange={(value) => handleSelectChange('leadAttorneyId', value)}
              >
                <SelectTrigger id="leadAttorneyId">
                  <SelectValue placeholder="Select Attorney" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sarah Miller</SelectItem>
                  <SelectItem value="2">James Wilson</SelectItem>
                  <SelectItem value="3">Emily Chen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted rounded-lg border">
              <h4 className="text-sm font-medium mb-2">Suggested Team Members</h4>
              <div className="flex flex-wrap gap-2">
                {['Paralegal: Mike Ross', 'Associate: Rachel Zane', 'Expert: Dr. House'].map((member) => (
                  <Badge key={member} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                    <span>{member}</span>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Users className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      case 'financial':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingType">Billing Type</Label>
                <Select
                  value={formData.billingType}
                  onValueChange={(value) => handleSelectChange('billingType', value)}
                >
                  <SelectTrigger id="billingType">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="flat">Flat Fee</SelectItem>
                    <SelectItem value="contingency">Contingency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Rate / Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    id="hourlyRate"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retainerAmount">Retainer Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    id="retainerAmount"
                    name="retainerAmount"
                    value={formData.retainerAmount}
                    onChange={handleInputChange}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-semibold">Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Client</span>
                  <span className="font-medium">{formData.clientName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Matter</span>
                  <span className="font-medium">{formData.matterTitle || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Practice Area</span>
                  <span className="font-medium capitalize">{formData.practiceArea || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Billing</span>
                  <span className="font-medium capitalize">{formData.billingType}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox id="confirm" />
              <Label htmlFor="confirm" className="font-normal cursor-pointer">
                I confirm that all conflict checks have been cleared and engagement letter is ready.
              </Label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">New Matter Intake</h1>
        <p className="text-muted-foreground">Complete the steps below to open a new matter</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative px-2">
          {/* Connecting line */}
          <div className="absolute left-0 top-[20px] w-full h-0.5 bg-muted -z-10" />

          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = STEPS.findIndex(s => s.id === currentStep) > index;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2 z-10">
                <div
                  className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200
                      ${isActive ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-lg' :
                      isCompleted ? 'border-primary bg-primary text-primary-foreground' :
                        'border-muted text-muted-foreground bg-background'}
                   `}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <span
                  className={`
                      text-xs font-medium transition-colors duration-200 whitespace-nowrap
                      ${isActive ? 'text-primary' :
                      isCompleted ? 'text-primary' :
                        'text-muted-foreground'}
                   `}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card className="shadow-lg border-muted/60">
        <CardHeader>
          <CardTitle>{STEPS.find(s => s.id === currentStep)?.title}</CardTitle>
          <CardDescription>Enter details below.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/20 py-4 mt-2 rounded-b-lg">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 'client'}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep === 'review' ? (
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle className="h-4 w-4" />
              Create Matter
            </Button>
          ) : (
            <Button onClick={nextStep} className="gap-2">
              Next Step
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
