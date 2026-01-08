import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, Gavel, BookOpen } from 'lucide-react';
import { legalResearchApi } from '../legalResearchApi';

interface SearchFilters {
  searchType: 'all' | 'case_law' | 'statute';
  jurisdiction?: string[];
  court?: string[];
  dateFrom?: string;
  dateTo?: string;
  topics?: string[];
  keyNumber?: string;
  isBinding?: boolean;
  isActive?: boolean;
}

interface ResearchSearchBarProps {
  onSearch: (results: any) => void;
  onLoading?: (loading: boolean) => void;
}

/**
 * ResearchSearchBar Component
 * Advanced search interface for legal research with filters
 */
export const ResearchSearchBar: React.FC<ResearchSearchBarProps> = ({
  onSearch,
  onLoading
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchType: 'all',
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setIsSearching(true);
    onLoading?.(true);

    try {
      const results = await legalResearchApi.search({
        query: query.trim(),
        searchType: filters.searchType,
        caseLawFilters: filters.searchType !== 'statute' ? {
          jurisdiction: filters.jurisdiction,
          court: filters.court,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          topics: filters.topics,
          keyNumber: filters.keyNumber,
          isBinding: filters.isBinding,
        } : undefined,
        statuteFilters: filters.searchType !== 'case_law' ? {
          jurisdiction: filters.jurisdiction,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          topics: filters.topics,
          isActive: filters.isActive,
        } : undefined,
        saveToHistory: true,
      });

      onSearch(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
      onLoading?.(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search case law, statutes, or enter a citation..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Type Toggle */}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => handleFilterChange('searchType', 'all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filters.searchType === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Sources
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('searchType', 'case_law')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              filters.searchType === 'case_law'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Gavel className="w-4 h-4" />
            Case Law
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('searchType', 'statute')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              filters.searchType === 'statute'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Statutes
          </button>
        </div>
      </form>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Jurisdiction Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Jurisdiction
              </label>
              <select
                value={filters.jurisdiction?.[0] || ''}
                onChange={(e) => handleFilterChange('jurisdiction', e.target.value ? [e.target.value] : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Jurisdictions</option>
                <option value="Federal">Federal</option>
                <option value="State">State</option>
                <option value="Supreme Court">Supreme Court</option>
                <option value="Circuit Court">Circuit Court</option>
                <option value="District Court">District Court</option>
              </select>
            </div>

            {/* Court Filter (Case Law only) */}
            {filters.searchType !== 'statute' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court
                </label>
                <select
                  value={filters.court?.[0] || ''}
                  onChange={(e) => handleFilterChange('court', e.target.value ? [e.target.value] : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Courts</option>
                  <option value="U.S. Supreme Court">U.S. Supreme Court</option>
                  <option value="1st Circuit">1st Circuit</option>
                  <option value="2nd Circuit">2nd Circuit</option>
                  <option value="3rd Circuit">3rd Circuit</option>
                  <option value="9th Circuit">9th Circuit</option>
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Binding Precedent (Case Law only) */}
            {filters.searchType === 'case_law' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precedent Status
                </label>
                <select
                  value={filters.isBinding === undefined ? '' : filters.isBinding ? 'binding' : 'non-binding'}
                  onChange={(e) => handleFilterChange('isBinding', e.target.value === '' ? undefined : e.target.value === 'binding')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Cases</option>
                  <option value="binding">Binding Precedent Only</option>
                  <option value="non-binding">Non-Binding</option>
                </select>
              </div>
            )}

            {/* Active Status (Statutes only) */}
            {filters.searchType === 'statute' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statute Status
                </label>
                <select
                  value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'active')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statutes</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive/Repealed</option>
                </select>
              </div>
            )}

            {/* Key Number (Case Law only) */}
            {filters.searchType === 'case_law' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  West Key Number
                </label>
                <input
                  type="text"
                  value={filters.keyNumber || ''}
                  onChange={(e) => handleFilterChange('keyNumber', e.target.value)}
                  placeholder="e.g., 92K1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setFilters({ searchType: filters.searchType })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
