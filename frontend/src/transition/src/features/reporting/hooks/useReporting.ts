/**
 * useReporting - Hook for reporting operations
 *
 * Connects to backend reporting gateway for analytics and reports.
 */

import { useEffect, useState } from "react";
import type { Report } from "../../../services/data/api/gateways/reportingGateway";
import { reportingGateway } from "../../../services/data/api/gateways/reportingGateway";

export function useReporting() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportingGateway.getAllReports();
      setReports(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load reports";
      console.error("Failed to load reports:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (
    type: string,
    params: Record<string, any> = {}
  ): Promise<Report | null> => {
    setLoading(true);
    setError(null);
    try {
      const report = await reportingGateway.generateReport(type, params);
      setReports((prev) => [...prev, report]);
      return report;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate report";
      console.error("Failed to generate report:", err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (
    reportId: string,
    format: "pdf" | "xlsx" | "csv"
  ): Promise<Blob | null> => {
    setLoading(true);
    setError(null);
    try {
      return await reportingGateway.exportReport(reportId, format);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export report";
      console.error("Failed to export report:", err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    reports,
    loading,
    error,
    refresh: loadReports,
    generateReport,
    exportReport,
  };
}
