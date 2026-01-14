// src/app/paths/PublicPath.tsx
import { useData } from "@/routes/dashboard";
import React, { useState } from "react";
import { OptimisticInput } from "../../components/performance/OptimisticInput";
import { useAuth } from "../../contexts/auth/AuthContext";

export function PublicPath() {
  const { login, isLoading: authLoading, error: authError } = useAuth();
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
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Load Public Data
        </button>
        <ul className="mt-4 space-y-2">
          {items.map((x) => (
            <li key={x.id} className="p-2 bg-gray-100 rounded">
              {x.label}
            </li>
          ))}
        </ul>
      </div>

      <hr className="my-8" />

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl mb-4">Login</h2>
        {authError && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {authLoading ? "Logging in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};
