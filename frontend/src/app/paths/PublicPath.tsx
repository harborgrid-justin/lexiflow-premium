// src/app/paths/PublicPath.tsx
import { OptimisticInput } from "@/components/performance/OptimisticInput";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/routes/dashboard";
import { cn } from "@/lib/cn";
import React, { useState } from "react";

export function PublicPath() {
  const { login, isLoading: authLoading, error: authError } = useAuth();
  const { theme } = useTheme();
  const { items, refresh } = useData();
  const [email, setEmail] = useState("demo@lexiflow.ai");
  const [password, setPassword] = useState("password");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // Error handled in context
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">LexiFlow Public Portal</h1>

      <div className="mb-8">
        <h2 className="text-xl mb-2">Public Data</h2>
        <button
          onClick={refresh}
          className={cn('text-white px-4 py-2 rounded', theme.colors.primary, 'hover:opacity-90')}
        >
          Load Public Data
        </button>
        <ul className="mt-4 space-y-2">
          {items.map((x) => (
            <li key={x.id} className={cn('p-2 rounded', theme.surface.hover)}>
              {x.label}
            </li>
          ))}
        </ul>
      </div>

      <hr className="my-8" />

      <div className={cn('p-6 rounded shadow', theme.surface.card)}>
        <h2 className="text-xl mb-4">Login</h2>
        {authError && (
          <div className={cn('p-3 rounded mb-4', theme.status.error.background, theme.status.error.text)}>
            {authError}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <OptimisticInput
              type="email"
              value={email}
              onChange={setEmail}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              metricName="LoginEmail"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <OptimisticInput
              type="password"
              value={password}
              onChange={setPassword}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              metricName="LoginPassword"
            />
          </div>
          <button
            type="submit"
            disabled={authLoading}
            className={cn('w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50', theme.colors.primary, 'hover:opacity-90', theme.border.focus)}
          >
            {authLoading ? "Logging in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};
