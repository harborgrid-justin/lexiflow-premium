import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';

/**
 * Projects Module
 * Project management and task tracking for legal work
 * Features:
 * - Project creation and organization
 * - Task assignment and tracking
 * - Milestone and deadline management
 * - Team collaboration and resource allocation
 */
@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
