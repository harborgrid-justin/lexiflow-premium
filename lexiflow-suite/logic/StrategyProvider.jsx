
import React, { useState } from "react";
import { StrategyContext } from "./StrategyContext.js";

export const StrategyProvider = ({ children }) => {
  const [citations, setCitations] = useState([]);
  const [argumentsList, setArgumentsList] = useState([]);

  const addCitation = (cit) => setCitations(prev => [cit, ...prev]);
  const addArgument = (arg) => setArgumentsList(prev => [arg, ...prev]);

  const value = {
    citations,
    argumentsList,
    addCitation,
    addArgument
  };

  return (
    <StrategyContext.Provider value={value}>
      {children}
    </StrategyContext.Provider>
  );
};
