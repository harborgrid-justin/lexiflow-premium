
export interface LegalRule {
  id: string;
  code: string; // e.g., "FRCP 26(f)"
  name: string;
  type: 'FRCP' | 'FRAP' | 'FRBP' | 'FRE' | 'Local';
  summary: string;
}

export const MOCK_RULES: LegalRule[] = [
  { id: 'r1', code: 'FRCP 26(f)', name: 'Conference of the Parties; Planning for Discovery', type: 'FRCP', summary: 'Parties must confer as soon as practicable to discuss the nature and basis of their claims and defenses and to develop a proposed discovery plan.' },
  { id: 'r2', code: 'FRCP 12(b)(6)', name: 'Failure to State a Claim', type: 'FRCP', summary: 'A motion asserting that the complaint fails to state a claim upon which relief can be granted.' },
  { id: 'r3', code: 'FRAP 4', name: 'Appeal as of Right—When Taken', type: 'FRAP', summary: 'In a civil case, the notice of appeal must be filed with the district clerk within 30 days after entry of the judgment or order appealed from.' },
  { id: 'r4', code: 'FRE 401', name: 'Test for Relevant Evidence', type: 'FRE', summary: 'Evidence is relevant if: (a) it has any tendency to make a fact more or less probable than it would be without the evidence; and (b) the fact is of consequence in determining the action.' },
  { id: 'r5', code: 'FRE 803', name: 'Exceptions to the Rule Against Hearsay', type: 'FRE', summary: 'The following are not excluded by the rule against hearsay, regardless of whether the declarant is available as a witness.' },
  { id: 'r6', code: 'FRBP 7001', name: 'Scope of Rules of Part VII', type: 'FRBP', summary: 'An adversary proceeding is governed by the rules of this Part VII.' },
  { id: 'r7', code: 'FRCP 56', name: 'Summary Judgment', type: 'FRCP', summary: 'The court shall grant summary judgment if the movant shows that there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law.' },
];
