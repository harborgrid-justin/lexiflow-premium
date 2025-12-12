import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export async function seedClients(dataSource: DataSource): Promise<void> {
  console.log('Seeding clients...');

  const clientRepository = dataSource.getRepository('Client');

  // Load clients from JSON file
  const clientsPath = path.join(__dirname, 'test-data', 'clients.json');
  const clientsData = JSON.parse(fs.readFileSync(clientsPath, 'utf-8'));

  // Check if clients already exist
  const existingClients = await clientRepository.count();
  if (existingClients > 0) {
    console.log('Clients already seeded, skipping...');
    return;
  }

  // Insert clients
  for (const clientData of clientsData) {
    try {
      const client = clientRepository.create({
        ...clientData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await clientRepository.save(client);
    } catch (error) {
      console.error(`Error seeding client ${clientData.email}:`, error.message);
    }
  }

  console.log(`✓ Seeded ${clientsData.length} clients`);
}
