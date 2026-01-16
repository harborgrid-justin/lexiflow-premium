/**
 * Reports Domain Types
 *
 * @module routes/reports/components/types
 */

export type Report = {
  id: string;
  name: string;
  type: string;
  description: string;
  lastRun?: string;
  schedule?: string;
  status: string;
};
