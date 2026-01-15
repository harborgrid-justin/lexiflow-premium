/**
 * Settings Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import type { SettingsLoaderData } from './loader';
import { SettingsProvider } from './SettingsProvider';
import { SettingsView } from './SettingsView';

export function SettingsPage() {
  const initialData = useLoaderData() as SettingsLoaderData;

  return (
    <SettingsProvider initialData={initialData}>
      <SettingsView />
    </SettingsProvider>
  );
}

export default SettingsPage;
