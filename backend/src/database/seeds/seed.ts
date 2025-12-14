import AppDataSource from '../data-source';
import { seedUsers } from './users.seed';
import { seedClients } from './clients.seed';
import { seedCases } from './cases.seed';
import { seedDocuments } from './documents.seed';
import { seedTimeEntries } from './time-entries.seed';
import { seedParties } from './parties.seed';
import { seedCasePhases } from './case-phases.seed';
import { seedMotions } from './motions.seed';
import { seedDocketEntries } from './docket-entries.seed';
import { seedInvoices } from './invoices.seed';
import { seedEvidenceItems } from './evidence-items.seed';

async function bootstrap() {
  console.log('===========================================');
  console.log('LexiFlow Database Seeding');
  console.log('===========================================\n');

  const dataSource = AppDataSource;

  try {
    // Initialize connection
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('✓ Connected to database\n');

    // Run seeds in order (respecting foreign key dependencies)
    await seedUsers(dataSource);
    await seedClients(dataSource);
    await seedCases(dataSource);
    await seedDocuments(dataSource);
    await seedTimeEntries(dataSource);
    await seedParties(dataSource);
    await seedCasePhases(dataSource);
    await seedMotions(dataSource);
    await seedDocketEntries(dataSource);
    await seedInvoices(dataSource);
    await seedEvidenceItems(dataSource);

    console.log('\n===========================================');
    console.log('✓ Database seeding completed successfully!');
    console.log('===========================================\n');

    // Print summary
    const userCount = await dataSource.getRepository('User').count();
    const clientCount = await dataSource.getRepository('Client').count();
    const caseCount = await dataSource.getRepository('Case').count();
    const documentCount = await dataSource.getRepository('Document').count();
    const timeEntryCount = await dataSource.getRepository('TimeEntry').count();
    const partyCount = await dataSource.getRepository('Party').count();
    const casePhaseCount = await dataSource.getRepository('CasePhase').count();
    const motionCount = await dataSource.getRepository('Motion').count();
    const docketEntryCount = await dataSource.getRepository('DocketEntry').count();
    const invoiceCount = await dataSource.getRepository('Invoice').count();
    const evidenceItemCount = await dataSource.getRepository('EvidenceItem').count();

    console.log('Summary:');
    console.log(`  Users:        ${userCount}`);
    console.log(`  Clients:      ${clientCount}`);
    console.log(`  Cases:        ${caseCount}`);
    console.log(`  Documents:    ${documentCount}`);
    console.log(`  Time Entries: ${timeEntryCount}`);
    console.log(`  Parties:      ${partyCount}`);
    console.log(`  Case Phases:  ${casePhaseCount}`);
    console.log(`  Motions:      ${motionCount}`);
    console.log(`  Docket Entries: ${docketEntryCount}`);
    console.log(`  Invoices:     ${invoiceCount}`);
    console.log(`  Evidence Items: ${evidenceItemCount}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✓ Database connection closed');
    }
  }
}

// Run the seeder
bootstrap();
