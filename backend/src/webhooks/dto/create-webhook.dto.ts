import { IsString, IsUrl, IsArray, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WebhookEvent {
  CASE_CREATED = 'case.created',
  CASE_UPDATED = 'case.updated',
  CASE_DELETED = 'case.deleted',
  DOCUMENT_UPLOADED = 'document.uploaded',
  DOCUMENT_UPDATED = 'document.updated',
  DOCUMENT_DELETED = 'document.deleted',
  INVOICE_CREATED = 'invoice.created',
  INVOICE_SENT = 'invoice.sent',
  INVOICE_PAID = 'invoice.paid',
  TIME_ENTRY_CREATED = 'time_entry.created',
  DEPOSITION_SCHEDULED = 'deposition.scheduled',
  DEPOSITION_COMPLETED = 'deposition.completed',
  DISCOVERY_REQUEST_CREATED = 'discovery_request.created',
  DISCOVERY_REQUEST_COMPLETED = 'discovery_request.completed',
}

export class CreateWebhookDto {
  @ApiProperty({ description: 'Webhook name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Webhook URL endpoint' })
  @IsUrl()
  url!: string;

  @ApiProperty({
    description: 'Events to subscribe to',
    enum: WebhookEvent,
    isArray: true,
  })
  @IsArray()
  @IsEnum(WebhookEvent, { each: true })
  events!: WebhookEvent[];

  @ApiProperty({ description: 'Secret for webhook signature verification', required: false })
  @IsOptional()
  @IsString()
  secret?: string;

  @ApiProperty({ description: 'Description of the webhook', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Whether the webhook is active', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ description: 'Custom headers to include in webhook requests', required: false })
  @IsOptional()
  headers?: Record<string, string>;
}
