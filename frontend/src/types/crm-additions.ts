export interface LeadsBySource {
  source: string;
  count: number;
  value: number;
}

export interface LeadsByStatus {
  status: string;
  count: number;
  value: number;
}

export interface ConversionTrend {
  period: string;
  rate: number;
}
