import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { HRService } from './hr.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@ApiTags('HR')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('hr')
export class HRController {
  constructor(private readonly hrService: HRService) {}

  // Health check endpoint
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async health() {
    return { status: 'ok', service: 'hr' };
  }

  // Employee Management
  @Get('employees')
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEmployees(@Query() query: any) {
    return await this.hrService.findAllEmployees(query);
  }

  @Get('employees/:id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee found' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEmployee(@Param('id') id: string) {
    return await this.hrService.findOneEmployee(id);
  }

  @Post('employees')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 409, description: 'Employee already exists' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createEmployee(@Body() createDto: CreateEmployeeDto) {
    return await this.hrService.createEmployee(createDto);
  }

  @Put('employees/:id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateEmployee(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
    return await this.hrService.updateEmployee(id, updateDto);
  }

  @Delete('employees/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteEmployee(@Param('id') id: string) {
    await this.hrService.deleteEmployee(id);
  }

  // Time Off Management
  @Get('time-off')
  @ApiOperation({ summary: 'Get time off requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTimeOffRequests(@Query() query: any) {
    return await this.hrService.findAllTimeOffRequests(query);
  }

  @Post('time-off')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create time off request' })
  @ApiResponse({ status: 201, description: 'Time off request created' })
  @ApiResponse({ status: 409, description: 'Overlapping request exists' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createTimeOffRequest(@Body() createDto: CreateTimeOffDto) {
    return await this.hrService.createTimeOffRequest(createDto);
  }

  @Post('time-off/:id/approve')
  @ApiOperation({ summary: 'Approve time off request' })
  @ApiResponse({ status: 200, description: 'Request approved' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async approveTimeOff(@Param('id') id: string, @Req() req: any) {
    const approverId = req.user?.id || 'system';
    return await this.hrService.approveTimeOff(id, approverId);
  }

  @Post('time-off/:id/deny')
  @ApiOperation({ summary: 'Deny time off request' })
  @ApiResponse({ status: 200, description: 'Request denied' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async denyTimeOff(@Param('id') id: string, @Body() body: { reason?: string }, @Req() req: any) {
    const approverId = req.user?.id || 'system';
    return await this.hrService.denyTimeOff(id, approverId, body.reason);
  }

  // Utilization & Analytics
  @Get('utilization')
  @ApiOperation({ summary: 'Get employee utilization metrics' })
  @ApiResponse({ status: 200, description: 'Utilization metrics retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUtilization(@Query() query: any) {
    return await this.hrService.getUtilization(query);
  }
}

