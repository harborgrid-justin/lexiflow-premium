/**
 * Shared Pipes
 * Central export point for all pipes used in LexiFlow Premium
 *
 * This file provides a single import point for all validation and transformation pipes.
 * Pipes transform input data and validate it before it reaches route handlers.
 */

// =============================================================================
// VALIDATION PIPES
// =============================================================================

/**
 * ValidationPipe
 * Validates and transforms incoming request data using class-validator
 *
 * Usage:
 * Applied globally via APP_PIPE provider
 *
 * Features:
 * - Validates DTOs using class-validator decorators
 * - Transforms plain objects to class instances
 * - Strips properties not defined in DTO (whitelist)
 * - Throws BadRequestException on validation failure
 *
 * Configuration:
 * ```typescript
 * new ValidationPipe({
 *   whitelist: true,           // Strip non-whitelisted properties
 *   forbidNonWhitelisted: true, // Throw error if extra properties
 *   transform: true,            // Transform to DTO class instances
 *   transformOptions: {
 *     enableImplicitConversion: true,
 *   },
 * })
 * ```
 */
export { ValidationPipe } from '../../common/pipes/validation.pipe';

/**
 * ParseUuidPipe
 * Validates and parses UUID parameters
 *
 * Usage:
 * ```typescript
 * @Get(':id')
 * async getById(@Param('id', ParseUuidPipe) id: string) { ... }
 * ```
 *
 * Throws BadRequestException if parameter is not a valid UUID
 */
export { ParseUuidPipe } from '../../common/pipes/parse-uuid.pipe';

// =============================================================================
// PIPE USAGE GUIDELINES
// =============================================================================

/**
 * PIPE BEST PRACTICES:
 *
 * 1. Global Validation:
 *    Apply ValidationPipe globally for automatic DTO validation:
 *    ```typescript
 *    app.useGlobalPipes(
 *      new ValidationPipe({
 *        whitelist: true,
 *        forbidNonWhitelisted: true,
 *        transform: true,
 *        transformOptions: {
 *          enableImplicitConversion: true,
 *        },
 *      }),
 *    );
 *    ```
 *
 * 2. DTO Validation:
 *    Create DTOs with class-validator decorators:
 *    ```typescript
 *    import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
 *
 *    export class CreateUserDto {
 *      @IsEmail()
 *      email: string;
 *
 *      @IsString()
 *      @MinLength(12)
 *      @MaxLength(128)
 *      password: string;
 *
 *      @IsString()
 *      @MinLength(2)
 *      @MaxLength(100)
 *      name: string;
 *    }
 *    ```
 *
 * 3. Parameter Validation:
 *    Validate route parameters:
 *    ```typescript
 *    @Get(':id')
 *    async getById(
 *      @Param('id', ParseUuidPipe) id: string
 *    ) { ... }
 *    ```
 *
 * 4. Query Parameter Validation:
 *    Create query DTOs for complex query parameters:
 *    ```typescript
 *    export class PaginationQueryDto {
 *      @IsOptional()
 *      @Type(() => Number)
 *      @IsInt()
 *      @Min(1)
 *      page?: number = 1;
 *
 *      @IsOptional()
 *      @Type(() => Number)
 *      @IsInt()
 *      @Min(1)
 *      @Max(100)
 *      limit?: number = 25;
 *    }
 *
 *    @Get('users')
 *    async getUsers(@Query() query: PaginationQueryDto) { ... }
 *    ```
 *
 * 5. Custom Pipes:
 *    Create custom pipes for specific transformations:
 *    ```typescript
 *    @Injectable()
 *    export class ParseDatePipe implements PipeTransform {
 *      transform(value: string): Date {
 *        const date = new Date(value);
 *        if (isNaN(date.getTime())) {
 *          throw new BadRequestException('Invalid date format');
 *        }
 *        return date;
 *      }
 *    }
 *    ```
 *
 * 6. Pipe Ordering:
 *    When using multiple pipes, they execute left to right:
 *    ```typescript
 *    @Get(':id')
 *    async getById(
 *      @Param('id', ParseUuidPipe, CustomTransformPipe) id: string
 *    ) { ... }
 *    // ParseUuidPipe executes first, then CustomTransformPipe
 *    ```
 *
 * 7. Built-in Pipes:
 *    NestJS provides several built-in pipes:
 *    - ParseIntPipe: Converts string to integer
 *    - ParseFloatPipe: Converts string to float
 *    - ParseBoolPipe: Converts string to boolean
 *    - ParseArrayPipe: Converts string to array
 *    - ParseUUIDPipe: Validates and parses UUID
 *    - ParseEnumPipe: Validates enum values
 *    - DefaultValuePipe: Provides default value
 *    - ValidationPipe: Validates DTOs
 *
 * 8. Error Handling:
 *    Pipes should throw appropriate exceptions:
 *    ```typescript
 *    throw new BadRequestException({
 *      code: 'VALIDATION_ERROR',
 *      message: 'Invalid input format',
 *      field: 'id',
 *      value: value,
 *    });
 *    ```
 *
 * COMMON VALIDATION PATTERNS:
 *
 * Pattern 1: Basic DTO validation
 * ```typescript
 * export class CreateCaseDto {
 *   @IsString()
 *   @MinLength(3)
 *   @MaxLength(100)
 *   title: string;
 *
 *   @IsString()
 *   @IsOptional()
 *   @MaxLength(2000)
 *   description?: string;
 *
 *   @IsEnum(CaseStatus)
 *   status: CaseStatus;
 * }
 * ```
 *
 * Pattern 2: Nested object validation
 * ```typescript
 * export class AddressDto {
 *   @IsString()
 *   street: string;
 *
 *   @IsString()
 *   city: string;
 *
 *   @Matches(/^\d{5}(-\d{4})?$/)
 *   zipCode: string;
 * }
 *
 * export class CreateUserDto {
 *   @IsEmail()
 *   email: string;
 *
 *   @ValidateNested()
 *   @Type(() => AddressDto)
 *   address: AddressDto;
 * }
 * ```
 *
 * Pattern 3: Array validation
 * ```typescript
 * export class BulkCreateDto {
 *   @IsArray()
 *   @ValidateNested({ each: true })
 *   @Type(() => CreateItemDto)
 *   @ArrayMinSize(1)
 *   @ArrayMaxSize(100)
 *   items: CreateItemDto[];
 * }
 * ```
 *
 * Pattern 4: Custom validation decorator
 * ```typescript
 * @ValidatorConstraint({ name: 'isStrongPassword', async: false })
 * export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
 *   validate(password: string) {
 *     return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(password);
 *   }
 *
 *   defaultMessage() {
 *     return 'Password must be at least 12 characters with uppercase, lowercase, number, and special character';
 *   }
 * }
 *
 * export function IsStrongPassword(validationOptions?: ValidationOptions) {
 *   return function (object: object, propertyName: string) {
 *     registerDecorator({
 *       target: object.constructor,
 *       propertyName: propertyName,
 *       options: validationOptions,
 *       constraints: [],
 *       validator: IsStrongPasswordConstraint,
 *     });
 *   };
 * }
 * ```
 *
 * Pattern 5: Conditional validation
 * ```typescript
 * export class UpdateCaseDto {
 *   @IsString()
 *   @IsOptional()
 *   title?: string;
 *
 *   @IsString()
 *   @ValidateIf(o => o.status === 'closed')
 *   @IsNotEmpty()
 *   closeReason?: string;
 * }
 * ```
 *
 * TRANSFORMATION EXAMPLES:
 *
 * 1. Type transformation:
 * ```typescript
 * export class QueryDto {
 *   @Type(() => Number)
 *   @IsInt()
 *   page: number;
 *
 *   @Type(() => Date)
 *   @IsDate()
 *   startDate: Date;
 * }
 * ```
 *
 * 2. Custom transformation:
 * ```typescript
 * @Transform(({ value }) => value.toLowerCase())
 * @IsEmail()
 * email: string;
 *
 * @Transform(({ value }) => value.trim())
 * @IsString()
 * name: string;
 * ```
 *
 * PERFORMANCE CONSIDERATIONS:
 *
 * 1. Validation overhead:
 *    - ValidationPipe adds latency to requests
 *    - Use whitelist to strip unnecessary properties
 *    - Consider caching validation results for repeated patterns
 *
 * 2. Large payloads:
 *    - Set maximum array size with @ArrayMaxSize
 *    - Limit string lengths with @MaxLength
 *    - Use streaming for large file uploads
 *
 * 3. Async validation:
 *    - Minimize database lookups in validators
 *    - Use batch validation when possible
 *    - Consider eventual consistency for performance
 */
