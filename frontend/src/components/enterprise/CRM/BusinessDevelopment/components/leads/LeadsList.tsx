/**
 * LeadsList Component
 * @module components/enterprise/CRM/BusinessDevelopment/components/leads
 * @description List container for leads with filtering
 */

import React from 'react';
import { Lead } from '../../types';
import { LeadFilters } from './LeadFilters';
import { LeadPipelineChart } from './LeadPipelineChart';
import { LeadCard } from './LeadCard';
import { LeadsByStatus } from '../../types';

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
