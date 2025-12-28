/**
 * Discovery Document Templates Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.discovery.getDocTemplates() instead.
 * This constant is only for seeding and testing purposes.
 */

/**
 * @deprecated MOCK DATA - Use DataService.discovery instead
 */
export const MOCK_DISCOVERY_DOCS = {
  minutes: {
    id: 'DOC-MIN-001',
    title: "Minutes: Rule 26(f) Conference",
    date: "Oct 15, 2023",
    type: "Conference Minute",
    content: `MINUTES OF DISCOVERY CONFERENCE (FRCP 26(f))

Date: October 15, 2023
Location: Teleconference

Attendees: 
- Plaintiff Counsel: J. Doe
- Defense Counsel: S. Miller (LexiFlow Firm)

1. Preservation of Electronically Stored Information (ESI)
Parties agreed to preserve all emails from key custodians (List A) dating back to Jan 2020. No specific form of production agreed upon yet for databases.

2. Privilege Claims
Agreed to use 'quick peek' clawback agreement pursuant to FRE 502(d). A proposed order will be submitted.

3. Initial Disclosures
Scheduled for exchange by Nov 14, 2023. Plaintiff to provide damage computation.

4. Phasing
Phase 1: Written discovery and document production (Nov-Feb). 
Phase 2: Depositions (Mar-May 2024).

5. Settlement
Parties agreed to discuss ADR after Phase 1 discovery.

Minutes recorded by: S. Miller`
  },
  filing: {
    id: 'DOC-FIL-052',
    title: "Joint Discovery Plan (Form 52)",
    date: "Nov 01, 2023",
    type: "Court Filing",
    content: `UNITED STATES DISTRICT COURT
NORTHERN DISTRICT OF CALIFORNIA

MARTINEZ v. TECHCORP INDUSTRIES
Case No. C-2024-001

JOINT REPORT AND DISCOVERY PLAN

1. Changes to Discovery Rules
No changes to standard limitations on interrogatories (25) or depositions (10 per side) proposed.

2. Subjects of Discovery
- Employment history of Plaintiff.
- Internal communications regarding the 'Restructure Initiative'.
- Performance reviews of comparable employees.

3. ESI Format
- Text: Searchable PDF or TIFF with load files.
- Spreadsheets: Native format with metadata preserved.

4. Deadlines
- Initial Disclosures: Nov 14, 2023
- Fact Discovery Cutoff: June 1, 2024
- Expert Discovery Cutoff: Aug 1, 2024
- Dispositive Motions: Sept 15, 2024

Respectfully submitted,

/s/ J. Doe (Plaintiff Counsel)
/s/ S. Miller (Defense Counsel)`
  }
};
