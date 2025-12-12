import React, { useState, useEffect } from 'react';
import { FileText, Tag, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ClassificationResult {
  type: string;
  category: string;
  subcategory?: string;
  confidence: number;
  tags: string[];
  characteristics: {
    length: string;
    complexity: string;
    formality: string;
    [key: string]: any;
  };
  suggestions: string[];
}

interface DocumentClassifierProps {
  documentId: string;
  onClassificationComplete?: (result: ClassificationResult) => void;
  autoClassify?: boolean;
}

/**
 * Document Classification UI Component
 * Features:
 * - ML-based document type detection
 * - Confidence visualization
 * - Manual classification override
 * - Tag management
 * - Classification suggestions
 * - Batch classification
 */
export const DocumentClassifier: React.FC<DocumentClassifierProps> = ({
  documentId,
  onClassificationComplete,
  autoClassify = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [manualType, setManualType] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (autoClassify) {
      classifyDocument();
    }
  }, [documentId, autoClassify]);

  const classifyDocument = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/documents/${documentId}/classify`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Classification failed');
      }

      const result: ClassificationResult = await response.json();
      setClassification(result);
      setCustomTags(result.tags);
      onClassificationComplete?.(result);

    } catch (error) {
      console.error('Classification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyManualClassification = async () => {
    if (!manualType) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/documents/${documentId}/classify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: manualType,
          tags: customTags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update classification');
      }

      await classifyDocument();

    } catch (error) {
      console.error('Manual classification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag && !customTags.includes(newTag)) {
      setCustomTags([...customTags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag));
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const documentTypes = [
    'Contract',
    'Complaint',
    'Motion',
    'Brief',
    'Deposition',
    'Discovery Request',
    'Court Order',
    'Affidavit',
    'Settlement Agreement',
    'Lease Agreement',
  ];

  if (loading && !classification) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Classifying document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Document Classification
        </h2>

        <button
          onClick={classifyDocument}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Re-classify
        </button>
      </div>

      {classification ? (
        <div className="space-y-6">
          {/* Classification Result */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium">Automatic Classification</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Document Type */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Document Type</label>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-lg font-medium ${getConfidenceColor(classification.confidence)}`}>
                    {classification.type}
                  </div>
                  <div className="text-sm text-gray-600">
                    {(classification.confidence * 100).toFixed(1)}% confidence
                  </div>
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Category</label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm font-medium">
                    {classification.category}
                  </div>
                </div>

                {classification.subcategory && (
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Subcategory</label>
                    <div className="px-3 py-2 bg-gray-100 rounded text-sm font-medium">
                      {classification.subcategory}
                    </div>
                  </div>
                )}
              </div>

              {/* Characteristics */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Characteristics</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(classification.characteristics).map(([key, value]) => (
                    <div key={key} className="px-3 py-2 bg-blue-50 rounded text-sm">
                      <span className="text-gray-600">{key}:</span>{' '}
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence Meter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600">Classification Confidence</label>
                  <span className="text-sm font-medium">
                    {(classification.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      classification.confidence >= 0.8 ? 'bg-green-500' :
                      classification.confidence >= 0.6 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${classification.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Suggestions */}
              {classification.suggestions.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Suggestions
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {classification.suggestions.map((suggestion, idx) => (
                      <li key={idx}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {customTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Manual Classification Override */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium">Manual Override</h3>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600">
                If the automatic classification is incorrect, you can manually specify the document type.
              </p>

              <div className="flex gap-2">
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select document type...</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <button
                  onClick={applyManualClassification}
                  disabled={!manualType || loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Classification Quality */}
          {classification.confidence < 0.6 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Low Confidence Classification
                  </p>
                  <p className="text-sm text-yellow-800">
                    The automatic classification has low confidence. Please review and consider using manual override if incorrect.
                  </p>
                </div>
              </div>
            </div>
          )}

          {classification.confidence >= 0.8 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 mb-1">
                    High Confidence Classification
                  </p>
                  <p className="text-sm text-green-800">
                    The document has been classified with high confidence. The classification is likely accurate.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No classification available</p>
          <button
            onClick={classifyDocument}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Classify Document
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentClassifier;
