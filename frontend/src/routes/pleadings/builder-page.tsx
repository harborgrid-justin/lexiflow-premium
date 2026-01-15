import { PleadingBuilder } from './components/PleadingBuilder';
import { createMeta } from '../_shared/meta-utils';

export function meta() {
  return createMeta({
    title: 'Pleading Builder',
    description: 'AI-powered pleading drafting and template management',
  });
}

export default function PleadingBuilderPage() {
  return <PleadingBuilder />;
}
