
import React from 'react';
import { CheckCircle, XCircle, Clock, User, FileText, Shield } from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { Card } from '../common/Card.tsx';

interface ApprovalRequest {
  id: string;
  title: string;
  requester: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface ApprovalWorkflowProps {
  requests?: ApprovalRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const MOCK_APPROVALS: ApprovalRequest[] = [
  { id: '1', title: 'Settlement Offer > $50k', requester: 'James Doe', date: '2024-03-15', status: 'Pending', description: 'Authorization required for settlement offer in Martinez case.', priority: 'High' },
  { id: '2', title: 'Expert Witness Retainer', requester: 'Sarah Jenkins', date: '2024-03-14', status: 'Pending', description: 'Budget approval for forensic accountant.', priority: 'Medium' },
];

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ 
  requests = MOCK_APPROVALS,
  onApprove,
  onReject 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-purple-600" /> Pending Approvals
      </h3>
      
      {requests.length === 0 ? (
        <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
          No pending approvals required.
        </div>
      ) : (
        requests.map(req => (
          <Card key={req.id} noPadding className="border-l-4 border-l-purple-500">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{req.title}</h4>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <User className="h-3 w-3 mr-1" /> {req.requester}
                    <span className="mx-2">•</span>
                    <Clock className="h-3 w-3 mr-1" /> {req.date}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-bold ${req.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {req.priority}
                </span>
              </div>
              
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-100 mb-4">
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
};
