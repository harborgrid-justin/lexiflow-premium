import { DataSource } from 'typeorm';
import { Party, PartyType, PartyRole } from '@core/parties/entities/party.entity';
import { Case } from '@cases/entities/case.entity';
import { faker } from '@faker-js/faker';

export const seedParties = async (dataSource: DataSource) => {
  const partyRepository = dataSource.getRepository(Party);
  const caseRepository = dataSource.getRepository(Case);

  const cases = await caseRepository.find();

  if (cases.length === 0) {
    console.log('Skipping party seeding due to no cases found.');
    return;
  }

  const parties: Party[] = [];
  for (const aCase of cases) {
    for (let i = 0; i < faker.number.int({ min: 2, max: 5 }); i++) {
      const party = new Party();
      party.caseId = aCase.id;
      party.name = faker.company.name();
      party.type = faker.helpers.arrayElement(Object.values(PartyType));
      party.role = faker.helpers.arrayElement(Object.values(PartyRole));
      party.email = faker.internet.email();
      party.phone = faker.phone.number();
      party.address = faker.location.streetAddress();
      party.city = faker.location.city();
      party.state = faker.location.state();
      party.zipCode = faker.location.zipCode();
      party.country = faker.location.country();
      party.primaryContactName = faker.person.fullName();
      party.primaryContactEmail = faker.internet.email();
      party.primaryContactPhone = faker.phone.number();
      party.attorneyName = faker.person.fullName();
      party.attorneyBarNumber = faker.string.alphanumeric(10);
      parties.push(party);
    }
  }

  await partyRepository.save(parties);
  console.log('✓ Parties seeded');
};
