import { DiscoveryRequest } from '@/types';

export type DiscoveryView =
  | 'dashboard'
  | 'requests'
  | 'privilege'
  | 'holds'
  | 'plan'
  | 'doc_viewer'
  | 'response'
  | 'production_wizard'
  | 'productions'
  | 'depositions'
  | 'esi'
  | 'interviews'
  | 'custodians'
  | 'examinations'
  | 'collections'
  | 'processing'
  | 'review'
  | 'timeline';

export interface DiscoveryPlatformProps {
    initialTab?: DiscoveryView;
    caseId?: string;
}

export interface DiscoveryRequestsProps {
  onNavigate: (view: DiscoveryView, id?: string) => void;
  items?: DiscoveryRequest[];
}

export interface DiscoveryResponseProps {
  request: DiscoveryRequest | null;
  onBack: () => void;
  onSave: (reqId: string, text: string) => void;
}

export interface DiscoveryProductionProps {
  request: DiscoveryRequest | null;
  onBack: () => void;
}

export interface DiscoveryDocumentViewerProps {
  docId: string;
  onBack: () => void;
}

export interface ViewerDocumentState {
    title: string;
    content: string;
    type: string;
    date: string;
}

export interface DiscoveryProductionsProps {
    onCreateClick: () => void;
}

export interface InitialDisclosureWizardProps {
  onComplete: () => void;
}
