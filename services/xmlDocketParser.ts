
import { CaseStatus, DocketEntry, DocketEntryType, Party, Case, CaseId, PartyId, DocketId } from "../types";
import { PacerCase, PacerParty, PacerJurisdictionType } from "../types/pacer";

export const XmlDocketParser = {
  parse: (xmlString: string): { 
    caseInfo: Partial<Case>, 
    parties: Party[], 
    docketEntries: DocketEntry[] 
  } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    // 1. Extract Case Info and Map to PacerCase structure
    const stub = doc.querySelector("stub");
    const caseTypeNode = doc.querySelector("caseType");
    
    const pacerData: Partial<PacerCase> = {
        caseTitle: stub?.getAttribute("shortTitle") || "Unknown Case",
        caseNumberFull: stub?.getAttribute("caseNumber") || "",
        dateFiled: stub?.getAttribute("dateFiled") || "",
        courtId: stub?.getAttribute("origCourt") || "", 
        natureOfSuit: stub?.getAttribute("natureOfSuit") || "",
        caseType: caseTypeNode?.getAttribute("type") || "cv",
        jurisdictionType: (caseTypeNode?.getAttribute("type") === "Bankruptcy-District Court" ? 'ap' : 'cv') as PacerJurisdictionType,
        caseStatus: stub?.getAttribute("dateTerminated") ? 'C' : 'O',
    };
    
    const caseInfo: Partial<Case> = {
      title: pacerData.caseTitle,
      // FIX: Cast string to branded type CaseId
      id: (pacerData.caseNumberFull || "Unknown ID") as CaseId,
      filingDate: pacerData.dateFiled || "",
      court: pacerData.courtId || "Federal Court",
      status: pacerData.caseStatus === 'C' ? CaseStatus.Closed : CaseStatus.Discovery,
      matterType: pacerData.jurisdictionType === 'ap' ? 'Appeal' : 'Litigation',
      description: `Imported via XML. NOS: ${pacerData.natureOfSuit}`,
      jurisdiction: "Federal",
      dateTerminated: stub?.getAttribute("dateTerminated") || undefined,
      // Embed Pacer Data
      pacerData: pacerData as PacerCase
    };

    // 2. Extract Parties and Map to PacerParty
    const partyNodes = Array.from(doc.querySelectorAll("party"));
    const parties: Party[] = partyNodes.map((p, idx) => {
      const attorney = p.querySelector("attorney");
      const name = p.getAttribute("info") || "Unknown";
      const typeStr = p.getAttribute("type") || "";
      
      let type: 'Individual' | 'Corporation' | 'Government' = 'Individual';
      if (name.includes("Inc") || name.includes("Corp") || name.includes("LLC")) type = 'Corporation';
      
      const pacerParty: Partial<PacerParty> = {
          lastName: name, // Simplified mapping
          partyRole: typeStr.trim(),
      };
      
      return {
        // FIX: Cast string to branded type PartyId
        id: `p-xml-${idx}` as PartyId,
        name: name,
        role: typeStr.trim(),
        contact: attorney?.getAttribute("email") || attorney?.getAttribute("personalPhone") || "",
        type: type,
        counsel: attorney ? `${attorney.getAttribute("firstName") || ''} ${attorney.getAttribute("lastName") || ''}`.trim() : undefined,
        partyGroup: p.getAttribute("prisonerNumber") ? "Prisoner" : undefined,
        pacerData: pacerParty as PacerParty
      };
    });

    // 3. Extract Docket Entries
    const docketNodes = Array.from(doc.querySelectorAll("docketText"));
    const docketEntries: DocketEntry[] = docketNodes.map((dt, idx) => {
      const text = dt.getAttribute("text") || "";
      const date = dt.getAttribute("dateFiled") || "";
      const docLink = dt.getAttribute("docLink") || undefined;
      
      // Determine Type Heuristically
      let type: DocketEntryType = 'Filing';
      if (text.toUpperCase().includes("ORDER")) type = 'Order';
      else if (text.toUpperCase().includes("NOTICE")) type = 'Notice';
      else if (text.toUpperCase().includes("MINUTE")) type = 'Minute Entry';
      else if (text.toUpperCase().includes("EXHIBIT")) type = 'Exhibit';

      // Extract Sequence Number via Regex if present e.g. [123]
      const seqMatch = text.match(/\[(\d+)\]/);
      const seq = seqMatch ? parseInt(seqMatch[1]) : idx + 1;

      return {
        // FIX: Cast string to branded type DocketId
        id: `dk-xml-${idx}` as DocketId,
        sequenceNumber: seq,
        caseId: caseInfo.id || ("Unknown" as CaseId),
        date: date,
        type: type,
        title: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
        description: text,
        filedBy: text.toLowerCase().includes("plaintiff") || text.toLowerCase().includes("appellant") ? "Appellant/Plaintiff" : 
                 text.toLowerCase().includes("defendant") || text.toLowerCase().includes("appellee") ? "Appellee/Defendant" : "Court",
        docLink: docLink,
        isSealed: text.toUpperCase().includes("SEALED")
      };
    });

    return { caseInfo, parties, docketEntries };
  }
};