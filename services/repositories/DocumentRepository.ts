import { LegalDocument } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class DocumentRepository extends Repository<LegalDocument> {
    constructor() { super(STORES.DOCUMENTS); }
    
    getRecent = async () => {
        const all = await this.getAll();
        return all.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).slice(0, 20);
    }
    
    getByCaseId = async (caseId: string) => { return this.getByIndex('caseId', caseId); }
    
    getTemplates = async () => { await delay(50); return []; }
    
    getContent = async (id: string) => {
        const doc = await this.getById(id);
        return doc ? doc.content : '';
    }

    getFile = async (id: string) => {
        return db.getFile(id);
    }
    
    getFolders = async () => {
        await delay(50);
        return [
            { id: 'root', label: 'All Documents', icon: 'Folder' },
            { id: 'discovery', label: 'Discovery', icon: 'Folder' },
            { id: 'evidence', label: 'Evidence', icon: 'Folder' },
            { id: 'pleadings', label: 'Pleadings', icon: 'Folder' },
            { id: 'correspondence', label: 'Correspondence', icon: 'Folder' },
        ];
    }
    
    redact = async (id: string): Promise<LegalDocument> => {
        await delay(800);
        const doc = await this.getById(id);
        if (!doc) throw new Error("Document not found");
        
        // Create Redacted Version
        const newVersion = { 
            ...doc, 
            id: `doc-${Date.now()}`, 
            title: `[REDACTED] ${doc.title}`, 
            lastModified: new Date().toISOString().split('T')[0],
            isRedacted: true,
            sourceModule: doc.sourceModule || 'General'
        };
        await this.add(newVersion);
        await this.logAction('REDACT_DOCUMENT', id, 'Created redacted copy');
        return newVersion;
    }
    
    share = async (id: string, email: string) => {
        await delay(500);
        const doc = await this.getById(id);
        if (doc) {
            const currentShares = doc.sharedWith || [];
            await this.update(id, { sharedWith: [...currentShares, email] });
            await this.logAction('SHARE_DOCUMENT', id, `Shared with ${email}`);
        }
    }
    
    summarizeBatch = async (ids: string[]) => {
        await delay(2000); // Simulate LLM processing
        return ids.length;
    }
}