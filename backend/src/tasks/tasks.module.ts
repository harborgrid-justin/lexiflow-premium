import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';

/**
 * Tasks Module
 * Personal and team task management
 * Features:
 * - Task creation and assignment
 * - Due date tracking and reminders
 * - Task priorities and status workflow
 * - Integration with cases and projects
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService]
})
export class TasksModule {}
