
import { CaseStatus, DocketEntry, DocketEntryType, Party, Case, CaseId, PartyId, DocketId } from "../types";
import { PacerCase, PacerParty, PacerJurisdictionType } from "../types/pacer";
import { yieldToMain } from "../utils/apiUtils";

export const XmlDocketParser = {
  parse: async (xmlString: string): Promise<{ 
    caseInfo: Partial<Case>, 
    parties: Party[], 
    docketEntries: DocketEntry[] 
  }> => {
    // Note: DOMParser is synchronous, but for very large strings we might still block here.
    // In a real browser environment, there is no async streaming XML parser standard readily available without libs.
    // We assume the XML string load itself isn't the blocker, but the traversal is.
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    // 1. Extract Case Info
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
      id: (pacerData.caseNumberFull || "Unknown ID") as CaseId,
      filingDate: pacerData.dateFiled || "",
      court: pacerData.courtId || "Federal Court",
      status: pacerData.caseStatus === 'C' ? CaseStatus.Closed : CaseStatus.Discovery,
      matterType: pacerData.jurisdictionType === 'ap' ? 'Appeal' : 'Litigation',
      description: `Imported via XML. NOS: ${pacerData.natureOfSuit}`,
      jurisdiction: "Federal",
      dateTerminated: stub?.getAttribute("dateTerminated") || undefined,
      pacerData: pacerData as PacerCase
    };

    // 2. Extract Parties
    const partyNodes = Array.from(doc.querySelectorAll("party"));
    const parties: Party[] = [];
    
    for (let i = 0; i < partyNodes.length; i++) {
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
        name: name,
        role: typeStr.trim(),
        contact: attorney?.getAttribute("email") || attorney?.getAttribute("personalPhone") || "",
        type: type,
        counsel: attorney ? `${attorney.getAttribute("firstName") || ''} ${attorney.getAttribute("lastName") || ''}`.trim() : undefined,
        partyGroup: p.getAttribute("prisonerNumber") ? "Prisoner" : undefined,
        pacerData: pacerParty as PacerParty
      });

      // Yield every 50 parties to avoid blocking
      if (i % 50 === 0) await yieldToMain();
    }

    // 3. Extract Docket Entries
    const docketNodes = Array.from(doc.querySelectorAll("docketText"));
    const docketEntries: DocketEntry[] = [];
    
    for (let i = 0; i < docketNodes.length; i++) {
      const dt = docketNodes[i];
      const text = dt.getAttribute("text") || "";
      const date = dt.getAttribute("dateFiled") || "";
      const docLink = dt.getAttribute("docLink") || undefined;
      
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
        date: date,
        type: type,
        title: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
        description: text,
        filedBy: text.toLowerCase().includes("plaintiff") || text.toLowerCase().includes("appellant") ? "Appellant/Plaintiff" : 
                 text.toLowerCase().includes("defendant") || text.toLowerCase().includes("appellee") ? "Appellee/Defendant" : "Court",
        docLink: docLink,
        isSealed: text.toUpperCase().includes("SEALED")
      });

      // Yield every 50 entries
      if (i % 50 === 0) await yieldToMain();
    }

    return { caseInfo, parties, docketEntries };
  }
};
