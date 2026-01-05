import { AppView, Case } from "@/types";

export type CaseListView =
  | "active"
  | "intake"
  | "docket"
  | "tasks"
  | "conflicts"
  | "resources"
  | "trust"
  | "closing"
  | "archived";

export interface CaseListProps {
  onSelectCase: (caseData: Case) => void;
  initialTab?: CaseListView;
  setActiveView?: (view: AppView) => void;
}
