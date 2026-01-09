/**
 * Invoice Detail Route
 * Display single invoice with payment tracking and PDF preview
 */

import { InvoicesApiService } from '@/api/billing';
import { InvoiceDetail } from '@/features/operations/billing/components/time-tracking/InvoiceDetail';
import { Link, useActionData, useLoaderData, useNavigate, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return [
    { title: `Invoice ${data?.invoice?.invoiceNumber || ''} | LexiFlow` },
    { name: 'description', content: `View invoice details and record payments` },
  ];
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ params }: LoaderFunctionArgs) {
  const invoicesApi = new InvoicesApiService();

  try {
    const invoice = await invoicesApi.getById(params.id!);

    return {
      invoice,
    };
  } catch (error) {
    console.error('Failed to load invoice:', error);
    throw new Response('Invoice not found', { status: 404 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const invoicesApi = new InvoicesApiService();

  switch (intent) {
    case "send": {
      const recipients = formData.get("recipients") as string;
      try {
        await invoicesApi.send(params.id!, recipients ? JSON.parse(recipients) : undefined);
        return { success: true, message: "Invoice sent successfully" };
      } catch {
        return { success: false, error: "Failed to send invoice" };
      }
    }

    case "record-payment": {
      const methodRaw = formData.get("method") as string;
      let method: "Check" | "Wire" | "Credit Card" | "ACH" | "Cash" = "Check";

      switch (methodRaw) {
        case 'check': method = 'Check'; break;
        case 'wire': method = 'Wire'; break;
        case 'credit_card': method = 'Credit Card'; break;
        case 'ach': method = 'ACH'; break;
        case 'cash': method = 'Cash'; break;
        default: method = 'Check';
      }

      const payment = {
        amount: parseFloat(formData.get("amount") as string),
        date: formData.get("date") as string,
        method,
        reference: formData.get("reference") as string || undefined,
        notes: formData.get("notes") as string || undefined,
      };
      try {
        await invoicesApi.recordPayment(params.id!, payment);
        return { success: true, message: "Payment recorded successfully" };
      } catch {
        return { success: false, error: "Failed to record payment" };
      }
    }

    case "download-pdf":
      try {
        const pdfBlob = await invoicesApi.getPdf(params.id!);
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${params.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true, message: "PDF downloaded" };
      } catch {
        return { success: false, error: "Failed to download PDF" };
      }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function InvoiceDetailRoute() {
  const { invoice } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  return (
    <div className="p-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/billing" className="text-sm text-gray-700 hover:text-blue-600 dark:text-gray-400">
              Billing
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to="/billing/invoices" className="text-sm text-gray-700 hover:text-blue-600 dark:text-gray-400">
                Invoices
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{invoice.invoiceNumber}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Action Result */}
      {actionData?.message && (
        <div className={`mb-4 rounded-md p-4 ${actionData.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {actionData.message}
        </div>
      )}

      {/* Invoice Detail */}
      <InvoiceDetail
        invoice={invoice}
        onBack={() => navigate('/billing/invoices')}
      />
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Invoice"
      message="We couldn't load the invoice details. Please try again."
      backTo="/billing/invoices"
      backLabel="Return to Invoices"
    />
  );
}
