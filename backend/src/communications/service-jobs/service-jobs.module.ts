import { Module } from '@nestjs/common';
import { ServiceJobsController } from './service-jobs.controller';
import { ServiceJobsService } from './service-jobs.service';

/**
 * Service Jobs Module
 *
 * Provides service of process tracking functionality
 * Manages process servers and service completion
 *
 * @module ServiceJobsModule
 */
@Module({
  imports: [
    // TypeORM entities will be imported here once created by Agent 1
    // TypeOrmModule.forFeature([ServiceJob]),
  ],
  controllers: [ServiceJobsController],
  providers: [ServiceJobsService],
  exports: [ServiceJobsService],
})
export class ServiceJobsModule {}
