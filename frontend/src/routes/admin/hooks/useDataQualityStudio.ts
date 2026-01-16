import { QUALITY_RULES_DEFAULT } from "@/config/quality.config";
import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { DataAnomaly, QualityMetricHistory } from "@/types";
import { useEffect, useRef, useState } from "react";
import { QualityRule } from "../components/data/quality/RuleBuilder";

export const useDataQualityStudio = (initialTab: string = "dashboard") => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Timer Ref for Cleanup
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Builder State
  const [isRuleBuilderOpen, setIsRuleBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<QualityRule | undefined>(
    undefined,
  );

  useEffect(() => {
    if (initialTab !== "") {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current !== null) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Integrated Data Query
  const { data: fetchedAnomalies = [], isLoading } = useQuery<DataAnomaly[]>(
    ["admin", "anomalies"],
    async () => (await DataService.admin.getAnomalies()) as DataAnomaly[],
  );

  const { data: history = [] } = useQuery<QualityMetricHistory[]>(
    ["quality", "history"],
    async () =>
      (await DataService.quality.getHistory()) as QualityMetricHistory[],
  );

  const [anomalies, setAnomalies] = useState<DataAnomaly[]>([]);

  useEffect(() => {
    if (fetchedAnomalies.length > 0) {
      setAnomalies(fetchedAnomalies);
    }
  }, [fetchedAnomalies]);

  const [rules, setRules] = useState<QualityRule[]>(QUALITY_RULES_DEFAULT);

  const handleScan = (): void => {
    if (scanIntervalRef.current !== null) {
      clearInterval(scanIntervalRef.current);
    }

    setIsScanning(true);
    setScanProgress(0);

    scanIntervalRef.current = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          if (scanIntervalRef.current !== null) {
            clearInterval(scanIntervalRef.current);
          }
          setIsScanning(false);
          return 100;
        }
        return p + 5;
      });
    }, 100);
  };

  const openRuleBuilder = (rule?: QualityRule) => {
    setEditingRule(rule);
    setIsRuleBuilderOpen(true);
  };

  const closeRuleBuilder = () => {
    setIsRuleBuilderOpen(false);
    setEditingRule(undefined);
  };

  return {
    activeTab,
    setActiveTab,
    isScanning,
    scanProgress,
    handleScan,
    isLoading,
    anomalies,
    history,
    rules,
    setRules,
    isRuleBuilderOpen,
    setIsRuleBuilderOpen,
    editingRule,
    setEditingRule,
    openRuleBuilder,
    closeRuleBuilder,
  };
};
