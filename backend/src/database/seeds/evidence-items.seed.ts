import { DataSource } from 'typeorm';
import { EvidenceItem } from '../../entities/evidence-item.entity';
import { Case } from '../../cases/entities/case.entity';
import { faker } from '@faker-js/faker';

export const seedEvidenceItems = async (dataSource: DataSource) => {
  const evidenceItemRepository = dataSource.getRepository(EvidenceItem);
  const caseRepository = dataSource.getRepository(Case);

  const cases = await caseRepository.find();
  if (cases.length === 0) {
    console.log('Skipping evidence item seeding due to no cases found.');
    return;
  }

  const evidenceItems: Partial<EvidenceItem>[] = [];
  for (const aCase of cases) {
    const evidenceItem = new EvidenceItem();
    evidenceItem.case = aCase;
    evidenceItem.evidenceNumber = faker.string.alphanumeric(10);
    evidenceItem.title = faker.lorem.sentence();
    evidenceItem.description = faker.lorem.paragraph();
    evidenceItem.evidenceType = 'digital';
    evidenceItem.collectionDate = faker.date.past();
    evidenceItems.push(evidenceItem);
  }

  await evidenceItemRepository.save(evidenceItems);
  console.log('✓ Evidence items seeded');
};
