import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { TimeOffRequest } from './entities/time-off-request.entity';
import { CreateEmployeeDto, EmployeeStatus } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateTimeOffDto, TimeOffStatus } from './dto/create-time-off.dto';
import { calculateOffset, calculateTotalPages } from '@common/utils/math.utils';
import { validateSortField, validateSortOrder, sanitizeSearchQuery } from '@common/utils/query-validation.util';

@Injectable()
export class HRService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(TimeOffRequest)
    private readonly timeOffRepository: Repository<TimeOffRequest>,
  ) {}

  // Employee Management
  async createEmployee(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.employeeRepository.findOne({
      where: { email: createEmployeeDto.email }
    });

    if (existing) {
      throw new ConflictException(`Employee with email ${createEmployeeDto.email} already exists`);
    }

    const employee = this.employeeRepository.create(createEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  async findAllEmployees(filters: {
    status?: string;
    department?: string;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, department, role, search, sortBy, sortOrder, page = 1, limit = 50 } = filters;
    
    const queryBuilder = this.employeeRepository.createQueryBuilder('employee');

    if (status) queryBuilder.andWhere('employee.status = :status', { status });
    if (department) queryBuilder.andWhere('employee.department = :department', { department });
    if (role) queryBuilder.andWhere('employee.role = :role', { role });
    
    const sanitizedSearch = sanitizeSearchQuery(search);
    if (sanitizedSearch) {
      queryBuilder.andWhere(
        '(employee.firstName LIKE :search OR employee.lastName LIKE :search OR employee.email LIKE :search)',
        { search: `%${sanitizedSearch}%` }
      );
    }

    const safeSortField = validateSortField('employee', sortBy, 'lastName');
    const safeSortOrder = validateSortOrder(sortOrder, 'ASC');

    const [data, total] = await queryBuilder
      .orderBy(`employee.${safeSortField}`, safeSortOrder)
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

  async findOneEmployee(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['timeOffRequests']
    });
    
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOneEmployee(id);

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existing = await this.employeeRepository.findOne({
        where: { email: updateEmployeeDto.email }
      });
      if (existing) {
        throw new ConflictException(`Email ${updateEmployeeDto.email} is already in use`);
      }
    }

    Object.assign(employee, updateEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  async deleteEmployee(id: string): Promise<void> {
    const employee = await this.findOneEmployee(id);
    await this.employeeRepository.remove(employee);
  }

  // Time Off Management
  async createTimeOffRequest(createTimeOffDto: CreateTimeOffDto): Promise<TimeOffRequest> {
    // Verify employee exists
    await this.findOneEmployee(createTimeOffDto.employeeId);

    // Check for overlapping requests
    const overlapping = await this.timeOffRepository
      .createQueryBuilder('request')
      .where('request.employeeId = :employeeId', { employeeId: createTimeOffDto.employeeId })
      .andWhere('request.status != :cancelled', { cancelled: TimeOffStatus.CANCELLED })
      .andWhere('request.status != :denied', { denied: TimeOffStatus.DENIED })
      .andWhere(
        '(request.startDate <= :endDate AND request.endDate >= :startDate)',
        { startDate: createTimeOffDto.startDate, endDate: createTimeOffDto.endDate }
      )
      .getOne();

    if (overlapping) {
      throw new ConflictException('Time off request overlaps with an existing request');
    }

    const request = this.timeOffRepository.create(createTimeOffDto);
    return await this.timeOffRepository.save(request);
  }

  async findAllTimeOffRequests(filters: {
    employeeId?: string;
    status?: TimeOffStatus;
    page?: number;
    limit?: number;
  }) {
    const { employeeId, status, page = 1, limit = 50 } = filters;
    
    const where: FindOptionsWhere<TimeOffRequest> = {};
    if (employeeId) {
          if (employeeId) where.employeeId = employeeId;
    }
    if (status) where.status = status;

    const [data, total] = await this.timeOffRepository.findAndCount({
      where,
      relations: ['employee'],
      order: { startDate: 'DESC' },
      skip: calculateOffset(page, limit),
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: calculateTotalPages(total, limit),
    };
  }

  async approveTimeOff(id: string, approverId: string): Promise<TimeOffRequest> {
    const request = await this.timeOffRepository.findOne({ where: { id } });
    
    if (!request) {
      throw new NotFoundException(`Time off request with ID ${id} not found`);
    }

    if (request.status !== TimeOffStatus.PENDING) {
      throw new ConflictException('Only pending requests can be approved');
    }

    request.status = TimeOffStatus.APPROVED;
    request.approvedBy = approverId;
    request.approvedAt = new Date();

    return await this.timeOffRepository.save(request);
  }

  async denyTimeOff(id: string, approverId: string, reason?: string): Promise<TimeOffRequest> {
    const request = await this.timeOffRepository.findOne({ where: { id } });
    
    if (!request) {
      throw new NotFoundException(`Time off request with ID ${id} not found`);
    }

    if (request.status !== TimeOffStatus.PENDING) {
      throw new ConflictException('Only pending requests can be denied');
    }

    request.status = TimeOffStatus.DENIED;
    request.approvedBy = approverId;
    request.approvedAt = new Date();
    request.denialReason = reason || '';

    return await this.timeOffRepository.save(request);
  }

  async getUtilization(filters: {
    employeeId?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { employeeId, department, startDate, endDate } = filters;
    
    const queryBuilder = this.employeeRepository.createQueryBuilder('employee');

    if (employeeId) {
      queryBuilder.andWhere('employee.id = :employeeId', { employeeId });
    }
    if (department) {
      queryBuilder.andWhere('employee.department = :department', { department });
    }
    queryBuilder.andWhere('employee.status = :status', { status: EmployeeStatus.ACTIVE });

    const employees = await queryBuilder.getMany();

    // Calculate utilization metrics
    const utilization = employees.map(employee => ({
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      role: employee.role,
      billableHours: 0, // To be calculated from time tracking
      totalHours: 0,
      utilizationRate: 0,
      capacity: 40, // Standard 40 hours per week
    }));

    return {
      data: utilization,
      total: utilization.length,
      averageUtilization: 0,
      period: {
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date().toISOString(),
      },
    };
  }
}
