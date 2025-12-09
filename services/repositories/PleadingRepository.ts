
import { PleadingDocument, PleadingTemplate, FormattingRule, PleadingSection, Case, CaseId, UserId } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

export class PleadingRepository extends Repository<PleadingDocument> {
    constructor() {
        super(STORES.PLEADINGS);
    }
    
    getByCaseId = async (caseId: string): Promise<PleadingDocument[]> => {
        return this.getByIndex('caseId', caseId);
    }
    
    getTemplates = async (): Promise<PleadingTemplate[]> => {
        return db.getAll<PleadingTemplate>(STORES.PLEADING_TEMPLATES);
    }
    
    createFromTemplate = async (templateId: string, caseId: string, title: string, userId: string): Promise<PleadingDocument> => {
        const [template, caseData] = await Promise.all([
            db.get<PleadingTemplate>(STORES.PLEADING_TEMPLATES, templateId),
            db.get<Case>(STORES.CASES, caseId)
        ]);

        if (!template) throw new Error("Template not found");
        if (!caseData) throw new Error("Case not found");

        // Hydrate Sections
        const hydratedSections: PleadingSection[] = template.defaultSections.map((s, idx) => {
            let content = s.content || '';
            // Basic Variable Substitution
            content = content.replace('{{Plaintiff}}', caseData.parties?.find(p => p.role === 'Plaintiff')?.name || '[PLAINTIFF]');
            content = content.replace('{{Defendant}}', caseData.parties?.find(p => p.role === 'Defendant')?.name || '[DEFENDANT]');
            content = content.replace('{{CaseNumber}}', caseData.id);
            content = content.replace('{{Court}}', caseData.court || '[COURT]');

            return {
                id: `sec-${Date.now()}-${idx}`,
                type: s.type || 'Paragraph',
                content: content,
                order: idx,
                meta: s.meta
            };
        });

        const newDoc: PleadingDocument = {
            id: `plead-${Date.now()}` as any,
            caseId: caseId as CaseId,
            title: title,
            status: 'Draft',
            filingStatus: 'Pre-Filing',
            jurisdictionRulesId: 'default',
            version: 1,
            sections: hydratedSections,
            createdBy: userId as UserId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await this.add(newDoc);
        return newDoc;
    }

    getFormattingRules = async (): Promise<FormattingRule> => {
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

    generatePDF = async (pleadingId: string): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Mock PDF generation result
        return `https://example.com/pleading-${pleadingId}.pdf`;
    }
}
