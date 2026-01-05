
import React, { useState, useCallback } from "react";
import { DocContext } from "./DocContext";
import { MOCK_DOCUMENTS } from "../data/mockDocuments";
import { GeminiService } from "../services/geminiService";

export const DocProvider = ({ children }) => {
  const [docs, setDocs] = useState(MOCK_DOCUMENTS);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const analyzeDoc = async (id) => {
    const doc = docs.find(d => d.id === id);
    if (!doc) return;
    
    setLoading(true);
    try {
      const result = await GeminiService.analyzeDocument(doc.content);
      setDocs(prev => prev.map(d => 
        d.id === id ? { ...d, summary: result.summary, riskScore: result.riskScore } : d
      ));
    } catch (e) {
      console.error("AI Analysis Failed", e);
    } finally {
      setLoading(false);
    }
  };

  const uploadDoc = (doc) => {
    setDocs(prev => [doc, ...prev]);
  };

  const deleteDoc = (id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const value = {
    docs,
    loading,
    selectedId,
    setSelectedId,
    analyzeDoc,
    uploadDoc,
    deleteDoc
  };

  return (
    <DocContext.Provider value={value}>
      {children}
    </DocContext.Provider>
  );
};
