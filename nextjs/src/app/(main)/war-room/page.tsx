/**
 * War Room Page - Server Component
 */
import { WarRoom } from '@/components/war-room/WarRoom';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'War Room',
  description: 'Strategic trial planning and case preparation',
};

export default function WarRoomPage() {
  return <WarRoom />;
}
