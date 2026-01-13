/**
 * LeadsList Component
 * @module components/enterprise/CRM/BusinessDevelopment/components/leads
 * @description List container for leads with filtering
 */

import type { LeadsByStatus } from '@/types/crm';
import { Lead } from '../../types';
import { LeadCard } from './LeadCard';
import { LeadFilters } from './LeadFilters';
import { LeadPipelineChart } from './LeadPipelineChart';

interface LeadsListProps {
  leads: Lead[];
  leadsByStatus: LeadsByStatus[];
  onLeadClick?: (leadId: string) => void;
  onAddLead?: () => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  leadsByStatus,
  onLeadClick,
  onAddLead
}) => {
  return (
    <div className="space-y-6">
      <LeadFilters onAddLead={onAddLead} />
      <LeadPipelineChart data={leadsByStatus} />
      <div className="space-y-3">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
        ))}
      </div>
    </div>
  );
};
