import { faker } from '@faker-js/faker';
import { DataFactory } from './data-factory';

export interface DocumentFactoryOptions {
  documentType?: string;
  status?: string;
  caseId?: string;
}

export class DocumentFactory {
  /**
   * Generate a random document
   */
  static generateDocument(options: DocumentFactoryOptions = {}): any {
    const documentType = options.documentType || faker.helpers.arrayElement([
      'Motion',
      'Brief',
      'Complaint',
      'Answer',
      'Discovery Request',
      'Discovery Response',
      'Exhibit',
      'Contract',
      'Letter',
      'Memo',
      'Pleading',
      'Order',
      'Transcript',
    ]);

    const status = options.status || faker.helpers.arrayElement([
      'draft',
      'under_review',
      'approved',
      'filed',
      'archived',
    ]);

    const category = documentType.toLowerCase().replace(' ', '_');
    const title = DataFactory.generateDocumentTitle(this.getCategoryForType(documentType));

    return {
      title: `${title} - ${faker.date.recent({ days: 30 }).toLocaleDateString()}`,
      description: this.generateDocumentDescription(documentType),
      type: documentType,
      status,
      filename: `${title.replace(/\s+/g, '_')}_${faker.string.alphanumeric(8)}.pdf`,
      filePath: `/documents/${faker.date.recent({ days: 30 }).getFullYear()}/${faker.string.alphanumeric(12)}.pdf`,
      mimeType: 'application/pdf',
      fileSize: faker.number.int({ min: 50000, max: 5000000 }),
      checksum: faker.string.alphanumeric(32),
      currentVersion: faker.number.int({ min: 1, max: 5 }),
      author: faker.person.fullName(),
      pageCount: faker.number.int({ min: 1, max: 150 }),
      wordCount: faker.number.int({ min: 500, max: 50000 }),
      language: 'en',
      tags: this.generateTags(documentType),
      customFields: {},
      fullTextContent: null,
      ocrProcessed: faker.datatype.boolean({ probability: 0.7 }),
      ocrProcessedAt: faker.date.recent({ days: 5 }).toISOString(),
    };
  }

  /**
   * Generate multiple documents
   */
  static generateDocuments(count: number, options: DocumentFactoryOptions = {}): any[] {
    const documents = [];
    for (let i = 0; i < count; i++) {
      documents.push(this.generateDocument(options));
    }
    return documents;
  }

  /**
   * Generate document description
   */
  private static generateDocumentDescription(documentType: string): string {
    const descriptions = {
      Motion: 'Legal motion filed with the court requesting specific relief',
      Brief: 'Legal brief presenting arguments and supporting authorities',
      Complaint: 'Initial pleading commencing legal action',
      Answer: 'Response to complaint with affirmative defenses',
      'Discovery Request': 'Formal request for information and documents',
      'Discovery Response': 'Response to discovery requests with objections',
      Exhibit: 'Evidence exhibit for trial or hearing',
      Contract: 'Legally binding agreement between parties',
      Letter: 'Correspondence with client, court, or opposing counsel',
      Memo: 'Internal memorandum of law or case strategy',
      Pleading: 'Formal court filing stating claims or defenses',
      Order: 'Court order directing specific actions',
      Transcript: 'Official transcript of proceedings',
    };
    return descriptions[documentType] || 'Legal document';
  }

  /**
   * Get category for document type
   */
  private static getCategoryForType(documentType: string): string {
    const categories = {
      Motion: 'motion',
      Brief: 'brief',
      Complaint: 'pleading',
      Answer: 'pleading',
      'Discovery Request': 'discovery',
      'Discovery Response': 'discovery',
      Exhibit: 'discovery',
      Contract: 'contract',
      Letter: 'contract',
      Memo: 'brief',
      Pleading: 'pleading',
      Order: 'pleading',
      Transcript: 'discovery',
    };
    return categories[documentType] || 'contract';
  }

  /**
   * Generate tags for document
   */
  private static generateTags(documentType: string): string[] {
    const baseTags = [documentType.toLowerCase().replace(' ', '-')];
    const additionalTags = faker.helpers.arrayElements([
      'important',
      'client-facing',
      'court-filing',
      'confidential',
      'draft',
      'final',
      'reviewed',
    ], faker.number.int({ min: 1, max: 3 }));
    return [...baseTags, ...additionalTags];
  }
}
