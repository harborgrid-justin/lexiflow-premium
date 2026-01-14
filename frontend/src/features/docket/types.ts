import type { DocketEntry } from "@/types/motion-docket";

export type { DocketEntry };

export interface DocketLoaderData {
  entries: DocketEntry[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface DocketActionData {
  success: boolean;
  message?: string;
  error?: string;
}
