import { Module } from '@nestjs/common';

/**
 * DatabaseModule - No longer registers TypeORM here.
 * TypeORM is registered once in AppModule using getDatabaseConfig
 * which properly reads DATABASE_URL for Neon PostgreSQL.
 */
@Module({})
export class DatabaseModule {}
