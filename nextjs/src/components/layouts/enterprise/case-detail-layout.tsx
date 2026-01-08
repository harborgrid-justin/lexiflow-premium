"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Gavel,
  Users,
  TrendingUp,
  AlertCircle,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/shadcn/avatar";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import { cn } from "@/lib/utils";

// Type definitions for legal domain entities
export interface CaseData {
  id: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  courtName: string;
  judgeName: string;
  filingDate: Date;
  practiceArea: string;
  description?: string;

  // Quick stats
  stats: {
    daysOpen: number;
    budgetUsed: number;
    budgetTotal: number;
    documentCount: number;
    upcomingDeadlines: number;
  };

  // Key dates
  keyDates: CaseKeyDate[];

  // Assigned team
  assignedTeam: TeamMember[];

  // Related cases
  relatedCases: RelatedCase[];

  // Activity feed
  activities: CaseActivity[];
}

export type CaseStatus =
  | "Pre-Filing"
  | "Active"
  | "Discovery"
  | "Trial"
  | "Settled"
  | "Closed"
  | "On Hold"
  | "Appeal";

export interface CaseKeyDate {
  id: string;
  title: string;
  date: Date;
  type: "filing" | "hearing" | "deadline" | "trial" | "discovery";
  description?: string;
  completed?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
  hours?: number;
}

export interface RelatedCase {
  id: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  relationship: string;
}

export interface CaseActivity {
  id: string;
  type: "document" | "event" | "note" | "filing" | "communication";
  title: string;
  description: string;
  timestamp: Date;
  actor: {
    name: string;
    avatarUrl?: string;
  };
  metadata?: Record<string, unknown>;
}

export type CaseDetailTab =
  | "overview"
  | "parties"
  | "documents"
  | "calendar"
  | "financials"
  | "timeline";

export interface CaseDetailLayoutProps {
  caseData: CaseData;
  activeTab?: CaseDetailTab;
  onTabChange?: (tab: CaseDetailTab) => void;
  children?: React.ReactNode;
  className?: string;
}

const statusColors: Record<CaseStatus, string> = {
  "Pre-Filing": "bg-gray-100 text-gray-800 border-gray-300",
  "Active": "bg-blue-100 text-blue-800 border-blue-300",
  "Discovery": "bg-purple-100 text-purple-800 border-purple-300",
  "Trial": "bg-orange-100 text-orange-800 border-orange-300",
  "Settled": "bg-green-100 text-green-800 border-green-300",
  "Closed": "bg-gray-100 text-gray-600 border-gray-300",
  "On Hold": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Appeal": "bg-indigo-100 text-indigo-800 border-indigo-300",
};

const dateTypeIcons: Record<CaseKeyDate["type"], typeof Calendar> = {
  filing: FileText,
  hearing: Gavel,
  deadline: AlertCircle,
  trial: Briefcase,
  discovery: FileText,
};

export function CaseDetailLayout({
  caseData,
  activeTab = "overview",
  onTabChange,
  children,
  className,
}: CaseDetailLayoutProps) {
  const [currentTab, setCurrentTab] = React.useState<CaseDetailTab>(activeTab);

  const handleTabChange = (tab: string) => {
    const newTab = tab as CaseDetailTab;
    setCurrentTab(newTab);
    onTabChange?.(newTab);
  };

  const budgetPercentage = (caseData.stats.budgetUsed / caseData.stats.budgetTotal) * 100;
  const daysOpenColor = caseData.stats.daysOpen > 365 ? "text-red-600" : "text-gray-600";

  return (
    <div className={cn("flex flex-col h-full bg-gray-50", className)}>
      {/* Case Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
              <Badge
                variant="outline"
                className={cn("font-medium", statusColors[caseData.status])}
              >
                {caseData.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">{caseData.caseNumber}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>{caseData.courtName}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <Gavel className="w-4 h-4" />
                <span>Judge {caseData.judgeName}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-gray-500">
                Filed {format(caseData.filingDate, "MMM d, yyyy")}
              </span>
            </div>
            {caseData.description && (
              <p className="mt-2 text-sm text-gray-600 max-w-3xl">
                {caseData.description}
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Days Open</p>
                  <p className={cn("text-2xl font-bold mt-1", daysOpenColor)}>
                    {caseData.stats.daysOpen}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Budget Used</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900">
                    {budgetPercentage.toFixed(0)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className={cn(
                        "h-1.5 rounded-full",
                        budgetPercentage > 90
                          ? "bg-red-500"
                          : budgetPercentage > 75
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      )}
                      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    />
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Documents</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900">
                    {caseData.stats.documentCount.toLocaleString()}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Deadlines</p>
                  <p className={cn(
                    "text-2xl font-bold mt-1",
                    caseData.stats.upcomingDeadlines > 0 ? "text-orange-600" : "text-gray-900"
                  )}>
                    {caseData.stats.upcomingDeadlines}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Upcoming</p>
                </div>
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <Tabs value={currentTab} onValueChange={handleTabChange} className="h-full">
            <div className="bg-white border-b border-gray-200 px-6">
              <TabsList className="bg-transparent border-0 h-12">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="parties"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                >
                  Parties
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                >
                  Calendar
                </TabsTrigger>
                <TabsTrigger
                  value="financials"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                >
                  Financials
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                >
                  Timeline
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="mt-0">
                {children}
              </TabsContent>
              <TabsContent value="parties" className="mt-0">
                {children}
              </TabsContent>
              <TabsContent value="documents" className="mt-0">
                {children}
              </TabsContent>
              <TabsContent value="calendar" className="mt-0">
                {children}
              </TabsContent>
              <TabsContent value="financials" className="mt-0">
                {children}
              </TabsContent>
              <TabsContent value="timeline" className="mt-0">
                {children}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-white overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Key Dates */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Key Dates
                </h3>
                <div className="space-y-2">
                  {caseData.keyDates.slice(0, 5).map((keyDate) => {
                    const Icon = dateTypeIcons[keyDate.type];
                    const isPast = keyDate.date < new Date();
                    const isUpcoming = !isPast && keyDate.date < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                    return (
                      <div
                        key={keyDate.id}
                        className={cn(
                          "p-3 rounded-lg border",
                          keyDate.completed
                            ? "bg-gray-50 border-gray-200"
                            : isUpcoming
                            ? "bg-orange-50 border-orange-200"
                            : "bg-white border-gray-200"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className={cn(
                            "w-4 h-4 mt-0.5",
                            keyDate.completed ? "text-gray-400" : "text-gray-600"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium",
                              keyDate.completed ? "text-gray-500 line-through" : "text-gray-900"
                            )}>
                              {keyDate.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {format(keyDate.date, "MMM d, yyyy")}
                            </p>
                            {keyDate.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {keyDate.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Assigned Team */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Assigned Team
                </h3>
                <div className="space-y-2">
                  {caseData.assignedTeam.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      {member.hours !== undefined && (
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-900">{member.hours}h</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Related Cases */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Related Cases
                </h3>
                <div className="space-y-2">
                  {caseData.relatedCases.map((relatedCase) => (
                    <div
                      key={relatedCase.id}
                      className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                            {relatedCase.caseNumber}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {relatedCase.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", statusColors[relatedCase.status])}
                            >
                              {relatedCase.status}
                            </Badge>
                            <span className="text-xs text-gray-500">{relatedCase.relationship}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Activity Feed - Bottom Section */}
      <div className="border-t border-gray-200 bg-white">
        <div className="px-6 py-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
          <ScrollArea className="h-32">
            <div className="space-y-3">
              {caseData.activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={activity.actor.avatarUrl} alt={activity.actor.name} />
                    <AvatarFallback className="text-xs">
                      {activity.actor.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.actor.name}</span>{" "}
                      <span className="text-gray-600">{activity.description}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(activity.timestamp, "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
