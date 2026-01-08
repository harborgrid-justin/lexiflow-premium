"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  Highlighter,
  StickyNote,
  Eraser,
  Pointer,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import { Badge } from "@/components/ui/shadcn/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Textarea } from "@/components/ui/shadcn/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/shadcn/tooltip";

interface Exhibit {
  id: string;
  number: string;
  title: string;
  description: string;
  fileType: "pdf" | "image" | "video" | "document";
  status: "marked" | "offered" | "admitted" | "excluded";
  party: "plaintiff" | "defendant" | "joint";
  tags: string[];
  pages?: number;
}

interface Witness {
  id: string;
  name: string;
  type: "fact" | "expert" | "character";
  party: "plaintiff" | "defendant";
  status: "pending" | "deposed" | "testifying" | "testified";
  expectedDuration?: number;
  keyTopics?: string[];
}

interface Annotation {
  id: string;
  exhibitId: string;
  type: "highlight" | "note" | "drawing";
  content: string;
  color: string;
  page?: number;
  coordinates?: { x: number; y: number; width: number; height: number };
  createdAt: Date;
  createdBy: string;
}

interface WarRoomLayoutProps {
  exhibits: Exhibit[];
  witnesses: Witness[];
  notes: Annotation[];
  presentationMode: boolean;
  onPresentationModeToggle: () => void;
  onExhibitSelect?: (exhibitId: string) => void;
  onWitnessSelect?: (witnessId: string) => void;
  onAnnotationAdd?: (annotation: Omit<Annotation, "id" | "createdAt">) => void;
  onAnnotationDelete?: (annotationId: string) => void;
  onExhibitStatusChange?: (exhibitId: string, status: Exhibit["status"]) => void;
  children?: React.ReactNode;
}

export function WarRoomLayout({
  exhibits,
  witnesses,
  notes,
  presentationMode,
  onPresentationModeToggle,
  onExhibitSelect,
  onWitnessSelect,
  onAnnotationAdd,
  onAnnotationDelete,
  onExhibitStatusChange,
  children,
}: WarRoomLayoutProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [selectedExhibit, setSelectedExhibit] = useState<string | null>(null);
  const [selectedWitness, setSelectedWitness] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<"pointer" | "highlight" | "note" | "erase">("pointer");
  const [highlightColor, setHighlightColor] = useState("#FFFF00");
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [noteContent, setNoteContent] = useState("");

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // F11 for presentation mode
      if (e.key === "F11") {
        e.preventDefault();
        onPresentationModeToggle();
      }

      // Arrow keys for navigation
      if (e.key === "ArrowLeft" && selectedExhibit) {
        e.preventDefault();
        handleNavigateExhibit("prev");
      }
      if (e.key === "ArrowRight" && selectedExhibit) {
        e.preventDefault();
        handleNavigateExhibit("next");
      }

      // Tool shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "h":
            e.preventDefault();
            setActiveTool("highlight");
            break;
          case "n":
            e.preventDefault();
            setActiveTool("note");
            break;
          case "e":
            e.preventDefault();
            setActiveTool("erase");
            break;
          case "z":
            e.preventDefault();
            // Handle undo
            break;
          case "y":
            e.preventDefault();
            // Handle redo
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [selectedExhibit, onPresentationModeToggle]);

  const handleNavigateExhibit = (direction: "prev" | "next") => {
    if (!selectedExhibit) return;

    const currentIndex = exhibits.findIndex((e) => e.id === selectedExhibit);
    const newIndex =
      direction === "prev"
        ? Math.max(0, currentIndex - 1)
        : Math.min(exhibits.length - 1, currentIndex + 1);

    const newExhibit = exhibits[newIndex];
    setSelectedExhibit(newExhibit.id);
    onExhibitSelect?.(newExhibit.id);
  };

  const handleExhibitSelect = (exhibitId: string) => {
    setSelectedExhibit(exhibitId);
    onExhibitSelect?.(exhibitId);
  };

  const handleWitnessSelect = (witnessId: string) => {
    setSelectedWitness(witnessId);
    onWitnessSelect?.(witnessId);
  };

  const handleAddNote = () => {
    if (noteContent.trim() && selectedExhibit) {
      onAnnotationAdd?.({
        exhibitId: selectedExhibit,
        type: "note",
        content: noteContent.trim(),
        color: "#FFD700",
        createdBy: "current-user",
      });
      setNoteContent("");
    }
  };

  const handleZoom = (direction: "in" | "out" | "reset") => {
    if (direction === "reset") {
      setZoom(100);
    } else {
      setZoom((prev) => {
        const delta = direction === "in" ? 10 : -10;
        return Math.max(50, Math.min(200, prev + delta));
      });
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const exhibitsByStatus = exhibits.reduce((acc, exhibit) => {
    if (!acc[exhibit.status]) {
      acc[exhibit.status] = [];
    }
    acc[exhibit.status].push(exhibit);
    return acc;
  }, {} as Record<Exhibit["status"], Exhibit[]>);

  const witnessesByStatus = witnesses.reduce((acc, witness) => {
    if (!acc[witness.status]) {
      acc[witness.status] = [];
    }
    acc[witness.status].push(witness);
    return acc;
  }, {} as Record<Witness["status"], Witness[]>);

  const currentExhibit = exhibits.find((e) => e.id === selectedExhibit);
  const exhibitNotes = notes.filter((n) => n.exhibitId === selectedExhibit);

  const getStatusColor = (status: Exhibit["status"]): string => {
    switch (status) {
      case "marked":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "offered":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "admitted":
        return "bg-green-100 text-green-800 border-green-300";
      case "excluded":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-background ${presentationMode ? "fixed inset-0 z-50" : ""}`}>
      {/* Top Toolbar */}
      {!presentationMode && (
        <div className="border-b bg-muted/30 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">War Room</h1>
              {currentExhibit && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <span className="text-sm text-muted-foreground">
                    Exhibit {currentExhibit.number}: {currentExhibit.title}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                    >
                      {leftPanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle left panel</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                    >
                      {rightPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle right panel</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-6" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={onPresentationModeToggle}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Presentation Mode (F11)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share Screen</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Exhibits/Witnesses */}
        {(!presentationMode && !leftPanelCollapsed) && (
          <div className="w-80 border-r flex flex-col bg-muted/10">
            <Tabs defaultValue="exhibits" className="flex-1 flex flex-col">
              <div className="border-b px-4 pt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="exhibits" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Exhibits
                  </TabsTrigger>
                  <TabsTrigger value="witnesses" className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Witnesses
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="exhibits" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {Object.entries(exhibitsByStatus).map(([status, statusExhibits]) => (
                      <div key={status}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          {status} ({statusExhibits.length})
                        </h3>
                        <div className="space-y-2">
                          {statusExhibits.map((exhibit) => (
                            <Card
                              key={exhibit.id}
                              className={`cursor-pointer transition-colors hover:bg-accent ${
                                selectedExhibit === exhibit.id ? "border-primary bg-accent" : ""
                              }`}
                              onClick={() => handleExhibitSelect(exhibit.id)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <Badge variant="outline" className="font-mono">
                                    {exhibit.number}
                                  </Badge>
                                  <Badge className={getStatusColor(exhibit.status)}>
                                    {exhibit.status}
                                  </Badge>
                                </div>
                                <h4 className="font-medium text-sm mb-1">{exhibit.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {exhibit.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {exhibit.party}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {exhibit.fileType}
                                  </Badge>
                                  {exhibit.pages && (
                                    <Badge variant="secondary" className="text-xs">
                                      {exhibit.pages} pages
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="witnesses" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {Object.entries(witnessesByStatus).map(([status, statusWitnesses]) => (
                      <div key={status}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          {status} ({statusWitnesses.length})
                        </h3>
                        <div className="space-y-2">
                          {statusWitnesses.map((witness) => (
                            <Card
                              key={witness.id}
                              className={`cursor-pointer transition-colors hover:bg-accent ${
                                selectedWitness === witness.id ? "border-primary bg-accent" : ""
                              }`}
                              onClick={() => handleWitnessSelect(witness.id)}
                            >
                              <CardContent className="p-3">
                                <h4 className="font-medium text-sm mb-2">{witness.name}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {witness.type}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {witness.party}
                                  </Badge>
                                </div>
                                {witness.expectedDuration && (
                                  <p className="text-xs text-muted-foreground">
                                    Expected: {witness.expectedDuration} min
                                  </p>
                                )}
                                {witness.keyTopics && witness.keyTopics.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {witness.keyTopics.slice(0, 3).map((topic, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {topic}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Center Panel - Main Presentation Area */}
        <div className="flex-1 flex flex-col bg-slate-100">
          {/* Exhibit Controls */}
          <div className="border-b bg-background px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeTool === "pointer" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTool("pointer")}
                      >
                        <Pointer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Pointer Tool</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeTool === "highlight" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTool("highlight")}
                      >
                        <Highlighter className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Highlight Tool (Ctrl+H)</TooltipContent>
                  </Tooltip>

                  {activeTool === "highlight" && (
                    <div className="flex items-center gap-1 ml-2">
                      {["#FFFF00", "#00FF00", "#FF00FF", "#00FFFF"].map((color) => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded border-2 ${
                            highlightColor === color ? "border-primary" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setHighlightColor(color)}
                        />
                      ))}
                    </div>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeTool === "note" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTool("note")}
                      >
                        <StickyNote className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Note (Ctrl+N)</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeTool === "erase" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTool("erase")}
                      >
                        <Eraser className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Erase Tool (Ctrl+E)</TooltipContent>
                  </Tooltip>

                  <Separator orientation="vertical" className="mx-2 h-6" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Undo className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Redo className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleZoom("out")}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom Out</TooltipContent>
                  </Tooltip>

                  <span className="text-sm font-medium px-2 min-w-[60px] text-center">{zoom}%</span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleZoom("in")}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom In</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={handleRotate}>
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rotate</TooltipContent>
                  </Tooltip>

                  <Separator orientation="vertical" className="mx-2 h-6" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {currentExhibit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Status: {currentExhibit.status}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onExhibitStatusChange?.(currentExhibit.id, "marked")}
                    >
                      Mark as Marked
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onExhibitStatusChange?.(currentExhibit.id, "offered")}
                    >
                      Mark as Offered
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onExhibitStatusChange?.(currentExhibit.id, "admitted")}
                    >
                      Mark as Admitted
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onExhibitStatusChange?.(currentExhibit.id, "excluded")}
                    >
                      Mark as Excluded
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Presentation Area */}
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto">
              <div
                className="bg-white shadow-2xl rounded-lg overflow-hidden"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: "center",
                  transition: "transform 0.2s ease-in-out",
                }}
              >
                {children || (
                  <div className="min-h-[800px] flex items-center justify-center">
                    {currentExhibit ? (
                      <div className="text-center p-12">
                        <FileText className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">
                          Exhibit {currentExhibit.number}
                        </h2>
                        <p className="text-lg text-muted-foreground mb-4">
                          {currentExhibit.title}
                        </p>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          {currentExhibit.description}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FileText className="h-24 w-24 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-lg text-muted-foreground">
                          Select an exhibit or witness to begin
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          {currentExhibit && (
            <div className="border-t bg-background px-4 py-3">
              <div className="flex items-center justify-between max-w-6xl mx-auto">
                <Button
                  variant="outline"
                  onClick={() => handleNavigateExhibit("prev")}
                  disabled={exhibits.findIndex((e) => e.id === selectedExhibit) === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Exhibit {exhibits.findIndex((e) => e.id === selectedExhibit) + 1} of{" "}
                  {exhibits.length}
                </span>

                <Button
                  variant="outline"
                  onClick={() => handleNavigateExhibit("next")}
                  disabled={
                    exhibits.findIndex((e) => e.id === selectedExhibit) === exhibits.length - 1
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Notes and Annotations */}
        {(!presentationMode && !rightPanelCollapsed) && (
          <div className="w-80 border-l flex flex-col bg-muted/10">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Notes & Annotations</h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Add Note Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Add Note</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Enter your note..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={3}
                    />
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!noteContent.trim() || !selectedExhibit}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Notes */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Recent Notes ({exhibitNotes.length})
                  </h3>
                  {exhibitNotes.length === 0 ? (
                    <div className="text-center py-8">
                      <StickyNote className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">No notes yet</p>
                    </div>
                  ) : (
                    exhibitNotes.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ backgroundColor: note.color }}
                            >
                              {note.type}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onAnnotationDelete?.(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {note.createdAt.toLocaleString()} - {note.createdBy}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Presentation Mode Overlay */}
      {presentationMode && (
        <div className="absolute top-4 right-4 z-50">
          <Button variant="outline" size="sm" onClick={onPresentationModeToggle}>
            <Minimize2 className="h-4 w-4 mr-2" />
            Exit Presentation
          </Button>
        </div>
      )}
    </div>
  );
}
