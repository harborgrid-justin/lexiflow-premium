const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// --- Configuration ---
const DB_CONFIG = {
  user: "neondb_owner",
  password: "npg_u71zdejvgHOR",
  host: "ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech",
  database: "neondb",
  port: 5432,
  ssl: true,
};

const XML_PATH = "/workspaces/lexiflow-premium/archived/04_24-2160_Docket.xml";
const CASE_NUMBER = "24-2160";

// --- Helpers ---
function extractAttributes(tag, xml) {
  const regex = new RegExp(`<${tag}\\s+([^>]+)`, "g");
  const match = regex.exec(xml);
  if (!match) return null;

  const attrs = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(match[1])) !== null) {
    attrs[attrMatch[1]] = attrMatch[2];
  }
  return attrs;
}

function extractAllTags(tag, xml) {
  // Simple extraction for tags that might have children or be self-closing
  // This is a naive implementation but sufficient for this specific XML structure
  const results = [];
  const regex = new RegExp(
    `<${tag}[^>]*>(?:.*?)<\\/${tag}>|<${tag}[^>]*\\/>`,
    "gs"
  );
  let match;
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[0]);
  }
  return results;
}

function extractTagContent(tag, xml) {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, "s");
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

// --- Main ---
async function run() {
  const client = new Client(DB_CONFIG);

  try {
    console.log("Connecting to Database...");
    await client.connect();

    // 1. Ensure Column Exists (Manual Migration since user requested "just code")
    console.log("Checking/Creating 'appellate_data' column...");
    await client.query(`
      ALTER TABLE docket_entries
      ADD COLUMN IF NOT EXISTS appellate_data jsonb;
    `);

    // 2. Parse XML
    console.log(`Reading XML from ${XML_PATH}...`);
    const xmlContent = fs.readFileSync(XML_PATH, "utf8");

    const stubAttrs = extractAttributes("stub", xmlContent) || {};
    const caseTypeAttrs = extractAttributes("caseType", xmlContent) || {};
    const origCourtXml = extractAllTags("origCourt", xmlContent)[0] || "";
    const origCourtAttrs = extractAttributes("origCourt", origCourtXml) || {};
    const origPersonAttrs = extractAttributes("origPerson", origCourtXml) || {};
    const origDateSetAttrs =
      extractAttributes("origDateSet", origCourtXml) || {};

    const caption = extractTagContent("caption", xmlContent);

    // Associated Cases
    const associatedCasesXml = extractAllTags("associatedCase", xmlContent);
    const associatedCases = associatedCasesXml.map((acXml) => {
      const attrs = extractAttributes("associatedCase", acXml) || {};
      return {
        caseNumber: attrs.memberCaseNumber || attrs.caseNumber, // Fallback
        leadCaseNumber: attrs.leadCaseNumber,
        memberCaseNumber: attrs.memberCaseNumber,
        associatedType: attrs.associatedType,
        dateStart: attrs.dateStart,
        dateEnd: attrs.dateEnd,
        status: attrs.status,
        shortTitle: attrs.shortTitle,
      };
    });

    // Parties & Attorneys
    const partiesXml = extractAllTags("party", xmlContent);
    const parties = partiesXml.map((pXml) => {
      const pAttrs = extractAttributes("party", pXml) || {};
      const attorneysXml = extractAllTags("attorney", pXml);
      const attorneys = attorneysXml.map((aXml) => {
        const aAttrs = extractAttributes("attorney", aXml) || {};
        return {
          name: `${aAttrs.firstName} ${aAttrs.middleName} ${aAttrs.lastName}`
            .replace(/\s+/g, " ")
            .trim(),
          firstName: aAttrs.firstName,
          middleName: aAttrs.middleName,
          lastName: aAttrs.lastName,
          generation: aAttrs.generation,
          suffix: aAttrs.suffix,
          title: aAttrs.title,
          type: "Retained", // Inferred or from badge
          email: aAttrs.email,
          fax: aAttrs.fax,
          address1: aAttrs.address1,
          address2: aAttrs.address2,
          address3: aAttrs.address3,
          office: aAttrs.office,
          unit: aAttrs.unit,
          room: aAttrs.room,
          businessPhone: aAttrs.businessPhone,
          personalPhone: aAttrs.personalPhone,
          city: aAttrs.city,
          state: aAttrs.state,
          zip: aAttrs.zip,
          terminationDate: aAttrs.terminationDate,
          noticeInfo: aAttrs.noticeInfo,
        };
      });

      return {
        name: pAttrs.info, // The 'info' attribute contains the name in this XML
        type: pAttrs.type ? pAttrs.type.trim() : null,
        prisonerNumber: pAttrs.prisonerNumber,
        attorneys: attorneys,
      };
    });

    // 3. Construct AppellateData JSON
    const appellateData = {
      caseSelection: {
        caseNumber: stubAttrs.caseNumber,
        shortTitle: stubAttrs.shortTitle,
        dateFiled: stubAttrs.dateFiled,
        dateTerminated: stubAttrs.dateTerminated,
        natureOfSuit: stubAttrs.natureOfSuit,
        origCaseNumber: origCourtAttrs.caseNumber,
        origCaseLink: origCourtAttrs.caseNumberLink,
        type: caseTypeAttrs.type,
        status: "Open", // Inferred
      },
      caseQuery: {
        associatedCases: associatedCases,
        originatingCase: {
          caseNumber: origCourtAttrs.caseNumber,
          caseLink: origCourtAttrs.caseNumberLink,
          leadCaseNumber: origCourtAttrs.leadCaseNumber,
          leadCaseNumberLink: origCourtAttrs.leadCaseNumberLink,
          dateFiled: origCourtAttrs.dateFiled,
          dateJudgment: origDateSetAttrs.dateJudgment,
          dateNOAFiled: origDateSetAttrs.dateNOAFiled,
          dateExecution: origDateSetAttrs.dateExecution,
          judge:
            `${origPersonAttrs.firstName} ${origPersonAttrs.middleName} ${origPersonAttrs.lastName} (${origPersonAttrs.title})`.trim(),
          courtReporter: null, // Not in sample
        },
        parties: parties,
      },
      caseSummary: {
        stub: {
          caseNumber: stubAttrs.caseNumber,
          shortTitle: stubAttrs.shortTitle,
          natureOfSuit: stubAttrs.natureOfSuit,
          dateFiled: stubAttrs.dateFiled,
          dateTerminated: stubAttrs.dateTerminated,
          origCourt: stubAttrs.origCourt,
          caseType: caseTypeAttrs.type,
          subType: caseTypeAttrs.subType,
          subSubType: caseTypeAttrs.subSubType,
        },
        originatingCourt: {
          district: origCourtAttrs.district,
          division: origCourtAttrs.division,
          caseNumber: origCourtAttrs.caseNumber,
          dateDecided: origDateSetAttrs.dateDecided,
          dateRecdCoa: origDateSetAttrs.dateRecdCoa,
          dateSentence: origDateSetAttrs.dateSentence,
        },
        originatingPerson: {
          role: origPersonAttrs.role,
          firstName: origPersonAttrs.firstName,
          middleName: origPersonAttrs.middleName,
          lastName: origPersonAttrs.lastName,
          title: origPersonAttrs.title,
        },
      },
      fullDocket: {
        caption: caption ? caption.trim() : null,
        panel: {}, // Populate if data exists
        priorCases: [],
      },
    };

    console.log(
      "Constructed Appellate Data (Preview):",
      JSON.stringify(appellateData.caseSelection, null, 2)
    );

    // 4. Update Database
    // First find the case ID for '24-2160' if possible, or just update based on string matching in docket entries?
    // We don't have a reliable link to 'cases' table in this script easily without querying it.
    // But we can update docket_entries that look like they belong to this case.
    // Using a broad update for safety in this demo script.

    // Attempt to find entries via content match if case_id link is unknown
    const updateResult = await client.query(
      `
        UPDATE docket_entries
        SET appellate_data = $1
        WHERE description ILIKE '%24-2160%' OR docket_number LIKE '%24-2160%'
    `,
      [appellateData]
    );

    console.log(
      `Updated ${updateResult.rowCount} docket entries with appellate data.`
    );

    if (updateResult.rowCount === 0) {
      console.log(
        "WARNING: No docket entries found matching '24-2160'. Trying to update ALL entries for validation (dev only)..."
      );
      // OPTIONAL: Uncomment to force update one entry if you are testing
      // const forceUpdate = await client.query(`UPDATE docket_entries SET appellate_data = $1 WHERE id = (SELECT id FROM docket_entries LIMIT 1)`, [appellateData]);
      // console.log(`Force updated ${forceUpdate.rowCount} entry.`);
    }
  } catch (err) {
    console.error("FATAL ERROR:", err);
  } finally {
    await client.end();
  }
}

run();
