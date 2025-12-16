import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Clients')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  async findAll(@Query() query: any) {
    return await this.clientsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200, description: 'Client found' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async findOne(@Param('id') id: string) {
    return await this.clientsService.findOne(id);
  }

  @Get(':id/cases')
  @ApiOperation({ summary: 'Get client cases' })
  @ApiResponse({ status: 200, description: 'Cases retrieved successfully' })
  async getCases(@Param('id') id: string) {
    return await this.clientsService.getCases(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiResponse({ status: 409, description: 'Client already exists' })
  async create(@Body() createDto: CreateClientDto) {
    return await this.clientsService.create(createDto);
  }

  @Post(':id/portal-token')
  @ApiOperation({ summary: 'Generate client portal access token' })
  @ApiResponse({ status: 200, description: 'Token generated successfully' })
  async generatePortalToken(@Param('id') id: string) {
    return await this.clientsService.generatePortalToken(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateClientDto) {
    return await this.clientsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete client' })
  @ApiResponse({ status: 204, description: 'Client deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.clientsService.remove(id);
  }
}
