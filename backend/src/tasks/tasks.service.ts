import { Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere} from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto, TaskStatus, TaskPriority } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { calculateOffset, calculateTotalPages } from '@common/utils/math.utils';
import { sanitizeSearchQuery } from '@common/utils/query-validation.util';

/**
 * ╔=================================================================================================================╗
 * ║TASKS                                                                                                            ║
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
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdBy: userId,
    });

    return await this.taskRepository.save(task);
  }

  async findAll(filters: {
    status?: TaskStatus;
    priority?: string;
    caseId?: string;
    assignedTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, priority, caseId, assignedTo, search, page = 1, limit = 50 } = filters;
    
    const where: FindOptionsWhere<Task> = {};
    
    if (status) where.status = status;
    if (priority && Object.values(TaskPriority).includes(priority as TaskPriority)) {
      where.priority = priority as TaskPriority;
    }
    if (caseId) where.caseId = caseId;
    if (assignedTo) where.assignedTo = assignedTo;

    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    const sanitizedSearch = sanitizeSearchQuery(search);
    if (sanitizedSearch) {
      queryBuilder.where('task.title LIKE :search OR task.description LIKE :search', {
        search: `%${sanitizedSearch}%`,
      });
    }

    Object.keys(where).forEach(key => {
      const typedKey = key as keyof FindOptionsWhere<Task>;
      queryBuilder.andWhere(`task.${key} = :${key}`, { [key]: where[typedKey] });
    });

    const [data, total] = await queryBuilder
      .orderBy('task.dueDate', 'ASC', 'NULLS LAST')
      .addOrderBy('task.priority', 'DESC')
      .skip(calculateOffset(page, limit))
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: calculateTotalPages(total, limit),
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    // Auto-complete when status changes to Completed
    if (updateTaskDto.status === TaskStatus.COMPLETED && updateTaskDto.completionPercentage === undefined) {
      updateTaskDto.completionPercentage = 100;
    }

    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async bulkUpdate(updates: Array<{ id: string; updates: UpdateTaskDto }>): Promise<Task[]> {
    const results = await Promise.all(
      updates.map(({ id, updates: updateDto }) => this.update(id, updateDto))
    );
    return results;
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  async getTaskStats(caseId?: string) {
    const where: FindOptionsWhere<Task> = caseId ? { caseId } : {};

    const [total, completed, inProgress, blocked, overdue] = await Promise.all([
      this.taskRepository.count({ where }),
      this.taskRepository.count({ where: { ...where, status: TaskStatus.COMPLETED } }),
      this.taskRepository.count({ where: { ...where, status: TaskStatus.IN_PROGRESS } }),
      this.taskRepository.count({ where: { ...where, status: TaskStatus.BLOCKED } }),
      this.taskRepository.createQueryBuilder('task')
        .where(where)
        .andWhere('task.dueDate < :now', { now: new Date() })
        .andWhere('task.status != :completed', { completed: TaskStatus.COMPLETED })
        .getCount(),
    ]);

    return {
      total,
      completed,
      inProgress,
      blocked,
      overdue,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }
}
