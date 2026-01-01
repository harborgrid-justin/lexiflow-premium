'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
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
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </ErrorBoundary>
  );
}
