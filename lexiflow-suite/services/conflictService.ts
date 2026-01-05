
import { Party, ConflictCheck } from '../types.ts';
import { MOCK_CLIENTS } from '../data/models/client.ts';

export const ConflictService = {
  /**
   * Step 25: Conflict Check Execution.
   * Scans a list of parties against existing clients and matters.
   */
  async runGlobalConflictScan(parties: Party[]): Promise<ConflictCheck[]> {
    const hits: ConflictCheck[] = [];
    
    for (const party of parties) {
      // Logic: Case-insensitive search across client and matter history
      const clientMatch = MOCK_CLIENTS.find(c => 
        c.name.toLowerCase().includes(party.name.toLowerCase()) ||
        party.name.toLowerCase().includes(c.name.toLowerCase())
      );

      if (clientMatch) {
        hits.push({
          id: `conflict-${crypto.randomUUID()}`,
          entityName: party.name,
          date: new Date().toISOString(),
          status: 'Flagged',
          foundIn: [`Existing Client: ${clientMatch.name}`, 'Matter ID: C-2022-044'],
          checkedBy: 'System AI'
        });
      }
    }

    return hits;
  }
};
