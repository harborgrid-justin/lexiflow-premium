/**
 * Real Estate Page - Server Component
 */
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real Estate | LexiFlow',
  description: 'Manage real estate properties and transactions',
};

export default function RealEstatePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Real Estate</h1>
      <p className="text-slate-600 dark:text-slate-400">Manage properties, titles, and closings.</p>
    </div>
  );
}
