import { NestFactory } from "@nestjs/core";
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import { Case } from "../src/cases/entities/case.entity";

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const caseRepo = dataSource.getRepository(Case);

  const cases = await caseRepo.find({ take: 5 });
  console.log("Found cases:", cases.length);
  cases.forEach((c) => {
    console.log(`${c.id} - ${c.caseNumber} - ${c.title}`);
  });

  await app.close();
}

run();
