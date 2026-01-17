/**
 * Custom hook for managing NewCase form state
 */

import { useState, useCallback, useMemo } from 'react';

import { type Case, type Matter, MatterPriority, MatterStatus, PracticeArea } from '@/types';

import { type FormData, CaseType } from '../types/newCaseTypes';

export interface UseNewCaseFormResult {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleChange: (field: keyof FormData, value: unknown) => void;
  loadFormData: (data: Matter | Case) => void;
  generatedNumber: string;
}

export const useNewCaseForm = (
  existingMattersCount: number
): UseNewCaseFormResult => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    caseNumber: '',
    matterNumber: '',
    description: '',
    type: CaseType.CIVIL,
    status: MatterStatus.INTAKE,
    priority: MatterPriority.MEDIUM,
    practiceArea: PracticeArea.CIVIL_LITIGATION,
    tags: [],
    clientName: '',
    clientId: null,
    clientEmail: '',
    clientPhone: '',
    responsibleAttorneyName: '',
    leadAttorneyId: null,
    originatingAttorneyName: '',
    originatingAttorneyId: null,
    assignedTeamId: null,
    court: '',
    jurisdiction: '',
    venue: '',
    judge: null,
    referredJudge: null,
    magistrateJudge: null,
    causeOfAction: '',
    natureOfSuit: '',
    natureOfSuitCode: '',
    juryDemand: 'None',
    opposingPartyName: '',
    opposingCounsel: '',
    opposingCounselFirm: '',
    intakeDate: new Date().toISOString().split('T')[0]!,
    openedDate: '',
    filingDate: new Date().toISOString().split('T')[0]!,
    trialDate: null,
    dateTerminated: null,
    targetCloseDate: null,
    closedDate: null,
    statuteOfLimitations: null,
    billingType: '',
    estimatedValue: 0,
    budgetAmount: 0,
    hourlyRate: 0,
    flatFee: 0,
    contingencyPercentage: 0,
    retainerAmount: 0,
    conflictCheckCompleted: false,
    conflictCheckDate: null,
    conflictCheckStatus: 'pending',
    conflictCheckNotes: '',
    riskLevel: '',
    riskNotes: '',
    linkedCaseIds: [],
    linkedDocumentIds: [],
    relatedCases: [],
    internalNotes: '',
    customFields: {},
    metadata: {},
  });

  const handleChange = useCallback((field: keyof FormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const loadFormData = useCallback((data: Matter | Case) => {
    setFormData({
      title: data.title || '',
      caseNumber: (data as Case).caseNumber || '',
      matterNumber: (data as Matter).matterNumber || '',
      description: data.description || '',
      type: data.type || CaseType.CIVIL,
      status: data.status,
      priority: (data as Matter).priority || MatterPriority.MEDIUM,
      practiceArea: ((data as Matter).practiceArea as PracticeArea) || PracticeArea.CIVIL_LITIGATION,
      tags: (data as Matter).tags || [],
      clientName: (data as Matter).clientName || '',
      clientId: (data as Case).clientId || null,
      clientEmail: (data as Matter).clientEmail,
      clientPhone: (data as Matter).clientPhone,
      responsibleAttorneyName: (data as Matter).responsibleAttorneyName || '',
      leadAttorneyId: (data as Case).leadAttorneyId || null,
      originatingAttorneyName: (data as Matter).originatingAttorneyName || '',
      originatingAttorneyId: (data as Matter).originatingAttorneyId || null,
      assignedTeamId: (data as Case).assignedTeamId || null,
      court: (data as Case).court || '',
      jurisdiction: (data as Case).jurisdiction || '',
      venue: (data as Matter).venue,
      judge: (data as Case).judge || null,
      referredJudge: (data as Case).referredJudge || null,
      magistrateJudge: (data as Case).magistrateJudge || null,
      causeOfAction: (data as Case).causeOfAction || '',
      natureOfSuit: (data as Case).natureOfSuit || '',
      natureOfSuitCode: (data as Case).natureOfSuitCode || '',
      juryDemand: ((data as Case).juryDemand as 'None' | 'Plaintiff' | 'Defendant' | 'Both') || 'None',
      opposingPartyName: (data as Matter).opposingPartyName,
      opposingCounsel: typeof (data as Matter).opposingCounsel === 'string' ? (data as Matter).opposingCounsel as string : '',
      opposingCounselFirm: (data as Matter).opposingCounselFirm,
      intakeDate: (data as Matter).intakeDate?.split('T')[0] || new Date().toISOString().split('T')[0]!,
      openedDate: (data as Matter).openedDate?.split('T')[0] || '',
      filingDate: (data as Case).filingDate?.split('T')[0] || new Date().toISOString().split('T')[0]!,
      trialDate: (data as Case).trialDate?.split('T')[0] || null,
      dateTerminated: (data as Case).dateTerminated?.split('T')[0] || null,
      targetCloseDate: (data as Matter).targetCloseDate?.split('T')[0] || null,
      closedDate: (data as Matter).closedDate?.split('T')[0] || null,
      statuteOfLimitations: (data as Matter).statute_of_limitations?.split('T')[0] || null,
      billingType: (data as Matter).billingType,
      estimatedValue: (data as Matter).estimatedValue || 0,
      budgetAmount: (data as Matter).budgetAmount || 0,
      hourlyRate: (data as Matter).hourlyRate || 0,
      flatFee: (data as Matter).flatFee || 0,
      contingencyPercentage: (data as Matter).contingencyPercentage || 0,
      retainerAmount: (data as Matter).retainerAmount || 0,
      conflictCheckCompleted: (data as Matter).conflictCheckCompleted || false,
      conflictCheckDate: (data as Matter).conflictCheckDate?.split('T')[0] || null,
      conflictCheckStatus: (data as Matter).conflictCheckStatus,
      conflictCheckNotes: (data as Matter).conflictCheckNotes,
      riskLevel: (data as Matter).riskLevel,
      riskNotes: (data as Matter).riskNotes,
      linkedCaseIds: (data as Matter).linkedCaseIds || [],
      linkedDocumentIds: (data as Matter).linkedDocumentIds || [],
      relatedCases: (data as Case).relatedCases || [],
      internalNotes: (data as Matter).internalNotes,
      customFields: (data as Matter).customFields || {},
      metadata: (data as Case).metadata || {},
    });
  }, []);

  const generatedNumber = useMemo(() => {
    if (formData.matterNumber || formData.caseNumber) {
      return formData.matterNumber || formData.caseNumber;
    }
    const year = new Date().getFullYear();
    const count = existingMattersCount + 1;
    return `M${year}-${String(count).padStart(4, '0')}`;
  }, [existingMattersCount, formData.matterNumber, formData.caseNumber]);

  return {
    formData,
    setFormData,
    handleChange,
    loadFormData,
    generatedNumber,
  };
};
