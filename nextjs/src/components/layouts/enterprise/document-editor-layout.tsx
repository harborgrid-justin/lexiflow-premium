"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  FileText,
  Save,
  Download,
  Clock,
  Type,
  Image as ImageIcon,
  Table as TableIcon,
  Sparkles,
  MessageSquare,
  History,
  ChevronDown,
  Check,
  AlertCircle,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Separator } from "@/components/ui/shadcn/separator";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Badge } from "@/components/ui/shadcn/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/shadcn/tooltip";

interface DocumentVariable {
  id: string;
  name: string;
  type: "text" | "date" | "number" | "boolean";
  value?: string;
  description?: string;
  category?: string;
}

interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  variables: DocumentVariable[];
  content: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  readingTimeMinutes: number;
  lastSaved?: Date;
  lastModified?: Date;
  templateId?: string;
}

interface DocumentEditorLayoutProps {
  document: Document;
  templates: DocumentTemplate[];
  variables: DocumentVariable[];
  onSave: (content: string, variables: Record<string, string>) => Promise<void>;
  onExport?: (format: "docx" | "pdf") => Promise<void>;
  onTemplateSelect?: (templateId: string) => void;
  onVariableInsert?: (variableId: string) => void;
  autoSaveInterval?: number;
  children?: React.ReactNode;
}

export function DocumentEditorLayout({
  document,
  templates,
  variables,
  onSave,
  onExport,
  onTemplateSelect,
  onVariableInsert,
  autoSaveInterval = 30000,
  children,
}: DocumentEditorLayoutProps) {
  const [content, setContent] = useState(document.content);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(document.lastSaved);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(document.templateId);
  const [wordCount, setWordCount] = useState(document.wordCount);
  const [readingTime, setReadingTime] = useState(document.readingTimeMinutes);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate word count and reading time
  const updateMetrics = useCallback((text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // 200 words per minute average
  }, []);

  // Auto-save functionality
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(content, variableValues);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [content, variableValues, onSave]);

  // Set up auto-save
  useEffect(() => {
    if (autoSaveInterval > 0) {
      autoSaveTimerRef.current = setInterval(() => {
        if (content !== document.content) {
          handleSave();
        }
      }, autoSaveInterval);

      return () => {
        if (autoSaveTimerRef.current) {
          clearInterval(autoSaveTimerRef.current);
        }
      };
    }
  }, [content, document.content, autoSaveInterval, handleSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleSave]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    onTemplateSelect?.(templateId);
  };

  const handleVariableInsert = (variableId: string) => {
    onVariableInsert?.(variableId);
  };

  const handleExport = async (format: "docx" | "pdf") => {
    if (onExport) {
      await onExport(format);
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categorizedVariables = variables.reduce((acc, variable) => {
    const category = variable.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(variable);
    return acc;
  }, {} as Record<string, DocumentVariable[]>);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Template Selector */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Templates</h2>
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredTemplates.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No templates found</p>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    selectedTemplate === template.id ? "border-primary bg-accent" : ""
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-2">{template.description}</p>
                    )}
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Center Panel - Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-muted/30">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save document (Ctrl+S)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Separator orientation="vertical" className="mx-2 h-6" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Type className="h-4 w-4 mr-2" />
                    Format
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Bold</DropdownMenuItem>
                  <DropdownMenuItem>Italic</DropdownMenuItem>
                  <DropdownMenuItem>Underline</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Heading 1</DropdownMenuItem>
                  <DropdownMenuItem>Heading 2</DropdownMenuItem>
                  <DropdownMenuItem>Heading 3</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Insert
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Image</DropdownMenuItem>
                  <DropdownMenuItem>
                    <TableIcon className="h-4 w-4 mr-2" />
                    Table
                  </DropdownMenuItem>
                  <DropdownMenuItem>Link</DropdownMenuItem>
                  <DropdownMenuItem>Page Break</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>

              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </Button>

              <Button variant="ghost" size="sm">
                <History className="h-4 w-4 mr-2" />
                Version History
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("docx")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as DOCX
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <div className="bg-white shadow-lg rounded-lg min-h-[11in] p-16 prose prose-slate max-w-none">
                {children || (
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold mb-4">{document.title}</h1>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => {
                        const newContent = e.currentTarget.textContent || "";
                        setContent(newContent);
                        updateMetrics(newContent);
                      }}
                      className="outline-none min-h-[500px] focus:ring-0"
                    >
                      {content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Status Bar */}
        <div className="border-t bg-muted/30 px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">
                      Last saved at {lastSaved.toLocaleTimeString()}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-muted-foreground">Unsaved changes</span>
                  </>
                )}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">
                {wordCount.toLocaleString()} words
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">
                {readingTime} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Variables */}
      <div className="w-80 border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Variables</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {Object.entries(categorizedVariables).map(([category, vars]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-2">
                  {vars.map((variable) => (
                    <Card
                      key={variable.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleVariableInsert(variable.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium">{variable.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {variable.type}
                          </Badge>
                        </div>
                        {variable.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {variable.description}
                          </p>
                        )}
                        {variable.value && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                              {variable.value}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(categorizedVariables).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Type className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No variables available</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
