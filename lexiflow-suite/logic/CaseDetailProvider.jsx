
import React, { useState, useMemo, useCallback } from "react";
import { CaseDetailContext } from "./CaseDetailContext.js";
import { GeminiService } from "../services/geminiService.ts";

export const CaseDetailProvider = ({ caseData, children }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [analyzingId, setAnalyzingId] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const handleAnalyzeDoc = useCallback(async (doc) => {
    setAnalyzingId(doc.id);
    try {
      const result = await GeminiService.analyzeDocument(doc.content);
      // In a real app, we'd update the global document state here
      console.log("Analysis Result:", result);
    } finally {
      setAnalyzingId(null);
    }
  }, []);

  const value = {
    caseData,
    activeTab,
    setActiveTab,
    analyzingId,
    handleAnalyzeDoc,
    rightPanelOpen,
    setRightPanelOpen
  };

  return (
    <CaseDetailContext.Provider value={value}>
      {children}
    </CaseDetailContext.Provider>
  );
};
