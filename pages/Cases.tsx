import React from 'react';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';

const Cases: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className="p-6">
      <h1 className={cn('text-3xl font-bold', theme.text.primary)}>Cases</h1>
    </div>
  );
};

export default Cases;
