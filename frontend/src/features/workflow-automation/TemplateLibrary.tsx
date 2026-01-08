import React, { useState, useEffect } from 'react';
import { WorkflowTemplate } from './types';

/**
 * TemplateLibrary Component
 * Browse and use pre-built workflow templates
 */
export const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch('/api/workflows/templates');
      // setTemplates(response.data);

      // Mock data for demonstration
      setTemplates([
        {
          id: 'new-matter-intake',
          name: 'New Matter Intake',
          description: 'Complete intake process for new legal matters including conflict checks, engagement letters, and client onboarding',
          category: 'Matter Management',
        },
        {
          id: 'document-approval',
          name: 'Document Approval',
          description: 'Multi-level document review and approval workflow with partner sign-off',
          category: 'Document Management',
        },
        {
          id: 'invoice-approval',
          name: 'Invoice Approval',
          description: 'Automated invoice review and approval process with client notification',
          category: 'Billing',
        },
        {
          id: 'conflict-check',
          name: 'Conflict Check',
          description: 'Comprehensive conflict of interest verification with partner approval',
          category: 'Compliance',
        },
        {
          id: 'contract-review',
          name: 'Contract Review',
          description: 'Structured contract review and negotiation workflow with risk assessment',
          category: 'Contract Management',
        },
        {
          id: 'client-onboarding',
          name: 'Client Onboarding',
          description: 'Complete client intake and setup including KYC and billing configuration',
          category: 'Client Management',
        },
        {
          id: 'litigation-filing',
          name: 'Litigation Filing',
          description: 'Document preparation and court filing with citation checks',
          category: 'Litigation',
        },
        {
          id: 'discovery-response',
          name: 'Discovery Response',
          description: 'Systematic discovery request response with privilege review',
          category: 'Discovery',
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    if (confirm('Create a new workflow from this template?')) {
      try {
        // API call would go here
        // await fetch(`/api/workflows/from-template/${templateId}`, { method: 'POST' });
        alert('Workflow created successfully!');
        window.location.href = '/workflows';
      } catch (error) {
        console.error('Failed to create workflow:', error);
        alert('Failed to create workflow');
      }
    }
  };

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workflow Templates</h1>
        <p className="mt-1 text-sm text-gray-600">
          Pre-built workflows for common legal processes
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search templates..."
          className="flex-1 rounded-md border border-gray-300 px-4 py-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="rounded-md border border-gray-300 px-4 py-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {template.name}
                </h3>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {template.description}
              </p>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 font-medium"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  Use Template
                </button>
                <button
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => alert('Preview coming soon!')}
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;
