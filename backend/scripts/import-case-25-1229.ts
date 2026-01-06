import { NestFactory } from "@nestjs/core";
import * as fs from "fs";
import * as path from "path";
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import { Case, CaseStatus, CaseType } from "../src/cases/entities/case.entity";
import {
  DocketEntry,
  DocketEntryType,
} from "../src/docket/entities/docket-entry.entity";
import { Counsel } from "../src/parties/entities/counsel.entity";
import {
  Party,
  PartyRole,
  PartyType,
} from "../src/parties/entities/party.entity";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log("Connected to database. Starting import...");

  // Load JSON Data
  const dataPath = path.join(__dirname, "data", "case-25-1229.json");
  const caseData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  // 1. Create Case
  const casesRepo = dataSource.getRepository(Case);
  let caseEntity = await casesRepo.findOne({
    where: { caseNumber: caseData.caseNumber },
  });

  if (caseEntity) {
    console.log(`Case ${caseData.caseNumber} already exists. Updating...`);
  } else {
    caseEntity = new Case();
    caseEntity.caseNumber = caseData.caseNumber;
  }

  caseEntity.title = caseData.title;
  caseEntity.court = caseData.court;
  caseEntity.filingDate = new Date(caseData.filingDate);
  // Handle status enum mapping or default
  caseEntity.status = CaseStatus.CONSOLIDATED;
  caseEntity.type = CaseType.BANKRUPTCY;

  caseEntity.originatingCourt = caseData.originatingCourt;
  caseEntity.originatingCaseNumber = caseData.originatingCaseNumber;
  caseEntity.originatingCaseInfo = caseData.originatingCaseInfo;
  caseEntity.relatedCases = caseData.relatedCases;

  await casesRepo.save(caseEntity);
  console.log(`Case saved: ${caseEntity.id}`);

  // 2. Create Parties and Counsels
  const partyRepo = dataSource.getRepository(Party);
  const counselRepo = dataSource.getRepository(Counsel);

  for (const p of caseData.parties) {
    let party = await partyRepo.findOne({
      where: { caseId: caseEntity.id, name: p.name },
    });
    if (!party) {
      party = new Party();
      party.case = caseEntity;
      party.name = p.name;
    }

    party.type =
      p.type === "Appellant"
        ? PartyType.APPELLANT
        : p.type === "Appellee"
          ? PartyType.APPELLEE
          : PartyType.OTHER;
    party.role =
      p.role === "Appellant"
        ? PartyRole.APPELLANT
        : p.role === "Appellee"
          ? PartyRole.APPELLEE
          : PartyRole.INTERESTED_PARTY;
    party.description = p.description;
    party.isProSe = !!p.isProSe;

    // Handle Counsels
    const counsels: Counsel[] = [];

    // Single attorney (Pro Se)
    if (p.attorney) {
      const att = p.attorney;
      let counsel = await counselRepo.findOne({ where: { email: att.email } });
      if (!counsel && att.email) {
        counsel = new Counsel();
        counsel.firstName = att.firstName;
        counsel.middleName = att.middleName;
        counsel.lastName = att.lastName;
        counsel.email = att.email;
        counsel.phone = att.phone;
        counsel.address = att.address;
        counsel.city = att.city;
        counsel.state = att.state;
        counsel.zipCode = att.zipCode;
        counsel.appearance = att.appearance;
        await counselRepo.save(counsel);
      }
      if (counsel) counsels.push(counsel);
    }

    // Multiple attorneys
    if (p.attorneys) {
      for (const att of p.attorneys) {
        let counsel = null;
        if (att.email) {
          counsel = await counselRepo.findOne({
            where: { email: att.email },
          });
        }

        if (!counsel) {
          // Fallback check by name if no email or email match failed
          counsel = await counselRepo.findOne({
            where: {
              firstName: att.firstName,
              lastName: att.lastName,
            },
          });
        }

        if (!counsel) counsel = new Counsel(); // Create new if still not found

        // Update/Set fields
        counsel.firstName = att.firstName;
        counsel.middleName = att.middleName;
        counsel.lastName = att.lastName;
        counsel.email = att.email;
        counsel.phone = att.phone;
        counsel.address = att.address;
        counsel.city = att.city;
        counsel.state = att.state;
        counsel.zipCode = att.zipCode;
        counsel.firmName = att.firmName;
        counsel.appearance = att.appearance;

        await counselRepo.save(counsel);
        counsels.push(counsel);
      }
    }

    party.counsels = counsels;
    await partyRepo.save(party);
    console.log(`Party saved: ${party.name}`);
  }

  // 3. Process Docket Entries from RAW text
  const rawPath = path.join(__dirname, "data", "case-25-1229-raw.txt");
  const rawText = fs.readFileSync(rawPath, "utf8");
  const lines = rawText.split("\n");
  const docketRepo = dataSource.getRepository(DocketEntry);

  for (const line of lines) {
    if (line.startsWith("|ENTRY|")) {
      // Format: |ENTRY|DATE|DESCRIPTION|URL|
      const parts = line.split("|");
      if (parts.length >= 5) {
        const dateStr = parts[2];
        const desc = parts[3] || "";
        const url = parts[4];

        if (!dateStr) continue;

        // Extract Sequence Number e.g. [1001734848]
        const seqMatch = desc.match(/\[(\d+)\]/);
        const ecfDocNum = seqMatch ? seqMatch[1] : null;

        const entry = new DocketEntry();
        entry.case = caseEntity;
        entry.dateFiled = new Date(dateStr);
        entry.description = desc;
        entry.ecfUrl = url;
        entry.ecfDocumentNumber = ecfDocNum || undefined;
        entry.type = DocketEntryType.FILING; // Default, logic can be smarter based on desc text

        if (desc.includes("ORDER")) entry.type = DocketEntryType.ORDER;
        if (desc.includes("MOTION")) entry.type = DocketEntryType.MOTION;
        if (desc.includes("NOTICE")) entry.type = DocketEntryType.NOTICE;

        // Dedup check based on ecfDocNum
        const existing = ecfDocNum
          ? await docketRepo.findOne({
              where: { caseId: caseEntity.id, ecfDocumentNumber: ecfDocNum },
            })
          : null;

        if (!existing) {
          await docketRepo.save(entry);
          console.log(`Docket Entry saved: ${dateStr} - ${ecfDocNum}`);
        } else {
          console.log(`Docket Entry exists: ${ecfDocNum}`);
        }
      }
    }
  }

  console.log("Import completed.");
  await app.close();
}

bootstrap();
