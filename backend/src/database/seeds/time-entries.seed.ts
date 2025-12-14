import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export async function seedTimeEntries(dataSource: DataSource): Promise<void> {
  console.log('Seeding time entries...');

  const timeEntryRepository = dataSource.getRepository('TimeEntry');
  const caseRepository = dataSource.getRepository('Case');
  const userRepository = dataSource.getRepository('User');

  // Load time entries from JSON file
  const timeEntriesPath = path.join(__dirname, 'test-data', 'time-entries.json');
  const timeEntriesData = JSON.parse(fs.readFileSync(timeEntriesPath, 'utf-8'));

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
      const caseId = caseMap.get(timeEntryData.caseNumber);
      const userId = userMap.get(timeEntryData.userEmail);

      if (!caseId) {
        console.warn(`Case ${timeEntryData.caseNumber} not found for time entry`);
        continue;
      }

      if (!userId) {
        console.warn(`User ${timeEntryData.userEmail} not found for time entry`);
        continue;
      }

      const timeEntry = timeEntryRepository.create({
        description: timeEntryData.description,
        duration: timeEntryData.hours,
        rate: timeEntryData.billableRate,
        total: timeEntryData.hours * timeEntryData.billableRate,
        date: new Date(timeEntryData.date).toISOString().split('T')[0],
        billable: timeEntryData.isBillable,
        activity: timeEntryData.taskType,
        caseId,
        userId,
        createdAt: new Date(timeEntryData.date),
        updatedAt: new Date(),
      });
      await timeEntryRepository.save(timeEntry);
    } catch (error) {
      console.error(`Error seeding time entry:`, error.message);
    }
  }

  console.log(`✓ Seeded ${timeEntriesData.length} time entries`);
}
