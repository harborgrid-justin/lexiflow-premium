import { IsString, IsNotEmpty, IsOptional, IsDate, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ChainOfCustodyAction } from '../entities/chain-of-custody-event.entity';

export class CreateChainOfCustodyDto {
  @ApiProperty({ description: 'Evidence item ID' })
  @IsString()
  @IsNotEmpty()
  evidenceId!: string;

  @ApiProperty({ enum: ChainOfCustodyAction, description: 'Action type' })
  @IsEnum(ChainOfCustodyAction)
  action!: ChainOfCustodyAction;

  @ApiProperty({ description: 'Person who handled the evidence' })
  @IsString()
  @IsNotEmpty()
  handler!: string;

  @ApiPropertyOptional({ description: 'Handler user ID' })
  @IsOptional()
  @IsString()
  handlerId?: string;

  @ApiPropertyOptional({ description: 'Person evidence was transferred from' })
  @IsOptional()
  @IsString()
  transferredFrom?: string;

  @ApiPropertyOptional({ description: 'Person evidence was transferred to' })
  @IsOptional()
  @IsString()
  transferredTo?: string;

  @ApiPropertyOptional({ description: 'Location of the action' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Timestamp of the event', type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  timestamp?: Date;
}
