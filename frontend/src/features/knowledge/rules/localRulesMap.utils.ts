export interface Jurisdiction {
    region: string;
    type: string;
    name: string;
}

export interface CourtLevel {
    name: string;
    courts: string[];
}

export interface StateGroup {
    id: string;
    name: string;
    levels: CourtLevel[];
}

export const groupJurisdictionsByState = (jurisdictions: Jurisdiction[]): StateGroup[] => {
    const groups: Record<string, StateGroup> = {};
    const stateNames: Record<string, string> = { VA: 'Virginia', CA: 'California', NY: 'New York' }; // Lookup for demo names

    jurisdictions.forEach(j => {
        if (!groups[j.region]) {
            groups[j.region] = { id: j.region, name: stateNames[j.region] || j.region, levels: [] };
        }
        let level = groups[j.region].levels.find((l: CourtLevel) => l.name === j.type);
        if (!level) {
            level = { name: j.type, courts: [] };
            groups[j.region].levels.push(level);
        }
        level.courts.push(j.name);
    });
    return Object.values(groups);
};
