/**
 * StaffHiredHandler - HR -> Admin Integration
 * 
 * Responsibility: Auto-provision user accounts for new hires
 * Integration: Opp #9 from architecture docs
 */

import { BaseEventHandler } from './BaseEventHandler';
import type { SystemEventPayloads } from '@/types/integration-types';
import { SystemEventType } from '@/types/integration-types';

export class StaffHiredHandler extends BaseEventHandler<SystemEventPayloads[typeof SystemEventType.STAFF_HIRED]> {
  readonly eventType = SystemEventType.STAFF_HIRED;
  
  async handle(payload: SystemEventPayloads[typeof SystemEventType.STAFF_HIRED]) {
    const actions: string[] = [];
    const errors: string[] = [];
    const { staff } = payload;
    
    // Validate staff data
    const validationError = this.validateStaff(staff);
    if (validationError) {
      errors.push(validationError);
      return this.createError(errors);
    }
    
    const { DataService } = await import('@/services/data/dataService');
    
    // Verify user service is available
    if (!DataService.users || typeof DataService.users.add !== 'function') {
      errors.push('User provisioning service not available');
      return this.createError(errors);
    }
    
    // Create user account
    const newUser = {
      id: staff.userId,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      userType: 'Internal' as const,
      orgId: 'org-1',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await DataService.users.add(newUser);
    actions.push(`Provisioned User Account for ${staff.name} (${staff.email})`);
    
    return this.createSuccess(actions);
  }
  
  private validateStaff(staff: SystemEventPayloads[typeof SystemEventType.STAFF_HIRED]['staff']): string | null {
    // Validate required fields
    if (!staff.userId || !staff.name || !staff.email || !staff.role) {
      return 'Staff member missing required fields for user provisioning';
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(staff.email)) {
      return 'Invalid email format for user provisioning';
    }
    
    return null;
  }
}
