import { DataSource } from 'typeorm';
import { DraftingTemplate, TemplateCategory, TemplateStatus } from '../../drafting/entities/template.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const DEFAULT_USER_ID = process.env.DEFAULT_ADMIN_USER_ID || '00000000-0000-0000-0000-000000000001';

export const draftingTemplateSeeds: Partial<DraftingTemplate>[] = [
  // ============================================================================
  // MOTION TEMPLATES
  // ============================================================================
  {
    name: 'Motion to Dismiss for Lack of Jurisdiction',
    description: 'Standard motion to dismiss based on lack of subject matter or personal jurisdiction',
    category: TemplateCategory.MOTION,
    status: TemplateStatus.ACTIVE,
    jurisdiction: 'Federal',
    practiceArea: 'Civil Litigation',
    courtType: 'District Court',
    isPublic: true,
    content: `IN THE UNITED STATES DISTRICT COURT
FOR THE {{district}} DISTRICT OF {{state}}

{{case.plaintiff}},
    Plaintiff,

v.                                                   Case No. {{case.caseNumber}}

{{case.defendant}},
    Defendant.

MOTION TO DISMISS FOR LACK OF JURISDICTION

Defendant {{case.defendant}}, by and through undersigned counsel, respectfully moves this Court pursuant to Federal Rule of Civil Procedure 12(b)(1) and 12(b)(2) to dismiss this action for lack of subject matter jurisdiction and personal jurisdiction.

I. INTRODUCTION

{{introduction}}

II. STATEMENT OF FACTS

{{facts}}

III. LEGAL STANDARD

A motion to dismiss under Rule 12(b)(1) challenges the court's subject matter jurisdiction. {{legal_standard}}

IV. ARGUMENT

A. This Court Lacks Subject Matter Jurisdiction

{{jurisdiction_argument}}

B. Defendant Has Insufficient Minimum Contacts

{{minimum_contacts_argument}}

V. CONCLUSION

For the foregoing reasons, Defendant respectfully requests that this Court grant this Motion to Dismiss.

Respectfully submitted,

{{attorney_name}}
{{attorney_bar_number}}
{{firm_name}}
{{firm_address}}
{{attorney_phone}}
{{attorney_email}}

Date: {{filing_date}}`,
    variables: [
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'introduction', label: 'Introduction', type: 'text', required: true },
      { name: 'facts', label: 'Statement of Facts', type: 'text', required: true },
      { name: 'legal_standard', label: 'Legal Standard Details', type: 'text', required: false },
      { name: 'jurisdiction_argument', label: 'Jurisdiction Argument', type: 'text', required: true },
      { name: 'minimum_contacts_argument', label: 'Minimum Contacts Argument', type: 'text', required: true },
      { name: 'attorney_name', label: 'Attorney Name', type: 'text', required: true },
      { name: 'attorney_bar_number', label: 'Bar Number', type: 'text', required: true },
      { name: 'firm_name', label: 'Firm Name', type: 'text', required: true },
      { name: 'firm_address', label: 'Firm Address', type: 'text', required: true },
      { name: 'attorney_phone', label: 'Phone', type: 'text', required: true },
      { name: 'attorney_email', label: 'Email', type: 'text', required: true },
      { name: 'filing_date', label: 'Filing Date', type: 'date', required: true },
    ],
    tags: ['motion', 'dismiss', 'jurisdiction', 'Rule 12(b)'],
    usageCount: 0,
    createdBy: DEFAULT_USER_ID,
  },

  {
    name: 'Motion for Summary Judgment',
    description: 'Comprehensive motion for summary judgment under FRCP 56',
    category: TemplateCategory.MOTION,
    status: TemplateStatus.ACTIVE,
    jurisdiction: 'Federal',
    practiceArea: 'Civil Litigation',
    courtType: 'District Court',
    isPublic: true,
    content: `IN THE UNITED STATES DISTRICT COURT
FOR THE {{district}} DISTRICT OF {{state}}

{{case.plaintiff}},
    Plaintiff,

v.                                                   Case No. {{case.caseNumber}}

{{case.defendant}},
    Defendant.

MOTION FOR SUMMARY JUDGMENT

{{party_name}}, by and through undersigned counsel, respectfully moves this Court pursuant to Federal Rule of Civil Procedure 56 for summary judgment on all claims.

I. INTRODUCTION

{{introduction}}

II. STATEMENT OF UNDISPUTED MATERIAL FACTS

{{undisputed_facts}}

III. LEGAL STANDARD

Summary judgment is appropriate when "there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law." Fed. R. Civ. P. 56(a).

IV. ARGUMENT

{{main_argument}}

V. CONCLUSION

No genuine dispute of material fact exists, and {{party_name}} is entitled to judgment as a matter of law. This Court should grant summary judgment.

Respectfully submitted,

{{attorney_name}}
{{attorney_bar_number}}
{{firm_name}}
{{firm_address}}
{{attorney_phone}}
{{attorney_email}}

Date: {{filing_date}}`,
    variables: [
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'party_name', label: 'Moving Party Name', type: 'text', required: true },
      { name: 'introduction', label: 'Introduction', type: 'text', required: true },
      { name: 'undisputed_facts', label: 'Undisputed Material Facts', type: 'text', required: true },
      { name: 'main_argument', label: 'Main Argument', type: 'text', required: true },
      { name: 'attorney_name', label: 'Attorney Name', type: 'text', required: true },
      { name: 'attorney_bar_number', label: 'Bar Number', type: 'text', required: true },
      { name: 'firm_name', label: 'Firm Name', type: 'text', required: true },
      { name: 'firm_address', label: 'Firm Address', type: 'text', required: true },
      { name: 'attorney_phone', label: 'Phone', type: 'text', required: true },
      { name: 'attorney_email', label: 'Email', type: 'text', required: true },
      { name: 'filing_date', label: 'Filing Date', type: 'date', required: true },
    ],
    tags: ['motion', 'summary judgment', 'FRCP 56', 'dispositive'],
    usageCount: 0,
    createdBy: DEFAULT_USER_ID,
  },

  // ============================================================================
  // COMPLAINT TEMPLATES
  // ============================================================================
  {
    name: 'Civil Complaint - Breach of Contract',
    description: 'Standard complaint for breach of contract with multiple counts',
    category: TemplateCategory.COMPLAINT,
    status: TemplateStatus.ACTIVE,
    jurisdiction: 'Federal',
    practiceArea: 'Contract Law',
    courtType: 'District Court',
    isPublic: true,
    content: `IN THE UNITED STATES DISTRICT COURT
FOR THE {{district}} DISTRICT OF {{state}}

{{plaintiff_name}},
    Plaintiff,

v.                                                   CASE NO: __________

{{defendant_name}},
    Defendant.

COMPLAINT

Plaintiff {{plaintiff_name}} ("Plaintiff"), by and through undersigned counsel, brings this Complaint against Defendant {{defendant_name}} ("Defendant") and alleges as follows:

I. PARTIES

1. Plaintiff is {{plaintiff_description}}.

2. Defendant is {{defendant_description}}.

II. JURISDICTION AND VENUE

3. This Court has subject matter jurisdiction pursuant to 28 U.S.C. § 1332 (diversity jurisdiction). The amount in controversy exceeds $75,000, exclusive of interest and costs.

4. Venue is proper in this District pursuant to 28 U.S.C. § 1391(b).

III. FACTUAL ALLEGATIONS

5. On or about {{contract_date}}, Plaintiff and Defendant entered into a written contract ("the Agreement").

6. {{contract_description}}

7. Plaintiff performed all conditions, covenants, and promises required by the Agreement.

8. {{breach_description}}

9. As a direct and proximate result of Defendant's breach, Plaintiff has suffered damages in an amount to be proven at trial, but no less than {{damages_amount}}.

COUNT I - BREACH OF CONTRACT

10. Plaintiff re-alleges and incorporates paragraphs 1-9 as if fully set forth herein.

11. {{breach_details}}

12. Plaintiff has sustained damages in an amount to be proven at trial.

{{clause:0}}

PRAYER FOR RELIEF

WHEREFORE, Plaintiff respectfully requests that this Court:

A. Enter judgment in favor of Plaintiff and against Defendant;
B. Award compensatory damages in an amount to be proven at trial;
C. Award pre-judgment and post-judgment interest;
D. Award costs and attorneys' fees; and
E. Grant such other and further relief as the Court deems just and proper.

JURY DEMAND

Plaintiff demands a trial by jury on all issues so triable.

Respectfully submitted,

{{attorney_name}}
{{attorney_bar_number}}
{{firm_name}}
{{firm_address}}
{{attorney_phone}}
{{attorney_email}}

Date: {{filing_date}}`,
    variables: [
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'plaintiff_name', label: 'Plaintiff Name', type: 'text', required: true },
      { name: 'defendant_name', label: 'Defendant Name', type: 'text', required: true },
      { name: 'plaintiff_description', label: 'Plaintiff Description', type: 'text', required: true },
      { name: 'defendant_description', label: 'Defendant Description', type: 'text', required: true },
      { name: 'contract_date', label: 'Contract Date', type: 'date', required: true },
      { name: 'contract_description', label: 'Contract Description', type: 'text', required: true },
      { name: 'breach_description', label: 'Breach Description', type: 'text', required: true },
      { name: 'damages_amount', label: 'Damages Amount', type: 'text', required: true },
      { name: 'breach_details', label: 'Detailed Breach Allegations', type: 'text', required: true },
      { name: 'attorney_name', label: 'Attorney Name', type: 'text', required: true },
      { name: 'attorney_bar_number', label: 'Bar Number', type: 'text', required: true },
      { name: 'firm_name', label: 'Firm Name', type: 'text', required: true },
      { name: 'firm_address', label: 'Firm Address', type: 'text', required: true },
      { name: 'attorney_phone', label: 'Phone', type: 'text', required: true },
      { name: 'attorney_email', label: 'Email', type: 'text', required: true },
      { name: 'filing_date', label: 'Filing Date', type: 'date', required: true },
    ],
    clauseReferences: [
      { clauseId: '', position: 0, isOptional: true, condition: 'Include additional counts if applicable' },
    ],
    tags: ['complaint', 'breach of contract', 'civil litigation', 'contract dispute'],
    usageCount: 0,
    createdBy: DEFAULT_USER_ID,
  },

  // ============================================================================
  // DISCOVERY TEMPLATES
  // ============================================================================
  {
    name: 'First Set of Interrogatories',
    description: 'Standard interrogatories under FRCP 33',
    category: TemplateCategory.DISCOVERY,
    status: TemplateStatus.ACTIVE,
    jurisdiction: 'Federal',
    practiceArea: 'Civil Litigation',
    courtType: 'District Court',
    isPublic: true,
    content: `IN THE UNITED STATES DISTRICT COURT
FOR THE {{district}} DISTRICT OF {{state}}

{{case.plaintiff}},
    Plaintiff,

v.                                                   Case No. {{case.caseNumber}}

{{case.defendant}},
    Defendant.

{{party_name}}'S FIRST SET OF INTERROGATORIES TO {{responding_party}}

TO: {{responding_party}}

{{party_name}} ("{{party_short_name}}") requests that {{responding_party}} ("Respondent") answer the following interrogatories pursuant to Federal Rule of Civil Procedure 33, separately and fully in writing and under oath, within thirty (30) days from the date of service.

DEFINITIONS

{{definitions}}

INTERROGATORIES

INTERROGATORY NO. 1:
State your full legal name, any other names by which you have been known, your current address, date of birth, and Social Security Number.

INTERROGATORY NO. 2:
{{interrogatory_2}}

INTERROGATORY NO. 3:
{{interrogatory_3}}

INTERROGATORY NO. 4:
{{interrogatory_4}}

INTERROGATORY NO. 5:
{{interrogatory_5}}

{{additional_interrogatories}}

Respectfully submitted,

{{attorney_name}}
{{attorney_bar_number}}
{{firm_name}}
{{firm_address}}
{{attorney_phone}}
{{attorney_email}}

Date: {{filing_date}}`,
    variables: [
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'party_name', label: 'Propounding Party Name', type: 'text', required: true },
      { name: 'party_short_name', label: 'Party Short Name', type: 'text', required: true },
      { name: 'responding_party', label: 'Responding Party', type: 'text', required: true },
      { name: 'definitions', label: 'Definitions Section', type: 'text', required: false },
      { name: 'interrogatory_2', label: 'Interrogatory 2', type: 'text', required: true },
      { name: 'interrogatory_3', label: 'Interrogatory 3', type: 'text', required: true },
      { name: 'interrogatory_4', label: 'Interrogatory 4', type: 'text', required: true },
      { name: 'interrogatory_5', label: 'Interrogatory 5', type: 'text', required: true },
      { name: 'additional_interrogatories', label: 'Additional Interrogatories', type: 'text', required: false },
      { name: 'attorney_name', label: 'Attorney Name', type: 'text', required: true },
      { name: 'attorney_bar_number', label: 'Bar Number', type: 'text', required: true },
      { name: 'firm_name', label: 'Firm Name', type: 'text', required: true },
      { name: 'firm_address', label: 'Firm Address', type: 'text', required: true },
      { name: 'attorney_phone', label: 'Phone', type: 'text', required: true },
      { name: 'attorney_email', label: 'Email', type: 'text', required: true },
      { name: 'filing_date', label: 'Filing Date', type: 'date', required: true },
    ],
    tags: ['discovery', 'interrogatories', 'FRCP 33', 'written discovery'],
    usageCount: 0,
    createdBy: DEFAULT_USER_ID,
  },

  {
    name: 'Request for Production of Documents',
    description: 'Standard document production request under FRCP 34',
    category: TemplateCategory.DISCOVERY,
    status: TemplateStatus.ACTIVE,
    jurisdiction: 'Federal',
    practiceArea: 'Civil Litigation',
    courtType: 'District Court',
    isPublic: true,
    content: `IN THE UNITED STATES DISTRICT COURT
FOR THE {{district}} DISTRICT OF {{state}}

{{case.plaintiff}},
    Plaintiff,

v.                                                   Case No. {{case.caseNumber}}

{{case.defendant}},
    Defendant.

{{party_name}}'S FIRST REQUEST FOR PRODUCTION OF DOCUMENTS TO {{responding_party}}

TO: {{responding_party}}

Pursuant to Federal Rule of Civil Procedure 34, {{party_name}} requests that {{responding_party}} produce the following documents and things for inspection and copying at {{production_location}} within thirty (30) days from the date of service.

DEFINITIONS AND INSTRUCTIONS

1. "Document" means any written, recorded, or graphic matter, including electronically stored information (ESI).

{{additional_definitions}}

REQUESTS FOR PRODUCTION

REQUEST NO. 1:
All documents relating to or evidencing {{request_1}}.

REQUEST NO. 2:
{{request_2}}

REQUEST NO. 3:
{{request_3}}

REQUEST NO. 4:
{{request_4}}

REQUEST NO. 5:
{{request_5}}

{{additional_requests}}

Respectfully submitted,

{{attorney_name}}
{{attorney_bar_number}}
{{firm_name}}
{{firm_address}}
{{attorney_phone}}
{{attorney_email}}

Date: {{filing_date}}`,
    variables: [
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'party_name', label: 'Requesting Party Name', type: 'text', required: true },
      { name: 'responding_party', label: 'Responding Party', type: 'text', required: true },
      { name: 'production_location', label: 'Production Location', type: 'text', required: true },
      { name: 'additional_definitions', label: 'Additional Definitions', type: 'text', required: false },
      { name: 'request_1', label: 'Request 1 Description', type: 'text', required: true },
      { name: 'request_2', label: 'Request 2', type: 'text', required: true },
      { name: 'request_3', label: 'Request 3', type: 'text', required: true },
      { name: 'request_4', label: 'Request 4', type: 'text', required: true },
      { name: 'request_5', label: 'Request 5', type: 'text', required: true },
      { name: 'additional_requests', label: 'Additional Requests', type: 'text', required: false },
      { name: 'attorney_name', label: 'Attorney Name', type: 'text', required: true },
      { name: 'attorney_bar_number', label: 'Bar Number', type: 'text', required: true },
      { name: 'firm_name', label: 'Firm Name', type: 'text', required: true },
      { name: 'firm_address', label: 'Firm Address', type: 'text', required: true },
      { name: 'attorney_phone', label: 'Phone', type: 'text', required: true },
      { name: 'attorney_email', label: 'Email', type: 'text', required: true },
      { name: 'filing_date', label: 'Filing Date', type: 'date', required: true },
    ],
    tags: ['discovery', 'production', 'documents', 'FRCP 34', 'ESI'],
    usageCount: 0,
    createdBy: DEFAULT_USER_ID,
  },

  // ============================================================================
  // ANSWER TEMPLATE
  // ============================================================================
  {
    name: 'Answer to Complaint',
    description: 'Standard answer with affirmative defenses',
    category: TemplateCategory.ANSWER,
    status: TemplateStatus.ACTIVE,
    jurisdiction: 'Federal',
    practiceArea: 'Civil Litigation',
    courtType: 'District Court',
    isPublic: true,
    content: `IN THE UNITED STATES DISTRICT COURT
FOR THE {{district}} DISTRICT OF {{state}}

{{case.plaintiff}},
    Plaintiff,

v.                                                   Case No. {{case.caseNumber}}

{{case.defendant}},
    Defendant.

ANSWER TO COMPLAINT

Defendant {{case.defendant}}, by and through undersigned counsel, answers Plaintiff's Complaint as follows:

ANSWER TO ALLEGATIONS

1. Defendant {{response_1}} the allegations in Paragraph 1 of the Complaint.

2. {{response_2}}

3. {{response_3}}

{{additional_responses}}

AFFIRMATIVE DEFENSES

Without assuming the burden of proof, and without admitting the allegations of the Complaint, Defendant asserts the following affirmative defenses:

FIRST AFFIRMATIVE DEFENSE
(Failure to State a Claim)

The Complaint fails to state a claim upon which relief can be granted.

SECOND AFFIRMATIVE DEFENSE
({{defense_2_title}})

{{defense_2_content}}

THIRD AFFIRMATIVE DEFENSE
({{defense_3_title}})

{{defense_3_content}}

{{additional_defenses}}

PRAYER FOR RELIEF

WHEREFORE, Defendant prays that this Court:

A. Dismiss the Complaint with prejudice;
B. Award Defendant costs and attorneys' fees; and
C. Grant such other relief as the Court deems just and proper.

JURY DEMAND

Defendant demands a trial by jury on all issues so triable.

Respectfully submitted,

{{attorney_name}}
{{attorney_bar_number}}
{{firm_name}}
{{firm_address}}
{{attorney_phone}}
{{attorney_email}}

Date: {{filing_date}}`,
    variables: [
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'response_1', label: 'Response to Para 1 (admits/denies/lacks knowledge)', type: 'select', required: true, options: ['admits', 'denies', 'lacks sufficient knowledge to admit or deny'] },
      { name: 'response_2', label: 'Response to Para 2', type: 'text', required: true },
      { name: 'response_3', label: 'Response to Para 3', type: 'text', required: true },
      { name: 'additional_responses', label: 'Additional Responses', type: 'text', required: false },
      { name: 'defense_2_title', label: 'Second Defense Title', type: 'text', required: true },
      { name: 'defense_2_content', label: 'Second Defense Content', type: 'text', required: true },
      { name: 'defense_3_title', label: 'Third Defense Title', type: 'text', required: true },
      { name: 'defense_3_content', label: 'Third Defense Content', type: 'text', required: true },
      { name: 'additional_defenses', label: 'Additional Defenses', type: 'text', required: false },
      { name: 'attorney_name', label: 'Attorney Name', type: 'text', required: true },
      { name: 'attorney_bar_number', label: 'Bar Number', type: 'text', required: true },
      { name: 'firm_name', label: 'Firm Name', type: 'text', required: true },
      { name: 'firm_address', label: 'Firm Address', type: 'text', required: true },
      { name: 'attorney_phone', label: 'Phone', type: 'text', required: true },
      { name: 'attorney_email', label: 'Email', type: 'text', required: true },
      { name: 'filing_date', label: 'Filing Date', type: 'date', required: true },
    ],
    tags: ['answer', 'affirmative defenses', 'responsive pleading'],
    usageCount: 0,
    createdBy: DEFAULT_USER_ID,
  },

  // ============================================================================
  // NOTICE TEMPLATES
  // ============================================================================
  {
    name: 'Notice of Deposition',
    description: 'Notice of oral deposition under FRCP 30',
    category: TemplateCategory.NOTICE,
    status: TemplateStatus.ACTIVE,
    jurisdiction: 'Federal',
    practiceArea: 'Civil Litigation',
    courtType: 'District Court',
    isPublic: true,
    content: `IN THE UNITED STATES DISTRICT COURT
FOR THE {{district}} DISTRICT OF {{state}}

{{case.plaintiff}},
    Plaintiff,

v.                                                   Case No. {{case.caseNumber}}

{{case.defendant}},
    Defendant.

NOTICE OF DEPOSITION

TO ALL PARTIES AND THEIR COUNSEL OF RECORD:

PLEASE TAKE NOTICE that pursuant to Federal Rule of Civil Procedure 30, {{party_name}} will take the deposition of {{deponent_name}} on {{deposition_date}} at {{deposition_time}}, at {{deposition_location}}.

The deposition will be recorded by {{recording_method}}.

The deposition will continue from day to day until completed.

{{additional_notices}}

Respectfully submitted,

{{attorney_name}}
{{attorney_bar_number}}
{{firm_name}}
{{firm_address}}
{{attorney_phone}}
{{attorney_email}}

Date: {{filing_date}}`,
    variables: [
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'party_name', label: 'Noticing Party', type: 'text', required: true },
      { name: 'deponent_name', label: 'Deponent Name', type: 'text', required: true },
      { name: 'deposition_date', label: 'Deposition Date', type: 'date', required: true },
      { name: 'deposition_time', label: 'Deposition Time', type: 'text', required: true },
      { name: 'deposition_location', label: 'Deposition Location', type: 'text', required: true },
      { name: 'recording_method', label: 'Recording Method', type: 'select', required: true, options: ['stenographic means', 'audio recording', 'video recording', 'stenographic means and video recording'] },
      { name: 'additional_notices', label: 'Additional Notices', type: 'text', required: false },
      { name: 'attorney_name', label: 'Attorney Name', type: 'text', required: true },
      { name: 'attorney_bar_number', label: 'Bar Number', type: 'text', required: true },
      { name: 'firm_name', label: 'Firm Name', type: 'text', required: true },
      { name: 'firm_address', label: 'Firm Address', type: 'text', required: true },
      { name: 'attorney_phone', label: 'Phone', type: 'text', required: true },
      { name: 'attorney_email', label: 'Email', type: 'text', required: true },
      { name: 'filing_date', label: 'Filing Date', type: 'date', required: true },
    ],
    tags: ['notice', 'deposition', 'FRCP 30', 'discovery'],
    usageCount: 0,
    createdBy: DEFAULT_USER_ID,
  },
];

export async function seedDraftingTemplates(dataSource: DataSource): Promise<void> {
  const templateRepository = dataSource.getRepository(DraftingTemplate);

  console.log('🌱 Seeding drafting templates...');

  for (const seed of draftingTemplateSeeds) {
    const existing = await templateRepository.findOne({
      where: { name: seed.name },
    });

    if (!existing) {
      const template = templateRepository.create(seed);
      await templateRepository.save(template);
      console.log(`  ✓ Created template: ${seed.name}`);
    } else {
      console.log(`  ⊘ Template already exists: ${seed.name}`);
    }
  }

  console.log('✅ Drafting templates seeding complete!');
}
