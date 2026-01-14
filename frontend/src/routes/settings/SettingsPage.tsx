/**
 * Settings Domain - Page Component
 */

import { SettingsProvider } from './SettingsProvider';
import { SettingsView } from './SettingsView';

export function SettingsPage() {
  return (
    <SettingsProvider>
      <SettingsView />
    </SettingsProvider>
  );
}

export default SettingsPage;
