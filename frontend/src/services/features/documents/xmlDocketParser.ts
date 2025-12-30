/**
 * @module services/xmlDocketParser
 * @category Services - Docket
 * @description PACER XML docket parser with non-blocking traversal via yieldToMain. Parses case info
 * (stub, caseType nodes), parties with attorney data, and docket entries with type classification.
 * Yields every 50 items to prevent UI blocking on large dockets. Maps PACER fields to internal
 * Case/Party/DocketEntry types with pacerData preservation.
 */

import { ValidationError, FileProcessingError } from '@/services/core/errors';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Utils & Constants
import { yieldToMain } from '@/utils/apiUtils';

// Types
import { CaseStatus, DocketEntry, DocketEntryType, Party, Case, CaseId, PartyId, DocketId, MatterType } from '@/types';
import { PacerCase, PacerParty, PacerJurisdictionType } from '@/types/pacer';

// ============================================================================
// SERVICE
// ============================================================================
export const XmlDocketParser = {
  parse: async (xmlString: string): Promise<{ 
    caseInfo: Partial<Case>, 
    parties: Party[], 
    docketEntries: DocketEntry[] 
  }> => {
    // Validate input
    if (!xmlString || !xmlString.trim()) {
      throw new ValidationError('XML string is empty or undefined');
    }

    let doc: Document;
    try {
      // Note: DOMParser is synchronous, but for very large strings we might still block here.
      // In a real browser environment, there is no async streaming XML parser standard readily available without libs.
      // We assume the XML string load itself isn't the blocker, but the traversal is.
      const parser = new DOMParser();
      doc = parser.parseFromString(xmlString, "text/xml");
      
      // Check for XML parse errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new FileProcessingError('XML Document', `XML parsing error: ${parserError.textContent || 'Malformed XML'}`);
      }
    } catch (error) {
      if (error instanceof FileProcessingError) {
        throw error;
      }
      throw new FileProcessingError('XML Document', `Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 1. Extract Case Info
    let caseInfo: Partial<Case>;
    try {
      const stub = doc.querySelector("stub");
      const caseTypeNode = doc.querySelector("caseType");
      
      // Require at minimum a stub node
      if (!stub) {
        throw new ValidationError('Missing required <stub> element in XML');
      }
      
      const pacerData: Partial<PacerCase> = {
          caseTitle: stub.getAttribute("shortTitle") || "Unknown Case",
          caseNumberFull: stub.getAttribute("caseNumber") || "",
          dateFiled: stub.getAttribute("dateFiled") || "",
          courtId: stub.getAttribute("origCourt") || "", 
          natureOfSuit: stub.getAttribute("natureOfSuit") || "",
          caseType: caseTypeNode?.getAttribute("type") || "cv",
          jurisdictionType: (caseTypeNode?.getAttribute("type") === "Bankruptcy-District Court" ? 'ap' : 'cv') as PacerJurisdictionType,
          caseStatus: stub.getAttribute("dateTerminated") ? 'C' : 'O',
      };
      
      caseInfo = {
        title: pacerData.caseTitle,
        id: (pacerData.caseNumberFull || "Unknown ID") as CaseId,
        filingDate: pacerData.dateFiled || "",
        court: pacerData.courtId || "Federal Court",
        status: pacerData.caseStatus === 'C' ? CaseStatus.Closed : CaseStatus.Discovery,
        matterType: MatterType.LITIGATION, // Both appeals and litigation map to LITIGATION
        description: `Imported via XML. NOS: ${pacerData.natureOfSuit}`,
        jurisdiction: "Federal",
        dateTerminated: stub.getAttribute("dateTerminated") || undefined,
        pacerData: pacerData as PacerCase
      };
    } catch (error) {
      console.error('Error extracting case info:', error);
      // Return minimal case info on partial failure
      caseInfo = {
        title: "XML Parse Error - Review Required",
        id: `case-error-${Date.now()}` as CaseId,
        filingDate: new Date().toISOString(),
        court: "Unknown Court",
        status: CaseStatus.Active,
        matterType: MatterType.LITIGATION,
        description: `Case info extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        jurisdiction: "Federal"
      };
    }

    // 2. Extract Parties
    const parties: Party[] = [];
    try {
      const partyNodes = Array.from(doc.querySelectorAll("party"));
      
      for (let i = 0; i < partyNodes.length; i++) {
        try {
          const p = partyNodes[i];
          const attorney = p.querySelector("attorney");
          const name = p.getAttribute("info") || "Unknown";
          const typeStr = p.getAttribute("type") || "";
          
          let type: 'Individual' | 'Corporation' | 'Government' = 'Individual';
          if (name.includes("Inc") || name.includes("Corp") || name.includes("LLC")) type = 'Corporation';
          
          const pacerParty: Partial<PacerParty> = {
              lastName: name,
              partyRole: typeStr.trim(),
          };
          
          parties.push({
            id: `p-xml-${i}` as PartyId,
            caseId: (caseInfo.id || `case-${Date.now()}`) as CaseId,
            name: name,
            role: typeStr.trim() || 'Other',
            contact: attorney?.getAttribute("email") || attorney?.getAttribute("personalPhone") || "",
            type: type,
            counsel: attorney ? `${attorney.getAttribute("firstName") || ''} ${attorney.getAttribute("lastName") || ''}`.trim() : undefined,
            partyGroup: p.getAttribute("prisonerNumber") ? "Prisoner" : undefined,
            pacerData: pacerParty as any
          });

          // Yield every 50 parties to avoid blocking
          if (i % 50 === 0) await yieldToMain();
        } catch (partyError) {
          console.warn(`Failed to parse party at index ${i}:`, partyError);
          // Continue with remaining parties
        }
      }
    } catch (error) {
      console.error('Error extracting parties:', error);
      // Return empty parties array on failure, but continue processing
    }

    // 3. Extract Docket Entries
    const docketEntries: DocketEntry[] = [];
    try {
      const docketNodes = Array.from(doc.querySelectorAll("docketText"));
      
      if (docketNodes.length === 0) {
        console.warn('No docket entries found in XML');
      }
      
      for (let i = 0; i < docketNodes.length; i++) {
        try {
          const dt = docketNodes[i];
          const text = dt.getAttribute("text") || "";
          const date = dt.getAttribute("dateFiled") || "";
          const docLink = dt.getAttribute("docLink") || undefined;
          
          // Skip entries with no text
          if (!text.trim()) {
            console.warn(`Skipping empty docket entry at index ${i}`);
            continue;
          }
          
          let type: DocketEntryType = 'Filing';
          if (text.toUpperCase().includes("ORDER")) type = 'Order';
          else if (text.toUpperCase().includes("NOTICE")) type = 'Notice';
          else if (text.toUpperCase().includes("MINUTE")) type = 'Minute Entry';
          else if (text.toUpperCase().includes("EXHIBIT")) type = 'Exhibit';

          const seqMatch = text.match(/\[(\d+)\]/);
          const seq = seqMatch ? parseInt(seqMatch[1]) : i + 1;

          docketEntries.push({
            id: `dk-xml-${i}` as DocketId,
            sequenceNumber: seq,
            caseId: caseInfo.id || ("Unknown" as CaseId),
            date: date || new Date().toISOString(),
            type: type,
            title: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
            description: text,
            filedBy: text.toLowerCase().includes("plaintiff") || text.toLowerCase().includes("appellant") ? "Appellant/Plaintiff" :
              text.toLowerCase().includes("defendant") || text.toLowerCase().includes("appellee") ? "Appellee/Defendant" : "Court",
            docLink: docLink,
            isSealed: text.toUpperCase().includes("SEALED"),
            dateFiled: "",
            entryDate: ""
          });

          // Yield every 50 entries
          if (i % 50 === 0) await yieldToMain();
        } catch (entryError) {
          console.warn(`Failed to parse docket entry at index ${i}:`, entryError);
          // Continue with remaining entries
        }
      }
    } catch (error) {
      console.error('Error extracting docket entries:', error);
      // Return partial results even if docket entries fail
    }

    // Validate we have at least minimal data
    if (!caseInfo.id) {
      throw new ValidationError('Failed to extract case information from XML');
    }

    return { caseInfo, parties, docketEntries };
  }
};

