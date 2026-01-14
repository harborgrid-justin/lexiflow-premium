export interface Integration {
  id: string;
  name: string;
  description: string;
  category:
    | "storage"
    | "ai"
    | "communication"
    | "calendar"
    | "billing"
    | "analytics";
  status: "connected" | "disconnected" | "error";
  icon: string;
  lastSync?: string;
  config?: Record<string, unknown>;
}
