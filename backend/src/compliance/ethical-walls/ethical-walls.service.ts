import { Injectable } from '@nestjs/common';
import {
  EthicalWallDto,
  CreateEthicalWallDto,
  UpdateEthicalWallDto,
  QueryEthicalWallsDto,
  CheckEthicalWallDto,
  EthicalWallCheckResult,
  EthicalWallStatus,
} from './dto/ethical-wall.dto';

@Injectable()
export class EthicalWallsService {
  private ethicalWalls: Map<string, EthicalWallDto> = new Map();

  async create(dto: CreateEthicalWallDto): Promise<EthicalWallDto> {
    const wall: EthicalWallDto = {
      id: this.generateId(),
      ...dto,
      status: EthicalWallStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.ethicalWalls.set(wall.id, wall);
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

  async update(id: string, dto: UpdateEthicalWallDto): Promise<EthicalWallDto> {
    const wall = await this.findOne(id);

    const updatedWall: EthicalWallDto = {
      ...wall,
      ...dto,
      updatedAt: new Date(),
    };

    this.ethicalWalls.set(id, updatedWall);
    return updatedWall;
  }

  async remove(id: string): Promise<void> {
    const wall = await this.findOne(id);
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

  async checkAccess(dto: CheckEthicalWallDto): Promise<EthicalWallCheckResult> {
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

  private generateId(): string {
    return `wall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
