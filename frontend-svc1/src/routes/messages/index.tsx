import { SecureMessenger } from '@/features/operations/messenger/SecureMessenger';
import type { MetaArgs } from 'react-router';
import { createListMeta } from '../_shared/meta-utils';

export function meta(_args: MetaArgs) {
  return createListMeta({
    entityType: 'Messages',
    description: 'Secure internal and external communication',
  });
}

export default function MessagesIndexRoute() {
  return <SecureMessenger />;
}
