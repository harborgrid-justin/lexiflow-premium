/**
 * Firm Business Process Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.workflow.getProcesses() instead.
 * This constant is only for seeding and testing purposes.
 */

/**
 * @deprecated MOCK DATA - Use DataService.workflow instead
 */
export const BUSINESS_PROCESSES = [
  // Existing Core Processes
  { id: 'bp1', name: 'New Client Onboarding', status: 'Active', triggers: 'CRM: New Lead', tasks: 12, completed: 8, owner: 'Admin Team' },
  { id: 'bp2', name: 'Month-End Billing', status: 'Scheduled', triggers: 'Finance: Day 28', tasks: 45, completed: 0, owner: 'Finance' },
  { id: 'bp3', name: 'Annual Conflict Audit', status: 'Idle', triggers: 'Admin: Manual', tasks: 150, completed: 0, owner: 'Compliance' },
  { id: 'bp4', name: 'Associate Review Cycle', status: 'Active', triggers: 'HR: Nov 1', tasks: 20, completed: 5, owner: 'HR' },
  
  // New Integrated Infra-Connected Processes
  { id: 'bp5', name: 'E-Discovery Processing', status: 'Active', triggers: 'Discovery: Upload > 1GB', tasks: 8, completed: 3, owner: 'Litigation Support' },
  { id: 'bp6', name: 'Evidence Chain Audit', status: 'Scheduled', triggers: 'Vault: Transfer Event', tasks: 35, completed: 0, owner: 'Risk Committee' },
  { id: 'bp7', name: 'Pro Hac Vice Admission', status: 'Pending', triggers: 'Jurisdiction: Out-of-State', tasks: 5, completed: 0, owner: 'Managing Partner' },
  { id: 'bp8', name: 'Pre-Bill Review Cycle', status: 'Active', triggers: 'Billing: WIP Threshold', tasks: 18, completed: 12, owner: 'Billing Dept' },
  { id: 'bp9', name: 'GDPR/CCPA Compliance', status: 'Idle', triggers: 'Intake: EU/CA Citizen', tasks: 6, completed: 0, owner: 'Privacy Officer' },
  { id: 'bp10', name: 'Matter Closing & Archive', status: 'Idle', triggers: 'Case: Status=Closed', tasks: 15, completed: 0, owner: 'Records Dept' },
  { id: 'bp11', name: 'Privilege Log Gen', status: 'Active', triggers: 'Discovery: Production Set', tasks: 4, completed: 1, owner: 'Associate Team' },
  { id: 'bp12', name: 'Vendor Risk Assessment', status: 'Pending', triggers: 'Admin: New Vendor', tasks: 9, completed: 0, owner: 'Compliance' },
  { id: 'bp13', name: 'Conflict Waiver Protocol', status: 'Active', triggers: 'Compliance: Conflict Hit', tasks: 3, completed: 2, owner: 'Ethics Committee' },
  { id: 'bp14', name: 'Litigation Hold Enforcement', status: 'Completed', triggers: 'Case: Created', tasks: 5, completed: 5, owner: 'General Counsel' },
  { id: 'bp15', name: 'Document Malware Scan', status: 'Active', triggers: 'DMS: File Upload', tasks: 1, completed: 1, owner: 'Security Ops' },
];
