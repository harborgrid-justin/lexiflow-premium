
import React, { useState, useMemo } from "react";
import { BillingContext } from "./BillingContext";
import { MOCK_TIME_ENTRIES } from "../data/mockBilling";

export const BillingProvider = ({ children }) => {
  const [entries, setEntries] = useState(MOCK_TIME_ENTRIES);
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const total = entries.reduce((acc, curr) => acc + curr.total, 0);
    const unbilled = entries.filter(e => e.status === 'Unbilled').reduce((acc, curr) => acc + curr.total, 0);
    return { total, unbilled, count: entries.length };
  }, [entries]);

  const addEntry = (entry) => {
    setEntries(prev => [{ ...entry, id: Date.now().toString() }, ...prev]);
  };

  const value = {
    entries,
    stats,
    loading,
    addEntry
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};
