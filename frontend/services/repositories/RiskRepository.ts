import { Risk } from '../../types';
import { Repository } from '../core/Repository';
import { STORES } from '../db';
import { IntegrationOrchestrator } from '../integrationOrchestrator';
import { SystemEventType } from '../../types/integration-types';

export class RiskRepository extends Repository<Risk> {
    constructor() {
        super(STORES.RISKS);
    }
    
    async getByCaseId(caseId: string) {
        return this.getByIndex('caseId', caseId);
    }
    
    async add(item: Risk): Promise<Risk> {
        const result = await super.add(item);
        if (result.impact === 'High' && result.probability === 'High') {
             IntegrationOrchestrator.publish(SystemEventType.RISK_ESCALATED, { risk: result });
        }
        return result;
    }
}