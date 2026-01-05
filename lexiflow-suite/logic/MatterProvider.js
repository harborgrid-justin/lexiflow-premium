
import React, { useState, useCallback, useMemo } from "react";
import { MatterContext } from "./MatterContext";
import { MOCK_CASES } from "../data/mockCases";

/**
 * MatterProvider: Manages the lifecycle and state transitions of legal cases.
 * Handles filtering, sorting, and matter activation logic.
 */
export const MatterProvider = ({ children }) => {
  const [cases, setCases] = useState(MOCK_CASES);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const activeCase = useMemo(() => 
    cases.find(c => c.id === activeCaseId) || null,
    [cases, activeCaseId]
  );

  const filteredCases = useMemo(() => {
    if (statusFilter === "All") return cases;
    return cases.filter(c => c.status === statusFilter);
  }, [cases, statusFilter]);

  const selectCase = (id) => setActiveCaseId(id);

  const addCase = (newCase) => {
    setCases(prev => [newCase, ...prev]);
  };

  const updateCaseStatus = (id, status) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const value = {
    cases: filteredCases,
    activeCase,
    loading,
    statusFilter,
    setStatusFilter,
    selectCase,
    addCase,
    updateCaseStatus
  };

  return (
    <MatterContext.Provider value={value}>
      {children}
    </MatterContext.Provider>
  );
};
