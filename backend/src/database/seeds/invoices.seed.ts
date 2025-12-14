import { DataSource } from 'typeorm';
import { Invoice, InvoiceStatus, BillingModel } from '../../billing/invoices/entities/invoice.entity';
import { Client } from '../../entities/client.entity';
import { Case } from '../../cases/entities/case.entity';
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
    const client = faker.helpers.arrayElement(clients);
    const aCase = faker.helpers.arrayElement(cases.filter(c => c.clientId === client.id));

    if (!aCase) continue;

    const invoice = new Invoice();
    invoice.invoiceNumber = faker.string.alphanumeric(10);
    invoice.caseId = aCase.id;
    invoice.client = client;
    invoice.clientName = client.name;
    invoice.matterDescription = aCase.description;
    invoice.invoiceDate = faker.date.past().toISOString().split('T')[0];
    invoice.dueDate = faker.date.future().toISOString().split('T')[0];
    invoice.billingModel = faker.helpers.arrayElement(Object.values(BillingModel));
    invoice.status = faker.helpers.arrayElement(Object.values(InvoiceStatus));
    invoice.subtotal = faker.number.float({ min: 100, max: 10000 });
    invoice.totalAmount = invoice.subtotal;
    invoices.push(invoice);
  }

  await invoiceRepository.save(invoices);
  console.log('✓ Invoices seeded');
};
