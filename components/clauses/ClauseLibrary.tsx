
import React from 'react';
import { Clause } from '../types';

interface ClauseLibraryProps {
    onSelectClause: (clause: Clause) => void;
}

const ClauseLibrary: React.FC<ClauseLibraryProps> = ({ onSelectClause }) => {
    return <div className="p-8 text-center text-slate-500">Clause Library Module Loading...</div>;
};

export default ClauseLibrary;
