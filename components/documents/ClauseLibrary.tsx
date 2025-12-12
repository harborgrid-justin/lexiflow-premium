import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Copy, Eye, Filter } from 'lucide-react';

interface Clause {
  id: string;
  title: string;
  content: string;
  description?: string;
  category: string;
  tags?: string[];
  variables?: string[];
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

interface ClauseLibraryProps {
  clauses?: Clause[];
  onSelectClause?: (clause: Clause) => void;
  onCreateClause?: () => void;
  onEditClause?: (clause: Clause) => void;
  onDeleteClause?: (clause: Clause) => void;
  onInterpolateClause?: (clause: Clause, variables: Record<string, any>) => void;
}

export const ClauseLibrary: React.FC<ClauseLibraryProps> = ({
  clauses = [],
  onSelectClause,
  onCreateClause,
  onEditClause,
  onDeleteClause,
  onInterpolateClause,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const categories = ['all', 'general', 'contract', 'motion', 'pleading', 'discovery', 'custom'];

  const filteredClauses = clauses.filter((clause) => {
    const matchesSearch =
      clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || clause.category === selectedCategory;

    return matchesSearch && matchesCategory && clause.isActive;
  });

  const handleClauseClick = (clause: Clause) => {
    setSelectedClause(clause);
    if (clause.variables && clause.variables.length > 0) {
      // Initialize variables
      const initialVars: Record<string, string> = {};
      clause.variables.forEach((v) => {
        initialVars[v] = '';
      });
      setVariables(initialVars);
      setShowVariableModal(true);
    } else {
      onSelectClause?.(clause);
    }
  };

  const handleInterpolate = () => {
    if (selectedClause) {
      onInterpolateClause?.(selectedClause, variables);
      setShowVariableModal(false);
      setSelectedClause(null);
      setVariables({});
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to show a toast notification here
  };

  const getMostUsedClauses = () => {
    return [...clauses]
      .filter((c) => c.isActive)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Clause Library</h2>
          {onCreateClause && (
            <button
              onClick={onCreateClause}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              New Clause
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clauses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Most Used Section */}
      {searchTerm === '' && selectedCategory === 'all' && (
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Most Used</h3>
          <div className="flex gap-2 overflow-x-auto">
            {getMostUsedClauses().map((clause) => (
              <button
                key={clause.id}
                onClick={() => handleClauseClick(clause)}
                className="px-3 py-2 bg-white border rounded-lg hover:shadow-md transition-shadow text-sm whitespace-nowrap"
              >
                <div className="font-medium">{clause.title}</div>
                <div className="text-xs text-gray-500">{clause.usageCount} uses</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clause List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-sm text-gray-500 mb-3">
          {filteredClauses.length} clause{filteredClauses.length !== 1 ? 's' : ''} found
        </div>

        <div className="space-y-3">
          {filteredClauses.map((clause) => (
            <div
              key={clause.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleClauseClick(clause)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{clause.title}</h3>
                  {clause.description && (
                    <p className="text-sm text-gray-600 mt-1">{clause.description}</p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(clause.content);
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Copy"
                  >
                    <Copy size={16} />
                  </button>
                  {onEditClause && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClause(clause);
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDeleteClause && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClause(clause);
                      }}
                      className="p-2 hover:bg-red-100 text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {clause.content}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {clause.category}
                </span>
                {clause.variables && clause.variables.length > 0 && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                    {clause.variables.length} variable{clause.variables.length !== 1 ? 's' : ''}
                  </span>
                )}
                {clause.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                <span className="text-xs text-gray-500 ml-auto">
                  Used {clause.usageCount} times
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredClauses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No clauses found</p>
            {onCreateClause && (
              <button
                onClick={onCreateClause}
                className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Create your first clause
              </button>
            )}
          </div>
        )}
      </div>

      {/* Variable Input Modal */}
      {showVariableModal && selectedClause && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Fill in Variables</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedClause.title}
              </p>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {selectedClause.variables?.map((variable) => (
                  <div key={variable}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {variable}
                    </label>
                    <input
                      type="text"
                      value={variables[variable] || ''}
                      onChange={(e) =>
                        setVariables({ ...variables, [variable]: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter ${variable}`}
                    />
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Preview</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {Object.entries(variables).reduce((content, [key, value]) => {
                    return content.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value || `[${key}]`);
                  }, selectedClause.content)}
                </p>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowVariableModal(false);
                  setSelectedClause(null);
                  setVariables({});
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInterpolate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Insert Clause
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClauseLibrary;
