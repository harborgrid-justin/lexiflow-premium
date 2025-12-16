import { Client, Case, EntityId, CaseId, UserId } from '../../types';
import { db, STORES } from '../db';
import { IntegrationOrchestrator } from '../integrationOrchestrator';
import { SystemEventType } from "../../types/integration-types";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const CRMService = {
    getLeads: async () => {
        return db.getAll(STORES.LEADS);
    },

    getAnalytics: async () => {
        const leads = await db.getAll<any>(STORES.LEADS);
        
        // Dynamic Calculation based on DB state
        const pipelineValue = leads.reduce((acc, l) => acc + (parseFloat(l.value.replace(/[^0-9.]/g, '')) || 0), 0);
        const bySource = leads.reduce((acc, l) => {
            acc[l.source || 'Referral'] = (acc[l.source || 'Referral'] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const sourcesChart = Object.keys(bySource).map(k => ({ name: k, value: bySource[k] }));

        return { 
            growth: [
                { month: 'Jan', clients: 5 }, { month: 'Feb', clients: 8 }, { month: 'Mar', clients: leads.length }
            ], 
            industry: [
                { name: 'Tech', value: 40, color: '#3b82f6' },
                { name: 'Finance', value: 25, color: '#8b5cf6' },
                { name: 'Healthcare', value: 15, color: '#10b981' }
            ], 
            revenue: [
                { name: 'Q1', retained: 400000, new: 120000 },
                { name: 'Q2', retained: 450000, new: 180000 },
            ], 
            sources: sourcesChart
        };
    },

    updateLead: async (id: string, updates: { stage: string }) => {
        const lead = await db.get<any>(STORES.LEADS, id);
        if (!lead) throw new Error("Lead not found");
        
        const updatedLead = { ...lead, ...updates };
        await db.put(STORES.LEADS, updatedLead);

        // Opp #1 Integration Point: CRM -> Compliance
        if (updates.stage) {
            IntegrationOrchestrator.publish(SystemEventType.LEAD_STAGE_CHANGED, {
                leadId: id,
                stage: updates.stage,
                clientName: lead.client,
                value: lead.value
            });
        }

        // Automation: If Converted, create Client and Case
        if (updates.stage === 'Matter Created' && lead.stage !== 'Matter Created') {
            await CRMService.convertLeadToClient(updatedLead);
        }

        return updatedLead;
    },

    convertLeadToClient: async (lead: any) => {
        console.log(`[CRM] Converting Lead ${lead.id} to Client/Case...`);
        
        // 1. Create Client
        const newClient: Client = {
            id: `cli-${Date.now()}` as EntityId,
            name: lead.client,
            industry: 'General',
            status: 'Active',
            totalBilled: 0,
            matters: []
        };
        await db.put(STORES.CLIENTS, newClient);

        // 2. Create Case
        const newCase: Case = {
            id: `MAT-${Date.now().toString().slice(-6)}` as CaseId,
            title: lead.title,
            client: lead.client,
            clientId: newClient.id,
            matterType: 'General',
            status: 'Pre-Filing' as any,
            filingDate: new Date().toISOString().split('T')[0],
            value: parseFloat(lead.value.replace(/[^0-9.]/g, '')) || 0,
            description: `Converted from Lead ${lead.id}`,
            ownerId: 'usr-admin-justin' as UserId,
            parties: [], citations: [], arguments: [], defenses: []
        };
        
        await db.put(STORES.CASES, newCase);
        
        // Update Client with Case Ref
        newClient.matters.push(newCase.id);
        await db.put(STORES.CLIENTS, newClient);

        // Trigger Integration
        IntegrationOrchestrator.publish(SystemEventType.CASE_CREATED, { caseData: newCase });
        IntegrationOrchestrator.publish(SystemEventType.ENTITY_CREATED, { entity: { ...newClient, type: 'Corporation', roles: ['Client'], riskScore: 0, tags: [] } as any });
    }
};