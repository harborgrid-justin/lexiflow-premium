import { WebhookEvent } from './create-webhook.dto';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  data: Record<string, unknown>;
  webhookId: string;
  deliveryId: string;
  signature?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  response?: {
    statusCode: number;
    body: string | Record<string, unknown>;
    headers: Record<string, string>;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
