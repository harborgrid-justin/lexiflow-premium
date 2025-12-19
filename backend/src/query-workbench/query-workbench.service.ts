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
      // Security: Strict query validation
      const queryUpper = dto.query.trim().toUpperCase();
      
      // Only allow SELECT, EXPLAIN, and WITH queries
      if (!queryUpper.startsWith('SELECT') && 
          !queryUpper.startsWith('EXPLAIN') && 
          !queryUpper.startsWith('WITH')) {
        throw new BadRequestException('Only SELECT, EXPLAIN, and WITH queries are allowed');
      }
      
      // Block dangerous keywords
      const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE', 'GRANT', 'REVOKE'];
      const hasUnsafeKeyword = dangerousKeywords.some(keyword => 
        new RegExp(`\\b${keyword}\\b`, 'i').test(dto.query)
      );
      
      if (hasUnsafeKeyword) {
        throw new BadRequestException('Query contains prohibited keywords');
      }
      
      // Block multiple statements (semicolon not at end)
      const statements = dto.query.split(';').filter(s => s.trim());
      if (statements.length > 1) {
        throw new BadRequestException('Multiple statements not allowed');
      }
      
      // Execute with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 30 seconds')), 30000)
      );
      
      result = await Promise.race([
        this.dataSource.query(dto.query),
        timeoutPromise
      ]);
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
