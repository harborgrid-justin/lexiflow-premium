
import { PleadingDocument, PleadingTemplate, FormattingRule } from '../../types/pleadingTypes';
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
    
    getFormattingRules = async (): Promise<FormattingRule> => {
        // Mocking fetching default rules from DB or config
        return {
            id: 'fed-civil',
            name: 'Federal Civil Rules',
            fontFamily: 'Times New Roman',
            fontSize: 12,
            lineHeight: 2.0, 
            marginTop: '1in',
            marginBottom: '1in',
            marginLeft: '1.25in', 
            marginRight: '1in',
            showLineNumbers: true,
            paperSize: 'Letter',
            captionStyle: 'Boxed'
        };
    }

    // Generate a PDF version (Mock implementation)
    generatePDF = async (pleadingId: string): Promise<string> => {
        // In a real app, this would send the structured JSON to a backend PDF engine
        // For now, we just simulate a delay and return a mock URL
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `https://example.com/pleading-${pleadingId}.pdf`;
    }
}
