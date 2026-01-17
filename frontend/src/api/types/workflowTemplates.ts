/**
 * Workflow Template Library Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.workflow.getTemplates() with queryKeys.workflow.templates() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/workflow/entities/workflow-template.entity.ts
 */

import { type WorkflowTemplateId } from '@/types/primitives';
import { type WorkflowTemplateData } from '@/types/workflow';

/**
 * @deprecated MOCK DATA - Use DataService.workflow instead
 */
export const TEMPLATE_LIBRARY: WorkflowTemplateData[] = [
  // LITIGATION
  {
    id: 'tpl-1' as WorkflowTemplateId, title: 'Civil Litigation (Standard)', category: 'Litigation', complexity: 'High', duration: '12-18 Months', auditReady: true,
    tags: ['Federal', 'Civil', 'Complex'],
    stages: ['Intake & Conflicts', 'Pleadings & Service', 'Discovery (Fact/Expert)', 'Dispositive Motions', 'Pre-Trial', 'Trial', 'Appeal']
  },
  {
    id: 'tpl-2' as WorkflowTemplateId, title: 'Small Claims Defense', category: 'Litigation', complexity: 'Low', duration: '1-3 Months', auditReady: true,
    tags: ['State', 'Defense', 'Fast-Track'],
    stages: ['Demand Review', 'Settlement Offer', 'Hearing Prep', 'Hearing', 'Judgment Payment']
  },
  {
    id: 'tpl-3' as WorkflowTemplateId, title: 'Class Action Settlement', category: 'Litigation', complexity: 'High', duration: '24+ Months', auditReady: true,
    tags: ['Mass Tort', 'Admin', 'Finance'],
    stages: ['Prelim Approval', 'Notice Period', 'Claims Processing', 'Fairness Hearing', 'Final Approval', 'Distribution']
  },

  // CORPORATE / TRANSACTIONAL
  {
    id: 'tpl-4' as WorkflowTemplateId, title: 'Corporate Formation (DE)', category: 'Corporate', complexity: 'Medium', duration: '2 Weeks', auditReady: true,
    tags: ['Entity', 'Startup', 'Delaware'],
    stages: ['Name Reservation', 'Articles of Inc.', 'Bylaws Drafting', 'EIN Obtainment', 'First Board Meeting', 'Stock Issuance']
  },
  {
    id: 'tpl-5' as WorkflowTemplateId, title: 'M&A Due Diligence', category: 'Corporate', complexity: 'High', duration: '3-6 Months', auditReady: true,
    tags: ['Deal', 'Audit', 'Review'],
    stages: ['NDA Execution', 'Data Room Setup', 'Financial Review', 'Legal Review', 'Risk Assessment', 'Report Gen']
  },

  // OPERATIONS / ADMIN
  {
    id: 'tpl-6' as WorkflowTemplateId, title: 'Client Intake & Onboarding', category: 'Operations', complexity: 'Medium', duration: '3 Days', auditReady: true,
    tags: ['Admin', 'KYC', 'Finance'],
    stages: ['Lead Capture', 'Conflict Check', 'Risk Score', 'Engagement Letter', 'Retainer Collection', 'File Opening']
  },
  {
    id: 'tpl-7' as WorkflowTemplateId, title: 'Invoice Approval Chain', category: 'Operations', complexity: 'Low', duration: '5 Days', auditReady: true,
    tags: ['Billing', 'Finance', 'Approval'],
    stages: ['Draft Bill', 'Partner Review', 'Compliance Check', 'Client Sent', 'Payment Tracking', 'Collection']
  },
  {
    id: 'tpl-8' as WorkflowTemplateId, title: 'Conflict Waiver Protocol', category: 'Operations', complexity: 'High', duration: '1 Week', auditReady: true,
    tags: ['Ethics', 'Risk', 'Compliance'],
    stages: ['Conflict ID', 'Ethics Comm Review', 'Waiver Drafting', 'Client 1 Consent', 'Client 2 Consent', 'Wall Setup']
  },

  // HR & VENDOR
  {
    id: 'tpl-9' as WorkflowTemplateId, title: 'Employee Onboarding', category: 'HR', complexity: 'Medium', duration: '2 Weeks', auditReady: true,
    tags: ['Internal', 'Staffing'],
    stages: ['Offer Acceptance', 'Background Check', 'IT Provisioning', 'Orientation', 'Training Modules', '30-Day Review']
  },
  {
    id: 'tpl-10' as WorkflowTemplateId, title: 'Vendor Security Assessment', category: 'IT/Security', complexity: 'Medium', duration: '1 Month', auditReady: true,
    tags: ['Security', 'GDPR', 'Procurement'],
    stages: ['Questionnaire Sent', 'Security Review', 'Contract Negotiation', 'DPA Signing', 'Access Grant']
  },
  {
    id: 'tpl-11' as WorkflowTemplateId, title: 'Case Closing & Archive', category: 'Operations', complexity: 'Low', duration: '1 Week', auditReady: true,
    tags: ['Records', 'Retention'],
    stages: ['Final Bill Paid', 'Doc Return', 'Retention Tagging', 'Database Close', 'Physical Archive', 'Survey Sent']
  }
];
