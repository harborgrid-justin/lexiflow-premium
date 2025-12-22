import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryDeepPartialEntity } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectFilterDto, PaginatedProjectResponseDto } from './dto/project-filter.dto';
import { validateSortField, validateSortOrder, sanitizeSearchQuery, validatePagination } from '../common/utils/query-validation.util';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(filterDto: ProjectFilterDto): Promise<PaginatedProjectResponseDto> {
    const {
      search,
      status,
      priority,
      caseId,
      projectManagerId,
      assignedTeamId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const { page, limit } = validatePagination(filterDto.page, filterDto.limit, 100);

    const queryBuilder = this.projectRepository.createQueryBuilder('project');

    // Search by name or description
    const sanitizedSearch = sanitizeSearchQuery(search);
    if (sanitizedSearch) {
      queryBuilder.andWhere(
        '(project.name ILIKE :search OR project.description ILIKE :search)',
        { search: `%${sanitizedSearch}%` },
      );
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    // Filter by priority
    if (priority) {
      queryBuilder.andWhere('project.priority = :priority', { priority });
    }

    // Filter by case
    if (caseId) {
      queryBuilder.andWhere('project.caseId = :caseId', { caseId });
    }

    // Filter by project manager
    if (projectManagerId) {
      queryBuilder.andWhere('project.projectManagerId = :projectManagerId', { projectManagerId });
    }

    // Filter by assigned team
    if (assignedTeamId) {
      queryBuilder.andWhere('project.assignedTeamId = :assignedTeamId', { assignedTeamId });
    }

    // Sorting - SQL injection protection
    const safeSortField = validateSortField('project', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`project.${safeSortField}`, safeSortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    await this.findOne(id);
    const { metadata, ...rest } = updateProjectDto;
    const updateData = {
      ...rest,
      ...(metadata && { metadata: JSON.stringify(metadata) }),
    } as QueryDeepPartialEntity<Project>;
    await this.projectRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.projectRepository.softDelete(id);
  }
}
