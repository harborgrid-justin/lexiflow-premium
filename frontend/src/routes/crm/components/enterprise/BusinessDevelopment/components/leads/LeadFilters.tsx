/**
 * LeadFilters Component
 * @module components/enterprise/CRM/BusinessDevelopment/components/leads
 * @description Filter and search UI for leads
 */

import { Search, Plus } from 'lucide-react';
import React from "react";

import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

interface LeadFiltersProps {
  onAddLead?: () => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({ onAddLead }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("flex gap-4 p-4 rounded-lg", theme.surface.default, theme.border.default, "border")}>
      <div className="flex-1">
        <div className="relative">
          <Search className={cn("absolute left-3 top-2.5 h-5 w-5", theme.text.tertiary)} />
          <input
            type="text"
            placeholder="Search leads..."
            className={cn("w-full pl-10 pr-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}
          />
        </div>
      </div>
      <select className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}>
        <option>All Statuses</option>
        <option>New</option>
        <option>Qualified</option>
        <option>Proposal</option>
      </select>
      <select className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}>
        <option>All Sources</option>
        <option>Referral</option>
        <option>Website</option>
        <option>Conference</option>
      </select>
      <button
        onClick={onAddLead}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        <Plus className="h-4 w-4 inline mr-1" />
        Add Lead
      </button>
    </div>
  );
};
