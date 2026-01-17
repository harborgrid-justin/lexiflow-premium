import { type Correspondence } from "@/api/communications/correspondence-api";

import type { DraftingTemplate } from "@/api/domains/drafting";

export interface Recipient {
  id: string;
  name: string;
  email: string;
  type: "to" | "cc" | "bcc";
}

export interface ComposeLoaderData {
  templates: DraftingTemplate[];
  recentRecipients: Recipient[];
  draftId: string | null;
  draft?: Correspondence;
  templateId?: string | null;
}

export interface ComposeActionData {
  success: boolean;
  message?: string;
  error?: string;
  draftId?: string;
  preview?: { subject: string; body: string };
  attachment?: { id: string; name: string; url?: string };
}
