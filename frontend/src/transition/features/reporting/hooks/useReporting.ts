/**
 * useReporting - Hook for reporting operations
 */

import { useState } from "react";
import { reportingGateway } from "../data/reportingGateway";
import type { Report } from "../domain/report";

export function useReporting() {
  const [loading, setLoading] = useState(false);

  const generateReport = async (type: string, params: any): Promise<Report> => {
    setLoading(true);
    try {
      return await reportingGateway.generateReport(type, params);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (
    reportId: string,
    format: "pdf" | "csv" | "xlsx"
  ): Promise<Blob> => {
    setLoading(true);
    try {
      return await reportingGateway.exportReport(reportId, format);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateReport,
    exportReport,
  };
}
