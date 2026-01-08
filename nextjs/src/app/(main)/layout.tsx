/**
 * Main Layout for Authenticated Pages
 * Enterprise-grade layout using shadcn/ui AppShell
 * Features: Responsive sidebar, command palette, notifications, breadcrumbs
 */

import { AppShell } from '@/components/layouts/enterprise/app-shell';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
