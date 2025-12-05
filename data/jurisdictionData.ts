
// Federal Hierarchy (Existing)
export interface CourtNode {
    name: string;
    districts?: string[];
}

export const FEDERAL_CIRCUITS: CourtNode[] = [
    {
        name: "1st Circuit",
        districts: ["D. Maine", "D. Massachusetts", "D. New Hampshire", "D. Puerto Rico", "D. Rhode Island"]
    },
    {
        name: "2nd Circuit",
        districts: ["D. Connecticut", "E.D. New York", "N.D. New York", "S.D. New York", "W.D. New York", "D. Vermont"]
    },
    {
        name: "3rd Circuit",
        districts: ["D. Delaware", "D. New Jersey", "E.D. Pennsylvania", "M.D. Pennsylvania", "W.D. Pennsylvania", "D. Virgin Islands"]
    },
    {
        name: "4th Circuit",
        districts: ["D. Maryland", "E.D. North Carolina", "M.D. North Carolina", "W.D. North Carolina", "D. South Carolina", "E.D. Virginia", "W.D. Virginia", "N.D. West Virginia", "S.D. West Virginia"]
    },
    {
        name: "5th Circuit",
        districts: ["E.D. Louisiana", "M.D. Louisiana", "W.D. Louisiana", "N.D. Mississippi", "S.D. Mississippi", "E.D. Texas", "N.D. Texas", "S.D. Texas", "W.D. Texas"]
    },
    {
        name: "9th Circuit",
        districts: ["D. Alaska", "D. Arizona", "C.D. California", "E.D. California", "N.D. California", "S.D. California", "D. Hawaii", "D. Idaho", "D. Montana", "D. Nevada", "D. Oregon", "E.D. Washington", "W.D. Washington", "D. Guam", "D. N. Mariana Islands"]
    },
    {
        name: "11th Circuit",
        districts: ["M.D. Alabama", "N.D. Alabama", "S.D. Alabama", "M.D. Florida", "N.D. Florida", "S.D. Florida", "M.D. Georgia", "N.D. Georgia", "S.D. Georgia"]
    },
    {
        name: "D.C. Circuit",
        districts: ["D. District of Columbia"]
    },
    {
        name: "Federal Circuit",
        districts: ["US Court of Federal Claims", "US Court of International Trade"]
    }
];

// State Hierarchies
export interface JurisdictionDefinition {
    id: string;
    name: string;
    levels: {
        name: string; // e.g. "Supreme", "Circuit", "District", "Magistrate"
        courts: string[]; // Specific court names
    }[];
}

// Helper to generate numeric lists (e.g. "1st Judicial Circuit")
const genList = (count: number, suffix: string) => Array.from({length: count}, (_, i) => `${i + 1}${getOrdinal(i + 1)} ${suffix}`);
const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

export const STATE_JURISDICTIONS: Record<string, JurisdictionDefinition> = {
    "VA": {
        id: "VA",
        name: "Commonwealth of Virginia",
        levels: [
            {
                name: "Supreme Court",
                courts: ["Supreme Court of Virginia"]
            },
            {
                name: "Appellate Court",
                courts: ["Court of Appeals of Virginia"]
            },
            {
                name: "Circuit Court (General Jurisdiction)",
                courts: [
                    ...genList(31, "Judicial Circuit"),
                    "Fairfax Circuit Court (19th)",
                    "Alexandria Circuit Court (18th)", 
                    "Richmond Circuit Court (13th)",
                    "Norfolk Circuit Court (4th)"
                ]
            },
            {
                name: "General District Court (Limited Jurisdiction)",
                courts: [
                    ...genList(32, "Judicial District"),
                    "Fairfax General District Court",
                    "Prince William General District Court",
                    "Loudoun General District Court"
                ]
            },
            {
                name: "Juvenile & Domestic Relations",
                courts: genList(32, "J&DR District Court")
            },
            {
                name: "Magistrate System",
                courts: [
                    "Magistrate Region 1 (Southwest)",
                    "Magistrate Region 2 (Western)",
                    "Magistrate Region 3 (Southside/Central)",
                    "Magistrate Region 4 (Northern)",
                    "Magistrate Region 5 (Tidewater)",
                    "Magistrate Region 6 (Capital)",
                    "Magistrate Region 7 (Fairfax)",
                    "Magistrate Region 8 (Shenandoah)"
                ]
            }
        ]
    },
    "DC": {
        id: "DC",
        name: "District of Columbia",
        levels: [
            {
                name: "Highest Court",
                courts: ["District of Columbia Court of Appeals"]
            },
            {
                name: "Trial Court",
                courts: [
                    "Superior Court of the District of Columbia",
                    "Civil Division",
                    "Criminal Division",
                    "Family Court",
                    "Probate Division",
                    "Tax Division"
                ]
            }
        ]
    },
    "CA": {
        id: "CA",
        name: "California",
        levels: [
            { name: "Supreme Court", courts: ["Supreme Court of California"] },
            { name: "Court of Appeal", courts: genList(6, "Appellate District") },
            { name: "Superior Court", courts: ["Los Angeles County", "San Francisco County", "San Diego County", "Orange County", "Santa Clara County", "Alameda County"] }
        ]
    },
    "NY": {
        id: "NY",
        name: "New York",
        levels: [
            { name: "Court of Appeals (Highest)", courts: ["New York Court of Appeals"] },
            { name: "Appellate Division", courts: ["1st Dept", "2nd Dept", "3rd Dept", "4th Dept"] },
            { name: "Supreme Court (Trial)", courts: ["New York County", "Kings County", "Queens County", "Bronx County"] },
            { name: "Lower Courts", courts: ["NYC Civil Court", "NYC Criminal Court", "Surrogates Court", "Family Court"] }
        ]
    }
};
