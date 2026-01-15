import { CheckCircle, XCircle, Clock, User, Shield } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { DataService } from '@/services/data/data-service.service';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { ApprovalRequest } from './types';

interface ApprovalWorkflowProps {
  requests?: ApprovalRequest[]; // Can be passed or fetched internally
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApprovalWorkflow({
  requests: propRequests,
  onApprove,
  onReject
}: ApprovalWorkflowProps) {
  const { theme } = useTheme();

  // Load approvals from IndexedDB via useQuery when not provided as props
  const { data: internalRequests = [] } = useQuery<ApprovalRequest[]>(
    queryKeys.workflowsExtended.approvals(),
    () => DataService.workflow.getApprovals(),
    { enabled: !propRequests }
  );

  const requests = propRequests || internalRequests;

  return (
    <div className="space-y-4">
      <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
        <Shield className="h-5 w-5 mr-2 text-purple-600" /> Pending Approvals
      </h3>

      {requests.length === 0 ? (
        <div className={cn("text-center p-6 rounded-lg border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
          No pending approvals required.
        </div>
      ) : (
        requests.map(req => (
          <Card key={req.id} noPadding className="border-l-4 border-l-purple-500">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className={cn("font-bold", theme.text.primary)}>{req.title}</h4>
                  <div className={cn("flex items-center text-xs mt-1", theme.text.secondary)}>
                    <User className="h-3 w-3 mr-1" /> {req.requester}
                    <span className="mx-2">•</span>
                    <Clock className="h-3 w-3 mr-1" /> {req.date}
                  </div>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded font-bold",
                  req.priority === 'High' ? `${theme.status.error.bg} ${theme.status.error.text}` : `${theme.status.info.bg} ${theme.status.info.text}`
                )}>
                  {req.priority}
                </span>
              </div>

              <p className={cn("text-sm p-3 rounded border mb-4", theme.surface.highlight, theme.border.default, theme.text.primary)}>
                {req.description}
              </p>

              <div className="flex justify-end gap-3">
                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => onReject(req.id)}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button size="sm" variant="primary" className="bg-purple-600 hover:bg-purple-700 border-transparent" onClick={() => onApprove(req.id)}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

ApprovalWorkflow.displayName = 'ApprovalWorkflow';
