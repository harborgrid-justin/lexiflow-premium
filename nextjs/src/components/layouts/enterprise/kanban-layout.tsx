"use client";

import * as React from "react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import {
  Plus,
  MoreVertical,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/shadcn/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/shadcn/avatar";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/shadcn/dropdown-menu";
import { Input } from "@/components/ui/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { cn } from "@/lib/utils";

// Type definitions for kanban board
export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cardIds: string[];
  limit?: number;
  order: number;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority: CardPriority;
  dueDate?: Date;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  tags?: string[];
  attachmentCount?: number;
  commentCount?: number;
  checklistTotal?: number;
  checklistCompleted?: number;
  metadata?: Record<string, unknown>;
}

export type CardPriority = "low" | "medium" | "high" | "urgent";

export interface KanbanFilters {
  assignees?: string[];
  priorities?: CardPriority[];
  dueDateRange?: {
    from: Date | null;
    to: Date | null;
  };
  tags?: string[];
  searchQuery?: string;
}

export interface KanbanLayoutProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void;
  onCardClick?: (card: KanbanCard) => void;
  onAddCard?: (columnId: string) => void;
  onColumnAdd?: () => void;
  filters?: KanbanFilters;
  onFilterChange?: (filters: KanbanFilters) => void;
  className?: string;
}

const priorityConfig: Record<CardPriority, { color: string; label: string; icon: typeof AlertCircle }> = {
  low: {
    color: "bg-gray-100 text-gray-700 border-gray-300",
    label: "Low",
    icon: AlertCircle,
  },
  medium: {
    color: "bg-blue-100 text-blue-700 border-blue-300",
    label: "Medium",
    icon: AlertCircle,
  },
  high: {
    color: "bg-orange-100 text-orange-700 border-orange-300",
    label: "High",
    icon: AlertCircle,
  },
  urgent: {
    color: "bg-red-100 text-red-700 border-red-300",
    label: "Urgent",
    icon: AlertCircle,
  },
};

function getDueDateColor(dueDate: Date): string {
  if (isPast(dueDate) && !isToday(dueDate)) {
    return "text-red-600";
  }
  if (isToday(dueDate)) {
    return "text-orange-600";
  }
  if (isTomorrow(dueDate)) {
    return "text-yellow-600";
  }
  return "text-gray-600";
}

function getDueDateLabel(dueDate: Date): string {
  if (isToday(dueDate)) {
    return "Today";
  }
  if (isTomorrow(dueDate)) {
    return "Tomorrow";
  }
  if (isPast(dueDate)) {
    return "Overdue";
  }
  return format(dueDate, "MMM d");
}

export function KanbanLayout({
  columns,
  cards,
  onCardMove,
  onCardClick,
  onAddCard,
  onColumnAdd,
  filters = {},
  onFilterChange,
  className,
}: KanbanLayoutProps) {
  const [draggedCard, setDraggedCard] = React.useState<KanbanCard | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);
  const [previewCard, setPreviewCard] = React.useState<KanbanCard | null>(null);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  // Filter cards
  const filteredCards = React.useMemo(() => {
    return cards.filter((card) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (
          !card.title.toLowerCase().includes(query) &&
          !card.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (filters.assignees && filters.assignees.length > 0) {
        if (!card.assignee || !filters.assignees.includes(card.assignee.id)) {
          return false;
        }
      }
      if (filters.priorities && filters.priorities.length > 0) {
        if (!filters.priorities.includes(card.priority)) {
          return false;
        }
      }
      if (filters.tags && filters.tags.length > 0) {
        if (!card.tags || !filters.tags.some((tag) => card.tags?.includes(tag))) {
          return false;
        }
      }
      if (filters.dueDateRange) {
        if (filters.dueDateRange.from && card.dueDate && card.dueDate < filters.dueDateRange.from) {
          return false;
        }
        if (filters.dueDateRange.to && card.dueDate && card.dueDate > filters.dueDateRange.to) {
          return false;
        }
      }
      return true;
    });
  }, [cards, filters]);

  // Group cards by column
  const cardsByColumn = React.useMemo(() => {
    const grouped = new Map<string, KanbanCard[]>();
    columns.forEach((col) => {
      grouped.set(col.id, []);
    });
    filteredCards.forEach((card) => {
      if (grouped.has(card.columnId)) {
        grouped.get(card.columnId)!.push(card);
      }
    });
    return grouped;
  }, [columns, filteredCards]);

  const handleDragStart = (e: React.DragEvent, card: KanbanCard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedCard && draggedCard.columnId !== columnId) {
      const newIndex = cardsByColumn.get(columnId)?.length || 0;
      onCardMove?.(draggedCard.id, draggedCard.columnId, columnId, newIndex);
    }

    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const allAssignees = React.useMemo(() => {
    const assignees = new Map<string, { id: string; name: string; avatarUrl?: string }>();
    cards.forEach((card) => {
      if (card.assignee) {
        assignees.set(card.assignee.id, card.assignee);
      }
    });
    return Array.from(assignees.values());
  }, [cards]);

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    cards.forEach((card) => {
      card.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [cards]);

  const activeFilterCount = [
    filters.searchQuery,
    filters.assignees?.length,
    filters.priorities?.length,
    filters.tags?.length,
    filters.dueDateRange?.from || filters.dueDateRange?.to,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    onFilterChange?.({
      assignees: [],
      priorities: [],
      tags: [],
      dueDateRange: { from: null, to: null },
      searchQuery: "",
    });
  };

  return (
    <div className={cn("flex flex-col h-full bg-gray-50", className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredCards.length} of {cards.length} cards
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Search cards..."
                value={filters.searchQuery || ""}
                onChange={(e) => onFilterChange?.({ ...filters, searchQuery: e.target.value })}
                className="w-64 pr-8"
              />
              {filters.searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => onFilterChange?.({ ...filters, searchQuery: "" })}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 min-w-[1.25rem]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-2 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Priority</p>
                    <div className="space-y-1">
                      {(Object.keys(priorityConfig) as CardPriority[]).map((priority) => (
                        <label key={priority} className="flex items-center gap-2 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={filters.priorities?.includes(priority)}
                            onChange={(e) => {
                              const priorities = filters.priorities || [];
                              onFilterChange?.({
                                ...filters,
                                priorities: e.target.checked
                                  ? [...priorities, priority]
                                  : priorities.filter((p) => p !== priority),
                              });
                            }}
                            className="rounded border-gray-300"
                          />
                          <Badge variant="outline" className={cn("text-xs", priorityConfig[priority].color)}>
                            {priorityConfig[priority].label}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>

                  {allAssignees.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Assignee</p>
                      <div className="space-y-1">
                        {allAssignees.slice(0, 5).map((assignee) => (
                          <label key={assignee.id} className="flex items-center gap-2 cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={filters.assignees?.includes(assignee.id)}
                              onChange={(e) => {
                                const assignees = filters.assignees || [];
                                onFilterChange?.({
                                  ...filters,
                                  assignees: e.target.checked
                                    ? [...assignees, assignee.id]
                                    : assignees.filter((a) => a !== assignee.id),
                                });
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{assignee.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}

            {/* Add Column */}
            {onColumnAdd && (
              <Button variant="outline" onClick={onColumnAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="flex gap-4 min-w-max">
            {columns
              .sort((a, b) => a.order - b.order)
              .map((column) => {
                const columnCards = cardsByColumn.get(column.id) || [];
                const isOverLimit = column.limit && columnCards.length >= column.limit;
                const isDragOver = dragOverColumn === column.id;

                return (
                  <div
                    key={column.id}
                    className={cn(
                      "w-80 flex-shrink-0 bg-gray-100 rounded-lg transition-all",
                      isDragOver && "ring-2 ring-blue-500 bg-blue-50"
                    )}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    {/* Column Header */}
                    <div className="p-4 pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: column.color }}
                          />
                          <h2 className="font-semibold text-gray-900">{column.title}</h2>
                          <Badge variant="secondary" className="text-xs">
                            {columnCards.length}
                            {column.limit && `/${column.limit}`}
                          </Badge>
                        </div>
                        {onAddCard && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => onAddCard(column.id)}
                            disabled={isOverLimit}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {isOverLimit && (
                        <p className="text-xs text-orange-600">Column limit reached</p>
                      )}
                    </div>

                    {/* Cards */}
                    <ScrollArea className="px-4 pb-4" style={{ maxHeight: "calc(100vh - 250px)" }}>
                      <div className="space-y-2">
                        {columnCards.map((card) => {
                          const priorityConf = priorityConfig[card.priority];
                          const PriorityIcon = priorityConf.icon;

                          return (
                            <Card
                              key={card.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, card)}
                              onDragEnd={handleDragEnd}
                              onClick={() => onCardClick?.(card)}
                              className={cn(
                                "cursor-move hover:shadow-lg transition-all group",
                                draggedCard?.id === card.id && "opacity-50"
                              )}
                            >
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  {/* Card Header */}
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 flex-1">
                                      {card.title}
                                    </h3>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                        >
                                          <MoreVertical className="w-3 h-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  {/* Description */}
                                  {card.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {card.description}
                                    </p>
                                  )}

                                  {/* Tags */}
                                  {card.tags && card.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                      {card.tags.slice(0, 2).map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {card.tags.length > 2 && (
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                          +{card.tags.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  {/* Checklist Progress */}
                                  {card.checklistTotal !== undefined && card.checklistTotal > 0 && (
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-xs text-gray-600">
                                        <div className="flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" />
                                          <span>
                                            {card.checklistCompleted || 0}/{card.checklistTotal}
                                          </span>
                                        </div>
                                        <span>
                                          {Math.round(((card.checklistCompleted || 0) / card.checklistTotal) * 100)}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                          className="bg-green-500 h-1 rounded-full transition-all"
                                          style={{
                                            width: `${((card.checklistCompleted || 0) / card.checklistTotal) * 100}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Card Footer */}
                                  <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                      {/* Priority */}
                                      <Badge variant="outline" className={cn("text-xs", priorityConf.color)}>
                                        <PriorityIcon className="w-3 h-3 mr-1" />
                                        {priorityConf.label}
                                      </Badge>

                                      {/* Due Date */}
                                      {card.dueDate && (
                                        <div
                                          className={cn(
                                            "flex items-center gap-1 text-xs",
                                            getDueDateColor(card.dueDate)
                                          )}
                                        >
                                          <Calendar className="w-3 h-3" />
                                          <span>{getDueDateLabel(card.dueDate)}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Assignee */}
                                    {card.assignee && (
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={card.assignee.avatarUrl} alt={card.assignee.name} />
                                        <AvatarFallback className="text-xs">
                                          {card.assignee.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>

                                  {/* Metadata Icons */}
                                  {(card.attachmentCount || card.commentCount) && (
                                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                                      {card.attachmentCount && card.attachmentCount > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Tag className="w-3 h-3" />
                                          <span>{card.attachmentCount}</span>
                                        </div>
                                      )}
                                      {card.commentCount && card.commentCount > 0 && (
                                        <div className="flex items-center gap-1">
                                          <MessageSquare className="w-3 h-3" />
                                          <span>{card.commentCount}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}

                        {columnCards.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-sm text-gray-500">No cards</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                );
              })}
          </div>
        </div>
      </ScrollArea>

      {/* Card Preview Dialog */}
      <Dialog open={!!previewCard} onOpenChange={(open) => !open && setPreviewCard(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewCard?.title}</DialogTitle>
          </DialogHeader>
          {previewCard && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{previewCard.description}</p>
              {/* Additional card details would go here */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
