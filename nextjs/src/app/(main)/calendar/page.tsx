/**
 * Global Calendar Page - Server Component
 */
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar | LexiFlow',
  description: 'Global firm calendar',
};

export default function CalendarPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <p className="text-slate-600 dark:text-slate-400">View all case events and deadlines.</p>
    </div>
  );
}
