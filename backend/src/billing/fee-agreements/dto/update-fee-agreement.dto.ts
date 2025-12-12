import { PartialType } from '@nestjs/mapped-types';
import { CreateFeeAgreementDto } from './create-fee-agreement.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { FeeAgreementStatus } from '../entities/fee-agreement.entity';

export class UpdateFeeAgreementDto extends PartialType(CreateFeeAgreementDto) {
  @IsOptional()
  @IsEnum(FeeAgreementStatus)
  status?: FeeAgreementStatus;

  @IsOptional()
  @IsString()
  signedBy?: string;
}
