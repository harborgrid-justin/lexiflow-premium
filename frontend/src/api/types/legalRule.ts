/**
 * Legal Rules Mock Data (FRE, FRCP, etc.)
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.knowledge.getRules() instead.
 * This constant is only for seeding and testing purposes.
 */

import { LegalRule } from '@/types';

/**
 * @deprecated MOCK DATA - Use DataService.knowledge instead
 */
export const MOCK_RULES: LegalRule[] = [
  // --- FEDERAL RULES OF EVIDENCE (FRE) ---
  
  // ARTICLE I. GENERAL PROVISIONS
  { id: 'fre-art-1', code: 'Article I', name: 'General Provisions', type: 'FRE', level: 'Article', summary: 'Scope, Purpose, and Rulings on Evidence', text: '' },
  { id: 'fre-101', parentId: 'fre-art-1', code: 'Rule 101', name: 'Scope; Definitions', type: 'FRE', level: 'Rule', summary: 'These rules apply to proceedings in United States courts.', text: '(a) In General. These rules apply to proceedings in United States courts. The specific courts and proceedings to which the rules apply, along with exceptions, are set out in Rule 1101.' },
  { id: 'fre-102', parentId: 'fre-art-1', code: 'Rule 102', name: 'Purpose', type: 'FRE', level: 'Rule', summary: 'Purpose is to administer proceedings fairly and eliminate unjustifiable expense.', text: 'These rules should be construed so as to administer every proceeding fairly, eliminate unjustifiable expense and delay, and promote the development of evidence law, to the end of ascertaining the truth and securing a just determination.' },
  
  // ARTICLE II. JUDICIAL NOTICE
  { id: 'fre-art-2', code: 'Article II', name: 'Judicial Notice', type: 'FRE', level: 'Article', summary: 'Judicial Notice of Adjudicative Facts', text: '' },
  { 
    id: 'fre-201', 
    parentId: 'fre-art-2', 
    code: 'Rule 201', 
    name: 'Judicial Notice of Adjudicative Facts', 
    type: 'FRE', 
    level: 'Rule', 
    summary: 'Governs judicial notice of an adjudicative fact only, not a legislative fact.', 
    text: 'See detailed view.',
    structuredContent: {
      "rule_number": "201",
      "title": "Judicial Notice of Adjudicative Facts",
      "text": {
        "a": {
          "title": "Scope",
          "content": "This rule governs judicial notice of an adjudicative fact only, not a legislative fact."
        },
        "b": {
          "title": "Kinds of Facts That May Be Judicially Noticed",
          "content": "The court may judicially notice a fact that is not subject to reasonable dispute because it:",
          "subsections": {
            "1": "is generally known within the trial court’s territorial jurisdiction;",
            "2": "can be accurately and readily determined from sources whose accuracy cannot reasonably be questioned."
          }
        },
        "c": {
          "title": "Taking Notice",
          "subsections": {
            "1": "The court may take judicial notice on its own;",
            "2": "The court must take judicial notice if a party requests it and the court is supplied with the necessary information."
          }
        },
        "d": {
          "title": "Timing",
          "content": "The court may take judicial notice at any stage of the proceeding."
        },
        "e": {
          "title": "Opportunity to Be Heard",
          "content": "On timely request, a party is entitled to be heard on the propriety of taking judicial notice and the nature of the fact to be noticed. If the court takes judicial notice before notifying a party, the party, on request, is still entitled to be heard."
        },
        "f": {
          "title": "Instructing the Jury",
          "content": {
            "civil": "In a civil case, the court must instruct the jury to accept the noticed fact as conclusive.",
            "criminal": "In a criminal case, the court must instruct the jury that it may or may not accept the noticed fact as conclusive."
          }
        }
      },
      "statutory_notes": {
        "enactment": {
          "public_law": "Pub. L. 93–595, §1",
          "date": "Jan. 2, 1975",
          "stat": "88 Stat. 1930"
        },
        "amendments": [
          {
            "date": "Apr. 26, 2011",
            "effective_date": "Dec. 1, 2011"
          }
        ]
      },
      "advisory_committee_notes": {
        "proposed_rules": {
          "subdivision_a": {
            "topic": "Scope and distinction between adjudicative and legislative facts",
            "summary": "Rule 201 governs only adjudicative facts. Legislative facts, used in legal reasoning and policy, are not regulated by this rule. Discussion includes definitions, scholarly commentary (Kenneth Davis, Morgan), and the need for flexibility in judicial reasoning. Legislative facts often involve facts not 'clearly indisputable' and therefore cannot be limited by the adjudicative fact framework."
          },
          "subdivision_b": {
            "topic": "Kinds of facts subject to judicial notice",
            "summary": "Judicial notice is limited to facts beyond reasonable controversy. Emphasizes caution and procedural fairness. Aligns with Uniform Rule 9 requirements. Excludes 'propositions of generalized knowledge' as adjudicative facts to be given to juries."
          },
          "subdivisions_c_and_d": {
            "topic": "Taking notice and timing",
            "summary": "Court has discretion to take judicial notice on its own. Must take notice when requested and appropriately supported. Consistent with existing practice and distinguishes itself from Uniform Rules."
          },
          "subdivision_e": {
            "topic": "Opportunity to be heard",
            "summary": "Requires opportunity to be heard if requested. No formal notice procedure mandated. Even if notice is taken before informing a party, the party can still request a hearing."
          },
          "subdivision_f": {
            "topic": "Stage of proceedings",
            "summary": "Judicial notice may be taken at any stage, including appeal. Supported by multiple jurisdictions and rules."
          },
          "subdivision_g": {
            "topic": "Admissibility of evidence to disprove noticed facts",
            "summary": "Debate exists over whether evidence should be admitted to disprove judicially noticed facts. Rule 201 adopts the position that no such evidence should go before the jury for adjudicative facts. Distinguishes from legislative fact considerations. Clarifies treatment in criminal cases and rejects distinctions barring judicial notice against accused except regarding venue."
          },
          "note_on_judicial_notice_of_law": {
            "topic": "Judicial notice of law not governed by Rule 201",
            "summary": "Judicial notice of foreign-country law is addressed in Rules 44.1 (Civil) and 26.1 (Criminal). Evidence rules should not govern procedures for determining law; those belong in procedural rules."
          }
        },
        "house_judiciary_committee_notes": {
          "rule_201_g_modification": {
            "summary": "House Committee rejected mandatory instruction in criminal cases requiring acceptance of judicially noticed facts as conclusive, citing the Sixth Amendment. Adopted the 1969 draft making such instruction discretionary in criminal cases but mandatory in civil cases."
          }
        },
        "committee_notes_2011_amendment": {
          "summary": "Rule restyled for clarity and consistency. Amendments were intended to be purely stylistic with no substantive change in evidence admissibility."
        }
      }
    }
  },

  // ARTICLE III. PRESUMPTIONS
  { id: 'fre-art-3', code: 'Article III', name: 'Presumptions in Civil Cases', type: 'FRE', level: 'Article', summary: '', text: '' },
  { id: 'fre-301', parentId: 'fre-art-3', code: 'Rule 301', name: 'Presumptions in Civil Cases Generally', type: 'FRE', level: 'Rule', summary: 'Party against whom a presumption is directed has the burden of producing evidence.', text: 'In a civil case, unless a federal statute or these rules provide otherwise, the party against whom a presumption is directed has the burden of producing evidence to rebut the presumption.' },

  // ARTICLE IV. RELEVANCE AND ITS LIMITS
  { id: 'fre-art-4', code: 'Article IV', name: 'Relevance and its Limits', type: 'FRE', level: 'Article', summary: 'Definition of Relevant Evidence and admissibility.', text: '' },
  { id: 'fre-401', parentId: 'fre-art-4', code: 'Rule 401', name: 'Test for Relevant Evidence', type: 'FRE', level: 'Rule', summary: 'Evidence is relevant if it has any tendency to make a fact more or less probable.', text: 'Evidence is relevant if:\n(a) it has any tendency to make a fact more or less probable than it would be without the evidence; and\n(b) the fact is of consequence in determining the action.' },
  { id: 'fre-402', parentId: 'fre-art-4', code: 'Rule 402', name: 'General Admissibility of Relevant Evidence', type: 'FRE', level: 'Rule', summary: 'Relevant evidence is admissible unless provided otherwise.', text: 'Relevant evidence is admissible unless any of the following provides otherwise: the United States Constitution; a federal statute; these rules; or other rules prescribed by the Supreme Court.' },
  { id: 'fre-403', parentId: 'fre-art-4', code: 'Rule 403', name: 'Excluding Relevant Evidence', type: 'FRE', level: 'Rule', summary: 'Prejudice, Confusion, Waste of Time.', text: 'The court may exclude relevant evidence if its probative value is substantially outweighed by a danger of one or more of the following: unfair prejudice, confusing the issues, misleading the jury, undue delay, wasting time, or needlessly presenting cumulative evidence.' },
  { id: 'fre-404', parentId: 'fre-art-4', code: 'Rule 404', name: 'Character Evidence; Crimes or Other Acts', type: 'FRE', level: 'Rule', summary: 'Character evidence is not admissible to prove that on a particular occasion the person acted in accordance with the character.', text: '(a) Character Evidence.\n(1) Prohibited Uses. Evidence of a person’s character or character trait is not admissible to prove that on a particular occasion the person acted in accordance with the character or trait.' },

  // ARTICLE V. PRIVILEGES
  { id: 'fre-art-5', code: 'Article V', name: 'Privileges', type: 'FRE', level: 'Article', summary: '', text: '' },
  { id: 'fre-501', parentId: 'fre-art-5', code: 'Rule 501', name: 'Privilege in General', type: 'FRE', level: 'Rule', summary: 'Common law governs claim of privilege.', text: 'The common law—as interpreted by United States courts in the light of reason and experience—governs a claim of privilege unless any of the following provides otherwise.' },
  { id: 'fre-502', parentId: 'fre-art-5', code: 'Rule 502', name: 'Attorney-Client Privilege and Work Product', type: 'FRE', level: 'Rule', summary: 'Limitations on Waiver.', text: 'The following provisions apply, in the circumstances set out, to disclosure of a communication or information covered by the attorney-client privilege or work-product protection.' },

  // ARTICLE VI. WITNESSES
  { id: 'fre-art-6', code: 'Article VI', name: 'Witnesses', type: 'FRE', level: 'Article', summary: '', text: '' },
  { id: 'fre-601', parentId: 'fre-art-6', code: 'Rule 601', name: 'Competency to Testify in General', type: 'FRE', level: 'Rule', summary: 'Every person is competent to be a witness unless these rules provide otherwise.', text: 'Every person is competent to be a witness unless these rules provide otherwise.' },

  // ARTICLE VII. OPINIONS AND EXPERT TESTIMONY
  { id: 'fre-art-7', code: 'Article VII', name: 'Opinions and Expert Testimony', type: 'FRE', level: 'Article', summary: '', text: '' },
  { id: 'fre-702', parentId: 'fre-art-7', code: 'Rule 702', name: 'Testimony by Expert Witnesses', type: 'FRE', level: 'Rule', summary: 'A witness who is qualified as an expert by knowledge, skill, experience, training, or education may testify.', text: 'A witness who is qualified as an expert by knowledge, skill, experience, training, or education may testify in the form of an opinion or otherwise if:\n(a) the expert’s scientific, technical, or other specialized knowledge will help the trier of fact to understand the evidence or to determine a fact in issue...' },

  // ARTICLE VIII. HEARSAY
  { id: 'fre-art-8', code: 'Article VIII', name: 'Hearsay', type: 'FRE', level: 'Article', summary: '', text: '' },
  { id: 'fre-801', parentId: 'fre-art-8', code: 'Rule 801', name: 'Definitions', type: 'FRE', level: 'Rule', summary: 'Definitions of Statement, Declarant, Hearsay.', text: '(c) Hearsay. “Hearsay” means a statement that:\n(1) the declarant does not make while testifying at the current trial or hearing; and\n(2) a party offers in evidence to prove the truth of the matter asserted in the statement.' },
  { id: 'fre-802', parentId: 'fre-art-8', code: 'Rule 802', name: 'The Rule Against Hearsay', type: 'FRE', level: 'Rule', summary: 'Hearsay is not admissible unless any of the following provides otherwise.', text: 'Hearsay is not admissible unless any of the following provides otherwise: a federal statute; these rules; or other rules prescribed by the Supreme Court.' },
  { id: 'fre-803', parentId: 'fre-art-8', code: 'Rule 803', name: 'Exceptions to the Rule Against Hearsay', type: 'FRE', level: 'Rule', summary: 'Availability of Declarant Immaterial.', text: 'The following are not excluded by the rule against hearsay, regardless of whether the declarant is available as a witness: (1) Present Sense Impression...' },

  // --- FEDERAL RULES OF CIVIL PROCEDURE (FRCP) SAMPLES ---
  { id: 'frcp-12', code: 'FRCP 12(b)(6)', name: 'Failure to State a Claim', type: 'FRCP', level: 'Rule', summary: 'Motion to dismiss for failure to state a claim.', text: 'Every defense to a claim for relief in any pleading must be asserted in the responsive pleading if one is required. But a party may assert the following defenses by motion... (6) failure to state a claim upon which relief can be granted;' },
  { id: 'frcp-26', code: 'FRCP 26(f)', name: 'Conference of the Parties', type: 'FRCP', level: 'Rule', summary: 'Planning for Discovery.', text: 'Conference of the Parties; Planning for Discovery. (1) Conference Timing. Except in a proceeding exempted from initial disclosure under Rule 26(a)(1)(B) or when the court orders otherwise, the parties must confer as soon as practicable...' },

  // --- LOCAL RULES SAMPLES ---
  { id: 'lr-ca-1', code: 'L.R. 7-3', name: 'Conference of Counsel', type: 'Local', level: 'Rule', summary: 'N.D. Cal. requirement to meet and confer before filing motions.', text: 'In all cases... counsel for the moving party must confer with counsel for the opposing party to attempt to resolve the dispute...' }
];
