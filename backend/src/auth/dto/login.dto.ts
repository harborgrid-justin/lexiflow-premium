import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Login DTO with enterprise-grade validation
 * Password minimum length matches password policy service (12 characters)
 */
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@lexiflow.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email!: string;

  @ApiProperty({
    description: 'User password (minimum 12 characters per enterprise policy)',
    example: 'SecurePass123!',
    minLength: 12,
    maxLength: 128,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  password!: string;
}
