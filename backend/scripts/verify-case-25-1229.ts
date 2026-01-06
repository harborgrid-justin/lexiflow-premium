import { NestFactory } from "@nestjs/core";
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module"; // Adjust path if necessary
import { Case } from "../src/cases/entities/case.entity";
import { DocketEntry } from "../src/docket/entities/docket-entry.entity";
import { Party } from "../src/parties/entities/party.entity";

async function verify() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // Ensure we get the DataSource that NestJS configured
  const dataSource = app.get(DataSource);

  try {
    console.log("Connected to database via NestJS context.");

    const caseNumber = "25-1229";
    const caseRepo = dataSource.getRepository(Case);
    const partyRepo = dataSource.getRepository(Party);
    const docketRepo = dataSource.getRepository(DocketEntry);

    // 1. Check Case
    const caseEntity = await caseRepo.findOne({
      where: { caseNumber },
    });

    if (!caseEntity) {
      console.error(`❌ Case ${caseNumber} not found!`);
      return;
    }

    console.log(`✅ Case found: ${caseEntity.title}`);
    console.log(`   Status: ${caseEntity.status}`);
    console.log(`   Originating Case: ${caseEntity.originatingCaseNumber}`);

    if (caseEntity.status !== "Consolidated") {
      console.warn(
        `⚠️ Warning: Case status is ${caseEntity.status}, expected 'Consolidated'`
      );
    }

    // 2. Check Parties and Counsels
    const parties = await partyRepo.find({
      where: { caseId: caseEntity.id },
      relations: ["counsels"],
    });

    console.log(`\n✅ Found ${parties.length} parties.`);
    parties.forEach((p) => {
      console.log(`   - ${p.name} (${p.type})`);
      if (p.counsels && p.counsels.length > 0) {
        console.log(
          `     Represented by: ${p.counsels.map((c) => `${c.firstName} ${c.lastName}`).join(", ")}`
        );
      } else {
        console.log(`     (No counsel linked)`);
      }
    });

    // 3. Check Docket Entries
    const docketEntries = await docketRepo.find({
      where: { caseId: caseEntity.id },
      order: { sequenceNumber: "ASC" }, // or dateFiled
    });

    console.log(`\n✅ Found ${docketEntries.length} docket entries.`);
    // Sample check of first and last
    if (docketEntries.length > 0) {
      const first = docketEntries[0];
      const last = docketEntries[docketEntries.length - 1];

      if (first) {
        console.log(
          `   First entry: ${first.dateFiled} - ${first.description ? first.description.substring(0, 50) : ""}...`
        );
      }
      if (last) {
        console.log(
          `   Last entry: ${last.dateFiled} - ${last.description ? last.description.substring(0, 50) : ""}...`
        );
      }
    }
  } catch (error) {
    console.error("Error during verification:", error);
  } finally {
    await app.close();
  }
}

verify();
