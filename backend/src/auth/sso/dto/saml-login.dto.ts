import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SamlLoginDto {
  @ApiProperty({ description: 'Organization identifier for SSO', example: 'acme-corp' })
  @IsString()
  organizationId!: string;

  @ApiProperty({ description: 'Email domain for SSO lookup', example: 'acme.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Relay state for post-authentication redirect', required: false })
  @IsOptional()
  @IsString()
  relayState?: string;
}

export class SamlCallbackDto {
  @ApiProperty({ description: 'SAML response from IdP' })
  @IsString()
  SAMLResponse!: string;

  @ApiProperty({ description: 'Relay state', required: false })
  @IsOptional()
  @IsString()
  RelayState?: string;
}

export class SamlMetadataDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  organizationId!: string;
}

export class CreateSamlConfigDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  organizationId!: string;

  @ApiProperty({ description: 'IdP Entity ID' })
  @IsString()
  entityId!: string;

  @ApiProperty({ description: 'IdP SSO Entry Point URL' })
  @IsString()
  entryPoint!: string;

  @ApiProperty({ description: 'SP Callback URL' })
  @IsString()
  callbackUrl!: string;

  @ApiProperty({ description: 'SP Issuer' })
  @IsString()
  issuer!: string;

  @ApiProperty({ description: 'IdP X.509 Certificate' })
  @IsString()
  certificate!: string;

  @ApiProperty({ description: 'Provider name', example: 'Okta' })
  @IsString()
  providerName!: string;

  @ApiProperty({ description: 'Enable JIT provisioning', required: false })
  @IsOptional()
  jitProvisioningEnabled?: boolean;

  @ApiProperty({ description: 'Default role for JIT provisioned users', required: false })
  @IsOptional()
  @IsString()
  defaultRole?: string;
}

export class UpdateSamlConfigDto {
  @ApiProperty({ description: 'IdP Entity ID', required: false })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({ description: 'IdP SSO Entry Point URL', required: false })
  @IsOptional()
  @IsString()
  entryPoint?: string;

  @ApiProperty({ description: 'IdP X.509 Certificate', required: false })
  @IsOptional()
  @IsString()
  certificate?: string;

  @ApiProperty({ description: 'Is configuration active', required: false })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Enable JIT provisioning', required: false })
  @IsOptional()
  jitProvisioningEnabled?: boolean;
}
