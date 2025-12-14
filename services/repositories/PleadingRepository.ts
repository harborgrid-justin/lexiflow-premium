
import { PleadingDocument, PleadingTemplate, FormattingRule, PleadingSection, Case, CaseId, UserId } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';
import { IdGenerator } from '../../utils/idGenerator';
import { createTemplateContext, hydrateTemplateSections } from '../../utils/templateEngine';
import { validateTemplate } from '../../utils/validation';

/**
 * Version conflict error for optimistic concurrency control
 */
export class VersionConflictError extends Error {
    constructor(
        message: string,
        public readonly expectedVersion: number,
        public readonly actualVersion: number
    ) {
        super(message);
        this.name = 'VersionConflictError';
    }
}

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
    
    /**
     * Creates a pleading from template with proper type safety and validation
     */
    createFromTemplate = async (
        templateId: string, 
        caseId: string, 
        title: string, 
        userId: string
    ): Promise<PleadingDocument> => {
        const [template, caseData] = await Promise.all([
            db.get<PleadingTemplate>(STORES.PLEADING_TEMPLATES, templateId),
            db.get<Case>(STORES.CASES, caseId)
        ]);

        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        
        if (!caseData) {
            throw new Error(`Case not found: ${caseId}`);
        }

        // Validate template structure
        const validation = validateTemplate(template);
        if (!validation.valid) {
            throw new Error(`Invalid template: ${validation.errors.map(e => e.message).join(', ')}`);
        }

        // Create template context with case data
        const context = createTemplateContext(caseData);

        // Hydrate sections using template engine
        const hydratedPartialSections = hydrateTemplateSections(template.defaultSections, context);

        // Convert to full PleadingSection objects with generated IDs
        const hydratedSections: PleadingSection[] = hydratedPartialSections.map((s, idx) => ({
            id: IdGenerator.section(),
            type: s.type || 'Paragraph',
            content: s.content || '',
            order: idx,
            meta: s.meta
        }));

        const newDoc: PleadingDocument = {
            id: IdGenerator.pleading(),
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

    /**
     * Updates a pleading with optimistic concurrency control
     */
    updateWithVersionCheck = async (
        id: string,
        updates: Partial<PleadingDocument>,
        expectedVersion: number
    ): Promise<PleadingDocument> => {
        const current = await this.getById(id);
        
        if (!current) {
            throw new Error(`Pleading not found: ${id}`);
        }

        // Check version for optimistic locking
        if (current.version !== expectedVersion) {
            throw new VersionConflictError(
                'Version conflict: document was modified by another user',
                expectedVersion,
                current.version
            );
        }

        // Increment version
        const updated: PleadingDocument = {
            ...current,
            ...updates,
            version: current.version + 1,
            updatedAt: new Date().toISOString()
        };

        await this.update(id, updated);
        return updated;
    }

    /**
     * Gets formatting rules (with future support for jurisdiction-specific rules)
     */
    getFormattingRules = async (jurisdictionId?: string): Promise<FormattingRule> => {
        // TODO: Fetch jurisdiction-specific rules from database
        // For now, return default federal civil rules
        return {
            id: IdGenerator.formattingRule(),
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

    /**
     * Generates PDF with proper error handling
     */
    generatePDF = async (pleadingId: string): Promise<string> => {
        const pleading = await this.getById(pleadingId);
        
        if (!pleading) {
            throw new Error(`Pleading not found: ${pleadingId}`);
        }

        // Simulate PDF generation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock PDF generation result
        return `https://example.com/pleading-${pleadingId}.pdf`;
    }
}