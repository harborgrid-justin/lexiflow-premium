import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class EnableTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class VerifyTwoFactorSetupDto {
  @IsString()
  @IsNotEmpty()
  secret: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class DisableTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class TwoFactorAuthDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  secret?: string;

  @IsString()
  qrCode?: string;
}
