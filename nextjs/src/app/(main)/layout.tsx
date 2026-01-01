/**
 * Main Layout for Authenticated Pages
 * Includes sidebar navigation and header
 */

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
