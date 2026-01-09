/**
 * @module enterprise/Discovery/ExhibitOrganizer
 * @category Enterprise Trial Management
 * @description Trial exhibit organization with exhibit lists and presentation mode
 */

import { Button } from '@/components/ui/atoms/Button/Button';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  File,
  FileText,
  Grid3x3,
  Image as ImageIcon,
  List,
  Minimize2,
  Plus,
  Presentation,
  Search,
  Star,
  Tag,
  Trash2,
  Video
} from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface Exhibit {
  id: string;
  exhibitNumber: string;
  title: string;
  description: string;
  type: 'document' | 'photograph' | 'video' | 'audio' | 'demonstrative' | 'other';
  status: 'draft' | 'pending' | 'admitted' | 'rejected' | 'withdrawn';
  dateAdded: Date;
  dateAdmitted?: Date;
  witness?: string;
  party: 'plaintiff' | 'defendant' | 'third-party';
  foundationRequired: boolean;
  foundationWitness?: string;
  objections?: string[];
  tags: string[];
  fileUrl?: string;
  thumbnailUrl?: string;
  pages?: number;
  notes?: string;
  presentationOrder?: number;
  marked: boolean;
  starred: boolean;
}

export interface ExhibitList {
  id: string;
  name: string;
  description?: string;
  createdDate: Date;
  updatedDate: Date;
  exhibits: string[]; // exhibit IDs
  trialDate?: Date;
  purpose: 'opening' | 'direct' | 'cross' | 'closing' | 'general';
}

export interface ExhibitOrganizerProps {
  caseId?: string;
  trialId?: string;
  onNavigate?: (view: string, id?: string) => void;
  className?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockExhibits: Exhibit[] = [
  {
    id: '1',
    exhibitNumber: 'PX-001',
    title: 'Employment Contract - Signed Original',
    description: 'Original employment agreement dated January 15, 2024',
    type: 'document',
    status: 'admitted',
    dateAdded: new Date('2025-11-01'),
    dateAdmitted: new Date('2025-12-15'),
    witness: 'John Doe',
    party: 'plaintiff',
    foundationRequired: true,
    foundationWitness: 'HR Manager Sarah Johnson',
    tags: ['contract', 'employment', 'key-document'],
    pages: 12,
    marked: true,
    starred: true,
    presentationOrder: 1,
    notes: 'Critical exhibit - foundation laid through HR witness'
  },
  {
    id: '2',
    exhibitNumber: 'PX-002',
    title: 'Email Chain - Termination Discussion',
    description: 'Email communications regarding termination decision',
    type: 'document',
    status: 'admitted',
    dateAdded: new Date('2025-11-05'),
    dateAdmitted: new Date('2025-12-16'),
    witness: 'Jane Smith',
    party: 'plaintiff',
    foundationRequired: true,
    foundationWitness: 'Jane Smith',
    objections: ['Hearsay - overruled', 'Authentication - sustained then cured'],
    tags: ['email', 'termination', 'communications'],
    pages: 8,
    marked: true,
    starred: false,
    presentationOrder: 2
  },
  {
    id: '3',
    exhibitNumber: 'PX-003',
    title: 'Company Org Chart',
    description: 'Organizational chart showing reporting structure',
    type: 'demonstrative',
    status: 'pending',
    dateAdded: new Date('2025-11-10'),
    party: 'plaintiff',
    foundationRequired: false,
    tags: ['demonstrative', 'org-chart', 'visual-aid'],
    pages: 1,
    marked: false,
    starred: true,
    presentationOrder: 3,
    notes: 'Created for jury presentation - pending admission'
  },
  {
    id: '4',
    exhibitNumber: 'DX-001',
    title: 'Performance Review Documents',
    description: 'Annual performance reviews 2022-2024',
    type: 'document',
    status: 'admitted',
    dateAdded: new Date('2025-11-12'),
    dateAdmitted: new Date('2025-12-17'),
    witness: 'Michael Chen',
    party: 'defendant',
    foundationRequired: true,
    foundationWitness: 'Supervisor Michael Chen',
    tags: ['performance', 'reviews', 'personnel-file'],
    pages: 24,
    marked: true,
    starred: false,
    presentationOrder: 4
  },
  {
    id: '5',
    exhibitNumber: 'PX-004',
    title: 'Video Deposition - Expert Testimony',
    description: 'Deposition video of expert witness Dr. Rodriguez',
    type: 'video',
    status: 'pending',
    dateAdded: new Date('2025-12-01'),
    party: 'plaintiff',
    foundationRequired: true,
    foundationWitness: 'Court Reporter',
    tags: ['deposition', 'expert', 'video'],
    marked: false,
    starred: true,
    notes: 'Plan to play clips at trial - need to prepare designations'
  }
];

// Commented out unused mock data
// const mockExhibitLists: ExhibitList[] = [
//   {
//     id: '1',
//     name: 'Opening Statement Exhibits',
//     description: 'Key exhibits for opening statement presentation',
//     createdDate: new Date('2025-11-15'),
//     updatedDate: new Date('2025-12-01'),
//     exhibits: ['1', '3'],
//     trialDate: new Date('2026-01-15'),
//     purpose: 'opening'
//   },
//   {
//     id: '2',
//     name: 'Plaintiff Direct Examination',
//     description: 'Exhibits for plaintiff\'s direct examination',
//     createdDate: new Date('2025-11-20'),
//     updatedDate: new Date('2025-12-10'),
//     exhibits: ['1', '2'],
//     trialDate: new Date('2026-01-16'),
//     purpose: 'direct'
//   },
//   {
//     id: '3',
//     name: 'Defense Case Exhibits',
//     description: 'All defense exhibits',
//     createdDate: new Date('2025-11-25'),
//     updatedDate: new Date('2025-12-15'),
//     exhibits: ['4'],
//     purpose: 'general'
//   }
// ];

// ============================================================================
// COMPONENT
// ============================================================================

export const ExhibitOrganizer: React.FC<ExhibitOrganizerProps> = ({
  className
}) => {
  const { theme } = useTheme();
  const [exhibits, setExhibits] = useState<Exhibit[]>(mockExhibits);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterParty, setFilterParty] = useState<string>('all');
  const [_selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);

  // Filter exhibits
  const filteredExhibits = exhibits.filter(exhibit => {
    const matchesSearch = !searchQuery ||
      exhibit.exhibitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exhibit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exhibit.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || exhibit.status === filterStatus;
    const matchesParty = filterParty === 'all' || exhibit.party === filterParty;

    return matchesSearch && matchesStatus && matchesParty;
  });

  // Sort by presentation order
  const sortedExhibits = [...filteredExhibits].sort((a, b) => {
    if (a.presentationOrder && b.presentationOrder) {
      return a.presentationOrder - b.presentationOrder;
    }
    if (a.presentationOrder) return -1;
    if (b.presentationOrder) return 1;
    return 0;
  });

  const getTypeIcon = (type: Exhibit['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'photograph':
        return <ImageIcon className="h-5 w-5" />;
      case 'video':
      case 'audio':
        return <Video className="h-5 w-5" />;
      case 'demonstrative':
        return <Presentation className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: Exhibit['status']) => {
    switch (status) {
      case 'admitted':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-rose-600" />;
      case 'withdrawn':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: Exhibit['status']) => {
    switch (status) {
      case 'admitted':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'pending':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
      case 'rejected':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400';
      case 'withdrawn':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const getPartyColor = (party: Exhibit['party']) => {
    switch (party) {
      case 'plaintiff':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'defendant':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'third-party':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const toggleStar = (exhibitId: string) => {
    setExhibits(exhibits.map(ex =>
      ex.id === exhibitId ? { ...ex, starred: !ex.starred } : ex
    ));
  };

  const toggleMark = (exhibitId: string) => {
    setExhibits(exhibits.map(ex =>
      ex.id === exhibitId ? { ...ex, marked: !ex.marked } : ex
    ));
  };

  const enterPresentationMode = () => {
    const markedExhibits = sortedExhibits.filter(ex => ex.marked);
    if (markedExhibits.length > 0) {
      setPresentationMode(true);
      setCurrentSlide(0);
    }
  };

  const exitPresentationMode = () => {
    setPresentationMode(false);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    const markedExhibits = sortedExhibits.filter(ex => ex.marked);
    if (currentSlide < markedExhibits.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Presentation Mode View
  if (presentationMode) {
    const markedExhibits = sortedExhibits.filter(ex => ex.marked);
    const currentExhibit = markedExhibits[currentSlide];

    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Presentation Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={exitPresentationMode}>
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit Presentation
            </Button>
            <span className="text-sm">
              Exhibit {currentSlide + 1} of {markedExhibits.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={prevSlide} disabled={currentSlide === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={nextSlide} disabled={currentSlide === markedExhibits.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Presentation Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExhibit?.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-6xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {currentExhibit?.exhibitNumber}
                    </h1>
                    <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium', getStatusColor(currentExhibit?.status || 'draft'))}>
                      {getStatusIcon(currentExhibit?.status || 'draft')}
                      {currentExhibit?.status}
                    </span>
                  </div>
                  <h2 className="text-xl text-gray-700 dark:text-gray-300">
                    {currentExhibit?.title}
                  </h2>
                </div>

                {/* Exhibit Preview */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg aspect-video flex items-center justify-center mb-6">
                  <div className="text-center">
                    {getTypeIcon(currentExhibit?.type || 'document')}
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      {currentExhibit?.type === 'document' && `${currentExhibit?.pages || 0} pages`}
                      {currentExhibit?.type === 'photograph' && 'Photograph'}
                      {currentExhibit?.type === 'video' && 'Video File'}
                      {currentExhibit?.type === 'demonstrative' && 'Demonstrative Exhibit'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Description
                    </p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">
                      {currentExhibit?.description}
                    </p>
                  </div>
                  {currentExhibit?.witness && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Witness
                      </p>
                      <p className="text-lg text-gray-900 dark:text-gray-100">
                        {currentExhibit.witness}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="bg-gray-900 text-white p-2 text-center text-xs">
          Use arrow keys or buttons to navigate • ESC to exit
        </div>
      </div>
    );
  }

  // Normal View
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn('text-2xl font-bold flex items-center gap-2', theme.text.primary)}>
            <BookOpen className="h-7 w-7 text-indigo-600" />
            Exhibit Organizer
          </h2>
          <p className={cn('text-sm mt-1', theme.text.secondary)}>
            Organize trial exhibits and manage presentation lists
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Presentation}
            onClick={enterPresentationMode}
            disabled={sortedExhibits.filter(ex => ex.marked).length === 0}
          >
            Presentation Mode ({sortedExhibits.filter(ex => ex.marked).length})
          </Button>
          <Button variant="secondary" icon={Download}>
            Export List
          </Button>
          <Button variant="primary" icon={Plus}>
            Add Exhibit
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Exhibits', value: exhibits.length, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'Admitted', value: exhibits.filter(e => e.status === 'admitted').length, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Pending', value: exhibits.filter(e => e.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Marked for Presentation', value: exhibits.filter(e => e.marked).length, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Starred', value: exhibits.filter(e => e.starred).length, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' }
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}
          >
            <p className={cn('text-xs font-medium mb-1', theme.text.secondary)}>{stat.label}</p>
            <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4', theme.text.tertiary)} />
            <input
              type="text"
              placeholder="Search exhibits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg border',
                theme.surface.input,
                theme.border.default
              )}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={cn('px-4 py-2 rounded-lg border', theme.surface.input, theme.border.default)}
          >
            <option value="all">All Status</option>
            <option value="admitted">Admitted</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <select
            value={filterParty}
            onChange={(e) => setFilterParty(e.target.value)}
            className={cn('px-4 py-2 rounded-lg border', theme.surface.input, theme.border.default)}
          >
            <option value="all">All Parties</option>
            <option value="plaintiff">Plaintiff</option>
            <option value="defendant">Defendant</option>
            <option value="third-party">Third Party</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Exhibits Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedExhibits.map((exhibit) => (
            <motion.div
              key={exhibit.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'p-6 rounded-lg border cursor-pointer hover:shadow-md transition-all',
                theme.surface.default,
                theme.border.default
              )}
              onClick={() => setSelectedExhibit(exhibit)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn('p-2 rounded', getPartyColor(exhibit.party))}>
                    {getTypeIcon(exhibit.type)}
                  </div>
                  <div>
                    <h3 className={cn('font-bold font-mono', theme.text.primary)}>
                      {exhibit.exhibitNumber}
                    </h3>
                    {exhibit.presentationOrder && (
                      <span className={cn('text-xs', theme.text.tertiary)}>
                        Order: {exhibit.presentationOrder}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStar(exhibit.id); }}
                    className={cn('p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700')}
                  >
                    <Star className={cn('h-4 w-4', exhibit.starred ? 'fill-amber-500 text-amber-500' : theme.text.tertiary)} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMark(exhibit.id); }}
                    className={cn('p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700')}
                    title="Mark for presentation"
                  >
                    <CheckCircle2 className={cn('h-4 w-4', exhibit.marked ? 'text-blue-600' : theme.text.tertiary)} />
                  </button>
                </div>
              </div>

              <h4 className={cn('font-semibold mb-2 line-clamp-2', theme.text.primary)}>
                {exhibit.title}
              </h4>
              <p className={cn('text-sm mb-3 line-clamp-2', theme.text.secondary)}>
                {exhibit.description}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', getStatusColor(exhibit.status))}>
                  {getStatusIcon(exhibit.status)}
                  {exhibit.status}
                </span>
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', getPartyColor(exhibit.party))}>
                  {exhibit.party}
                </span>
              </div>

              {exhibit.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exhibit.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700', theme.text.secondary)}>
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                  {exhibit.tags.length > 3 && (
                    <span className={cn('text-xs px-2 py-0.5', theme.text.tertiary)}>
                      +{exhibit.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={cn('rounded-lg border overflow-hidden', theme.border.default)}>
          <table className="w-full">
            <thead className={cn('border-b', theme.background, theme.border.default)}>
              <tr>
                <th className="px-4 py-3 text-left w-12"></th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Exhibit #
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Title
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Type
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Party
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Status
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Witness
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', theme.surface.default, theme.border.default)}>
              {sortedExhibits.map((exhibit) => (
                <tr key={exhibit.id} className={cn('hover:bg-gray-50 dark:hover:bg-gray-800/50')}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleMark(exhibit.id)}
                        title="Mark for presentation"
                      >
                        <CheckCircle2 className={cn('h-4 w-4', exhibit.marked ? 'text-blue-600' : theme.text.tertiary)} />
                      </button>
                      <button onClick={() => toggleStar(exhibit.id)}>
                        <Star className={cn('h-4 w-4', exhibit.starred ? 'fill-amber-500 text-amber-500' : theme.text.tertiary)} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('text-sm font-mono font-medium', theme.text.primary)}>
                      {exhibit.exhibitNumber}
                    </span>
                    {exhibit.presentationOrder && (
                      <span className={cn('ml-2 text-xs', theme.text.tertiary)}>
                        #{exhibit.presentationOrder}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('text-sm', theme.text.primary)}>{exhibit.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('text-sm capitalize', theme.text.secondary)}>
                      {exhibit.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', getPartyColor(exhibit.party))}>
                      {exhibit.party}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', getStatusColor(exhibit.status))}>
                      {getStatusIcon(exhibit.status)}
                      {exhibit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('text-sm', theme.text.secondary)}>
                      {exhibit.witness || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className={cn('p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700', theme.text.secondary)}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className={cn('p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700', theme.text.secondary)}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className={cn('p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-rose-600')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredExhibits.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn('p-12 rounded-lg border text-center', theme.surface.default, theme.border.default)}
        >
          <BookOpen className={cn('h-16 w-16 mx-auto mb-4 opacity-20', theme.text.primary)} />
          <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
            No Exhibits Found
          </h3>
          <p className={cn('text-sm', theme.text.secondary)}>
            {searchQuery || filterStatus !== 'all' || filterParty !== 'all'
              ? 'Try adjusting your filters or search'
              : 'Add your first exhibit to get started'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ExhibitOrganizer;
