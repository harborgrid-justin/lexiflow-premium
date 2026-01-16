import { LoadingState } from '@/components/common/LoadingState';
import { Case, LegalDocument, Party } from '@/types';
import { Suspense, useCallback } from 'react';
import { Await, useLoaderData, useNavigate, useParams } from 'react-router';
import { CaseDetailProvider } from './CaseDetailContext';
import { CaseDetailShell } from './CaseDetailShell';
import { caseDetailLoader } from './detail-loader';
import { useCaseDetail } from './hooks/useCaseDetail';

export { caseDetailLoader as loader };

export default function CaseDetailLayout() {
  const { caseData, documents, parties } = useLoaderData() as {
    caseData: Case;
    documents: Promise<LegalDocument[]>;
    parties: Promise<Party[]>;
  };
  const { tab } = useParams();
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/cases');
  }, [navigate]);

  const handleSelectCase = useCallback((selectedCase: { id: string }) => {
    navigate(`/cases/${selectedCase.id}`);
  }, [navigate]);

  return (
    <Suspense fallback={<LoadingState />}>
      <Await resolve={documents}>
        {(resolvedDocuments: LegalDocument[]) => (
          <Await resolve={parties}>
            {(resolvedParties: Party[]) => {
              // Now we have both resolved data and caseData
              const detail = useCaseDetail(
                caseData,
                tab || 'Overview',
                resolvedDocuments,
                resolvedParties
              );

              return (
                <CaseDetailProvider value={{
                  ...detail,
                  caseData
                }}>
                  <CaseDetailShell />
                </CaseDetailProvider>
              );
            }}
          </Await>
        )}
      </Await>
    </Suspense>
  );
}
