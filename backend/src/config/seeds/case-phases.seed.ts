import { DataSource } from 'typeorm';
import { CasePhase, PhaseType, PhaseStatus } from '../../case-phases/entities/case-phase.entity';
import { Case } from '../../cases/entities/case.entity';
import { faker } from '@faker-js/faker';

export const seedCasePhases = async (dataSource: DataSource) => {
  const casePhaseRepository = dataSource.getRepository(CasePhase);
  const caseRepository = dataSource.getRepository(Case);

  const cases = await caseRepository.find();
  if (cases.length === 0) {
    console.log('Skipping case phase seeding due to no cases found.');
    return;
  }

  const casePhases: CasePhase[] = [];
  for (const aCase of cases) {
    const phase = new CasePhase();
    phase.caseId = aCase.id;
    phase.name = faker.lorem.words(3);
    phase.type = faker.helpers.arrayElement(Object.values(PhaseType));
    phase.status = faker.helpers.arrayElement(Object.values(PhaseStatus));
    phase.startDate = faker.date.past();
    phase.endDate = faker.date.future();
    phase.description = faker.lorem.sentence();
    casePhases.push(phase);
  }

  await casePhaseRepository.save(casePhases);
  console.log('✓ Case phases seeded');
};
