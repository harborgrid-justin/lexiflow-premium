import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { QueryHistory } from './entities/query-history.entity';
import { SavedQuery } from './entities/saved-query.entity';
import { ExecuteQueryDto, SaveQueryDto } from './dto/execute-query.dto';

@Injectable()
export class QueryWorkbenchService {
  constructor(
    @InjectRepository(QueryHistory)
    private readonly historyRepository: Repository<QueryHistory>,
    @InjectRepository(SavedQuery)
    private readonly savedQueryRepository: Repository<SavedQuery>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async executeQuery(dto: ExecuteQueryDto, userId: string) {
    const startTime = Date.now();
    let result: any;
    let success = true;
    let error: string | null = null;
    let rowsAffected = 0;

    try {
      // Security: Only allow SELECT, EXPLAIN, and WITH queries
      const queryUpper = dto.query.trim().toUpperCase();
      if (!queryUpper.startsWith('SELECT') && 
          !queryUpper.startsWith('EXPLAIN') && 
          !queryUpper.startsWith('WITH')) {
        throw new BadRequestException('Only SELECT, EXPLAIN, and WITH queries are allowed');
      }

      result = await this.dataSource.query(dto.query);
      rowsAffected = Array.isArray(result) ? result.length : 0;
    } catch (err) {
      success = false;
      error = err.message;
      result = null;
    }

    const executionTime = Date.now() - startTime;

    // Save to history
    const history = this.historyRepository.create({
      query: dto.query,
      userId,
      executionTimeMs: executionTime,
      rowsAffected,
      successful: success,
      error,
    });
    
    await this.historyRepository.save(history);

    return {
      success,
      data: result,
      executionTimeMs: executionTime,
      rowsAffected,
      error,
      historyId: history.id,
    };
  }

  async getHistory(userId: string, limit = 100) {
    return await this.historyRepository.find({
      where: { userId },
      order: { executedAt: 'DESC' },
      take: limit,
    });
  }

  async saveQuery(dto: SaveQueryDto, userId: string) {
    const savedQuery = this.savedQueryRepository.create({
      ...dto,
      userId,
    });
    
    return await this.savedQueryRepository.save(savedQuery);
  }

  async getSavedQueries(userId: string) {
    return await this.savedQueryRepository.find({
      where: [
        { userId },
        { isShared: true },
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  async deleteSavedQuery(id: string, userId: string) {
    const query = await this.savedQueryRepository.findOne({
      where: { id, userId },
    });
    
    if (!query) {
      throw new BadRequestException('Query not found or access denied');
    }
    
    return await this.savedQueryRepository.remove(query);
  }

  async explainQuery(dto: ExecuteQueryDto) {
    const explainQuery = `EXPLAIN (FORMAT JSON, ANALYZE) ${dto.query}`;
    
    try {
      const result = await this.dataSource.query(explainQuery);
      return {
        success: true,
        plan: result[0]['QUERY PLAN'],
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  }
}
