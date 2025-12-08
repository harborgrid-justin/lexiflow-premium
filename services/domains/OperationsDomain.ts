import { db, STORES } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const OperationsService = {
    // Existing
    getOkrs: async () => db.getAll(STORES.OKRS),
    
    // New
    getCleTracking: async () => db.getAll(STORES.CLE_TRACKING),
    getVendorContracts: async () => db.getAll(STORES.VENDOR_CONTRACTS),
    getRfps: async () => db.getAll(STORES.RFPS),
    getMaintenanceTickets: async () => db.getAll(STORES.MAINTENANCE_TICKETS),
    getFacilities: async () => db.getAll(STORES.FACILITIES),
};
