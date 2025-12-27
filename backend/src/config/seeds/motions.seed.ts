import { DataSource } from 'typeorm';
import { Motion, MotionType, MotionStatus } from '@core/motions/entities/motion.entity';
import { Case } from '@cases/entities/case.entity';
import { faker } from '@faker-js/faker';

export const seedMotions = async (dataSource: DataSource) => {
  const motionRepository = dataSource.getRepository(Motion);
  const caseRepository = dataSource.getRepository(Case);

  const cases = await caseRepository.find();
  if (cases.length === 0) {
    console.log('Skipping motion seeding due to no cases found.');
    return;
  }

  const motions: Motion[] = [];
  for (const aCase of cases) {
    const motion = new Motion();
    motion.caseId = aCase.id;
    motion.title = faker.lorem.sentence();
    motion.type = faker.helpers.arrayElement(Object.values(MotionType));
    motion.status = faker.helpers.arrayElement(Object.values(MotionStatus));
    motion.filingDate = faker.date.past();
    motion.hearingDate = faker.date.future();
    motion.description = faker.lorem.paragraph();
    motions.push(motion);
  }

  await motionRepository.save(motions);
  console.log('✓ Motions seeded');
};
