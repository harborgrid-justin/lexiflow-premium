/**
 * @module components/clauses/ClauseLibrary
 * @category Clauses
 * @description Clause library with templates and versioning.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through parent components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { FileText, Plus, Search, Tag } from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Types
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Button } from '@/components/ui/atoms/Button/Button';
import { Input } from '@/components/ui/atoms/Input/Input';
import { AdaptiveLoader } from '@/components/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { Card } from '@/components/ui/molecules/Card/Card';
import { EmptyState } from '@/components/ui/molecules/EmptyState/EmptyState';
import { ErrorState } from '@/components/ui/molecules/ErrorState/ErrorState';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { DataService } from '@/services/data/dataService';
import { QUERY_KEYS } from '@/services/data/queryKeys';
import { Clause } from '@/types';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ClauseLibraryProps {
    /** Callback when a clause is selected. */
    onSelectClause: (clause: Clause) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const ClauseLibrary: React.FC<ClauseLibraryProps> = ({ onSelectClause }) => {
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Fetch real clauses from DataService
    const { data: clauses = [], isLoading, error, refetch } = useQuery(QUERY_KEYS.CLAUSES.ALL, async () => {
        return await DataService.clauses.getAll();
    });

    const categories = ['Confidentiality', 'Liability', 'Payment Terms', 'Termination', 'Indemnification', 'Dispute Resolution'];

    const filteredClauses = clauses.filter((clause: Clause) => {
        const matchesSearch = !searchTerm ||
            clause.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clause.content?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || clause.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (error) return <ErrorState message="Failed to load clause library" onRetry={refetch} />;
    if (isLoading) {
        return <AdaptiveLoader contentType="list" itemCount={8} shimmer message="Loading clause library..." />;
    }

    return (
        <div className={cn("h-full flex flex-col", theme.background)}>
            {/* Header */}
            <div className="p-4 border-b shrink-0" style={{ borderColor: theme.border.default }}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className={cn("text-xl font-bold", theme.text.primary)}>Clause Library</h2>
                        <p className={cn("text-sm", theme.text.secondary)}>
                            {clauses.length} clauses available
                        </p>
                    </div>
                    <Button variant="primary" icon={Plus}>
                        Create Clause
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
                    <Input
                        placeholder="Search clauses by title or content..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                        size="sm"
                        variant={selectedCategory === null ? 'primary' : 'outline'}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All Categories
                    </Button>
                    {categories.map(category => (
                        <Button
                            key={category}
                            size="sm"
                            variant={selectedCategory === category ? 'primary' : 'outline'}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Clauses List */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredClauses.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title={searchTerm || selectedCategory ? 'No matching clauses' : 'No clauses available'}
                        description={searchTerm || selectedCategory
                            ? 'Try adjusting your search or filters to find clauses'
                            : 'Create your first clause template to get started'}
                        action={!searchTerm && !selectedCategory ? (
                            <Button variant="primary" icon={Plus}>
                                Create Your First Clause
                            </Button>
                        ) : undefined}
                    />
                ) : (
                    <div className="grid gap-3">
                        {filteredClauses.map((clause: Clause) => (
                            <Card key={clause.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                <div
                                    className="p-4"
                                    onClick={() => onSelectClause(clause)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className={cn("h-5 w-5", theme.text.secondary)} />
                                            <h3 className={cn("font-semibold", theme.text.primary)}>
                                                {clause.title || 'Untitled Clause'}
                                            </h3>
                                        </div>
                                        {clause.category && (
                                            <Badge variant="info">{clause.category}</Badge>
                                        )}
                                    </div>
                                    <p className={cn("text-sm line-clamp-2 mb-3", theme.text.secondary)}>
                                        {clause.content || 'No content available'}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs" style={{ color: theme.text.tertiary }}>
                                        {clause.tags && clause.tags.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {clause.tags.slice(0, 3).join(', ')}
                                                {clause.tags.length > 3 && ` +${clause.tags.length - 3}`}
                                            </div>
                                        )}
                                        {clause.version && (
                                            <span>Version {clause.version}</span>
                                        )}
                                        {clause.updatedAt && (
                                            <span>Updated {new Date(clause.updatedAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClauseLibrary;
