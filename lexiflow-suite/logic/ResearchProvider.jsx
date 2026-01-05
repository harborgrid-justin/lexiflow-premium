
import React, { useState } from "react";
import { ResearchContext } from "./ResearchContext.js";
import { GeminiService } from "../services/geminiService.ts";

export const ResearchProvider = ({ children }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const performResearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const result = await GeminiService.conductResearch(q);
      const session = {
        id: Date.now(),
        query: q,
        response: result.text,
        sources: result.sources,
        timestamp: new Date().toLocaleTimeString()
      };
      setResults(session);
      setHistory(prev => [session, ...prev]);
    } catch (e) {
      console.error("Research Failed", e);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    query,
    setQuery,
    results,
    history,
    loading,
    performResearch
  };

  return (
    <ResearchContext.Provider value={value}>
      {children}
    </ResearchContext.Provider>
  );
};
