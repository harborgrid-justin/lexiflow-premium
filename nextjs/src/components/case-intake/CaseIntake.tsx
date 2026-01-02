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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe or Company Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Type</label>
                <select
                  name="clientType"
                  value={formData.clientType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="individual">Individual</option>
                  <option value="corporate">Corporate</option>
                  <option value="government">Government</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        );
      case 'matter':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Matter Title</label>
              <input
                type="text"
                name="matterTitle"
                value={formData.matterTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Smith v. Jones"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Practice Area</label>
                <select
                  name="practiceArea"
                  value={formData.practiceArea}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Area</option>
                  <option value="litigation">Litigation</option>
                  <option value="corporate">Corporate</option>
                  <option value="ip">Intellectual Property</option>
                  <option value="real_estate">Real Estate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the matter..."
              />
            </div>
          </div>
        );
      case 'conflicts':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-emerald-900 dark:text-emerald-100">No Direct Conflicts Found</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  Automated check performed against 1,240 existing matters and 4,500 contacts.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-3">Potential Name Matches</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">John A. Doe (Defendant)</p>
                      <p className="text-xs text-slate-500">Matter: Doe v. City (Closed 2023)</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:underline">Review</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lead Attorney</label>
              <select
                name="leadAttorneyId"
                value={formData.leadAttorneyId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Attorney</option>
                <option value="1">Sarah Miller</option>
                <option value="2">James Wilson</option>
                <option value="3">Emily Chen</option>
              </select>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Suggested Team Members</h4>
              <div className="flex flex-wrap gap-2">
                {['Paralegal: Mike Ross', 'Associate: Rachel Zane', 'Expert: Dr. House'].map((member) => (
                  <div key={member} className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm">
                    <span>{member}</span>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <Users className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'financial':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Type</label>
                <select
                  name="billingType"
                  value={formData.billingType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="flat">Flat Fee</option>
                  <option value="contingency">Contingency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rate / Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Retainer Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    name="retainerAmount"
                    value={formData.retainerAmount}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
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
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Client</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formData.clientName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Matter</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formData.matterTitle || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Practice Area</span>
                  <span className="font-medium text-slate-900 dark:text-white capitalize">{formData.practiceArea || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Billing</span>
                  <span className="font-medium text-slate-900 dark:text-white capitalize">{formData.billingType}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" id="confirm" className="rounded border-slate-300" />
              <label htmlFor="confirm">I confirm that all conflict checks have been cleared and engagement letter is ready.</label>
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Matter Intake</h1>
        <p className="text-slate-500 dark:text-slate-400">Complete the steps below to open a new matter</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-10" />
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = STEPS.findIndex(s => s.id === currentStep) > index;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'border-blue-600 bg-blue-600 text-white' :
                    isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' :
                      'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400'
                  }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' :
                    isCompleted ? 'text-emerald-600 dark:text-emerald-400' :
                      'text-slate-500 dark:text-slate-400'
                  }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        {renderStepContent()}

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 'client'}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep === 'review' ? (
            <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <CheckCircle className="h-4 w-4" />
              Create Matter
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
