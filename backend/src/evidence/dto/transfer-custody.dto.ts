import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferCustodyDto {
  @ApiProperty({ description: 'Person transferring custody' })
  @IsString()
  @IsNotEmpty()
  transferredFrom: string;

  @ApiProperty({ description: 'Person receiving custody' })
  @IsString()
  @IsNotEmpty()
  transferredTo: string;

  @ApiProperty({ description: 'Handler executing the transfer' })
  @IsString()
  @IsNotEmpty()
  handler: string;

  @ApiPropertyOptional({ description: 'Handler user ID' })
  @IsOptional()
  @IsString()
  handlerId?: string;

  @ApiPropertyOptional({ description: 'Transfer location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Transfer notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
