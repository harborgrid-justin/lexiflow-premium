/**
 * Data Platform Domain - Page Component
 */

import { DataPlatformProvider } from './DataPlatformProvider';
import { DataPlatformView } from './DataPlatformView';

export function DataPlatformPage() {
  return (
    <DataPlatformProvider>
      <DataPlatformView />
    </DataPlatformProvider>
  );
}

export default DataPlatformPage;
