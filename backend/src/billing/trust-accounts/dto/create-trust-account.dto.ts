import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min } from 'class-validator';
import { TrustAccountType, TrustAccountStatus } from '../entities/trust-account.entity';

export class CreateTrustAccountDto {
  @IsString()
  accountNumber: string;

  @IsString()
  accountName: string;

  @IsEnum(TrustAccountType)
  accountType: TrustAccountType;

  @IsString()
  clientId: string;

  @IsString()
  clientName: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(TrustAccountStatus)
  status?: TrustAccountStatus;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  routingNumber?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  openedDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumBalance?: number;

  @IsOptional()
  @IsBoolean()
  interestBearing?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  responsibleAttorney?: string;
}
