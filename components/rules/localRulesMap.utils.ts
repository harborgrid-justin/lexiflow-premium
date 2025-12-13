
export const groupJurisdictionsByState = (jurisdictions: any[]): any[] => {
    const groups: Record<string, any> = {};
    const stateNames: Record<string, string> = { VA: 'Virginia', CA: 'California', NY: 'New York' }; // Lookup for demo names
    
    jurisdictions.forEach(j => {
        if (!groups[j.region]) {
            groups[j.region] = { id: j.region, name: stateNames[j.region] || j.region, levels: [] };
        }
        let level = groups[j.region].levels.find((l: any) => l.name === j.type);
        if (!level) {
            level = { name: j.type, courts: [] };
            groups[j.region].levels.push(level);
        }
        level.courts.push(j.name);
    });
    return Object.values(groups);
};
