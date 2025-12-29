/**
 * Enhanced Controller Example
 * Demonstrates best practices using all new API enhancements
 *
 * This is a reference implementation showing how to use:
 * - Enhanced DTOs with validation
 * - Custom validators and decorators
 * - Response helpers
 * - Strict typing
 * - Security guards
 * - Swagger documentation
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

// DTOs
import {
  FilterDto,
  SuccessResponseDto,
  PaginatedResponseDto,
  EntityResponseDto,
} from '@common/dto';

// Validators
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  IsNotFutureDate,
  IsPhoneNumber,
  ArrayUnique,
} from '@common/validators';

// Decorators
import {
  ApiCreateOperation,
  ApiReadOperation,
  ApiListOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
} from '@common/decorators/api-enhanced.decorator';

// Guards
import {
  RolesGuard,
  PermissionsGuard,
} from '@common/guards/enhanced-security.guard';

// Interceptors
import { PerformanceInterceptor } from '@common/interceptors/performance.interceptor';
import { ResponseSerializerInterceptor } from '@common/interceptors/response-serializer.interceptor';

// Helpers
import {
  ResponseHelper,
  PaginationHelper,
  ErrorHelper,
} from '@common/helpers';

// Types
import { UUID } from '@common/types';

// Pipes
import {
  ParseUuidPipe,
} from '@common/pipes/transform.pipes';

/**
 * Example Entity DTO
 */
class ExampleEntityDto extends EntityResponseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsEmail()
  email!: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ArrayUnique()
  @IsOptional()
  tags?: string[];
}

/**
 * Create Example DTO
 */
class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name!: string;

  @IsEmail()
  email!: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsNotFutureDate()
  @IsOptional()
  birthDate?: Date;

  @ArrayUnique()
  @IsOptional()
  tags?: string[];
}

/**
 * Update Example DTO
 */
class UpdateExampleDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ArrayUnique()
  @IsOptional()
  tags?: string[];
}

/**
 * Filter DTO for listing
 */
class ExampleFilterDto extends FilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

/**
 * Enhanced Example Controller
 * Demonstrates all API enhancements
 */
@ApiTags('Examples')
@ApiBearerAuth('JWT-auth')
@Controller('examples')
@UseGuards(RolesGuard, PermissionsGuard)
@UseInterceptors(PerformanceInterceptor, ResponseSerializerInterceptor)
export class EnhancedExampleController {
  private readonly logger = new Logger(EnhancedExampleController.name);

  /**
   * List Examples with Pagination
   */
  @Get()
  @ApiListOperation({
    summary: 'List all examples',
    description: 'Retrieve a paginated list of examples with optional filtering',
    responseType: ExampleEntityDto,
  })
  async findAll(
    @Query() filterDto: ExampleFilterDto,
  ): Promise<PaginatedResponseDto<ExampleEntityDto>> {
    this.logger.log('Fetching examples with filters', filterDto);

    try {
      // Validate pagination parameters
      PaginationHelper.validatePagination(
        filterDto.page || 1,
        filterDto.limit || 20,
      );

      // Mock data - in real implementation, fetch from service/repository
      const mockData: ExampleEntityDto[] = [
        {
          id: 'uuid-1' as UUID,
          name: 'Example 1',
          email: 'example1@test.com',
          phone: '+1234567890',
          tags: ['tag1', 'tag2'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const total = 1;
      const page = filterDto.page || 1;
      const limit = filterDto.limit || 20;

      // Build response metadata
      const meta = {
        timestamp: new Date().toISOString(),
        path: '/api/examples',
        method: 'GET',
      };

      // Return paginated response
      return ResponseHelper.paginated(mockData, total, page, limit, meta);
    } catch (error) {
      this.logger.error('Error fetching examples', error);
      throw error;
    }
  }

  /**
   * Get Single Example by ID
   */
  @Get(':id')
  @ApiReadOperation({
    summary: 'Get example by ID',
    description: 'Retrieve a single example by its UUID',
    responseType: ExampleEntityDto,
  })
  async findOne(
    @Param('id', new ParseUuidPipe()) id: string,
  ): Promise<SuccessResponseDto<ExampleEntityDto>> {
    this.logger.log(`Fetching example with id: ${id}`);

    try {
      // Mock data - in real implementation, fetch from service/repository
      const mockData: ExampleEntityDto = {
        id: id as UUID,
        name: 'Example 1',
        email: 'example1@test.com',
        phone: '+1234567890',
        tags: ['tag1', 'tag2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // If not found, throw error
      if (!mockData) {
        const meta = {
          timestamp: new Date().toISOString(),
          path: `/api/examples/${id}`,
          method: 'GET',
        };
        throw ErrorHelper.notFound('Example', id, meta);
      }

      // Build response metadata
      const meta = {
        timestamp: new Date().toISOString(),
        path: `/api/examples/${id}`,
        method: 'GET',
      };

      // Return success response
      return ResponseHelper.success(mockData, meta);
    } catch (error) {
      this.logger.error(`Error fetching example ${id}`, error);
      throw error;
    }
  }

  /**
   * Create New Example
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperation({
    summary: 'Create new example',
    description: 'Create a new example entity with validation',
    responseType: ExampleEntityDto,
  })
  async create(
    @Body() createDto: CreateExampleDto,
  ): Promise<SuccessResponseDto<ExampleEntityDto>> {
    this.logger.log('Creating new example', createDto);

    try {
      // In real implementation, save to database via service
      const mockData: ExampleEntityDto = {
        id: 'new-uuid' as UUID,
        name: createDto.name,
        email: createDto.email,
        phone: createDto.phone,
        tags: createDto.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Build response metadata
      const meta = {
        timestamp: new Date().toISOString(),
        path: '/api/examples',
        method: 'POST',
      };

      // Return success response
      return ResponseHelper.success(mockData, meta);
    } catch (error) {
      this.logger.error('Error creating example', error);
      throw error;
    }
  }

  /**
   * Update Example
   */
  @Put(':id')
  @ApiUpdateOperation({
    summary: 'Update example',
    description: 'Update an existing example entity',
    responseType: ExampleEntityDto,
  })
  async update(
    @Param('id', new ParseUuidPipe()) id: string,
    @Body() updateDto: UpdateExampleDto,
  ): Promise<SuccessResponseDto<ExampleEntityDto>> {
    this.logger.log(`Updating example ${id}`, updateDto);

    try {
      // In real implementation, update in database via service
      const mockData: ExampleEntityDto = {
        id: id as UUID,
        name: updateDto.name || 'Example 1',
        email: updateDto.email || 'example1@test.com',
        phone: updateDto.phone,
        tags: updateDto.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Build response metadata
      const meta = {
        timestamp: new Date().toISOString(),
        path: `/api/examples/${id}`,
        method: 'PUT',
      };

      // Return success response
      return ResponseHelper.success(mockData, meta);
    } catch (error) {
      this.logger.error(`Error updating example ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete Example
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteOperation({
    summary: 'Delete example',
    description: 'Delete an example entity by ID',
  })
  async remove(@Param('id', new ParseUuidPipe()) id: string): Promise<void> {
    this.logger.log(`Deleting example ${id}`);

    try {
      // In real implementation, delete from database via service

      // Return no content (void)
      return ResponseHelper.noContent();
    } catch (error) {
      this.logger.error(`Error deleting example ${id}`, error);
      throw error;
    }
  }
}
