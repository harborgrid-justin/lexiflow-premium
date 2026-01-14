/**
 * Correspondence Compose Route
 *
 * Provides a rich correspondence composition interface for creating
 * and sending legal documents, letters, and communications:
 * - Template selection and customization
 * - Recipient management
 * - Attachment handling
 * - Draft saving and auto-save
 * - Preview and send functionality
 *
 * @module routes/correspondence/compose
 */

import type { DraftingTemplate } from '@/lib/frontend-api';
import { Correspondence } from '@/lib/frontend-api';
import type { ComposeActionData, ComposeLoaderData, Recipient } from '@/routes/correspondence/compose/types';
import { DataService } from '@/services/data/data-service.service';
import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/compose";
import { ComposeCorrespondence } from './components/ComposeCorrespondence';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Compose Correspondence',
    description: 'Create and send legal correspondence, letters, and documents',
  });
}

// ============================================================================
// Client Loader
// ============================================================================

/**
 * Fetches correspondence compose data on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs): Promise<ComposeLoaderData> {
  const url = new URL(request.url);
  const draftId = url.searchParams.get('draft');
  const templateId = url.searchParams.get('template');
  console.log('template ID:', templateId);

  let templates: DraftingTemplate[] = [];
  try {
    templates = await DataService.drafting.getTemplates();
  } catch (error) {
    console.error("Failed to fetch templates", error);
  }

  // Fetch recent recipients (clients)
  const recentRecipients: Recipient[] = [];
  try {
    const clientsResponse = await DataService.clients.getAll();
    const clients = Array.isArray(clientsResponse) ? clientsResponse : [];
    clients.forEach((client: { id: string; firstName?: string; lastName?: string; email?: string }) => {
      if (client.email) {
        recentRecipients.push({
          id: client.id,
          name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown',
          email: client.email,
          type: 'to'
        });
      }
    });
  } catch (error) {
    console.error("Failed to fetch recipients", error);
  }

  // Load draft if draftId is provided
  let draft: Correspondence | null = null;
  if (draftId) {
    try {
      const communications = await DataService.correspondence.getCommunications();
      draft = (communications as Correspondence[]).find((c) => c.id === draftId) || null;
    } catch (error) {
      console.error("Failed to load draft", error);
    }
  }

  return {
    templates,
    recentRecipients,
    draftId,
    draft: draft || undefined,
    templateId
  };
}

// Ensure client loader runs on hydration
clientLoader.hydrate = true as const;

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs): Promise<ComposeActionData> {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "save-draft": {
      const subject = formData.get("subject") as string;
      const body = formData.get("body") as string;
      const templateId = formData.get("templateId") as string;

      try {
        // Use DataService to save draft
        const draft = await DataService.communications.correspondence.create({
          subject,
          notes: body, // Mapping body to notes for now as per Correspondence interface
          correspondenceType: 'letter', // Defaulting to letter
          status: 'draft',
          date: new Date().toISOString(),
          metadata: { templateId }
        });

        return {
          success: true,
          message: "Draft saved successfully",
          draftId: draft.id,
        };
      } catch (error) {
        console.error("Failed to save draft", error);
        return {
          success: false,
          error: "Failed to save draft",
        };
      }
    }

    case "send": {
      const subject = formData.get("subject") as string;
      const body = formData.get("body") as string;
      const recipientsStr = formData.get("recipients") as string;

      if (!subject?.trim()) {
        return {
          success: false,
          error: "Subject is required",
        };
      }

      if (!body?.trim()) {
        return {
          success: false,
          error: "Message body is required",
        };
      }

      if (!recipientsStr?.trim()) {
        return {
          success: false,
          error: "At least one recipient is required",
        };
      }

      try {
        // Use DataService to send correspondence
        await DataService.communications.correspondence.create({
          subject,
          notes: body,
          recipients: recipientsStr.split(',').map(r => r.trim()),
          correspondenceType: 'email', // Defaulting to email for send action
          status: 'sent',
          date: new Date().toISOString()
        });

        return {
          success: true,
          message: "Correspondence sent successfully",
        };
      } catch (error) {
        console.error("Failed to send correspondence", error);
        return {
          success: false,
          error: "Failed to send correspondence",
        };
      }
    }

    case "preview": {
      const subject = formData.get("subject") as string;
      const body = formData.get("body") as string;

      return {
        success: true,
        message: "Preview generated",
        preview: { subject, body }
      };
    }

    case "attach": {
      const file = formData.get("file") as File;
      const draftId = formData.get("draftId") as string;

      if (!file || file.size === 0) {
        return {
          success: false,
          error: "No file selected",
        };
      }

      try {
        const document = await DataService.documents.upload(file, {
          category: 'correspondence_attachment',
          draftId: draftId || undefined,
          uploadedAt: new Date().toISOString()
        });

        return {
          success: true,
          message: "Attachment added",
          attachment: document
        };
      } catch (error) {
        console.error("Failed to upload attachment", error);
        return {
          success: false,
          error: "Failed to upload attachment",
        };
      }
    }

    default:
      return {
        success: false,
        error: "Invalid action",
      };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ComposeCorrespondenceRoute() {
  const data = useLoaderData<typeof clientLoader>();

  return <ComposeCorrespondence data={data} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Compose Error"
      message="Failed to load the correspondence composer. Please try again."
      backTo="/correspondence"
      backLabel="Back to Correspondence"
    />
  );
}
