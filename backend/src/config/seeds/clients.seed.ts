import { DataSource } from "typeorm";
import * as fs from "fs";
import * as path from "path";
import * as PathsConfig from "@config/paths.config";

export async function seedClients(dataSource: DataSource): Promise<void> {
  console.log("Seeding clients...");

  const clientRepository = dataSource.getRepository("Client");

  // Load clients from JSON file
  const clientsPath = path.join(PathsConfig.TEST_DATA_DIR, "clients.json");
  const clientsData = JSON.parse(
    fs.readFileSync(clientsPath, "utf-8")
  ) as Array<
    Record<string, unknown> & {
      clientType: string;
      firstName: string;
      lastName: string;
      companyName: string;
    }
  >;

  // Check if clients already exist
  const existingClients = await clientRepository.count();
  if (existingClients > 0) {
    console.log("Clients already seeded, skipping...");
    return;
  }

  // Insert clients
  let clientCounter = 1;
  for (const clientData of clientsData) {
    try {
      const name =
        clientData.clientType === "individual"
          ? `${clientData.firstName} ${clientData.lastName}`
          : clientData.companyName;

      const client = clientRepository.create({
        ...clientData,
        name,
        clientNumber: `C${String(new Date().getFullYear()).slice(-2)}${String(
          clientCounter++
        ).padStart(4, "0")}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await clientRepository.save(client);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error seeding client:`, message);
    }
  }

  console.log(`✓ Seeded ${clientsData.length} clients`);
}
