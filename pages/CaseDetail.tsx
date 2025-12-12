import React from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';

const CaseDetail: React.FC = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  return (
    <div className="p-6">
      <h1 className={cn('text-3xl font-bold', theme.text.primary)}>Case Detail: {id}</h1>
    </div>
  );
};

export default CaseDetail;
