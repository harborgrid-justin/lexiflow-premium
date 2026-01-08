import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Network,
  GitBranch,
  Link2,
  Plus,
  Search,
  Eye,
} from 'lucide-react';
import { CaseRelationship, RelationshipType } from '../types';

interface RelatedCasesNetworkProps {
  caseId: string;
  onCaseSelect?: (caseId: string) => void;
  onAddRelationship?: () => void;
}

interface NetworkNode {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  level: number;
  relationships: number;
}

interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  label: string;
  strength: number;
}

export const RelatedCasesNetwork: React.FC<RelatedCasesNetworkProps> = ({
  caseId,
  onCaseSelect,
  onAddRelationship,
}) => {
  const [viewMode, setViewMode] = useState<'network' | 'list'>('network');
  const [depth, setDepth] = useState(2);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    loadCaseNetwork();
  }, [caseId, depth]);

  const loadCaseNetwork = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch(`/api/cases/${caseId}/network?depth=${depth}`);
      // const data = await response.json();
      // setNodes(data.nodes);
      // setEdges(data.edges);

      // Mock data for demonstration
      setNodes([
        {
          id: caseId,
          caseNumber: 'CV-2025-0123',
          title: 'Main Case',
          status: 'ACTIVE',
          level: 0,
          relationships: 2,
        },
        {
          id: 'case-2',
          caseNumber: 'CV-2024-0456',
          title: 'Related Contract Dispute',
          status: 'ACTIVE',
          level: 1,
          relationships: 1,
        },
        {
          id: 'case-3',
          caseNumber: 'APP-2025-0789',
          title: 'Appeal of Main Case',
          status: 'PENDING',
          level: 1,
          relationships: 1,
        },
      ]);

      setEdges([
        {
          id: 'edge-1',
          source: caseId,
          target: 'case-2',
          type: RelationshipType.RELATED,
          label: 'Related to',
          strength: 75,
        },
        {
          id: 'edge-2',
          source: caseId,
          target: 'case-3',
          type: RelationshipType.APPEALED_TO,
          label: 'Appealed to',
          strength: 100,
        },
      ]);
    } catch (error) {
      console.error('Failed to load case network:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRelationshipColor = (type: RelationshipType) => {
    switch (type) {
      case RelationshipType.APPEALED_TO:
      case RelationshipType.APPEALED_FROM:
        return 'bg-purple-500';
      case RelationshipType.CONSOLIDATED:
        return 'bg-blue-500';
      case RelationshipType.LEAD_CASE:
      case RelationshipType.MEMBER_CASE:
        return 'bg-green-500';
      case RelationshipType.RELATED:
      case RelationshipType.PARALLEL:
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CLOSED':
        return 'bg-gray-500';
      case 'ARCHIVED':
        return 'bg-gray-400';
      default:
        return 'bg-blue-500';
    }
  };

  const renderNetworkView = () => (
    <div className="space-y-4">
      {/* Network Visualization */}
      <div className="relative min-h-[400px] border-2 border-dashed rounded-lg p-6 bg-muted/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            {/* Central Node */}
            <div
              className={`mx-auto w-48 p-4 border-2 rounded-lg bg-card cursor-pointer transition-all ${
                selectedNode === caseId
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedNode(caseId)}
            >
              <div className="font-semibold text-sm">
                {nodes.find((n) => n.id === caseId)?.caseNumber}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {nodes.find((n) => n.id === caseId)?.title}
              </div>
              <Badge className={`mt-2 ${getStatusColor(nodes.find((n) => n.id === caseId)?.status || '')}`}>
                {nodes.find((n) => n.id === caseId)?.status}
              </Badge>
            </div>

            {/* Related Nodes */}
            <div className="flex gap-8 justify-center flex-wrap max-w-3xl">
              {nodes
                .filter((node) => node.id !== caseId)
                .map((node) => {
                  const edge = edges.find(
                    (e) => e.source === caseId && e.target === node.id
                  );
                  return (
                    <div key={node.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-px flex-1 bg-border" />
                        {edge && (
                          <Badge
                            variant="outline"
                            className={getRelationshipColor(edge.type)}
                          >
                            {edge.label}
                          </Badge>
                        )}
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div
                        className={`w-40 p-3 border rounded-lg bg-card cursor-pointer transition-all ${
                          selectedNode === node.id
                            ? 'border-primary shadow-lg scale-105'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedNode(node.id)}
                      >
                        <div className="font-medium text-xs">
                          {node.caseNumber}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {node.title}
                        </div>
                        <Badge className={`mt-2 text-xs ${getStatusColor(node.status)}`}>
                          {node.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{nodes.length}</div>
            <div className="text-xs text-muted-foreground">Total Cases</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{edges.length}</div>
            <div className="text-xs text-muted-foreground">Relationships</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{depth}</div>
            <div className="text-xs text-muted-foreground">Network Depth</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {edges.map((edge) => {
        const relatedNode = nodes.find((n) => n.id === edge.target);
        if (!relatedNode) return null;

        return (
          <Card key={edge.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getRelationshipColor(edge.type)}>
                      {edge.label}
                    </Badge>
                    <Badge className={getStatusColor(relatedNode.status)}>
                      {relatedNode.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="font-semibold">{relatedNode.caseNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {relatedNode.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      {relatedNode.relationships} connection(s)
                    </div>
                    <div>Strength: {edge.strength}%</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCaseSelect?.(relatedNode.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {edges.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No related cases found</p>
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Related Cases Network
            </CardTitle>
            <CardDescription>
              Visualize and manage case relationships
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={viewMode}
              onValueChange={(value: any) => setViewMode(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={depth.toString()}
              onValueChange={(value) => setDepth(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Depth: 1</SelectItem>
                <SelectItem value="2">Depth: 2</SelectItem>
                <SelectItem value="3">Depth: 3</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onAddRelationship} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">
              Loading case network...
            </p>
          </div>
        ) : viewMode === 'network' ? (
          renderNetworkView()
        ) : (
          renderListView()
        )}
      </CardContent>
    </Card>
  );
};

export default RelatedCasesNetwork;
