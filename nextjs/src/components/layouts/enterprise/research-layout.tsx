"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  BookOpen,
  FileText,
  Bookmark,
  Copy,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Scale,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/shadcn/tooltip";
import { Alert, AlertDescription } from "@/components/ui/shadcn/alert";
import { Textarea } from "@/components/ui/shadcn/textarea";

interface LegalDocument {
  id: string;
  type: "case" | "statute" | "regulation" | "treatise";
  citation: string;
  title: string;
  court?: string;
  jurisdiction: string;
  date: Date;
  summary?: string;
  keyHoldings?: string[];
  relatedCitations?: string[];
  shepardStatus?: "positive" | "negative" | "caution" | "neutral";
  relevanceScore?: number;
}

interface SearchFilter {
  jurisdiction: string[];
  court: string[];
  dateFrom?: Date;
  dateTo?: Date;
  docType: string[];
}

interface Annotation {
  id: string;
  documentId: string;
  type: "note" | "highlight" | "citation";
  content: string;
  page?: number;
  createdAt: Date;
  tags?: string[];
}

interface ResearchLayoutProps {
  searchResults: LegalDocument[];
  selectedDoc: LegalDocument | null;
  annotations: Annotation[];
  availableJurisdictions: string[];
  availableCourts: string[];
  onSearch: (query: string, filters: SearchFilter) => Promise<void>;
  onDocumentSelect: (docId: string) => void;
  onAnnotationAdd: (annotation: Omit<Annotation, "id" | "createdAt">) => Promise<void>;
  onAnnotationDelete: (annotationId: string) => Promise<void>;
  onSaveToMatter?: (documentId: string, matterId: string) => Promise<void>;
  onCitationCopy?: (citation: string) => void;
  onShepardize?: (documentId: string) => Promise<void>;
  children?: React.ReactNode;
}

export function ResearchLayout({
  searchResults,
  selectedDoc,
  annotations,
  availableJurisdictions,
  availableCourts,
  onSearch,
  onDocumentSelect,
  onAnnotationAdd,
  onAnnotationDelete,
  onSaveToMatter,
  onCitationCopy,
  onShepardize,
  children,
}: ResearchLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({
    jurisdiction: [],
    court: [],
    docType: [],
  });
  const [citationFormat, setCitationFormat] = useState<"bluebook" | "alwd" | "universal">("bluebook");
  const [noteContent, setNoteContent] = useState("");
  const [selectedMatter, setSelectedMatter] = useState("");

  // Filter annotations for selected document
  const documentAnnotations = useMemo(
    () => annotations.filter((a) => a.documentId === selectedDoc?.id),
    [annotations, selectedDoc]
  );

  // Format citation based on selected style
  const formatCitation = useCallback(
    (doc: LegalDocument): string => {
      if (!doc) return "";

      switch (citationFormat) {
        case "bluebook":
          if (doc.type === "case") {
            return `${doc.title}, ${doc.citation} (${doc.court} ${doc.date.getFullYear()})`;
          }
          return doc.citation;
        case "alwd":
          if (doc.type === "case") {
            return `${doc.title}, ${doc.citation} (${doc.court}, ${doc.date.getFullYear()})`;
          }
          return doc.citation;
        case "universal":
        default:
          return doc.citation;
      }
    },
    [citationFormat]
  );

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      await onSearch(searchQuery, filters);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType: keyof SearchFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const toggleJurisdiction = (jurisdiction: string) => {
    setFilters((prev) => ({
      ...prev,
      jurisdiction: prev.jurisdiction.includes(jurisdiction)
        ? prev.jurisdiction.filter((j) => j !== jurisdiction)
        : [...prev.jurisdiction, jurisdiction],
    }));
  };

  const toggleCourt = (court: string) => {
    setFilters((prev) => ({
      ...prev,
      court: prev.court.includes(court)
        ? prev.court.filter((c) => c !== court)
        : [...prev.court, court],
    }));
  };

  const toggleDocType = (docType: string) => {
    setFilters((prev) => ({
      ...prev,
      docType: prev.docType.includes(docType)
        ? prev.docType.filter((d) => d !== docType)
        : [...prev.docType, docType],
    }));
  };

  // Handle annotation
  const handleAddNote = async () => {
    if (!noteContent.trim() || !selectedDoc) return;

    await onAnnotationAdd({
      documentId: selectedDoc.id,
      type: "note",
      content: noteContent.trim(),
    });

    setNoteContent("");
  };

  const handleCopyCitation = () => {
    if (selectedDoc) {
      const citation = formatCitation(selectedDoc);
      onCitationCopy?.(citation);
      navigator.clipboard.writeText(citation);
    }
  };

  const handleShepardize = async () => {
    if (selectedDoc) {
      await onShepardize?.(selectedDoc.id);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("research-search")?.focus();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "s" && selectedDoc) {
        e.preventDefault();
        // Save to matter
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedDoc) {
        e.preventDefault();
        handleCopyCitation();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [selectedDoc]);

  const getShepardStatusIcon = (status?: LegalDocument["shepardStatus"]) => {
    switch (status) {
      case "positive":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "negative":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "caution":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "neutral":
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getShepardStatusBadge = (status?: LegalDocument["shepardStatus"]) => {
    const variants = {
      positive: "bg-green-100 text-green-800 border-green-300",
      negative: "bg-red-100 text-red-800 border-red-300",
      caution: "bg-yellow-100 text-yellow-800 border-yellow-300",
      neutral: "bg-blue-100 text-blue-800 border-blue-300",
    };

    return (
      <Badge className={variants[status || "neutral"]}>
        {status || "Not Analyzed"}
      </Badge>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Search Bar */}
      <div className="border-b p-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="research-search"
                placeholder="Search cases, statutes, regulations... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="pl-10"
              />
            </div>

            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Jurisdiction Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jurisdiction</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span>
                            {filters.jurisdiction.length > 0
                              ? `${filters.jurisdiction.length} selected`
                              : "All"}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Select Jurisdictions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {availableJurisdictions.map((jurisdiction) => (
                          <DropdownMenuCheckboxItem
                            key={jurisdiction}
                            checked={filters.jurisdiction.includes(jurisdiction)}
                            onCheckedChange={() => toggleJurisdiction(jurisdiction)}
                          >
                            {jurisdiction}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Court Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Court</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span>
                            {filters.court.length > 0 ? `${filters.court.length} selected` : "All"}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Select Courts</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {availableCourts.map((court) => (
                          <DropdownMenuCheckboxItem
                            key={court}
                            checked={filters.court.includes(court)}
                            onCheckedChange={() => toggleCourt(court)}
                          >
                            {court}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Document Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document Type</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span>
                            {filters.docType.length > 0
                              ? `${filters.docType.length} selected`
                              : "All"}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Select Document Types</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {["case", "statute", "regulation", "treatise"].map((type) => (
                          <DropdownMenuCheckboxItem
                            key={type}
                            checked={filters.docType.includes(type)}
                            onCheckedChange={() => toggleDocType(type)}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        placeholder="From"
                        onChange={(e) =>
                          handleFilterChange("dateFrom", e.target.value ? new Date(e.target.value) : undefined)
                        }
                      />
                      <Input
                        type="date"
                        placeholder="To"
                        onChange={(e) =>
                          handleFilterChange("dateTo", e.target.value ? new Date(e.target.value) : undefined)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Search Results */}
        <div className="w-96 border-r flex flex-col bg-muted/10">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Search Results</h2>
              <Badge variant="secondary">{searchResults.length} found</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Click on a result to view details
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "No results found. Try adjusting your search."
                      : "Enter a search query to find legal authorities"}
                  </p>
                </div>
              ) : (
                searchResults.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedDoc?.id === doc.id ? "border-primary bg-accent" : ""
                    }`}
                    onClick={() => onDocumentSelect(doc.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {doc.type}
                        </Badge>
                        {doc.shepardStatus && getShepardStatusIcon(doc.shepardStatus)}
                      </div>

                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2 font-mono">
                        {doc.citation}
                      </p>

                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        {doc.court && (
                          <span className="flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            {doc.court}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {doc.jurisdiction}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {doc.date.getFullYear()}
                        </span>
                      </div>

                      {doc.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {doc.summary}
                        </p>
                      )}

                      {doc.relevanceScore && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Relevance</span>
                            <Badge variant="secondary">
                              {Math.round(doc.relevanceScore * 100)}%
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Area - Document Viewer */}
        <div className="flex-1 flex flex-col">
          {selectedDoc ? (
            <>
              {/* Document Header */}
              <div className="border-b p-4 bg-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{selectedDoc.title}</h1>
                    <p className="text-sm font-mono text-muted-foreground mb-2">
                      {formatCitation(selectedDoc)}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      {selectedDoc.court && (
                        <span className="flex items-center gap-1">
                          <Scale className="h-4 w-4" />
                          {selectedDoc.court}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedDoc.jurisdiction}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {selectedDoc.date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    {getShepardStatusBadge(selectedDoc.shepardStatus)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleCopyCitation}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Citation (Ctrl+C)
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy formatted citation</p>
                      </TooltipContent>
                    </Tooltip>

                    <Select value={citationFormat} onValueChange={(v: any) => setCitationFormat(v)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bluebook">Bluebook</SelectItem>
                        <SelectItem value="alwd">ALWD</SelectItem>
                        <SelectItem value="universal">Universal</SelectItem>
                      </SelectContent>
                    </Select>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleShepardize}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Shepardize
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Check citation validity</p>
                      </TooltipContent>
                    </Tooltip>

                    {onSaveToMatter && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Bookmark className="h-4 w-4 mr-2" />
                            Save to Matter
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save to current matter</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download document</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share document</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Document Content */}
              <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto p-8">
                  {children || (
                    <div className="space-y-6">
                      {selectedDoc.summary && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Summary:</strong> {selectedDoc.summary}
                          </AlertDescription>
                        </Alert>
                      )}

                      {selectedDoc.keyHoldings && selectedDoc.keyHoldings.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Key Holdings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc pl-5 space-y-2">
                              {selectedDoc.keyHoldings.map((holding, idx) => (
                                <li key={idx} className="text-sm">
                                  {holding}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {selectedDoc.relatedCitations && selectedDoc.relatedCitations.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Related Citations</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {selectedDoc.relatedCitations.map((citation, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded hover:bg-accent cursor-pointer font-mono text-sm"
                                >
                                  {citation}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="prose prose-slate max-w-none">
                        <p className="text-muted-foreground">
                          Full document text would be displayed here...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-24 w-24 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">No Document Selected</h2>
                <p className="text-muted-foreground">
                  Search for legal authorities and select a result to view details
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Annotations and Citations */}
        <div className="w-80 border-l flex flex-col bg-muted/10">
          <Tabs defaultValue="notes" className="flex-1 flex flex-col">
            <div className="border-b px-4 pt-3">
              <TabsList className="w-full">
                <TabsTrigger value="notes" className="flex-1">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="citations" className="flex-1">
                  Citations
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="notes" className="flex-1 overflow-hidden m-0">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="text-sm font-semibold mb-3">Add Note</h3>
                  <Textarea
                    placeholder="Enter your research notes..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={4}
                    className="mb-3"
                  />
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!noteContent.trim() || !selectedDoc}
                  >
                    Add Note
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Annotations ({documentAnnotations.length})
                    </h3>
                    {documentAnnotations.length === 0 ? (
                      <div className="text-center py-8">
                        <StickyNote className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">No annotations yet</p>
                      </div>
                    ) : (
                      documentAnnotations.map((annotation) => (
                        <Card key={annotation.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {annotation.type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => onAnnotationDelete(annotation.id)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm">{annotation.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {annotation.createdAt.toLocaleString()}
                            </p>
                            {annotation.tags && annotation.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {annotation.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="citations" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Related Citations
                  </h3>
                  {selectedDoc?.relatedCitations && selectedDoc.relatedCitations.length > 0 ? (
                    selectedDoc.relatedCitations.map((citation, idx) => (
                      <Card key={idx} className="cursor-pointer hover:bg-accent">
                        <CardContent className="p-3">
                          <p className="text-sm font-mono">{citation}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => onCitationCopy?.(citation)}
                          >
                            <Copy className="h-3 w-3 mr-2" />
                            Copy
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        {selectedDoc ? "No related citations" : "Select a document to view citations"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
