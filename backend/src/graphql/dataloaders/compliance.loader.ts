import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class ComplianceLoader {
  // Inject ComplianceServices here
  // constructor(
  //   private readonly auditLogService: AuditLogService,
  //   private readonly conflictCheckService: ConflictCheckService,
  // ) {}

  // Create a DataLoader for loading audit logs by user ID
  public readonly batchAuditLogsByUserId = new DataLoader(
    async (userIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const auditLogs = await this.auditLogService.findByUserIds([...userIds]);
      // const auditLogsByUserId = new Map<string, any[]>();
      // auditLogs.forEach(log => {
      //   if (!auditLogsByUserId.has(log.userId)) {
      //     auditLogsByUserId.set(log.userId, []);
      //   }
      //   auditLogsByUserId.get(log.userId)!.push(log);
      // });
      // return userIds.map(id => auditLogsByUserId.get(id) || []);
      return userIds.map(() => []);
    },
  );

  // Create a DataLoader for loading audit logs by entity
  public readonly batchAuditLogsByEntity = new DataLoader(
    async (entityKeys: readonly string[]) => {
      // entityKey format: "entityName:entityId"
      // TODO: Implement batch loading logic
      // const entityData = entityKeys.map(key => {
      //   const [entity, entityId] = key.split(':');
      //   return { entity, entityId };
      // });
      // const auditLogs = await this.auditLogService.findByEntities(entityData);
      // const auditLogsByKey = new Map<string, any[]>();
      // auditLogs.forEach(log => {
      //   const key = `${log.entity}:${log.entityId}`;
      //   if (!auditLogsByKey.has(key)) {
      //     auditLogsByKey.set(key, []);
      //   }
      //   auditLogsByKey.get(key)!.push(log);
      // });
      // return entityKeys.map(key => auditLogsByKey.get(key) || []);
      return entityKeys.map(() => []);
    },
  );

  // Create a DataLoader for loading conflict checks by client ID
  public readonly batchConflictChecksByClientId = new DataLoader(
    async (clientIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const conflictChecks = await this.conflictCheckService.findByClientIds([...clientIds]);
      // const conflictChecksByClientId = new Map<string, any[]>();
      // conflictChecks.forEach(check => {
      //   if (!conflictChecksByClientId.has(check.clientId)) {
      //     conflictChecksByClientId.set(check.clientId, []);
      //   }
      //   conflictChecksByClientId.get(check.clientId)!.push(check);
      // });
      // return clientIds.map(id => conflictChecksByClientId.get(id) || []);
      return clientIds.map(() => []);
    },
  );

  // Load audit logs by user ID
  async loadAuditLogsByUserId(userId: string) {
    return this.batchAuditLogsByUserId.load(userId);
  }

  // Load audit logs by entity
  async loadAuditLogsByEntity(entity: string, entityId: string) {
    return this.batchAuditLogsByEntity.load(`${entity}:${entityId}`);
  }

  // Load conflict checks by client ID
  async loadConflictChecksByClientId(clientId: string) {
    return this.batchConflictChecksByClientId.load(clientId);
  }
}
