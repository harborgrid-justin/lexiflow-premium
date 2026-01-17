/**
 * Federal Court Hierarchy Data
 * Defines the structure of US Federal Court system
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.jurisdiction.getFederalHierarchy() instead.
 * This constant is only for seeding and testing purposes.
 */

import { MOCK_JURISDICTIONS } from './jurisdiction';

/**
 * Represents a court node in the federal hierarchy
 * @property name - Official circuit or court name
 * @property districts - Optional array of district court names within the circuit
 */
export type CourtNode = {
    readonly name: string;
    readonly districts?: readonly string[];
};

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
        name: "6th Circuit",
        districts: ["E.D. Kentucky", "W.D. Kentucky", "E.D. Michigan", "W.D. Michigan", "N.D. Ohio", "S.D. Ohio", "E.D. Tennessee", "M.D. Tennessee", "W.D. Tennessee"]
    },
    {
        name: "7th Circuit",
        districts: ["C.D. Illinois", "N.D. Illinois", "S.D. Illinois", "N.D. Indiana", "S.D. Indiana", "E.D. Wisconsin", "W.D. Wisconsin"]
    },
    {
        name: "8th Circuit",
        districts: ["E.D. Arkansas", "W.D. Arkansas", "N.D. Iowa", "S.D. Iowa", "D. Minnesota", "E.D. Missouri", "W.D. Missouri", "D. Nebraska", "D. North Dakota", "D. South Dakota"]
    },
    {
        name: "9th Circuit",
        districts: ["D. Alaska", "D. Arizona", "C.D. California", "E.D. California", "N.D. California", "S.D. California", "D. Hawaii", "D. Idaho", "D. Montana", "D. Nevada", "D. Oregon", "E.D. Washington", "W.D. Washington", "D. Guam", "D. N. Mariana Islands"]
    },
    {
        name: "10th Circuit",
        districts: ["D. Colorado", "D. Kansas", "D. New Mexico", "E.D. Oklahoma", "N.D. Oklahoma", "W.D. Oklahoma", "D. Utah", "D. Wyoming"]
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

export const getCourtHierarchy = () => {
    return {
        levels: ["Supreme Court", "Court of Appeals", "District Court", "Bankruptcy Court"],
        circuits: FEDERAL_CIRCUITS
    };
};


/**
 * Represents a level in state court hierarchy (e.g., Supreme, Appellate, Trial)
 */
export type StateJurisdictionLevel = {
  readonly name: string;
  readonly courts: readonly string[];
};

/**
 * Represents a complete state court system
 * @property id - Two-letter state code (e.g., 'CA', 'NY')
 * @property name - Full state name
 * @property levels - Hierarchical court structure from highest to lowest
 */
export type StateJurisdiction = {
  readonly id: string;
  readonly name: string;
  readonly levels: readonly StateJurisdictionLevel[];
};

const stateCourts = MOCK_JURISDICTIONS.filter((j) => j.system === 'State');
const stateNames: Record<string, string> = {
    VA: 'Virginia',
    CA: 'California',
    NY: 'New York',
};

export const STATE_JURISDICTIONS: Record<string, StateJurisdiction> = stateCourts.reduce((acc: Record<string, StateJurisdiction>, court: typeof MOCK_JURISDICTIONS[number]) => {
    const stateId = court.region;
    if (!acc[stateId]) {
        acc[stateId] = {
            id: stateId,
            name: stateNames[stateId] || stateId,
            levels: []
        };
    }
    const levels = acc[stateId].levels as unknown as StateJurisdictionLevel[];
    let level = levels.find((l) => l.name === court.type);
    if (!level) {
        level = { name: court.type, courts: [] };
        (levels as unknown as StateJurisdictionLevel[]).push(level);
    }
    (level.courts as unknown as string[]).push(court.name);
    return acc;
}, {} as Record<string, StateJurisdiction>)
