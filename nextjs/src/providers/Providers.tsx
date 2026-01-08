'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/shadcn/tooltip';
import { ToastProvider } from '@/providers';
import { AuthProvider } from '@/providers/AuthProvider';
import { DataSourceProvider } from '@/providers/DataSourceProvider';
import { QueryClientProvider } from '@/providers/QueryClientProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Provider as JotaiProvider } from 'jotai';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <JotaiProvider>
        <QueryClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <DataSourceProvider>
                <TooltipProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </TooltipProvider>
              </DataSourceProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </ErrorBoundary>
  );
}
