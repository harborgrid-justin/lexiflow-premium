'use client';

/**
 * Permissions Client Component
 * Handles filtering and display of permissions
 */

import { useState, useMemo } from 'react';
import { Search, Eye, Lock } from 'lucide-react';
import type { Permission } from '../types';

interface PermissionsClientProps {
  permissions: Permission[];
}

function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    read: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    update: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    approve: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    export: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return colors[action] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
}

export function PermissionsClient({ permissions }: PermissionsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => {
    return [...new Set(permissions.map((p) => p.category))];
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    return permissions.filter((perm) => {
      const matchesSearch =
        perm.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || perm.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [permissions, searchTerm, categoryFilter]);

  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce<Record<string, Permission[]>>((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {});
  }, [filteredPermissions]);

  const stats = useMemo(() => ({
    total: permissions.length,
    categories: categories.length,
    resources: new Set(permissions.map((p) => p.resource)).size,
    actions: new Set(permissions.map((p) => p.action)).size,
  }), [permissions, categories]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Permissions</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Categories</p>
          <p className="text-2xl font-bold text-blue-600">{stats.categories}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Resources</p>
          <p className="text-2xl font-bold text-green-600">{stats.resources}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Actions</p>
          <p className="text-2xl font-bold text-purple-600">{stats.actions}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label htmlFor="perm-search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="perm-search"
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label htmlFor="cat-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              id="cat-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Permissions by Category */}
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, perms]) => (
          <div
            key={category}
            className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{category}</h2>
              <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
                {perms.length} permissions
              </span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {perms.map((perm) => (
                <div
                  key={perm.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <code className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono text-slate-700 dark:text-slate-300">
                        {perm.id}
                      </code>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getActionColor(perm.action)}`}>
                        {perm.action.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {perm.roleCount !== undefined ? `${perm.roleCount} roles` : ''}
                      </span>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        View Roles
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{perm.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedPermissions).length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Lock className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              No permissions found
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
