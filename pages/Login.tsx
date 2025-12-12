/**
 * Login Page
 * Placeholder login page
 */

import React from 'react';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';

const Login: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <h1 className={cn('text-3xl font-bold mb-6 text-center', theme.text.primary)}>
          Login
        </h1>
        <p className={cn('text-center', theme.text.secondary)}>
          Login page placeholder
        </p>
      </div>
    </div>
  );
};

export default Login;
