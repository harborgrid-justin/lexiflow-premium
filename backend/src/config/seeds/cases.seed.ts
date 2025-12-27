import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as PathsConfig from '@config/paths.config';

export async function seedCases(dataSource: DataSource): Promise<void> {
  console.log('Seeding cases...');

  const caseRepository = dataSource.getRepository('Case');
  const userRepository = dataSource.getRepository('User');
  const clientRepository = dataSource.getRepository('Client');

  // Load cases from JSON file
  const casesPath = path.join(PathsConfig.TEST_DATA_DIR, 'cases.json');
  const casesData = JSON.parse(fs.readFileSync(casesPath, 'utf-8'));

  // Check if cases already exist
  const existingCases = await caseRepository.count();
  if (existingCases > 0) {
    console.log('Cases already seeded, skipping...');
    return;
  }

  // Get all users and clients for random assignment
  const users = await userRepository.find({ where: { role: 'senior_associate' } });
  const clients = await clientRepository.find();

  if (users.length === 0 || clients.length === 0) {
    console.error('Cannot seed cases: users or clients not found');
    return;
  }

  // Insert cases
  for (const caseData of casesData) {
    try {
      // Assign random attorney and client
      const attorney = users[Math.floor(Math.random() * users.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];

      const statusMapping: Record<string, string> = {
        OPEN: 'Open',
        IN_PROGRESS: 'Active',
        CLOSED: 'Closed',
      };

      const caseEntity = caseRepository.create({
        ...caseData,
        status: statusMapping[caseData.status] || 'Open',
        assignedAttorneyId: attorney?.id,
        clientId: client?.id,
        createdAt: new Date(caseData.filingDate || Date.now()),
        updatedAt: new Date(),
      });
      await caseRepository.save(caseEntity);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error seeding case ${caseData.caseNumber}:`, message);
    }
  }

  console.log(`✓ Seeded ${casesData.length} cases`);
}
