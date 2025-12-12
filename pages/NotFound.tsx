/**
 * 404 Not Found Page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';

const NotFound: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className={cn('text-9xl font-bold mb-4', theme.text.primary)}>
          404
        </h1>
        <h2 className={cn('text-2xl font-semibold mb-4', theme.text.secondary)}>
          Page Not Found
        </h2>
        <p className={cn('text-lg mb-8', theme.text.tertiary)}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
