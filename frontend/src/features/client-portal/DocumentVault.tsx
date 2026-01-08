import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Lock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Folder,
  Edit3,
} from 'lucide-react';

interface SharedDocument {
  id: string;
  documentName: string;
  documentUrl: string;
  documentType?: string;
  fileSize: number;
  category?: string;
  description?: string;
  permissions: Array<'view' | 'download' | 'print' | 'comment'>;
  sharedAt: Date;
  expiresAt?: Date;
  requiresSignature: boolean;
  signedAt?: Date;
  isSensitive: boolean;
  downloadCount: number;
  downloadLimit?: number;
  status: string;
}

interface DocumentVaultProps {
  portalUserId: string;
}

export default function DocumentVault({ portalUserId }: DocumentVaultProps) {
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<SharedDocument | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [portalUserId, selectedCategory]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ portalUserId });
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      const response = await fetch(`/api/client-portal/documents?${params}`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (document: SharedDocument) => {
    try {
      await fetch(`/api/client-portal/documents/${document.id}/access?portalUserId=${portalUserId}`, {
        method: 'POST',
      });
      window.open(document.documentUrl, '_blank');
    } catch (error) {
      console.error('Failed to access document:', error);
    }
  };

  const handleDownloadDocument = async (document: SharedDocument) => {
    try {
      await fetch(`/api/client-portal/documents/${document.id}/download?portalUserId=${portalUserId}`, {
        method: 'POST',
      });
      // Trigger download
      const link = window.document.createElement('a');
      link.href = document.documentUrl;
      link.download = document.documentName;
      link.click();
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const handleSignDocument = (document: SharedDocument) => {
    setSelectedDocument(document);
    setShowSignatureModal(true);
  };

  const categories = ['all', ...new Set(documents.map((doc) => doc.category).filter(Boolean))];

  const filteredDocuments = documents.filter((doc) =>
    doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingSignatures = documents.filter((doc) => doc.requiresSignature && !doc.signedAt);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Vault</h1>
        <p className="mt-2 text-gray-600">Secure access to your shared documents</p>
      </div>

      {/* Pending Signatures Alert */}
      {pendingSignatures.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-yellow-700">
                <strong>{pendingSignatures.length}</strong> document
                {pendingSignatures.length !== 1 ? 's' : ''} require{pendingSignatures.length === 1 ? 's' : ''} your signature
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={() => handleViewDocument(document)}
              onDownload={() => handleDownloadDocument(document)}
              onSign={() => handleSignDocument(document)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No documents found</p>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && selectedDocument && (
        <SignatureModal
          portalUserId={portalUserId}
          document={selectedDocument}
          onClose={() => {
            setShowSignatureModal(false);
            setSelectedDocument(null);
          }}
          onSigned={() => {
            setShowSignatureModal(false);
            setSelectedDocument(null);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
}

interface DocumentCardProps {
  document: SharedDocument;
  onView: () => void;
  onDownload: () => void;
  onSign: () => void;
}

function DocumentCard({ document, onView, onDownload, onSign }: DocumentCardProps) {
  const getFileIcon = (type?: string) => {
    if (!type) return <FileText className="w-8 h-8 text-gray-400" />;
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes('word') || type.includes('doc')) return <FileText className="w-8 h-8 text-blue-500" />;
    if (type.includes('excel') || type.includes('sheet')) return <FileText className="w-8 h-8 text-green-500" />;
    return <FileText className="w-8 h-8 text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isExpiringSoon = () => {
    if (!document.expiresAt) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(document.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {getFileIcon(document.documentType)}
          <div className="flex items-center space-x-2">
            {document.isSensitive && (
              <span className="p-1 bg-red-100 rounded" title="Sensitive">
                <Lock className="w-4 h-4 text-red-600" />
              </span>
            )}
            {document.requiresSignature && !document.signedAt && (
              <span className="p-1 bg-yellow-100 rounded" title="Signature Required">
                <Edit3 className="w-4 h-4 text-yellow-600" />
              </span>
            )}
            {document.signedAt && (
              <span className="p-1 bg-green-100 rounded" title="Signed">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate" title={document.documentName}>
          {document.documentName}
        </h3>

        {document.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{document.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{formatFileSize(document.fileSize)}</span>
          <span>{new Date(document.sharedAt).toLocaleDateString()}</span>
        </div>

        {document.category && (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 mb-4">
            {document.category}
          </span>
        )}

        {isExpiringSoon() && (
          <div className="flex items-center text-xs text-orange-600 mb-4">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Expires soon</span>
          </div>
        )}

        {document.downloadLimit && (
          <div className="text-xs text-gray-500 mb-4">
            Downloads: {document.downloadCount}/{document.downloadLimit}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {document.permissions.includes('view') && (
            <button
              onClick={onView}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">View</span>
            </button>
          )}
          {document.permissions.includes('download') && (
            <button
              onClick={onDownload}
              disabled={
                document.downloadLimit !== undefined &&
                document.downloadCount >= document.downloadLimit
              }
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Download</span>
            </button>
          )}
          {document.requiresSignature && !document.signedAt && (
            <button
              onClick={onSign}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm">Sign</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface SignatureModalProps {
  portalUserId: string;
  document: SharedDocument;
  onClose: () => void;
  onSigned: () => void;
}

function SignatureModal({ portalUserId, document, onClose, onSigned }: SignatureModalProps) {
  const [signature, setSignature] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    try {
      setSigning(true);
      await fetch(`/api/client-portal/documents/${document.id}/sign?portalUserId=${portalUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureData: {
            signature,
            signedAt: new Date().toISOString(),
            ipAddress: 'client-ip',
          },
        }),
      });
      onSigned();
    } catch (error) {
      console.error('Failed to sign document:', error);
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Sign Document</h2>
          <p className="text-sm text-gray-600 mt-1">{document.documentName}</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type your full name to sign
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
              className="mt-1"
            />
            <label className="text-sm text-gray-700">
              I acknowledge that I have read and understood this document, and my electronic
              signature is legally binding.
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSign}
            disabled={signing || !signature || !agreementChecked}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit3 className="w-4 h-4" />
            <span>{signing ? 'Signing...' : 'Sign Document'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
