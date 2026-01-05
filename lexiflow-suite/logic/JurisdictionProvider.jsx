
import React, { useState } from "react";
import { JurisdictionContext } from "./JurisdictionContext.js";

export const JurisdictionProvider = ({ children }) => {
  const [activeVenue, setActiveVenue] = useState('federal');
  const [favoriteCourts, setFavoriteCourts] = useState(['N.D. Cal.', 'S.D.N.Y.']);

  const toggleFavorite = (court) => {
    setFavoriteCourts(prev => 
      prev.includes(court) ? prev.filter(c => c !== court) : [...prev, court]
    );
  };

  const value = {
    activeVenue,
    setActiveVenue,
    favoriteCourts,
    toggleFavorite
  };

  return (
    <JurisdictionContext.Provider value={value}>
      {children}
    </JurisdictionContext.Provider>
  );
};
