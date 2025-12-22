import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@lexiflow.com',
    format: 'email'
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
    format: 'password'
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    description: 'Full name (deprecated, use firstName and lastName)',
    example: 'John Doe',
    minLength: 2
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    minLength: 2
  })
  @IsString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    minLength: 2
  })
  @IsString()
  @MinLength(2)
  lastName!: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.ASSOCIATE
  })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({
    description: 'Whether the user account is active',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether multi-factor authentication is enabled',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  mfaEnabled?: boolean;
}
