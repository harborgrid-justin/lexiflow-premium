import { PleadingDocument, PleadingTemplate } from '../../types/pleadingTypes';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

export class PleadingRepository extends Repository<PleadingDocument> {
    constructor() {
        super(STORES.PLEADINGS);
    }
    
    // Custom method to find pleadings by case ID
    getByCaseId = async (caseId: string): Promise<PleadingDocument[]> => {
        return this.getByIndex('caseId', caseId);
    }
    
    getTemplates = async (): Promise<PleadingTemplate[]> => {
        return db.getAll<PleadingTemplate>(STORES.PLEADING_TEMPLATES);
    }

    // Generate a PDF version (Mock implementation)
    generatePDF = async (pleadingId: string): Promise<string> => {
        // In a real app, this would send the structured JSON to a backend PDF engine
        // For now, we just simulate a delay and return a mock URL
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `https://example.com/pleading-${pleadingId}.pdf`;
    }
}
