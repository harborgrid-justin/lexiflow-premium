
import { CaseStatus, DocketEntry, DocketEntryType, Party, Case } from "../types.ts";

export const XmlDocketParser = {
  parse: (xmlString: string): { 
    caseInfo: Partial<Case>, 
    parties: Party[], 
    docketEntries: DocketEntry[] 
  } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    // 1. Extract Case Info (Step 11)
    const stub = doc.querySelector("stub");
    const caseTypeNode = doc.querySelector("caseType");
    const natureOfSuit = stub?.getAttribute("natureOfSuit") || "";

    const caseInfo: Partial<Case> = {
      title: stub?.getAttribute("shortTitle") || "Unknown Case",
      id: stub?.getAttribute("caseNumber") || "Unknown ID",
      filingDate: stub?.getAttribute("dateFiled") || "",
      court: stub?.getAttribute("origCourt") || "",
      status: stub?.getAttribute("dateTerminated") ? CaseStatus.Closed : CaseStatus.Discovery,
      matterType: 'Litigation', 
      description: stub?.getAttribute("natureOfSuit") || "Imported via XML",
      jurisdiction: "Federal",
      natureOfSuit: natureOfSuit
    };

    // 2. Extract Parties & Attorneys (Step 11/12)
    const partyNodes = Array.from(doc.querySelectorAll("party"));
    const parties: Party[] = partyNodes.map((p, idx) => {
      const attorney = p.querySelector("attorney");
      const name = p.getAttribute("info") || "Unknown";
      const typeStr = p.getAttribute("type") || "";
      
      // Step 12: Data Normalization for Entity Type
      let type: 'Individual' | 'Corporation' | 'Government' = 'Individual';
      const normName = name.toUpperCase();
      if (normName.includes("INC") || normName.includes("CORP") || normName.includes("LLC") || normName.includes("LTD")) {
        type = 'Corporation';
      } else if (normName.includes("STATES") || normName.includes("DEPARTMENT") || normName.includes("AGENCY")) {
        type = 'Government';
      }
      
      return {
        id: `p-xml-${idx}`,
        name: name,
        role: typeStr.trim() || 'Unknown',
        contact: attorney?.getAttribute("email") || "",
        type: type,
        counsel: attorney ? `${attorney.getAttribute("firstName")} ${attorney.getAttribute("lastName")}` : undefined,
        partyGroup: p.getAttribute("prisonerNumber") ? "Prisoner" : undefined
      };
    });

    // 3. Extract Docket Entries (Step 15)
    const docketNodes = Array.from(doc.querySelectorAll("docketText"));
    const docketEntries: DocketEntry[] = docketNodes.map((dt, idx) => {
      const text = dt.getAttribute("text") || "";
      const date = dt.getAttribute("dateFiled") || "";
      const docLink = dt.getAttribute("docLink") || undefined;
      
      // Heuristic Type Detection (Step 15)
      let type: DocketEntryType = 'Filing';
      const normText = text.toUpperCase();
      if (normText.includes("ORDER")) type = 'Order';
      else if (normText.includes("NOTICE")) type = 'Notice';
      else if (normText.includes("MINUTE")) type = 'Minute Entry';
      else if (normText.includes("EXHIBIT")) type = 'Exhibit';
      else if (normText.includes("HEARING")) type = 'Hearing';

      const seqMatch = text.match(/\[(\d+)\]/);
      const seq = seqMatch ? parseInt(seqMatch[1]) : idx + 1;

      return {
        id: `dk-xml-${idx}`,
        sequenceNumber: seq,
        caseId: caseInfo.id || "Unknown",
        date: date,
        type: type,
        title: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
        description: text,
        filedBy: normText.includes("PLAINTIFF") || normText.includes("APPELLANT") ? "Plaintiff" : 
                 normText.includes("DEFENDANT") || normText.includes("APPELLEE") ? "Defendant" : "Court",
        docLink: docLink,
        isSealed: normText.includes("SEALED")
      };
    });

    return { caseInfo, parties, docketEntries };
  }
};
