import { calculateOffset, calculateTotalPages } from "@common/utils/math.utils";
import {
  sanitizeSearchQuery,
  validateSortField,
  validateSortOrder,
} from "@common/utils/query-validation.util";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { TimeEntry } from "../billing/time-entries/entities/time-entry.entity";
import { CaseTeamMember } from "../case-teams/entities/case-team.entity";
import { User } from "../users/entities/user.entity";
import { CreateEmployeeDto, EmployeeStatus } from "./dto/create-employee.dto";
import { CreateTimeOffDto, TimeOffStatus } from "./dto/create-time-off.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { Employee } from "./entities/employee.entity";
import { TimeOffRequest } from "./entities/time-off-request.entity";

/**
 * ╔=================================================================================================================╗
 * ║HR                                                                                                               ║
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
export class HRService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(TimeOffRequest)
    private readonly timeOffRepository: Repository<TimeOffRequest>,
    @InjectRepository(CaseTeamMember)
    private readonly caseTeamMemberRepository: Repository<CaseTeamMember>,
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  /**
   * Calculate utilization metrics for all active staff
   * Replaces mock data with real aggregation from Time Entries and Case Assignments
   */
  async getUtilizationMetrics() {
    // Fetch all active employees
    const employees = await this.employeeRepository.find({
      where: { status: EmployeeStatus.ACTIVE },
    });

    const metrics = await Promise.all(
      employees.map(async (employee) => {
        let caseCount = 0;
        let totalHours = 0;

        try {
          const user = await this.userRepository.findOne({
            where: { email: employee.email },
          });

          if (user) {
            caseCount = await this.caseTeamMemberRepository.count({
              where: { userId: user.id },
            });

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { sum } = await this.timeEntryRepository
              .createQueryBuilder("entry")
              .select("SUM(entry.duration)", "sum")
              .where("entry.userId = :userId", { userId: user.id })
              .andWhere("entry.date >= :startDate", {
                startDate: thirtyDaysAgo,
              })
              .getRawOne();

            totalHours = Number(sum || 0);
          }
        } catch {\2// ignore
        }

        let targetMonthly = employee.targetBillableHours || 160;
        if (targetMonthly > 200) targetMonthly = targetMonthly / 12;

        const utilization =
          targetMonthly > 0
            ? Math.round((totalHours / targetMonthly) * 100)
            : 0;

        return {
          name: `${employee.firstName} ${employee.lastName}`,
          role: employee.role || "Staff",
          utilization: Math.min(100, utilization),
          cases: caseCount,
        };
      })
    );

    return metrics;
  }

  // Employee Management
  async createEmployee(
    createEmployeeDto: CreateEmployeeDto
  ): Promise<Employee> {
    const existing = await this.employeeRepository.findOne({
      where: { email: createEmployeeDto.email },
    });

    if (existing) {
      throw new ConflictException(
        `Employee with email ${createEmployeeDto.email} already exists`
      );
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
    const {
      status,
      department,
      role,
      search,
      sortBy,
      sortOrder,
      page = 1,
      limit = 50,
    } = filters;

    const queryBuilder = this.employeeRepository.createQueryBuilder("employee");

    if (status) queryBuilder.andWhere("employee.status = :status", { status });
    if (department)
      queryBuilder.andWhere("employee.department = :department", {
        department,
      });
    if (role) queryBuilder.andWhere("employee.role = :role", { role });

    const sanitizedSearch = sanitizeSearchQuery(search);
    if (sanitizedSearch) {
      queryBuilder.andWhere(
        "(employee.firstName LIKE :search OR employee.lastName LIKE :search OR employee.email LIKE :search)",
        { search: `%${sanitizedSearch}%` }
      );
    }

    const safeSortField = validateSortField("employee", sortBy, "lastName");
    const safeSortOrder = validateSortOrder(sortOrder, "ASC");

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
      relations: ["timeOffRequests"],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async updateEmployee(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto
  ): Promise<Employee> {
    const employee = await this.findOneEmployee(id);

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existing = await this.employeeRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });
      if (existing) {
        throw new ConflictException(
          `Email ${updateEmployeeDto.email} is already in use`
        );
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
  async createTimeOffRequest(
    createTimeOffDto: CreateTimeOffDto
  ): Promise<TimeOffRequest> {
    // Verify employee exists
    await this.findOneEmployee(createTimeOffDto.employeeId);

    // Check for overlapping requests
    const overlapping = await this.timeOffRepository
      .createQueryBuilder("request")
      .where("request.employeeId = :employeeId", {
        employeeId: createTimeOffDto.employeeId,
      })
      .andWhere("request.status != :cancelled", {
        cancelled: TimeOffStatus.CANCELLED,
      })
      .andWhere("request.status != :denied", { denied: TimeOffStatus.DENIED })
      .andWhere(
        "(request.startDate <= :endDate AND request.endDate >= :startDate)",
        {
          startDate: createTimeOffDto.startDate,
          endDate: createTimeOffDto.endDate,
        }
      )
      .getOne();

    if (overlapping) {
      throw new ConflictException(
        "Time off request overlaps with an existing request"
      );
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
      relations: ["employee"],
      order: { startDate: "DESC" },
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

  async approveTimeOff(
    id: string,
    approverId: string
  ): Promise<TimeOffRequest> {
    const request = await this.timeOffRepository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Time off request with ID ${id} not found`);
    }

    if (request.status !== TimeOffStatus.PENDING) {
      throw new ConflictException("Only pending requests can be approved");
    }

    request.status = TimeOffStatus.APPROVED;
    request.approvedBy = approverId;
    request.approvedAt = new Date();

    return await this.timeOffRepository.save(request);
  }

  async denyTimeOff(
    id: string,
    approverId: string,
    reason?: string
  ): Promise<TimeOffRequest> {
    const request = await this.timeOffRepository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Time off request with ID ${id} not found`);
    }

    if (request.status !== TimeOffStatus.PENDING) {
      throw new ConflictException("Only pending requests can be denied");
    }

    request.status = TimeOffStatus.DENIED;
    request.approvedBy = approverId;
    request.approvedAt = new Date();
    request.denialReason = reason || "";

    return await this.timeOffRepository.save(request);
  }

  async getUtilization(filters: {
    employeeId?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { employeeId, department, startDate, endDate } = filters;

    const queryBuilder = this.employeeRepository.createQueryBuilder("employee");

    if (employeeId) {
      queryBuilder.andWhere("employee.id = :employeeId", { employeeId });
    }
    if (department) {
      queryBuilder.andWhere("employee.department = :department", {
        department,
      });
    }
    queryBuilder.andWhere("employee.status = :status", {
      status: EmployeeStatus.ACTIVE,
    });

    const employees = await queryBuilder.getMany();

    // Calculate utilization metrics
    const utilization = await Promise.all(
      employees.map(async (employee) => {
        let billableHours = 0;
        try {
          const user = await this.userRepository.findOne({
            where: { email: employee.email },
          });
          if (user) {
            const qb = this.timeEntryRepository
              .createQueryBuilder("entry")
              .select("SUM(entry.duration)", "sum")
              .where("entry.userId = :userId", { userId: user.id });
            if (startDate)
              qb.andWhere("entry.date >= :startDate", { startDate });
            if (endDate) qb.andWhere("entry.date <= :endDate", { endDate });
            const { sum } = await qb.getRawOne();
            billableHours = Number(sum || 0);
          }
        } catch {
      // Error ignored
    }

        let capacity = 160;
        if (startDate && endDate) {
          const days =
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 3600 * 24);
          capacity = Math.round(Math.max(1, days / 7) * 40);
        }
        const utilizationRate =
          capacity > 0 ? Math.round((billableHours / capacity) * 100) : 0;

        return {
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          department: employee.department,
          role: employee.role,
          billableHours,
          totalHours: billableHours,
          utilizationRate,
          capacity,
        };
      })
    );

    const avgUtil =
      utilization.length > 0
        ? utilization.reduce((acc, c) => acc + c.utilizationRate, 0) /
          utilization.length
        : 0;

    return {
      data: utilization,
      total: utilization.length,
      averageUtilization: Math.round(avgUtil),
      period: {
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date().toISOString(),
      },
    };
  }
}
