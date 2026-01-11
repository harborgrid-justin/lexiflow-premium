import { DataSource } from "typeorm";
import * as fs from "fs";
import * as path from "path";
import * as PathsConfig from "@config/paths.config";

export async function seedDocuments(dataSource: DataSource): Promise<void> {
  console.log("Seeding documents...");

  const documentRepository = dataSource.getRepository("Document");
  const caseRepository = dataSource.getRepository("Case");
  const userRepository = dataSource.getRepository("User");

  // Load documents from JSON file
  const documentsPath = path.join(PathsConfig.TEST_DATA_DIR, "documents.json");
  const documentsData = JSON.parse(
    fs.readFileSync(documentsPath, "utf-8")
  ) as Array<Record<string, unknown>>;

  // Check if documents already exist
  const existingDocuments = await documentRepository.count();
  if (existingDocuments > 0) {
    console.log("Documents already seeded, skipping...");
    return;
  }

  // Get all cases and users for assignment
  const cases = await caseRepository.find();
  const users = await userRepository.find();

  if (cases.length === 0 || users.length === 0) {
    console.error("Cannot seed documents: cases or users not found");
    return;
  }

  // Create a map of case numbers to case IDs
  const caseMap = new Map();
  cases.forEach((c) => caseMap.set(c.caseNumber, c.id));

  // Insert documents
  for (const documentData of documentsData) {
    try {
      const caseId = caseMap.get(String(documentData.caseNumber));
      const uploadedBy = users[Math.floor(Math.random() * users.length)];

      // Convert uppercase enum string from JSON to title-case to match the entity enum
      const toTitleCase = (str: string) =>
        str.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      const documentType = toTitleCase(
        String(documentData.documentType || "Document")
      );

      const document = documentRepository.create({
        ...documentData,
        type: documentType,
        caseId,
        creatorId: uploadedBy?.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await documentRepository.save(document);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `Error seeding document ${String(documentData.title || "unknown")}:`,
        message
      );
    }
  }

  const documentCount = Array.isArray(documentsData) ? documentsData.length : 0;
  console.log(`✓ Seeded ${documentCount} documents`);
}
