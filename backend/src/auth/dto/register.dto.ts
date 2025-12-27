import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Role } from '@common/enums/role.enum';

/**
 * Registration DTO with enterprise-grade validation
 * Implements password policy requirements:
 * - Minimum 12 characters
 * - Must contain uppercase, lowercase, number, and special character
 */
export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@lexiflow.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @ApiProperty({
    description: 'Password (min 12 chars, must include uppercase, lowercase, number, special char)',
    example: 'SecurePass123!',
    minLength: 12,
    maxLength: 128,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  password!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  lastName!: string;

  @ApiPropertyOptional({
    description: 'User role (defaults to USER if not specified)',
    enum: Role,
    example: Role.USER,
  })
  @IsEnum(Role, { message: 'Invalid role specified' })
  @IsOptional()
  role?: Role;
}
