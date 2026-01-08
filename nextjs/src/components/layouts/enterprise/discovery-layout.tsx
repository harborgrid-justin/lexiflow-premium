"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Grid3x3,
  List,
  Filter,
  Search,
  X,
  Download,
  Trash2,
  Tag,
  Eye,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  File,
  Calendar as CalendarIcon,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Badge } from "@/components/ui/shadcn/badge";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/shadcn/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/shadcn/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { cn } from "@/lib/utils";

// Type definitions for discovery documents
export interface DiscoveryDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  lastModified: Date;
  custodian: string;
  tags: string[];
  status: DocumentStatus;
  dateRange?: {
    from: Date;
    to: Date;
  };
  privilege?: boolean;
  redacted?: boolean;
  metadata?: Record<string, unknown>;
  thumbnailUrl?: string;
  pageCount?: number;
}

export type DocumentStatus =
  | "pending_review"
  | "under_review"
  | "responsive"
  | "non_responsive"
  | "privileged"
  | "produced";

export interface DiscoveryFilters {
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  documentTypes?: string[];
  custodians?: string[];
  tags?: string[];
  status?: DocumentStatus[];
  searchQuery?: string;
  privileged?: boolean | null;
}

export type ViewMode = "grid" | "list";

export interface DiscoveryLayoutProps {
  documents: DiscoveryDocument[];
  filters: DiscoveryFilters;
  onFilterChange: (filters: DiscoveryFilters) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onDocumentSelect?: (documentIds: string[]) => void;
  onDocumentPreview?: (documentId: string) => void;
  onBatchOperation?: (operation: string, documentIds: string[]) => void;
  className?: string;

  // Pagination
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const statusColors: Record<DocumentStatus, string> = {
  pending_review: "bg-gray-100 text-gray-800 border-gray-300",
  under_review: "bg-blue-100 text-blue-800 border-blue-300",
  responsive: "bg-green-100 text-green-800 border-green-300",
  non_responsive: "bg-gray-100 text-gray-600 border-gray-300",
  privileged: "bg-red-100 text-red-800 border-red-300",
  produced: "bg-purple-100 text-purple-800 border-purple-300",
};

const statusLabels: Record<DocumentStatus, string> = {
  pending_review: "Pending Review",
  under_review: "Under Review",
  responsive: "Responsive",
  non_responsive: "Non-Responsive",
  privileged: "Privileged",
  produced: "Produced",
};

const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileText,
  xlsx: FileText,
  ppt: FileText,
  pptx: FileText,
  txt: FileText,
  jpg: ImageIcon,
  jpeg: ImageIcon,
  png: ImageIcon,
  gif: ImageIcon,
  default: File,
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function DiscoveryLayout({
  documents,
  filters,
  onFilterChange,
  viewMode = "grid",
  onViewModeChange,
  onDocumentSelect,
  onDocumentPreview,
  onBatchOperation,
  className,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 50,
  onPageChange,
  onPageSizeChange,
}: DiscoveryLayoutProps) {
  const [selectedDocuments, setSelectedDocuments] = React.useState<Set<string>>(new Set());
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(true);
  const [previewDocumentId, setPreviewDocumentId] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState(filters.searchQuery || "");

  // Available filter options (would typically come from props or API)
  const availableDocTypes = Array.from(new Set(documents.map(d => d.fileType)));
  const availableCustodians = Array.from(new Set(documents.map(d => d.custodian)));
  const availableTags = Array.from(
    new Set(documents.flatMap(d => d.tags))
  );

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    const newSelection = new Set(selectedDocuments);
    if (checked) {
      newSelection.add(documentId);
    } else {
      newSelection.delete(documentId);
    }
    setSelectedDocuments(newSelection);
    onDocumentSelect?.(Array.from(newSelection));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(documents.map(d => d.id));
      setSelectedDocuments(allIds);
      onDocumentSelect?.(Array.from(allIds));
    } else {
      setSelectedDocuments(new Set());
      onDocumentSelect?.([]);
    }
  };

  const handleDocumentPreview = (documentId: string) => {
    setPreviewDocumentId(documentId);
    onDocumentPreview?.(documentId);
  };

  const handleSearchSubmit = () => {
    onFilterChange({ ...filters, searchQuery: searchInput });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    onFilterChange({
      dateRange: { from: null, to: null },
      documentTypes: [],
      custodians: [],
      tags: [],
      status: [],
      searchQuery: "",
      privileged: null,
    });
  };

  const activeFilterCount = [
    filters.searchQuery,
    filters.dateRange?.from || filters.dateRange?.to,
    filters.documentTypes?.length,
    filters.custodians?.length,
    filters.tags?.length,
    filters.status?.length,
    filters.privileged !== null && filters.privileged !== undefined,
  ].filter(Boolean).length;

  const previewDocument = documents.find(d => d.id === previewDocumentId);

  return (
    <div className={cn("flex flex-col h-full bg-gray-50", className)}>
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                className="pl-9 pr-9"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => {
                    setSearchInput("");
                    onFilterChange({ ...filters, searchQuery: "" });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 min-w-[1.25rem]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear all
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange?.("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange?.("list")}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Batch Operations */}
            {selectedDocuments.size > 0 && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedDocuments.size} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBatchOperation?.("download", Array.from(selectedDocuments))}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBatchOperation?.("tag", Array.from(selectedDocuments))}
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Tag
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onBatchOperation?.("redact", Array.from(selectedDocuments))}>
                        Redact
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onBatchOperation?.("privilege", Array.from(selectedDocuments))}>
                        Mark Privileged
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => onBatchOperation?.("delete", Array.from(selectedDocuments))}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Filter Sidebar */}
        {isFilterPanelOpen && (
          <div className="w-64 border-r border-gray-200 bg-white overflow-auto">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Filters</h3>
                </div>

                {/* Date Range */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Date Range
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    <Input
                      type="date"
                      placeholder="From"
                      value={filters.dateRange?.from ? format(filters.dateRange.from, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const from = e.target.value ? new Date(e.target.value) : null;
                        onFilterChange({
                          ...filters,
                          dateRange: { ...filters.dateRange, from, to: filters.dateRange?.to || null },
                        });
                      }}
                      className="text-xs"
                    />
                    <Input
                      type="date"
                      placeholder="To"
                      value={filters.dateRange?.to ? format(filters.dateRange.to, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const to = e.target.value ? new Date(e.target.value) : null;
                        onFilterChange({
                          ...filters,
                          dateRange: { from: filters.dateRange?.from || null, to },
                        });
                      }}
                      className="text-xs"
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Document Types */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Document Type
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    {availableDocTypes.slice(0, 8).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filters.documentTypes?.includes(type)}
                          onCheckedChange={(checked) => {
                            const types = filters.documentTypes || [];
                            onFilterChange({
                              ...filters,
                              documentTypes: checked
                                ? [...types, type]
                                : types.filter(t => t !== type),
                            });
                          }}
                        />
                        <span className="text-sm text-gray-700 uppercase">{type}</span>
                      </label>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Custodians */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Custodian
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    {availableCustodians.slice(0, 8).map((custodian) => (
                      <label key={custodian} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filters.custodians?.includes(custodian)}
                          onCheckedChange={(checked) => {
                            const custodians = filters.custodians || [];
                            onFilterChange({
                              ...filters,
                              custodians: checked
                                ? [...custodians, custodian]
                                : custodians.filter(c => c !== custodian),
                            });
                          }}
                        />
                        <span className="text-sm text-gray-700">{custodian}</span>
                      </label>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Status */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900">
                    Status
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    {(Object.keys(statusLabels) as DocumentStatus[]).map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filters.status?.includes(status)}
                          onCheckedChange={(checked) => {
                            const statuses = filters.status || [];
                            onFilterChange({
                              ...filters,
                              status: checked
                                ? [...statuses, status]
                                : statuses.filter(s => s !== status),
                            });
                          }}
                        />
                        <Badge variant="outline" className={cn("text-xs", statusColors[status])}>
                          {statusLabels[status]}
                        </Badge>
                      </label>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Tags */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    {availableTags.slice(0, 10).map((tag) => (
                      <label key={tag} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filters.tags?.includes(tag)}
                          onCheckedChange={(checked) => {
                            const tags = filters.tags || [];
                            onFilterChange({
                              ...filters,
                              tags: checked
                                ? [...tags, tag]
                                : tags.filter(t => t !== tag),
                            });
                          }}
                        />
                        <span className="text-sm text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* Select All */}
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  checked={selectedDocuments.size === documents.length && documents.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  Select all {documents.length} documents
                </span>
              </div>

              {/* Document Grid/List */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {documents.map((doc) => {
                    const Icon = fileTypeIcons[doc.fileType.toLowerCase()] || fileTypeIcons.default;
                    return (
                      <Card
                        key={doc.id}
                        className={cn(
                          "group cursor-pointer hover:shadow-lg transition-all",
                          selectedDocuments.has(doc.id) && "ring-2 ring-blue-500"
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="relative">
                            <Checkbox
                              checked={selectedDocuments.has(doc.id)}
                              onCheckedChange={(checked) => handleSelectDocument(doc.id, !!checked)}
                              className="absolute top-2 left-2 z-10 bg-white"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div
                              className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center mb-2"
                              onClick={() => handleDocumentPreview(doc.id)}
                            >
                              {doc.thumbnailUrl ? (
                                <img
                                  src={doc.thumbnailUrl}
                                  alt={doc.fileName}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Icon className="w-12 h-12 text-gray-400" />
                              )}
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentPreview(doc.id);
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-900 truncate" title={doc.fileName}>
                              {doc.fileName}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500 uppercase">{doc.fileType}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                            </div>
                            <Badge variant="outline" className={cn("text-xs w-full justify-center", statusColors[doc.status])}>
                              {statusLabels[doc.status]}
                            </Badge>
                            {doc.tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap mt-1">
                                {doc.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {doc.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                    +{doc.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const Icon = fileTypeIcons[doc.fileType.toLowerCase()] || fileTypeIcons.default;
                    return (
                      <Card
                        key={doc.id}
                        className={cn(
                          "group cursor-pointer hover:shadow-md transition-all",
                          selectedDocuments.has(doc.id) && "ring-2 ring-blue-500"
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedDocuments.has(doc.id)}
                              onCheckedChange={(checked) => handleSelectDocument(doc.id, !!checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Icon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0 grid grid-cols-5 gap-4">
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-gray-900 truncate" title={doc.fileName}>
                                  {doc.fileName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(doc.fileSize)} • {doc.pageCount ? `${doc.pageCount} pages` : doc.fileType.toUpperCase()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Custodian</p>
                                <p className="text-sm text-gray-900">{doc.custodian}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Modified</p>
                                <p className="text-sm text-gray-900">{format(doc.lastModified, "MMM d, yyyy")}</p>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <Badge variant="outline" className={cn("text-xs", statusColors[doc.status])}>
                                  {statusLabels[doc.status]}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDocumentPreview(doc.id);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          {doc.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap mt-2 ml-12">
                              {doc.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Pagination */}
          <div className="border-t border-gray-200 bg-white px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => onPageSizeChange?.(parseInt(value))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600 ml-4">
                  {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 mx-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Slide-over */}
      <Sheet open={!!previewDocumentId} onOpenChange={(open) => !open && setPreviewDocumentId(null)}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Document Preview</SheetTitle>
          </SheetHeader>
          {previewDocument && (
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewDocument.fileName}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={cn(statusColors[previewDocument.status])}>
                    {statusLabels[previewDocument.status]}
                  </Badge>
                  {previewDocument.privilege && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Privileged
                    </Badge>
                  )}
                  {previewDocument.redacted && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Redacted
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">File Type</p>
                  <p className="font-medium text-gray-900 uppercase">{previewDocument.fileType}</p>
                </div>
                <div>
                  <p className="text-gray-500">File Size</p>
                  <p className="font-medium text-gray-900">{formatFileSize(previewDocument.fileSize)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Custodian</p>
                  <p className="font-medium text-gray-900">{previewDocument.custodian}</p>
                </div>
                <div>
                  <p className="text-gray-500">Upload Date</p>
                  <p className="font-medium text-gray-900">{format(previewDocument.uploadDate, "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Modified</p>
                  <p className="font-medium text-gray-900">{format(previewDocument.lastModified, "MMM d, yyyy")}</p>
                </div>
                {previewDocument.pageCount && (
                  <div>
                    <p className="text-gray-500">Pages</p>
                    <p className="font-medium text-gray-900">{previewDocument.pageCount}</p>
                  </div>
                )}
              </div>

              {previewDocument.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tags</p>
                    <div className="flex gap-2 flex-wrap">
                      {previewDocument.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" className="flex-1">
                  <Tag className="w-4 h-4 mr-2" />
                  Add Tags
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
