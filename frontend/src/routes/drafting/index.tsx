/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";
import DraftingDashboard from './components/DraftingDashboard';

export function meta(_args: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Drafting',
    description: 'Draft and assemble legal documents',
  });
}

export default function DraftingIndexRoute() {
  return <DraftingDashboard />;
}
