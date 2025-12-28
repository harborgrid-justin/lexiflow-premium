/**
 * WallErectedHandler - Compliance -> Security Integration
 * 
 * Responsibility: Create row-level security policies for ethical walls
 * Integration: Opp #8 from architecture docs
 */

import { BaseEventHandler } from './BaseEventHandler';
import type { SystemEventPayloads } from '@/types/integration-types';
import { SystemEventType } from '@/types/integration-types';

export class WallErectedHandler extends BaseEventHandler<SystemEventPayloads[typeof SystemEventType.WALL_ERECTED]> {
  readonly eventType = SystemEventType.WALL_ERECTED;
  
  async handle(payload: SystemEventPayloads[typeof SystemEventType.WALL_ERECTED]) {
    const actions: string[] = [];
    const { wall } = payload;
    
    const { DataService } = await import('@/services');
    
    // Generate RLS policy for ethical wall
    const policyName = `wall_enforce_${wall.caseId}`;
    
    await DataService.admin.saveRLSPolicy({
      name: policyName,
      table: 'documents',
      cmd: 'SELECT',
      roles: wall.restrictedGroups,
      using: `case_id != '${wall.caseId}'`, // Prevent access
      status: 'Active'
    });
    
    actions.push(`Generated RLS Policy: ${policyName}`);
    
    return this.createSuccess(actions);
  }
}
