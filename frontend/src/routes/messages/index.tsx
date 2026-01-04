import { SecureMessenger } from '@/features/operations/messenger/SecureMessenger';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Messages',
    description: 'Secure internal and external communication',
  });
}

export default function MessagesIndexRoute() {
  return <SecureMessenger />;
}
