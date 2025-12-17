import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Migration } from './entities/migration.entity';
import { Snapshot } from './entities/snapshot.entity';
import { CreateMigrationDto, CreateSnapshotDto, CreateTableDto } from './dto/create-migration.dto';

@Injectable()
export class SchemaManagementService {
  constructor(
    @InjectRepository(Migration)
    private readonly migrationRepository: Repository<Migration>,
    @InjectRepository(Snapshot)
    private readonly snapshotRepository: Repository<Snapshot>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ==================== SCHEMA INSPECTION ====================
  
  async getTables() {
    const query = `
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tables = await this.dataSource.query(query);
    
    // Get columns for each table
    const tablesWithColumns = await Promise.all(
      tables.map(async (table) => {
        const columns = await this.getTableColumns(table.table_name);
        return {
          name: table.table_name,
          columnCount: parseInt(table.column_count),
          columns,
        };
      })
    );
    
    return tablesWithColumns;
  }

  async getTableColumns(tableName: string) {
    const query = `
      SELECT 
        column_name as name,
        data_type as type,
        is_nullable,
        column_default as "defaultValue",
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = $1
      ORDER BY ordinal_position;
    `;
    
    const columns = await this.dataSource.query(query, [tableName]);
    
    // Get primary keys
    const pkQuery = `
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary;
    `;
    
    const pks = await this.dataSource.query(pkQuery, [tableName]);
    const pkColumns = new Set(pks.map(pk => pk.column_name));
    
    return columns.map(col => ({
      ...col,
      pk: pkColumns.has(col.name),
      notNull: col.is_nullable === 'NO',
      type: col.character_maximum_length 
        ? `${col.type}(${col.character_maximum_length})` 
        : col.type,
    }));
  }

  // ==================== MIGRATIONS ====================
  
  async createMigration(dto: CreateMigrationDto, userId: string) {
    const migration = this.migrationRepository.create({
      ...dto,
      appliedBy: userId,
    });
    
    return await this.migrationRepository.save(migration);
  }

  async getMigrations() {
    return await this.migrationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async applyMigration(id: string, userId: string) {
    const migration = await this.migrationRepository.findOne({ where: { id } });
    
    if (!migration) {
      throw new NotFoundException(`Migration ${id} not found`);
    }
    
    if (migration.applied) {
      throw new BadRequestException('Migration already applied');
    }
    
    try {
      await this.dataSource.query(migration.up);
      
      migration.applied = true;
      migration.appliedAt = new Date();
      migration.appliedBy = userId;
      
      return await this.migrationRepository.save(migration);
    } catch (error) {
      throw new BadRequestException(`Migration failed: ${error.message}`);
    }
  }

  async revertMigration(id: string) {
    const migration = await this.migrationRepository.findOne({ where: { id } });
    
    if (!migration) {
      throw new NotFoundException(`Migration ${id} not found`);
    }
    
    if (!migration.applied) {
      throw new BadRequestException('Migration not applied');
    }
    
    try {
      await this.dataSource.query(migration.down);
      
      migration.applied = false;
      migration.appliedAt = null;
      
      return await this.migrationRepository.save(migration);
    } catch (error) {
      throw new BadRequestException(`Revert failed: ${error.message}`);
    }
  }

  // ==================== SNAPSHOTS ====================
  
  async createSnapshot(dto: CreateSnapshotDto, userId: string) {
    const tables = await this.getTables();
    const schemaData = {
      tables: dto.tables ? tables.filter(t => dto.tables.includes(t.name)) : tables,
      timestamp: new Date().toISOString(),
    };
    
    const snapshot = this.snapshotRepository.create({
      ...dto,
      schema: schemaData,
      sizeBytes: JSON.stringify(schemaData).length,
      createdBy: userId,
    });
    
    return await this.snapshotRepository.save(snapshot);
  }

  async getSnapshots() {
    return await this.snapshotRepository.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'description', 'sizeBytes', 'createdAt', 'createdBy'],
    });
  }

  async getSnapshot(id: string) {
    const snapshot = await this.snapshotRepository.findOne({ where: { id } });
    
    if (!snapshot) {
      throw new NotFoundException(`Snapshot ${id} not found`);
    }
    
    return snapshot;
  }

  async deleteSnapshot(id: string) {
    const snapshot = await this.getSnapshot(id);
    return await this.snapshotRepository.remove(snapshot);
  }

  // ==================== TABLE OPERATIONS ====================
  
  async createTable(dto: CreateTableDto) {
    const columnDefs = dto.columns.map(col => {
      let def = `${col.name} ${col.type}`;
      if (col.pk) def += ' PRIMARY KEY';
      if (col.notNull) def += ' NOT NULL';
      if (col.unique) def += ' UNIQUE';
      if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
      return def;
    }).join(', ');
    
    const query = `CREATE TABLE IF NOT EXISTS ${dto.name} (${columnDefs})`;
    
    await this.dataSource.query(query);
    
    // Add foreign keys separately
    for (const col of dto.columns.filter(c => c.fk)) {
      const [refTable, refColumn] = col.fk.split('.');
      const fkQuery = `ALTER TABLE ${dto.name} ADD CONSTRAINT fk_${dto.name}_${col.name} FOREIGN KEY (${col.name}) REFERENCES ${refTable}(${refColumn})`;
      await this.dataSource.query(fkQuery);
    }
    
    return { success: true, table: dto.name };
  }

  async alterTable(tableName: string, alterations: any) {
    // Implementation for ALTER TABLE operations
    // This would handle adding/dropping columns, changing types, etc.
    throw new Error('Not implemented yet');
  }

  async dropTable(tableName: string) {
    await this.dataSource.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
    return { success: true, table: tableName };
  }
}
