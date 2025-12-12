/**
 * Unauthorized Page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <ShieldAlert className={cn('h-24 w-24 mx-auto mb-6', theme.status.error.text)} />
        <h1 className={cn('text-3xl font-bold mb-4', theme.text.primary)}>
          Access Denied
        </h1>
        <p className={cn('text-lg mb-8', theme.text.secondary)}>
          You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
