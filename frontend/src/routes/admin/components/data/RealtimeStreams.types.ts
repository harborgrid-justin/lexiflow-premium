export interface DataStream {
  id: string;
  name: string;
  source: string;
  target: string;
  status: "active" | "paused" | "error";
  throughput: string;
  latency: string;
  messagesProcessed: number;
  lastActivity: string;
}

export interface RealtimeStreamsProps {
  initialTab?: string;
}
