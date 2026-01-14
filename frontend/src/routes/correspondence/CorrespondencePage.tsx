import { useLoaderData } from 'react-router';
import { CorrespondenceProvider } from './CorrespondenceProvider';
import { CorrespondenceView } from './CorrespondenceView';
import type { clientLoader } from './loader';

export function CorrespondencePageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <CorrespondenceProvider initialEmails={data.emails} initialLetters={data.letters} initialTemplates={data.templates}>
      <CorrespondenceView />
    </CorrespondenceProvider>
  );
}
