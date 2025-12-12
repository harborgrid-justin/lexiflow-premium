import { WebhookEvent } from './create-webhook.dto';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  data: any;
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
    body: any;
    headers: Record<string, string>;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
