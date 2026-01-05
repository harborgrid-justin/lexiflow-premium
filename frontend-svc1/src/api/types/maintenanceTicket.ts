/**
 * Maintenance Ticket Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.operations.getTickets() instead.
 * This constant is only for seeding and testing purposes.
 */

/**
 * @deprecated MOCK DATA - Use DataService.operations instead
 */
export const MOCK_MAINTENANCE_TICKETS = [
    { id: 'T-101', loc: 'NY Office', issue: 'HVAC Failure in Conf Room B', priority: 'High', status: 'Open', date: 'Today' },
    { id: 'T-102', loc: 'DC Office', issue: 'Replace Keycard Reader', priority: 'Medium', status: 'In Progress', date: 'Yesterday' },
    { id: 'T-103', loc: 'SF Office', issue: 'Coffee Machine Service', priority: 'Low', status: 'Closed', date: '2 days ago' },
];
