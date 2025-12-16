import { DataSource } from 'typeorm';
import { DocketEntry, DocketEntryType } from '../../docket/entities/docket-entry.entity';
import { Case } from '../../cases/entities/case.entity';
import { faker } from '@faker-js/faker';

export const seedDocketEntries = async (dataSource: DataSource) => {
  const docketEntryRepository = dataSource.getRepository(DocketEntry);
  const caseRepository = dataSource.getRepository(Case);

  const cases = await caseRepository.find();
  if (cases.length === 0) {
    console.log('Skipping docket entry seeding due to no cases found.');
    return;
  }

  const docketEntries: DocketEntry[] = [];
  let seq = 1;
  for (const aCase of cases) {
    const docketEntry = new DocketEntry();
    docketEntry.caseId = aCase.id;
    docketEntry.sequenceNumber = seq++;
    docketEntry.entryDate = faker.date.past();
    docketEntry.description = faker.lorem.sentence();
    docketEntry.docketNumber = faker.string.alphanumeric(10);
    docketEntry.dateFiled = faker.date.past();
    docketEntry.documentTitle = faker.lorem.sentence();
    docketEntry.documentUrl = faker.internet.url();
    docketEntry.type = faker.helpers.arrayElement(Object.values(DocketEntryType));
    docketEntries.push(docketEntry);
  }

  await docketEntryRepository.save(docketEntries);
  console.log('✓ Docket entries seeded');
};
