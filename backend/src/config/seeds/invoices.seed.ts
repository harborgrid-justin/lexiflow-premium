import { DataSource } from 'typeorm';
import { Invoice, InvoiceStatus, BillingModel } from '@billing/invoices/entities/invoice.entity';
import { Client } from '@core/clients/entities/client.entity';
import { Case } from '@cases/entities/case.entity';
import { faker } from '@faker-js/faker';

export const seedInvoices = async (dataSource: DataSource) => {
  const invoiceRepository = dataSource.getRepository(Invoice);
  const clientRepository = dataSource.getRepository(Client);
  const caseRepository = dataSource.getRepository(Case);

  const clients = await clientRepository.find();
  const cases = await caseRepository.find();

  if (clients.length === 0 || cases.length === 0) {
    console.log('Skipping invoice seeding due to no clients or cases found.');
    return;
  }

  const invoices: Partial<Invoice>[] = [];
  for (let i = 0; i < 20; i++) {
    // First, pick a random case that has a client ID.
    const aCase = faker.helpers.arrayElement(cases.filter(c => c.clientId));
    if (!aCase) {
      // This should not happen if all cases are seeded with a client, but as a safeguard:
      continue;
    }

    // Then, find the corresponding client.
    const client = clients.find(c => c.id === aCase.clientId);
    if (!client) {
      // This indicates data inconsistency, but we'll safeguard against it.
      continue;
    }

    const invoice = new Invoice();
    invoice.invoiceNumber = faker.string.alphanumeric(10);
    invoice.caseId = aCase.id;
    invoice.client = client;
    invoice.clientName = client.name;
    invoice.matterDescription = aCase.description || '';
    invoice.invoiceDate = faker.date.past();
    invoice.dueDate = faker.date.future();
    invoice.billingModel = faker.helpers.arrayElement(Object.values(BillingModel));
    invoice.status = faker.helpers.arrayElement(Object.values(InvoiceStatus));
    invoice.subtotal = faker.number.float({ min: 100, max: 10000 });
    invoice.totalAmount = invoice.subtotal;
    invoices.push(invoice);
  }

  await invoiceRepository.save(invoices);
  console.log('✓ Invoices seeded');
};
