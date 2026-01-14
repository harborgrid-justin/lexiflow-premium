/**
 * War Room Domain - Page Component
 */

import { WarRoomProvider } from './WarRoomProvider';
import { WarRoomView } from './WarRoomView';

export function WarRoomPage() {
  return (
    <WarRoomProvider>
      <WarRoomView />
    </WarRoomProvider>
  );
}

export default WarRoomPage;
