import { AppDataSource } from "../src/database/data-source";
import { Counsel } from "../src/parties/entities/counsel.entity";
import { Party } from "../src/parties/entities/party.entity";

async function debugMercer() {
  await AppDataSource.initialize();

  const counselRepo = AppDataSource.getRepository(Counsel);
  const partyRepo = AppDataSource.getRepository(Party);

  console.log("--- Searching for David Mercer ---");
  const mercers = await counselRepo.find({
    where: { lastName: "Mercer" },
    relations: ["parties"], // Is the inverse relation defined?
  });

  for (const m of mercers) {
    console.log(
      `Mercer ID: ${m.id}, Name: ${m.firstName} ${m.lastName}, Email: '${m.email}'`
    );
    // Note: Counsel entity might not have 'parties' inverse relation defined in checking code,
    // but usually ManyToMany can be checked from Party side.
  }

  console.log("\n--- Checking Justin's Party ---");
  const justin = await partyRepo.findOne({
    where: { name: "JUSTIN JEFFREY SAADEIN-MORALES" },
    relations: ["counsels"],
  });

  if (justin) {
    console.log(`Justin found. ID: ${justin.id}`);
    console.log("Counsels linked:");
    justin.counsels.forEach((c) => {
      console.log(` - ${c.firstName} ${c.lastName} (ID: ${c.id})`);
    });
  } else {
    console.log("Justin party not found.");
  }

  await AppDataSource.destroy();
}

debugMercer().catch(console.error);
