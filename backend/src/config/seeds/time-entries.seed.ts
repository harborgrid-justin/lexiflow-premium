import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as PathsConfig from '@config/paths.config';

export async function seedTimeEntries(dataSource: DataSource): Promise<void> {
  console.log('Seeding time entries...');

  const timeEntryRepository = dataSource.getRepository('TimeEntry');
  const caseRepository = dataSource.getRepository('Case');
  const userRepository = dataSource.getRepository('User');

  // Load time entries from JSON file
  const timeEntriesPath = path.join(PathsConfig.TEST_DATA_DIR, 'time-entries.json');
  const timeEntriesData = JSON.parse(fs.readFileSync(timeEntriesPath, 'utf-8')) as Array<Record<string, unknown>>;

  // Check if time entries already exist
  const existingTimeEntries = await timeEntryRepository.count();
  if (existingTimeEntries > 0) {
    console.log('Time entries already seeded, skipping...');
    return;
  }

  // Get all cases and users for assignment
  const cases = await caseRepository.find();
  const users = await userRepository.find();

  if (cases.length === 0 || users.length === 0) {
    console.error('Cannot seed time entries: cases or users not found');
    return;
  }

  // Create maps for quick lookup
  const caseMap = new Map();
  cases.forEach((c) => caseMap.set(c.caseNumber, c.id));

  const userMap = new Map();
  users.forEach((u) => userMap.set(u.email, u.id));

  // Insert time entries
  for (const timeEntryData of timeEntriesData) {
    try {
      const caseId = caseMap.get(String(timeEntryData.caseNumber));
      const userId = userMap.get(String(timeEntryData.userEmail));

      if (!caseId) {
        console.warn(`Case ${String(timeEntryData.caseNumber)} not found for time entry`);
        continue;
      }

      if (!userId) {
        console.warn(`User ${String(timeEntryData.userEmail)} not found for time entry`);
        continue;
      }

      const hours = Number(timeEntryData.hours) || 0;
      const billableRate = Number(timeEntryData.billableRate) || 0;
      const entryDate = String(timeEntryData.date);

      const timeEntry = timeEntryRepository.create({
        description: String(timeEntryData.description || ''),
        duration: hours,
        rate: billableRate,
        total: hours * billableRate,
        date: new Date(entryDate).toISOString().split('T')[0],
        billable: Boolean(timeEntryData.isBillable),
        activity: String(timeEntryData.taskType || ''),
        caseId,
        userId,
        createdAt: new Date(entryDate),
        updatedAt: new Date(),
      });
      await timeEntryRepository.save(timeEntry);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error seeding time entry:`, message);
    }
  }

  const timeEntryCount = Array.isArray(timeEntriesData) ? timeEntriesData.length : 0;
  console.log(`✓ Seeded ${timeEntryCount} time entries`);
}
