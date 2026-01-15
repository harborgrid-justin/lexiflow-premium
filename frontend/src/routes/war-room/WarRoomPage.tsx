/**
 * War Room Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import type { WarRoomLoaderData } from './loader';
import { WarRoomProvider } from './WarRoomProvider';
import { WarRoomView } from './WarRoomView';

export function WarRoomPage() {
  const initialData = useLoaderData() as WarRoomLoaderData;

  return (
    <WarRoomProvider initialData={initialData}>
      <WarRoomView />
    </WarRoomProvider>
  );
}

export default WarRoomPage;
