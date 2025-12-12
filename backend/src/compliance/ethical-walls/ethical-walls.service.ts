import { Injectable } from '@nestjs/common';
import {
  EthicalWallDto,
  CreateEthicalWallDto,
  UpdateEthicalWallDto,
  QueryEthicalWallsDto,
  CheckEthicalWallDto,
  EthicalWallCheckResult,
  EthicalWallStatus,
  EthicalWallNotificationDto,
  EthicalWallAuditEntryDto,
  WallBreachDto,
  WallEffectivenessMetricsDto,
} from './dto/ethical-wall.dto';

@Injectable()
export class EthicalWallsService {
  private ethicalWalls: Map<string, EthicalWallDto> = new Map();
  private notifications: Map<string, EthicalWallNotificationDto> = new Map();
  private auditEntries: Map<string, EthicalWallAuditEntryDto> = new Map();
  private breaches: Map<string, WallBreachDto> = new Map();

  async create(dto: CreateEthicalWallDto): Promise<EthicalWallDto> {
    const wall: EthicalWallDto = {
      id: this.generateId(),
      ...dto,
      status: EthicalWallStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.ethicalWalls.set(wall.id, wall);

    // Create audit entry
    await this.createAuditEntry({
      wallId: wall.id,
      action: 'created',
      performedBy: dto.createdBy,
      performedByName: dto.createdByName,
      details: `Ethical wall "${wall.name}" created with ${wall.restrictedUsers.length} restricted users and ${wall.restrictedEntities.length} entities`,
      metadata: { wall },
    });

    // Notify affected users
    for (const userId of wall.restrictedUsers) {
      await this.sendNotification({
        wallId: wall.id,
        wallName: wall.name,
        recipientUserId: userId,
        recipientUserName: `User ${userId}`,
        notificationType: 'wall_created',
        message: `You have been added to ethical wall "${wall.name}". Access to ${wall.restrictedEntities.length} entities is now restricted.`,
        metadata: { entities: wall.restrictedEntities },
      });
    }

    return wall;
  }

  async findAll(query: QueryEthicalWallsDto): Promise<{
    data: EthicalWallDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    let walls = Array.from(this.ethicalWalls.values());

    // Update expired walls
    walls = walls.map((wall) => {
      if (wall.expiresAt && new Date() > wall.expiresAt && wall.status === EthicalWallStatus.ACTIVE) {
        wall.status = EthicalWallStatus.EXPIRED;
        this.ethicalWalls.set(wall.id, wall);
      }
      return wall;
    });

    // Apply filters
    if (query.status) {
      walls = walls.filter((wall) => wall.status === query.status);
    }
    if (query.userId) {
      walls = walls.filter((wall) => wall.restrictedUsers.includes(query.userId));
    }
    if (query.entityType && query.entityId) {
      walls = walls.filter((wall) =>
        wall.restrictedEntities.some(
          (entity) =>
            entity.entityType === query.entityType &&
            entity.entityId === query.entityId,
        ),
      );
    }

    // Sort by creation date (newest first)
    walls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginate
    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWalls = walls.slice(startIndex, endIndex);

    return {
      data: paginatedWalls,
      total: walls.length,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<EthicalWallDto> {
    const wall = this.ethicalWalls.get(id);
    if (!wall) {
      throw new Error(`Ethical wall with ID ${id} not found`);
    }

    // Check expiration
    if (wall.expiresAt && new Date() > wall.expiresAt && wall.status === EthicalWallStatus.ACTIVE) {
      wall.status = EthicalWallStatus.EXPIRED;
      this.ethicalWalls.set(id, wall);
    }

    return wall;
  }

  async update(id: string, dto: UpdateEthicalWallDto, updatedBy?: string, updatedByName?: string): Promise<EthicalWallDto> {
    const wall = await this.findOne(id);
    const oldWall = { ...wall };

    const updatedWall: EthicalWallDto = {
      ...wall,
      ...dto,
      updatedAt: new Date(),
    };

    this.ethicalWalls.set(id, updatedWall);

    // Create audit entry
    const changes = this.detectChanges(oldWall, updatedWall);
    await this.createAuditEntry({
      wallId: id,
      action: 'modified',
      performedBy: updatedBy || 'system',
      performedByName: updatedByName || 'System',
      details: `Ethical wall "${wall.name}" modified: ${changes.join(', ')}`,
      metadata: { oldWall, updatedWall },
    });

    // Notify affected users if user list changed
    if (dto.restrictedUsers) {
      const addedUsers = dto.restrictedUsers.filter(u => !wall.restrictedUsers.includes(u));
      const removedUsers = wall.restrictedUsers.filter(u => !dto.restrictedUsers.includes(u));

      for (const userId of addedUsers) {
        await this.sendNotification({
          wallId: id,
          wallName: updatedWall.name,
          recipientUserId: userId,
          recipientUserName: `User ${userId}`,
          notificationType: 'wall_modified',
          message: `You have been added to ethical wall "${updatedWall.name}".`,
        });
      }
    }

    return updatedWall;
  }

  async remove(id: string, deletedBy?: string, deletedByName?: string): Promise<void> {
    const wall = await this.findOne(id);

    // Create audit entry before deletion
    await this.createAuditEntry({
      wallId: id,
      action: 'deleted',
      performedBy: deletedBy || 'system',
      performedByName: deletedByName || 'System',
      details: `Ethical wall "${wall.name}" deleted`,
      metadata: { wall },
    });

    this.ethicalWalls.delete(id);
  }

  async checkWallsForUser(userId: string): Promise<EthicalWallDto[]> {
    const walls = Array.from(this.ethicalWalls.values()).filter(
      (wall) =>
        wall.status === EthicalWallStatus.ACTIVE &&
        wall.restrictedUsers.includes(userId),
    );

    return walls;
  }

  async checkAccess(dto: CheckEthicalWallDto, ipAddress?: string): Promise<EthicalWallCheckResult> {
    const walls = Array.from(this.ethicalWalls.values()).filter((wall) => {
      if (wall.status !== EthicalWallStatus.ACTIVE) return false;

      // Check if user is restricted
      const userRestricted = wall.restrictedUsers.includes(dto.userId);

      // Check if entity is restricted
      const entityRestricted = wall.restrictedEntities.some(
        (entity) =>
          entity.entityType === dto.entityType &&
          entity.entityId === dto.entityId,
      );

      return userRestricted && entityRestricted;
    });

    // Log access check
    for (const wall of walls) {
      await this.createAuditEntry({
        wallId: wall.id,
        action: 'access_denied',
        performedBy: dto.userId,
        performedByName: `User ${dto.userId}`,
        details: `Access denied to ${dto.entityType} ${dto.entityId}`,
        metadata: { dto },
        ipAddress,
      });

      // Send notification
      await this.sendNotification({
        wallId: wall.id,
        wallName: wall.name,
        recipientUserId: dto.userId,
        recipientUserName: `User ${dto.userId}`,
        notificationType: 'access_denied',
        message: `Access denied to ${dto.entityType} due to ethical wall "${wall.name}"`,
        metadata: { entityType: dto.entityType, entityId: dto.entityId },
      });
    }

    if (walls.length > 0) {
      return {
        blocked: true,
        walls,
        message: `Access denied due to ${walls.length} active ethical wall(s)`,
      };
    }

    return {
      blocked: false,
      walls: [],
      message: 'Access granted',
    };
  }

  // Notification System
  private async sendNotification(dto: Omit<EthicalWallNotificationDto, 'id' | 'sentAt'>): Promise<EthicalWallNotificationDto> {
    const notification: EthicalWallNotificationDto = {
      id: this.generateId(),
      ...dto,
      sentAt: new Date(),
    };

    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getNotifications(userId: string): Promise<EthicalWallNotificationDto[]> {
    return Array.from(this.notifications.values())
      .filter((notif) => notif.recipientUserId === userId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async markNotificationRead(notificationId: string): Promise<EthicalWallNotificationDto> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    notification.readAt = new Date();
    this.notifications.set(notificationId, notification);
    return notification;
  }

  // Audit Trail
  private async createAuditEntry(dto: Omit<EthicalWallAuditEntryDto, 'id' | 'timestamp'>): Promise<EthicalWallAuditEntryDto> {
    const entry: EthicalWallAuditEntryDto = {
      id: this.generateId(),
      ...dto,
      timestamp: new Date(),
    };

    this.auditEntries.set(entry.id, entry);
    return entry;
  }

  async getAuditTrail(wallId: string): Promise<EthicalWallAuditEntryDto[]> {
    return Array.from(this.auditEntries.values())
      .filter((entry) => entry.wallId === wallId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAllAuditEntries(organizationId?: string): Promise<EthicalWallAuditEntryDto[]> {
    return Array.from(this.auditEntries.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Breach Detection
  async reportBreach(dto: {
    wallId: string;
    userId: string;
    userName: string;
    entityType: string;
    entityId: string;
    attemptedAction: string;
    ipAddress?: string;
  }): Promise<WallBreachDto> {
    const wall = await this.findOne(dto.wallId);

    const breach: WallBreachDto = {
      id: this.generateId(),
      wallId: dto.wallId,
      wallName: wall.name,
      userId: dto.userId,
      userName: dto.userName,
      entityType: dto.entityType,
      entityId: dto.entityId,
      attemptedAction: dto.attemptedAction,
      detectedAt: new Date(),
      ipAddress: dto.ipAddress,
      resolved: false,
    };

    this.breaches.set(breach.id, breach);

    // Create audit entry
    await this.createAuditEntry({
      wallId: dto.wallId,
      action: 'breach_detected',
      performedBy: dto.userId,
      performedByName: dto.userName,
      details: `Breach detected: ${dto.attemptedAction} on ${dto.entityType} ${dto.entityId}`,
      metadata: { breach },
      ipAddress: dto.ipAddress,
    });

    // Send notification
    await this.sendNotification({
      wallId: dto.wallId,
      wallName: wall.name,
      recipientUserId: wall.createdBy,
      recipientUserName: wall.createdByName,
      notificationType: 'wall_breach',
      message: `Potential breach detected on ethical wall "${wall.name}" by ${dto.userName}`,
      metadata: { breach },
    });

    return breach;
  }

  async getBreaches(wallId?: string): Promise<WallBreachDto[]> {
    const breaches = Array.from(this.breaches.values());

    if (wallId) {
      return breaches
        .filter((b) => b.wallId === wallId)
        .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
    }

    return breaches.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  async resolveBreach(breachId: string, resolvedBy: string): Promise<WallBreachDto> {
    const breach = this.breaches.get(breachId);
    if (!breach) {
      throw new Error(`Breach ${breachId} not found`);
    }

    breach.resolved = true;
    breach.resolvedAt = new Date();
    breach.resolvedBy = resolvedBy;

    this.breaches.set(breachId, breach);
    return breach;
  }

  // Wall Effectiveness Metrics
  async getWallMetrics(wallId: string): Promise<WallEffectivenessMetricsDto> {
    const wall = await this.findOne(wallId);
    const auditEntries = await this.getAuditTrail(wallId);
    const breaches = await this.getBreaches(wallId);

    const accessAttempts = auditEntries.filter(
      (e) => e.action === 'access_granted' || e.action === 'access_denied'
    ).length;

    const blockedAttempts = auditEntries.filter(
      (e) => e.action === 'access_denied'
    ).length;

    const daysActive = Math.ceil(
      (new Date().getTime() - wall.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate effectiveness score (0-100)
    let effectivenessScore = 100;
    if (breaches.length > 0) {
      effectivenessScore -= breaches.filter(b => !b.resolved).length * 10;
    }
    if (accessAttempts > 0 && blockedAttempts / accessAttempts < 0.9) {
      effectivenessScore -= 10;
    }
    effectivenessScore = Math.max(0, Math.min(100, effectivenessScore));

    return {
      wallId: wall.id,
      wallName: wall.name,
      createdAt: wall.createdAt,
      daysActive,
      accessAttempts,
      blockedAttempts,
      breachAttempts: breaches.length,
      affectedUsersCount: wall.restrictedUsers.length,
      restrictedEntitiesCount: wall.restrictedEntities.length,
      effectivenessScore,
    };
  }

  async getAllWallMetrics(organizationId: string): Promise<WallEffectivenessMetricsDto[]> {
    const walls = Array.from(this.ethicalWalls.values()).filter(
      (w) => w.organizationId === organizationId
    );

    const metrics: WallEffectivenessMetricsDto[] = [];
    for (const wall of walls) {
      const wallMetrics = await this.getWallMetrics(wall.id);
      metrics.push(wallMetrics);
    }

    return metrics.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  }

  private detectChanges(oldWall: EthicalWallDto, newWall: EthicalWallDto): string[] {
    const changes: string[] = [];

    if (oldWall.name !== newWall.name) {
      changes.push(`name changed from "${oldWall.name}" to "${newWall.name}"`);
    }
    if (oldWall.description !== newWall.description) {
      changes.push('description updated');
    }
    if (oldWall.restrictedUsers.length !== newWall.restrictedUsers.length) {
      changes.push(`restricted users changed (${oldWall.restrictedUsers.length} → ${newWall.restrictedUsers.length})`);
    }
    if (oldWall.restrictedEntities.length !== newWall.restrictedEntities.length) {
      changes.push(`restricted entities changed (${oldWall.restrictedEntities.length} → ${newWall.restrictedEntities.length})`);
    }
    if (oldWall.status !== newWall.status) {
      changes.push(`status changed from ${oldWall.status} to ${newWall.status}`);
    }

    return changes.length > 0 ? changes : ['no significant changes'];
  }

  private generateId(): string {
    return `wall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
