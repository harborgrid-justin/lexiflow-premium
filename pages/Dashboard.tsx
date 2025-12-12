/**
 * Dashboard Page
 * Placeholder dashboard page
 */

import React from 'react';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="p-6">
      <h1 className={cn('text-3xl font-bold mb-6', theme.text.primary)}>
        Dashboard
      </h1>
      <p className={cn('text-lg', theme.text.secondary)}>
        Welcome to LexiFlow Premium. Your enterprise React frontend is ready!
      </p>
    </div>
  );
};

export default Dashboard;
