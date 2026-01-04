import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Migration } from "./entities/migration.entity";
import { Snapshot } from "./entities/snapshot.entity";
import {
  CreateMigrationDto,
  CreateSnapshotDto,
  CreateTableDto,
} from "./dto/create-migration.dto";
import {
  TableQueryResult,
  TableInfo,
  ColumnQueryResult,
  PrimaryKeyInfo,
  TableColumn,
  AlterTableOperations,
  SchemaSnapshotData,
} from "./interfaces";

/**
 * ╔=================================================================================================================╗
 * ║SCHEMAMANAGEMENT                                                                                                 ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class SchemaManagementService {
  constructor(
    @InjectRepository(Migration)
    private readonly migrationRepository: Repository<Migration>,
    @InjectRepository(Snapshot)
    private readonly snapshotRepository: Repository<Snapshot>,
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  // ==================== SCHEMA INSPECTION ====================

  async getTables(): Promise<TableInfo[]> {
    const query = `
      SELECT
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const tables = await this.dataSource.query<TableQueryResult[]>(query);

    // Get columns for each table
    const tablesWithColumns = await Promise.all(
      tables.map(async (table: TableQueryResult): Promise<TableInfo> => {
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

  async getTableColumns(tableName: string): Promise<TableColumn[]> {
    // Validate table name to prevent SQL injection
    if (!this.isValidIdentifier(tableName)) {
      throw new BadRequestException("Invalid table name format");
    }

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

    const columns = await this.dataSource.query<ColumnQueryResult[]>(query, [
      tableName,
    ]);

    // Get primary keys
    const pkQuery = `
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary;
    `;

    const pks = await this.dataSource.query<PrimaryKeyInfo[]>(pkQuery, [
      tableName,
    ]);
    const pkColumns = new Set(pks.map((pk: PrimaryKeyInfo) => pk.column_name));

    return columns.map(
      (col: ColumnQueryResult): TableColumn => ({
        ...col,
        pk: pkColumns.has(col.name),
        notNull: col.is_nullable === "NO",
        type: col.character_maximum_length
          ? `${col.type}(${col.character_maximum_length})`
          : col.type,
      })
    );
  }

  // ==================== MIGRATIONS ====================

  async createMigration(
    dto: CreateMigrationDto,
    userId: string
  ): Promise<Migration> {
    const migration = this.migrationRepository.create({
      ...dto,
      appliedBy: userId,
    });

    return await this.migrationRepository.save(migration);
  }

  async getMigrations(): Promise<Migration[]> {
    return await this.migrationRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Validate SQL identifier (table/column name) to prevent injection
   */
  private isValidIdentifier(name: string): boolean {
    // PostgreSQL identifier rules: starts with letter or underscore,
    // contains only letters, digits, underscores, max 63 chars
    const validPattern = /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/;
    return validPattern.test(name);
  }

  async applyMigration(id: string, userId: string): Promise<Migration> {
    const migration = await this.migrationRepository.findOne({ where: { id } });

    if (!migration) {
      throw new NotFoundException(`Migration ${id} not found`);
    }

    if (migration.applied) {
      throw new BadRequestException("Migration already applied");
    }

    try {
      await this.dataSource.query(migration.up);

      migration.applied = true;
      migration.appliedAt = new Date();
      migration.appliedBy = userId;

      return await this.migrationRepository.save(migration);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(`Migration failed: ${message}`);
    }
  }

  async revertMigration(id: string): Promise<Migration> {
    const migration = await this.migrationRepository.findOne({ where: { id } });

    if (!migration) {
      throw new NotFoundException(`Migration ${id} not found`);
    }

    if (!migration.applied) {
      throw new BadRequestException("Migration not applied");
    }

    try {
      await this.dataSource.query(migration.down);

      migration.applied = false;
      migration.appliedAt = null;

      return await this.migrationRepository.save(migration);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(`Revert failed: ${message}`);
    }
  }

  // ==================== SNAPSHOTS ====================

  async createSnapshot(
    dto: CreateSnapshotDto,
    userId: string
  ): Promise<Snapshot> {
    const tables = await this.getTables();

    // Filter tables based on provided table names or include all
    let filteredTables = tables;
    if (dto.tables && dto.tables.length > 0) {
      const tableNames = dto.tables;
      filteredTables = tables.filter((t) => tableNames.includes(t.name));
    }

    const schemaData: SchemaSnapshotData = {
      tables: filteredTables,
      timestamp: new Date().toISOString(),
    };

    const snapshot = this.snapshotRepository.create({
      name: dto.name,
      description: dto.description,
      schema: schemaData as unknown as Record<string, unknown>,
      sizeBytes: JSON.stringify(schemaData).length,
      createdBy: userId,
    });

    return await this.snapshotRepository.save(snapshot);
  }

  async getSnapshots(): Promise<Snapshot[]> {
    return await this.snapshotRepository.find({
      order: { createdAt: "DESC" },
      select: [
        "id",
        "name",
        "description",
        "sizeBytes",
        "createdAt",
        "createdBy",
      ],
    });
  }

  async getSnapshot(id: string): Promise<Snapshot> {
    const snapshot = await this.snapshotRepository.findOne({ where: { id } });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot ${id} not found`);
    }

    return snapshot;
  }

  async deleteSnapshot(id: string): Promise<Snapshot> {
    const snapshot = await this.getSnapshot(id);
    return await this.snapshotRepository.remove(snapshot);
  }

  // ==================== TABLE OPERATIONS ====================

  async createTable(
    dto: CreateTableDto
  ): Promise<{ success: boolean; table: string }> {
    const columnDefs = dto.columns
      .map((col) => {
        let def = `${col.name} ${col.type}`;
        if (col.pk) def += " PRIMARY KEY";
        if (col.notNull) def += " NOT NULL";
        if (col.unique) def += " UNIQUE";
        if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
        return def;
      })
      .join(", ");

    const query = `CREATE TABLE IF NOT EXISTS ${dto.name} (${columnDefs})`;

    await this.dataSource.query(query);

    // Add foreign keys separately
    for (const col of dto.columns.filter((c) => c.fk)) {
      if (col.fk) {
        const [refTable, refColumn] = col.fk.split(".");
        const fkQuery = `ALTER TABLE ${dto.name} ADD CONSTRAINT fk_${dto.name}_${col.name} FOREIGN KEY (${col.name}) REFERENCES ${refTable}(${refColumn})`;
        await this.dataSource.query(fkQuery);
      }
    }

    return { success: true, table: dto.name };
  }

  async alterTable(
    tableName: string,
    alterations: AlterTableOperations
  ): Promise<{ success: boolean; table: string; operations: number }> {
    // Validate table name to prevent SQL injection
    if (!this.isValidIdentifier(tableName)) {
      throw new BadRequestException("Invalid table name format");
    }

    const operations: string[] = [];

    // Handle ADD COLUMN
    if (alterations.addColumns && Array.isArray(alterations.addColumns)) {
      for (const col of alterations.addColumns) {
        if (!this.isValidIdentifier(col.name)) {
          throw new BadRequestException(`Invalid column name: ${col.name}`);
        }
        const columnDef = `ADD COLUMN "${col.name}" ${col.type}${col.nullable === false ? " NOT NULL" : ""}${col.default ? ` DEFAULT ${col.default}` : ""}`;
        operations.push(columnDef);
      }
    }

    // Handle DROP COLUMN
    if (alterations.dropColumns && Array.isArray(alterations.dropColumns)) {
      for (const colName of alterations.dropColumns) {
        if (!this.isValidIdentifier(colName)) {
          throw new BadRequestException(`Invalid column name: ${colName}`);
        }
        operations.push(`DROP COLUMN "${colName}"`);
      }
    }

    // Handle ALTER COLUMN TYPE
    if (alterations.alterColumns && Array.isArray(alterations.alterColumns)) {
      for (const col of alterations.alterColumns) {
        if (!this.isValidIdentifier(col.name)) {
          throw new BadRequestException(`Invalid column name: ${col.name}`);
        }
        if (col.type) {
          operations.push(`ALTER COLUMN "${col.name}" TYPE ${col.type}`);
        }
        if (col.nullable !== undefined) {
          operations.push(
            `ALTER COLUMN "${col.name}" ${col.nullable ? "DROP NOT NULL" : "SET NOT NULL"}`
          );
        }
      }
    }

    // Handle RENAME COLUMN
    if (alterations.renameColumns && Array.isArray(alterations.renameColumns)) {
      for (const rename of alterations.renameColumns) {
        if (
          !this.isValidIdentifier(rename.oldName) ||
          !this.isValidIdentifier(rename.newName)
        ) {
          throw new BadRequestException("Invalid column names for rename");
        }
        operations.push(
          `RENAME COLUMN "${rename.oldName}" TO "${rename.newName}"`
        );
      }
    }

    if (operations.length === 0) {
      throw new BadRequestException("No valid alterations provided");
    }

    // Execute all operations in a single ALTER TABLE statement
    const query = `ALTER TABLE "${tableName}" ${operations.join(", ")}`;
    await this.dataSource.query(query);

    return { success: true, table: tableName, operations: operations.length };
  }

  async dropTable(
    tableName: string
  ): Promise<{ success: boolean; table: string }> {
    // Validate table name to prevent SQL injection
    if (!this.isValidIdentifier(tableName)) {
      throw new BadRequestException("Invalid table name format");
    }

    // Use double quotes for identifier to prevent injection
    await this.dataSource.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    return { success: true, table: tableName };
  }

  async getDbInfo(): Promise<any> {
    const dbNameResult = await this.dataSource.query(
      "SELECT current_database()"
    );
    const dbName = dbNameResult[0].current_database;

    const versionResult = await this.dataSource.query("SELECT version()");
    const version = versionResult[0].version;

    const tablesResult = await this.dataSource.query(`
      SELECT count(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tablesResult[0].count, 10);

    const sizeResult = await this.dataSource.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    const size = sizeResult[0].size;

    return {
      name: dbName,
      version: version,
      mode: "readwrite", // PostgreSQL is typically readwrite unless configured otherwise
      totalStores: tableCount,
      size: size,
      stores: await this.getTables(), // Reusing existing method to list tables
    };
  }

  async resetDatabase(): Promise<any> {
    if (process.env.NODE_ENV === "production") {
      throw new BadRequestException(
        "Cannot reset database in production environment"
      );
    }

    // Safety check: Ensure we are not deleting critical system tables if any
    // For a full reset in dev, we typically drop the public schema and recreate it

    try {
      await this.dataSource.query("DROP SCHEMA public CASCADE");
      await this.dataSource.query("CREATE SCHEMA public");
      await this.dataSource.query("GRANT ALL ON SCHEMA public TO public");

      // Re-run migrations to restore schema structure
      await this.dataSource.runMigrations();

      return {
        success: true,
        message: "Database successfully reset and migrations reapplied",
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to reset database: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
