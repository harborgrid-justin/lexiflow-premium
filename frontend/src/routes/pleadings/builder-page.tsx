import { createMeta } from '../_shared/meta-utils';

import { PleadingBuilder } from './components/PleadingBuilder';

export function meta() {
  return createMeta({
    title: 'Pleading Builder',
    description: 'AI-powered pleading drafting and template management',
  });
}

export default function PleadingBuilderPage() {
  return <PleadingBuilder />;
}
