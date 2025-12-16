import { Risk } from '../../types';
import { Repository } from '../core/Repository';
import { STORES } from '../db';
import { IntegrationOrchestrator } from '../integrationOrchestrator';
import { SystemEventType } from '../../types/integration-types';

export class RiskRepository extends Repository<Risk> {
    constructor() {
        super(STORES.RISKS);
    }

    // getByCaseId is inherited from base Repository class

    async add(item: Risk): Promise<Risk> {
        const result = await super.add(item);
        if (result.impact === 'High' && result.probability === 'High') {
             IntegrationOrchestrator.publish(SystemEventType.RISK_ESCALATED, { risk: result });
        }
        return result;
    }
}