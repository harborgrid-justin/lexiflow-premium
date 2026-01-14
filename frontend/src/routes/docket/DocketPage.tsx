import { useLoaderData } from 'react-router';
import { DocketProvider } from './DocketProvider';
import { DocketView } from './DocketView';
import type { clientLoader } from './loader';

export function DocketPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <DocketProvider initialEntries={data.docketEntries}>
      <DocketView />
    </DocketProvider>
  );
}
