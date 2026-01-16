import { LoadingState } from '@/components/molecules/LoadingState/LoadingState';
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

              // Navigation handler for tabs
              const handleTabChange = useCallback((newTab: string) => {
                // Map complex IDs to simple routes
                const routeMap: Record<string, string> = {
                  'Overview': 'overview',
                  'Parties': 'parties',
                  'Timeline': 'timeline',
                  'Strategy': 'strategy',
                  'Planning': 'calendar', // Use calendar route for Planning
                  'Projects': 'projects',
                  'Workflow': 'workflow',
                  'Collaboration': 'collaboration',
                  'Motions': 'motions',
                  'Discovery': 'discovery',
                  'Evidence': 'evidence',
                  'Exhibits': 'exhibits',
                  'Documents': 'documents',
                  'Drafting': 'drafting',
                  'Contract Review': 'review',
                  'Billing': 'financials', // Use financials route for Billing
                  'Research': 'research',
                  'Risk': 'risk',
                  'Arguments': 'arguments'
                };

                const path = routeMap[newTab] || newTab.toLowerCase().replace(/\s+/g, '-');
                navigate(path);
              }, [navigate]);

              return (
                <CaseDetailProvider value={{
                  ...detail,
                  caseData,
                  setActiveTab: handleTabChange
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
