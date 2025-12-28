
import { PleadingTemplate } from "@/types";

export const PLEADING_TEMPLATES: PleadingTemplate[] = [
    // --- GENERAL ---
    {
        id: 'tpl-complaint', name: 'Civil Complaint (General)', category: 'Pleading',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'COMPLAINT FOR DAMAGES' },
            { id: 'sec-3', type: 'Paragraph', content: 'Plaintiff, by and through undersigned counsel, brings this action against Defendant and alleges as follows:' },
            { id: 'sec-4', type: 'Heading', content: 'JURISDICTION AND VENUE' },
            { id: 'sec-5', type: 'Paragraph', content: '1. This Court has subject matter jurisdiction pursuant to 28 U.S.C. § 1331 (federal question) and/or § 1332 (diversity).' },
            { id: 'sec-6', type: 'Heading', content: 'PARTIES' },
            { id: 'sec-7', type: 'Paragraph', content: '2. Plaintiff is a resident of...' },
            { id: 'sec-8', type: 'Heading', content: 'FACTUAL ALLEGATIONS' },
            { id: 'sec-9', type: 'Paragraph', content: '3. On or about...' },
            { id: 'sec-10', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-answer', name: 'Answer to Complaint', category: 'Pleading',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'ANSWER AND AFFIRMATIVE DEFENSES' },
            { id: 'sec-3', type: 'Paragraph', content: 'Defendant hereby answers the Complaint as follows:' },
            { id: 'sec-4', type: 'List', content: '1. Admitted.\n2. Denied.\n3. Lacks knowledge or information sufficient to form a belief.' },
            { id: 'sec-5', type: 'Heading', content: 'AFFIRMATIVE DEFENSES' },
            { id: 'sec-6', type: 'Paragraph', content: 'FIRST DEFENSE: Failure to state a claim upon which relief can be granted.' },
            { id: 'sec-7', type: 'Signature', content: '' }
        ]
    },

    // --- RULE 12 (PRE-TRIAL MOTIONS) ---
    {
        id: 'tpl-rule-12b', name: 'Motion to Dismiss (Rule 12(b))', category: 'Pre-Trial',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION TO DISMISS' },
            { id: 'sec-3', type: 'Paragraph', content: 'PLEASE TAKE NOTICE that Defendant moves this Court to dismiss the Complaint pursuant to Federal Rule of Civil Procedure 12(b).' },
            { id: 'sec-4', type: 'Heading', content: 'MEMORANDUM OF POINTS AND AUTHORITIES' },
            { id: 'sec-5', type: 'Heading', content: 'I. LACK OF SUBJECT-MATTER JURISDICTION (12(b)(1))' },
            { id: 'sec-6', type: 'Paragraph', content: 'The Court lacks jurisdiction because...' },
            { id: 'sec-7', type: 'Heading', content: 'II. FAILURE TO STATE A CLAIM (12(b)(6))' },
            { id: 'sec-8', type: 'Paragraph', content: 'Even accepting all well-pleaded facts as true, Plaintiff fails to allege...' },
            { id: 'sec-9', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-12c', name: 'Motion for Judgment on the Pleadings (Rule 12(c))', category: 'Pre-Trial',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION FOR JUDGMENT ON THE PLEADINGS' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 12(c), [Party] moves for judgment on the pleadings because no material issue of fact remains to be resolved and [Party] is entitled to judgment as a matter of law.' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-12e', name: 'Motion for More Definite Statement (Rule 12(e))', category: 'Pre-Trial',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION FOR MORE DEFINITE STATEMENT' },
            { id: 'sec-3', type: 'Paragraph', content: 'Defendant moves pursuant to FRCP 12(e) for an order requiring Plaintiff to provide a more definite statement. The current pleading is so vague or ambiguous that Defendant cannot reasonably prepare a response.' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-12f', name: 'Motion to Strike (Rule 12(f))', category: 'Pre-Trial',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION TO STRIKE' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 12(f), [Party] moves to strike from the pleading the following redundant, immaterial, impertinent, or scandalous matter:' },
            { id: 'sec-4', type: 'List', content: '1. Paragraph 15 regarding...' },
            { id: 'sec-5', type: 'Signature', content: '' }
        ]
    },

    // --- PARTIES & AMENDMENTS ---
    {
        id: 'tpl-rule-15', name: 'Motion to Amend Pleading (Rule 15)', category: 'Pre-Trial',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION FOR LEAVE TO FILE AMENDED COMPLAINT' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 15(a)(2), Plaintiff requests leave of Court to file the attached First Amended Complaint. Justice so requires this amendment because...' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-23', name: 'Motion for Class Certification (Rule 23)', category: 'Class Action',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION FOR CLASS CERTIFICATION' },
            { id: 'sec-3', type: 'Heading', content: 'I. NUMEROSITY' },
            { id: 'sec-4', type: 'Heading', content: 'II. COMMONALITY' },
            { id: 'sec-5', type: 'Heading', content: 'III. TYPICALITY' },
            { id: 'sec-6', type: 'Heading', content: 'IV. ADEQUACY OF REPRESENTATION' },
            { id: 'sec-7', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-24', name: 'Motion to Intervene (Rule 24)', category: 'Parties',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION TO INTERVENE' },
            { id: 'sec-3', type: 'Paragraph', content: 'Proposed Intervenor moves to intervene in this action as of right pursuant to FRCP 24(a), or alternatively, for permissive intervention under FRCP 24(b).' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },

    // --- DISCOVERY ---
    {
        id: 'tpl-rule-37', name: 'Motion to Compel Discovery (Rule 37)', category: 'Discovery',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION TO COMPEL DISCOVERY' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 37(a), [Party] moves for an order compelling [Opposing Party] to respond to Interrogatories and Requests for Production.' },
            { id: 'sec-4', type: 'Heading', content: 'CERTIFICATION OF MEET AND CONFER' },
            { id: 'sec-5', type: 'Paragraph', content: 'Undersigned counsel certifies that they have in good faith conferred or attempted to confer with the party not making the disclosure in an effort to secure it without court action.' },
            { id: 'sec-6', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-26-protective', name: 'Motion for Protective Order (Rule 26(c))', category: 'Discovery',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION FOR PROTECTIVE ORDER' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 26(c), [Party] moves for a protective order to protect against annoyance, embarrassment, oppression, or undue burden or expense.' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-45', name: 'Motion to Quash Subpoena (Rule 45)', category: 'Discovery',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION TO QUASH SUBPOENA' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 45(d)(3), Movant requests this Court quash or modify the subpoena served on [Date] because it requires disclosure of privileged matter/subjects a person to undue burden.' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },

    // --- INJUNCTIONS & EMERGENCY ---
    {
        id: 'tpl-rule-65', name: 'Motion for TRO / Preliminary Injunction (Rule 65)', category: 'Emergency',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'EMERGENCY MOTION FOR TEMPORARY RESTRAINING ORDER' },
            { id: 'sec-3', type: 'Paragraph', content: 'Plaintiff moves pursuant to FRCP 65 for a Temporary Restraining Order enjoining Defendant from...' },
            { id: 'sec-4', type: 'Heading', content: 'MEMORANDUM' },
            { id: 'sec-5', type: 'Paragraph', content: '1. Likelihood of success on the merits.\n2. Irreparable harm in the absence of preliminary relief.\n3. Balance of equities.\n4. Public interest.' },
            { id: 'sec-6', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-67', name: 'Motion to Deposit Money (Rule 67)', category: 'Financial',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION TO DEPOSIT FUNDS INTO COURT REGISTRY' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 67, [Party] requests leave to deposit the sum of $_______, which is the subject of this dispute, into the registry of the Court.' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },

    // --- DISPOSITIVE & TRIAL ---
    {
        id: 'tpl-rule-56', name: 'Motion for Summary Judgment (Rule 56)', category: 'Dispositive',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION FOR SUMMARY JUDGMENT' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 56, [Party] moves for summary judgment on all claims. There is no genuine dispute as to any material fact and Movant is entitled to judgment as a matter of law.' },
            { id: 'sec-4', type: 'Heading', content: 'STATEMENT OF UNDISPUTED FACTS' },
            { id: 'sec-5', type: 'List', content: '1. ...\n2. ...' },
            { id: 'sec-6', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-50', name: 'Motion for Judgment as a Matter of Law (Rule 50)', category: 'Trial',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION FOR JUDGMENT AS A MATTER OF LAW' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 50(a), [Party] moves for judgment as a matter of law. A reasonable jury would not have a legally sufficient evidentiary basis to find for the opposing party on the issue of...' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-41', name: 'Notice of Voluntary Dismissal (Rule 41)', category: 'Pre-Trial',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'NOTICE OF VOLUNTARY DISMISSAL' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 41(a)(1)(A)(i), Plaintiff hereby voluntarily dismisses this action without prejudice against Defendant.' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },

    // --- POST-TRIAL & APPEAL ---
    {
        id: 'tpl-rule-59', name: 'Motion for New Trial (Rule 59)', category: 'Post-Trial',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION FOR NEW TRIAL' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 59, [Party] moves for a new trial on the grounds that the verdict is against the weight of the evidence/prejudicial error of law.' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-60', name: 'Motion for Relief from Judgment (Rule 60)', category: 'Post-Trial',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION FOR RELIEF FROM JUDGMENT' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 60(b), [Party] moves for relief from the final judgment entered on [Date] due to [mistake/newly discovered evidence/fraud].' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-rule-62', name: 'Motion for Stay Pending Appeal (Rule 62)', category: 'Appeal',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'MOTION FOR STAY PENDING APPEAL' },
            { id: 'sec-3', type: 'Paragraph', content: 'Pursuant to FRCP 62, [Party] moves to stay the execution of the judgment pending the disposition of the appeal to the Circuit Court.' },
            { id: 'sec-4', type: 'Signature', content: '' }
        ]
    }
];
