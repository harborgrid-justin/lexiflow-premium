
import { WorkflowTemplateData } from '../components/workflow/TemplatePreview';

export const TEMPLATE_LIBRARY: WorkflowTemplateData[] = [
  // LITIGATION
  {
    id: 'tpl-1', title: 'Civil Litigation (Standard)', category: 'Litigation', complexity: 'High', duration: '12-18 Months', auditReady: true,
    tags: ['Federal', 'Civil', 'Complex'],
    stages: ['Intake & Conflicts', 'Pleadings & Service', 'Discovery (Fact/Expert)', 'Dispositive Motions', 'Pre-Trial', 'Trial', 'Appeal']
  },
  {
    id: 'tpl-2', title: 'Small Claims Defense', category: 'Litigation', complexity: 'Low', duration: '1-3 Months', auditReady: true,
    tags: ['State', 'Defense', 'Fast-Track'],
    stages: ['Demand Review', 'Settlement Offer', 'Hearing Prep', 'Hearing', 'Judgment Payment']
  },
  {
    id: 'tpl-3', title: 'Class Action Settlement', category: 'Litigation', complexity: 'High', duration: '24+ Months', auditReady: true,
    tags: ['Mass Tort', 'Admin', 'Finance'],
    stages: ['Prelim Approval', 'Notice Period', 'Claims Processing', 'Fairness Hearing', 'Final Approval', 'Distribution']
  },

  // CORPORATE / TRANSACTIONAL
  {
    id: 'tpl-4', title: 'Corporate Formation (DE)', category: 'Corporate', complexity: 'Medium', duration: '2 Weeks', auditReady: true,
    tags: ['Entity', 'Startup', 'Delaware'],
    stages: ['Name Reservation', 'Articles of Inc.', 'Bylaws Drafting', 'EIN Obtainment', 'First Board Meeting', 'Stock Issuance']
  },
  {
    id: 'tpl-5', title: 'M&A Due Diligence', category: 'Corporate', complexity: 'High', duration: '3-6 Months', auditReady: true,
    tags: ['Deal', 'Audit', 'Review'],
    stages: ['NDA Execution', 'Data Room Setup', 'Financial Review', 'Legal Review', 'Risk Assessment', 'Report Gen']
  },

  // OPERATIONS / ADMIN
  {
    id: 'tpl-6', title: 'Client Intake & Onboarding', category: 'Operations', complexity: 'Medium', duration: '3 Days', auditReady: true,
    tags: ['Admin', 'KYC', 'Finance'],
    stages: ['Lead Capture', 'Conflict Check', 'Risk Score', 'Engagement Letter', 'Retainer Collection', 'File Opening']
  },
  {
    id: 'tpl-7', title: 'Invoice Approval Chain', category: 'Operations', complexity: 'Low', duration: '5 Days', auditReady: true,
    tags: ['Billing', 'Finance', 'Approval'],
    stages: ['Draft Bill', 'Partner Review', 'Compliance Check', 'Client Sent', 'Payment Tracking', 'Collection']
  },
  {
    id: 'tpl-8', title: 'Conflict Waiver Protocol', category: 'Operations', complexity: 'High', duration: '1 Week', auditReady: true,
    tags: ['Ethics', 'Risk', 'Compliance'],
    stages: ['Conflict ID', 'Ethics Comm Review', 'Waiver Drafting', 'Client 1 Consent', 'Client 2 Consent', 'Wall Setup']
  },

  // HR & VENDOR
  {
    id: 'tpl-9', title: 'Employee Onboarding', category: 'HR', complexity: 'Medium', duration: '2 Weeks', auditReady: true,
    tags: ['Internal', 'Staffing'],
    stages: ['Offer Acceptance', 'Background Check', 'IT Provisioning', 'Orientation', 'Training Modules', '30-Day Review']
  },
  {
    id: 'tpl-10', title: 'Vendor Security Assessment', category: 'IT/Security', complexity: 'Medium', duration: '1 Month', auditReady: true,
    tags: ['Security', 'GDPR', 'Procurement'],
    stages: ['Questionnaire Sent', 'Security Review', 'Contract Negotiation', 'DPA Signing', 'Access Grant']
  },
  {
    id: 'tpl-11', title: 'Case Closing & Archive', category: 'Operations', complexity: 'Low', duration: '1 Week', auditReady: true,
    tags: ['Records', 'Retention'],
    stages: ['Final Bill Paid', 'Doc Return', 'Retention Tagging', 'Database Close', 'Physical Archive', 'Survey Sent']
  }
];
