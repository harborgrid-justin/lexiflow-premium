// FIX: Add necessary types and data transformations to make this file a module and provide required data structures.
import { MOCK_JURISDICTIONS } from './models/jurisdiction';

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


// FIX: Define and export types for state jurisdiction data.
export interface StateJurisdictionLevel {
  name: string;
  courts: string[];
}
export interface StateJurisdiction {
  id: string;
  name: string;
  levels: StateJurisdictionLevel[];
}

// FIX: Transform MOCK_JURISDICTIONS into the expected STATE_JURISDICTIONS structure.
const stateCourts = MOCK_JURISDICTIONS.filter(j => j.system === 'State');
const stateNames: Record<string, string> = {
    VA: 'Virginia',
    CA: 'California',
    NY: 'New York',
};

export const STATE_JURISDICTIONS: Record<string, StateJurisdiction> = stateCourts.reduce((acc, court) => {
    const stateId = court.region;
    if (!acc[stateId]) {
        acc[stateId] = {
            id: stateId,
            name: stateNames[stateId] || stateId,
            levels: []
        };
    }
    let level = acc[stateId].levels.find(l => l.name === court.type);
    if (!level) {
        level = { name: court.type, courts: [] };
        acc[stateId].levels.push(level);
    }
    level.courts.push(court.name);
    return acc;
}, {} as Record<string, StateJurisdiction>);
