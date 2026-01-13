# Test Data for Case Import Feature

## Test Case 1: Complete XML (PACER Style)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<case>
  <title>Johnson v. Smith Corporation</title>
  <caseNumber>1:23-cv-12345</caseNumber>
  <description>Employment discrimination lawsuit alleging violations of Title VII of the Civil Rights Act</description>
  <type>Civil</type>
  <status>Active</status>
  <practiceArea>Employment Law</practiceArea>
  <jurisdiction>California</jurisdiction>
  <court>U.S. District Court, Northern District of California</court>
  <judge>Hon. Jane Smith</judge>
  <referredJudge>Hon. Michael Brown</referredJudge>
  <magistrateJudge>Hon. Emily Davis</magistrateJudge>
  <filingDate>2023-01-15</filingDate>
  <trialDate>2024-06-20</trialDate>
  <juryDemand>Both</juryDemand>
  <causeOfAction>42:2000 Civil Rights Act</causeOfAction>
  <natureOfSuit>Employment Discrimination</natureOfSuit>
  <natureOfSuitCode>442</natureOfSuitCode>
  <relatedCase>
    <court>4th Circuit Court of Appeals</court>
    <caseNumber>24-02160</caseNumber>
    <relationship>Appeal</relationship>
  </relatedCase>
</case>
```

## Test Case 2: Structured Text (Complete)
```
Title: Anderson v. Tech Innovations LLC
Case Number: 2:24-cv-67890
Description: Patent infringement lawsuit regarding mobile device technology
Type: Civil
Status: Discovery
Practice Area: Intellectual Property
Jurisdiction: Delaware
Court: U.S. District Court, District of Delaware
Judge: Hon. Robert Williams
Filing Date: 2024-03-22
Trial Date: 2025-01-15
Jury Demand: Plaintiff
Cause of Action: 35 U.S.C. § 271 Patent Infringement
Nature of Suit: Patent Infringement
Nature of Suit Code: 830
```

## Test Case 3: Minimal Text (Auto-detection)
```
Martinez v. Global Enterprises Inc.
Case No. 3:24-cv-45678
U.S. District Court, Southern District of New York
Filed: 2024-11-10
Judge: Hon. Sarah Thompson
```

## Test Case 4: CourtListener XML Style
```xml
<?xml version="1.0" encoding="UTF-8"?>
<docket>
  <case_name>Williams v. State Insurance Company</case_name>
  <docket_number>4:23-cv-98765</docket_number>
  <case_type>Insurance Dispute</case_type>
  <court_name>U.S. District Court, Western District of Texas</court_name>
  <assigned_judge>Hon. David Chen</assigned_judge>
  <date_filed>2023-08-05</date_filed>
  <jurisdiction>Texas</jurisdiction>
  <nature_of_suit>Insurance</nature_of_suit>
  <nos_code>110</nos_code>
</docket>
```

## Test Case 5: Real Estate Matter
```
Title: Thompson et al. v. Downtown Development Corp
Case Number: 5:24-cv-11223
Description: Commercial real estate dispute regarding breach of lease agreement
Type: Real Estate
Status: Active
Practice Area: Real Estate Law
Jurisdiction: Illinois
Court: U.S. District Court, Northern District of Illinois
Judge: Hon. Patricia Martinez
Magistrate Judge: Hon. Kevin O'Brien
Filing Date: 2024-05-18
Close Date: 2024-12-20
Nature of Suit: Contract Dispute
```

## Test Case 6: Criminal Case
```xml
<?xml version="1.0" encoding="UTF-8"?>
<case>
  <title>United States v. Rodriguez</title>
  <caseNumber>6:24-cr-33445</caseNumber>
  <description>Criminal prosecution for wire fraud and money laundering</description>
  <type>Criminal</type>
  <status>Active</status>
  <practiceArea>White Collar Crime</practiceArea>
  <jurisdiction>Florida</jurisdiction>
  <court>U.S. District Court, Southern District of Florida</court>
  <judge>Hon. Maria Gonzalez</judge>
  <filingDate>2024-09-12</filingDate>
  <trialDate>2025-03-05</trialDate>
  <causeOfAction>18 U.S.C. § 1343, 18 U.S.C. § 1956</causeOfAction>
</case>
```

## Test Case 7: Family Law Matter
```
Title: In re: Marriage of Davis
Case Number: FL-2024-7890
Description: Divorce proceedings with child custody and property division
Type: Family
Status: Pending
Practice Area: Family Law
Jurisdiction: California
Court: Superior Court of California, County of Los Angeles
Judge: Hon. Amanda Foster
Filing Date: 2024-07-20
```

## Test Case 8: Bankruptcy Case
```xml
<?xml version="1.0" encoding="UTF-8"?>
<case>
  <title>In re: Acme Manufacturing Corp</title>
  <caseNumber>7:24-bk-56789</caseNumber>
  <description>Chapter 11 bankruptcy reorganization</description>
  <type>Bankruptcy</type>
  <status>Active</status>
  <practiceArea>Bankruptcy</practiceArea>
  <jurisdiction>New York</jurisdiction>
  <court>U.S. Bankruptcy Court, Southern District of New York</court>
  <judge>Hon. Christopher Lee</judge>
  <filingDate>2024-10-01</filingDate>
  <natureOfSuit>Bankruptcy Chapter 11</natureOfSuit>
  <natureOfSuitCode>422</natureOfSuitCode>
</case>
```

## Test Case 9: Immigration Case
```
Title: Patel v. U.S. Citizenship and Immigration Services
Case Number: 8:24-cv-77665
Type: Immigration
Status: Active
Practice Area: Immigration Law
Jurisdiction: Washington
Court: U.S. District Court, Western District of Washington
Judge: Hon. Steven Park
Filing Date: 2024-08-30
Cause of Action: 8 U.S.C. § 1421 Naturalization Denial
Nature of Suit: Immigration
```

## Test Case 10: Multi-District Litigation (MDL)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<case>
  <title>In re: Pharmaceutical Product Liability Litigation</title>
  <caseNumber>MDL-2024-123</caseNumber>
  <description>Multi-district litigation involving defective pharmaceutical products</description>
  <type>Civil</type>
  <status>Discovery</status>
  <practiceArea>Product Liability</practiceArea>
  <jurisdiction>Multi-District</jurisdiction>
  <court>U.S. District Court, Eastern District of Pennsylvania</court>
  <judge>Hon. Margaret Sullivan</judge>
  <filingDate>2024-02-14</filingDate>
  <causeOfAction>Strict Product Liability, Negligence, Breach of Warranty</causeOfAction>
  <natureOfSuit>Product Liability</natureOfSuit>
  <natureOfSuitCode>365</natureOfSuitCode>
  <relatedCase>
    <court>3rd Circuit</court>
    <caseNumber>24-1234</caseNumber>
    <relationship>Consolidated</relationship>
  </relatedCase>
  <relatedCase>
    <court>3rd Circuit</court>
    <caseNumber>24-1235</caseNumber>
    <relationship>Consolidated</relationship>
  </relatedCase>
</case>
```

## Test Case 11: Error Test - Missing Required Fields
```
Description: This should fail because title and case number are missing
Court: U.S. District Court
Judge: Hon. Test Judge
Filing Date: 2024-01-01
```

## Test Case 12: Minimal Valid Case
```
Title: Doe v. Roe
Case Number: TEST-2024-001
```

## Usage Instructions

1. Copy any of the test cases above
2. Navigate to Case Management → Cases → Import Data
3. Paste the test data into the text area
4. Click "Parse Document"
5. Review the extracted data
6. Click "Create Case" to create the case in the system

## Expected Results

- **Test Cases 1-10**: Should successfully parse and extract all available fields
- **Test Case 11**: Should parse but display warning that Title and Case Number are required
- **Test Case 12**: Should successfully create a minimal case with just required fields

## Validation Checklist

- [ ] XML parsing works correctly
- [ ] Text parsing works correctly
- [ ] Required fields are validated (Title, Case Number)
- [ ] Dates are properly formatted
- [ ] Edit mode allows field modifications
- [ ] Case creation succeeds with valid data
- [ ] Error messages display for invalid input
- [ ] Success message shows after case creation
- [ ] Form clears after successful creation
- [ ] Case appears in Active Cases list after creation
