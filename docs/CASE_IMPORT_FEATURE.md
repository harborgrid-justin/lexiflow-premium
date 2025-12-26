# Case Data Import Feature

## Overview
The Case Import tab allows you to paste XML or structured text documents and automatically extract case metadata using **AI-powered structured extraction** or rule-based parsing. The extracted data maps to the backend case fields. This feature is particularly useful for importing cases from:
- PACER XML exports
- CourtListener case data
- Custom XML formats
- Structured text documents
- Unstructured documents (with AI extraction)
- Court docket PDFs (copy-pasted text)

## AI-Powered Extraction

**NEW**: The importer now uses **Google Gemini AI** with structured output to intelligently extract case data from any format, including unstructured documents. The AI can:
- Extract data from any document format (not just XML/structured text)
- Handle variations in field names and formats
- Identify relationships between data points
- Parse dates in multiple formats
- Extract related cases automatically
- Work with incomplete or poorly formatted documents

Toggle "AI-Powered Extraction" ON (default) for intelligent parsing, or OFF for traditional rule-based extraction.

## Location
Navigate to: **Case Management → Cases → Import Data**

## Supported Formats

### 1. XML Format (PACER/CourtListener Style)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<case>
  <title>Johnson v. Smith Corporation</title>
  <caseNumber>1:23-cv-12345</caseNumber>
  <description>Employment discrimination lawsuit</description>
  <type>Civil</type>
  <status>Active</status>
  <practiceArea>Employment Law</practiceArea>
  <jurisdiction>California</jurisdiction>
  <court>U.S. District Court, Northern District of California</court>
  <judge>Hon. Jane Smith</judge>
  <filingDate>2023-01-15</filingDate>
  <trialDate>2024-06-20</trialDate>
  <juryDemand>Both</juryDemand>
  <causeOfAction>42:2000 Civil Rights Act</causeOfAction>
  <natureOfSuit>Employment Discrimination</natureOfSuit>
  <natureOfSuitCode>442</natureOfSuit>
  <relatedCase>
    <court>4th Circuit</court>
    <caseNumber>24-02160</caseNumber>
    <relationship>Appeal</relationship>
  </relatedCase>
</case>
```

### 2. Structured Text Format
```
Title: Johnson v. Smith Corporation
Case Number: 1:23-cv-12345
Description: Employment discrimination lawsuit
Type: Civil
Status: Active
Practice Area: Employment Law
Jurisdiction: California
Court: U.S. District Court, Northern District of California
Judge: Hon. Jane Smith
Filing Date: 2023-01-15
Trial Date: 2024-06-20
Jury Demand: Both
Cause of Action: 42:2000 Civil Rights Act
Nature of Suit: Employment Discrimination
```

### 3. Minimal Format (Auto-detection)
The parser will attempt to extract case information even from minimal text:
```
Smith v. Jones
Case No. 1:23-cv-12345
U.S. District Court, Northern District of California
Filed: January 15, 2023
```

## Supported Fields

### Required Fields (Must be present to create case)
- **Title**: Case name (e.g., "Johnson v. Smith Corp")
- **Case Number**: Unique case identifier (e.g., "1:23-cv-12345")

### Optional Fields (Auto-extracted when available)
- **Description**: Case summary
- **Type**: Case type (Civil, Criminal, Family, etc.)
- **Status**: Current status (Active, Pending, Closed, etc.)
- **Practice Area**: Legal practice area
- **Jurisdiction**: Court jurisdiction
- **Court**: Court name
- **Judge**: Assigned judge name
- **Referred Judge**: Referred judge name
- **Magistrate Judge**: Magistrate judge name
- **Filing Date**: Date case was filed
- **Trial Date**: Scheduled trial date
- **Close Date**: Date case was closed
- **Date Terminated**: Date case was terminated
- **Jury Demand**: Jury demand type
- **Cause of Action**: Legal cause
- **Nature of Suit**: Nature of the lawsuit
- **Nature of Suit Code**: NOS code
- **Related Cases**: Array of related cases with court and case numbers

## Usage Workflow

### Step 1: Paste Document
1. Navigate to **Case Management → Cases → Import Data**
2. Paste your XML or text document into the text area
3. The parser supports both XML and structured text formats

### Step 2: Parse Document
1. Click the **"Parse Document"** button
2. The system will automatically detect the format (XML or text)
3. Extracted data will be displayed in the preview section below

### Step 3: Review & Edit
1. Review all extracted fields in the preview
2. Click **"Edit Mode"** to manually edit any fields
3. Required fields (Title and Case Number) are marked with a red asterisk (*)
4. Verify dates are in the correct format

### Step 4: Create Case
1. Once satisfied with the data, click **"Create Case"**
2. The case will be created in the backend PostgreSQL database
3. Success message will appear, and the case will be available in the Active Cases list
4. The form will automatically clear after 3 seconds

## XML Tag Mapping

The parser recognizes multiple tag name variations:

| Field | Primary Tag | Alternative Tags |
|-------|------------|------------------|
| Title | `<title>` | `<caseName>`, `<case_name>` |
| Case Number | `<caseNumber>` | `<case_number>`, `<docket_number>` |
| Court | `<court>` | `<courtName>`, `<court_name>` |
| Judge | `<judge>` | `<assigned_judge>` |
| Filing Date | `<filingDate>` | `<filing_date>`, `<date_filed>` |
| Nature of Suit | `<natureOfSuit>` | `<nature_of_suit>` |

## Text Pattern Recognition

The parser recognizes common text patterns:

| Pattern | Example |
|---------|---------|
| Case title with "v." | `Smith v. Jones` |
| Case number | `Case No. 1:23-cv-12345` or `Docket #: 1:23-cv-12345` |
| Label: Value | `Filing Date: 2023-01-15` |
| Court jurisdiction | Extracted from court name |

## Error Handling

### Common Errors

**"Please paste some content to parse"**
- Solution: Paste valid XML or text content

**"Could not extract any case data"**
- Solution: Ensure your document contains recognizable field labels or XML tags

**"Title and Case Number are required fields"**
- Solution: These fields must be present. Add them manually in Edit Mode or ensure they exist in your source document

**"Invalid XML format"**
- Solution: Validate your XML structure. The parser will automatically fall back to text parsing

## Tips for Best Results

1. **Use Standard Field Labels**: Use common labels like "Title:", "Case Number:", "Filing Date:" for text format
2. **Date Format**: Dates should be in ISO format (YYYY-MM-DD) or common formats like "January 15, 2023"
3. **XML Validation**: Ensure XML is well-formed with proper opening/closing tags
4. **Review Before Creating**: Always review extracted data in Edit Mode before creating the case
5. **Clear After Success**: The form automatically clears after successful case creation

## Backend Integration

The import feature integrates with:
- **Backend API**: `POST /api/cases`
- **Database**: PostgreSQL via NestJS/TypeORM
- **Validation**: Uses `CreateCaseDto` validation from backend
- **Query Invalidation**: Automatically refreshes case lists after creation

## Example Import Workflow

```
1. Copy PACER case XML export
2. Navigate to Case Management → Cases → Import Data
3. Paste XML → Click "Parse Document"
4. Review extracted data:
   - Title: Johnson v. Smith Corp ✓
   - Case Number: 1:23-cv-12345 ✓
   - Court: U.S. District Court ✓
   - Filing Date: 2023-01-15 ✓
5. Click "Edit Mode" to adjust any fields if needed
6. Click "Create Case"
7. Success! Case created and available in Active Cases list
```

## Technical Details

- **Component**: `frontend/src/features/cases/components/import/CaseImporter.tsx`
- **Parser Functions**: `parseXML()`, `parseText()`
- **API Method**: `api.cases.add()`
- **Query Keys**: `['cases']` (invalidated after creation)
- **Lazy Loaded**: Yes (code-split from main bundle)

## Future Enhancements

Potential improvements:
- Bulk import multiple cases
- Import from file upload (.xml, .json, .csv)
- Template library for common formats
- Import history and audit trail
- Party/attorney extraction
- Document attachment during import
