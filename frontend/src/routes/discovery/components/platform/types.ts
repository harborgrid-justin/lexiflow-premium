import { type DiscoveryRequest } from "@/types";
import { type DiscoveryView } from "@/utils/discoveryNavigation";

export type { DiscoveryView };

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
  caseId?: string;
}

export interface InitialDisclosureWizardProps {
  onComplete: () => void;
}
