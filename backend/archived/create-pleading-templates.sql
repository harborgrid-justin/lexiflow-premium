-- Create pleading_templates table
CREATE TABLE IF NOT EXISTS pleading_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar NOT NULL,
  description text,
  category varchar NOT NULL,
  "defaultSections" jsonb NOT NULL,
  variables jsonb,
  "formattingRules" jsonb,
  "jurisdictionId" varchar,
  "isActive" boolean DEFAULT true,
  "usageCount" integer DEFAULT 0,
  "createdBy" varchar,
  "updatedBy" varchar,
  "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample templates
INSERT INTO pleading_templates (id, name, description, category, "defaultSections", variables, "formattingRules")
VALUES 
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Motion to Dismiss',
    'Standard motion to dismiss for failure to state a claim',
    'Motion',
    '[
      {"type": "Caption", "content": "[COURT_NAME]\\n[CASE_NUMBER]\\n[PARTIES]", "order": 0},
      {"type": "Title", "content": "MOTION TO DISMISS", "order": 1},
      {"type": "Heading", "content": "I. INTRODUCTION", "order": 2},
      {"type": "Paragraph", "content": "Defendant [DEFENDANT_NAME] respectfully moves this Court to dismiss the Complaint pursuant to Federal Rule of Civil Procedure 12(b)(6) for failure to state a claim upon which relief can be granted.", "order": 3},
      {"type": "Heading", "content": "II. FACTUAL BACKGROUND", "order": 4},
      {"type": "Paragraph", "content": "[INSERT FACTS]", "order": 5},
      {"type": "Heading", "content": "III. LEGAL STANDARD", "order": 6},
      {"type": "Paragraph", "content": "To survive a motion to dismiss under Rule 12(b)(6), a complaint must contain sufficient factual matter, accepted as true, to state a claim to relief that is plausible on its face.", "order": 7},
      {"type": "Heading", "content": "IV. ARGUMENT", "order": 8},
      {"type": "Paragraph", "content": "[INSERT ARGUMENT]", "order": 9},
      {"type": "Heading", "content": "V. CONCLUSION", "order": 10},
      {"type": "Paragraph", "content": "For the foregoing reasons, Defendant respectfully requests that this Court grant this Motion to Dismiss.", "order": 11},
      {"type": "Signature", "content": "Respectfully submitted,\\n\\n[ATTORNEY_NAME]\\n[BAR_NUMBER]\\n[FIRM_NAME]\\n[ADDRESS]", "order": 12}
    ]'::jsonb,
    '["COURT_NAME", "CASE_NUMBER", "PARTIES", "DEFENDANT_NAME", "ATTORNEY_NAME", "BAR_NUMBER", "FIRM_NAME", "ADDRESS"]'::jsonb,
    '{"fontSize": 12, "lineSpacing": "double", "margins": {"top": 1, "bottom": 1, "left": 1, "right": 1}}'::jsonb
  ),
  (
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'Answer to Complaint',
    'Standard answer with affirmative defenses',
    'Answer',
    '[
      {"type": "Caption", "content": "[COURT_NAME]\\n[CASE_NUMBER]\\n[PARTIES]", "order": 0},
      {"type": "Title", "content": "ANSWER TO COMPLAINT", "order": 1},
      {"type": "Paragraph", "content": "Defendant [DEFENDANT_NAME] answers Plaintiffs Complaint as follows:", "order": 2},
      {"type": "Heading", "content": "RESPONSE TO ALLEGATIONS", "order": 3},
      {"type": "Paragraph", "content": "1. Defendant admits the allegations in Paragraph 1 of the Complaint.\\n2. Defendant denies the allegations in Paragraph 2 of the Complaint.\\n3. [CONTINUE AS NEEDED]", "order": 4},
      {"type": "Heading", "content": "AFFIRMATIVE DEFENSES", "order": 5},
      {"type": "Paragraph", "content": "First Affirmative Defense: [INSERT DEFENSE]\\n\\nSecond Affirmative Defense: [INSERT DEFENSE]", "order": 6},
      {"type": "Heading", "content": "PRAYER FOR RELIEF", "order": 7},
      {"type": "Paragraph", "content": "WHEREFORE, Defendant prays that this Court dismiss the Complaint with prejudice and award Defendant costs and such other relief as the Court deems just and proper.", "order": 8},
      {"type": "Signature", "content": "Respectfully submitted,\\n\\n[ATTORNEY_NAME]\\n[BAR_NUMBER]\\n[FIRM_NAME]\\n[ADDRESS]", "order": 9}
    ]'::jsonb,
    '["COURT_NAME", "CASE_NUMBER", "PARTIES", "DEFENDANT_NAME", "ATTORNEY_NAME", "BAR_NUMBER", "FIRM_NAME", "ADDRESS"]'::jsonb,
    '{"fontSize": 12, "lineSpacing": "double", "margins": {"top": 1, "bottom": 1, "left": 1, "right": 1}}'::jsonb
  ),
  (
    'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    'Summary Judgment Motion',
    'Motion for summary judgment',
    'Motion',
    '[
      {"type": "Caption", "content": "[COURT_NAME]\\n[CASE_NUMBER]\\n[PARTIES]", "order": 0},
      {"type": "Title", "content": "MOTION FOR SUMMARY JUDGMENT", "order": 1},
      {"type": "Heading", "content": "I. INTRODUCTION", "order": 2},
      {"type": "Paragraph", "content": "[MOVANT] respectfully moves this Court for summary judgment pursuant to Federal Rule of Civil Procedure 56.", "order": 3},
      {"type": "Heading", "content": "II. STATEMENT OF UNDISPUTED MATERIAL FACTS", "order": 4},
      {"type": "Paragraph", "content": "1. [FACT 1]\\n2. [FACT 2]\\n3. [FACT 3]", "order": 5},
      {"type": "Heading", "content": "III. LEGAL STANDARD", "order": 6},
      {"type": "Paragraph", "content": "Summary judgment is appropriate where there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law.", "order": 7},
      {"type": "Heading", "content": "IV. ARGUMENT", "order": 8},
      {"type": "Paragraph", "content": "[INSERT ARGUMENT]", "order": 9},
      {"type": "Heading", "content": "V. CONCLUSION", "order": 10},
      {"type": "Paragraph", "content": "For the foregoing reasons, [MOVANT] respectfully requests that this Court grant this Motion for Summary Judgment.", "order": 11},
      {"type": "Signature", "content": "Respectfully submitted,\\n\\n[ATTORNEY_NAME]\\n[BAR_NUMBER]\\n[FIRM_NAME]\\n[ADDRESS]", "order": 12}
    ]'::jsonb,
    '["COURT_NAME", "CASE_NUMBER", "PARTIES", "MOVANT", "ATTORNEY_NAME", "BAR_NUMBER", "FIRM_NAME", "ADDRESS"]'::jsonb,
    '{"fontSize": 12, "lineSpacing": "double", "margins": {"top": 1, "bottom": 1, "left": 1, "right": 1}}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
