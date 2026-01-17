import { ArrowRight } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router';

interface AdminNavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export function AdminNavLink({ to, icon, label }: AdminNavLinkProps) {
  return (
    <Link to={to} className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-border)] transition-all group">
      <div className="flex items-center gap-3">
        <div className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]">
          {icon}
        </div>
        <span className="text-[var(--color-text)] font-medium">{label}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
    </Link>
  );
}
