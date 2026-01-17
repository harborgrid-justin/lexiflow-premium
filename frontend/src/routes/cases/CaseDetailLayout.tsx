import { LoadingState } from '@/components/molecules/LoadingState/LoadingState';
import { Case, LegalDocument, Party } from '@/types';
import { Suspense, useCallback } from 'react';
import { Await, useLoaderData, useNavigate, useParams, type NavigateFunction } from 'react-router';
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

  return (
    <Suspense fallback={<LoadingState />}>
      <Await resolve={documents}>
        {(resolvedDocuments: LegalDocument[]) => (
          <Await resolve={parties}>
            {(resolvedParties: Party[]) => (
              <CaseDetailResolved
                caseData={caseData}
                tab={tab}
                navigate={navigate}
                documents={resolvedDocuments}
                parties={resolvedParties}
              />
            )}
          </Await>
        )}
      </Await>
    </Suspense>
  );
}

function CaseDetailResolved({
  caseData,
  tab,
  navigate,
  documents,
  parties,
}: {
  caseData: Case;
  tab?: string;
  navigate: NavigateFunction;
  documents: LegalDocument[];
  parties: Party[];
}) {
  const detail = useCaseDetail(caseData, tab || 'Overview', documents, parties);

  const handleTabChange = useCallback((newTab: string) => {
    const routeMap: Record<string, string> = {
      Overview: 'overview',
      Parties: 'parties',
      Timeline: 'timeline',
      Strategy: 'strategy',
      Planning: 'calendar',
      Projects: 'projects',
      Workflow: 'workflow',
      Collaboration: 'collaboration',
      Motions: 'motions',
      Discovery: 'discovery',
      Evidence: 'evidence',
      Exhibits: 'exhibits',
      Documents: 'documents',
      Drafting: 'drafting',
      'Contract Review': 'review',
      Billing: 'financials',
      Research: 'research',
      Risk: 'risk',
      Arguments: 'arguments',
    };

    const path = routeMap[newTab] || newTab.toLowerCase().replace(/\s+/g, '-');
    navigate(path);
  }, [navigate]);

  return (
    <CaseDetailProvider
      value={{
        ...detail,
        caseData,
        setActiveTab: handleTabChange,
      }}
    >
      <CaseDetailShell />
    </CaseDetailProvider>
  );
}
