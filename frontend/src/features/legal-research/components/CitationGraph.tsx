import React, { useEffect, useRef, useState } from 'react';
import { Network, BookOpen, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { legalResearchApi, CaseLaw, CitationLink } from '../legalResearchApi';

interface CitationGraphProps {
  caseId: string;
  onCaseClick?: (caseId: string) => void;
}

interface GraphNode {
  id: string;
  label: string;
  citation: string;
  type: 'source' | 'citing' | 'cited';
  treatmentSignal?: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  treatment: string;
  isNegative: boolean;
  label?: string;
}

/**
 * CitationGraph Component
 * Visualizes citation network and relationships between cases
 */
export const CitationGraph: React.FC<CitationGraphProps> = ({ caseId, onCaseClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [caseLaw, setCaseLaw] = useState<CaseLaw | null>(null);
  const [citingCases, setCitingCases] = useState<CitationLink[]>([]);
  const [citedCases, setCitedCases] = useState<CitationLink[]>([]);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    loadGraphData();
  }, [caseId]);

  useEffect(() => {
    if (nodes.length > 0 && canvasRef.current) {
      drawGraph();
    }
  }, [nodes, edges, hoveredNode, selectedNode]);

  const loadGraphData = async () => {
    setLoading(true);
    try {
      const [caseData, citing, cited] = await Promise.all([
        legalResearchApi.getCaseLawById(caseId),
        legalResearchApi.getCitingCases(caseId, 20),
        legalResearchApi.getCitedCases(caseId, 20),
      ]);

      setCaseLaw(caseData);
      setCitingCases(citing);
      setCitedCases(cited);

      // Build graph structure
      buildGraph(caseData, citing, cited);
    } catch (error) {
      console.error('Failed to load graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildGraph = (
    centerCase: CaseLaw,
    citing: CitationLink[],
    cited: CitationLink[]
  ) => {
    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];

    // Center node (current case)
    const centerNode: GraphNode = {
      id: centerCase.id,
      label: truncateText(centerCase.title, 30),
      citation: centerCase.citation,
      type: 'source',
      treatmentSignal: centerCase.treatmentSignal,
    };
    newNodes.push(centerNode);

    // Add citing cases (cases that cite this case)
    citing.forEach((link, index) => {
      if (link.sourceCase) {
        const node: GraphNode = {
          id: link.sourceCase.id,
          label: truncateText(link.sourceCase.title, 25),
          citation: link.sourceCase.citation,
          type: 'citing',
          treatmentSignal: link.signal,
        };
        newNodes.push(node);

        newEdges.push({
          from: link.sourceCase.id,
          to: centerCase.id,
          treatment: link.treatment,
          isNegative: link.isNegativeTreatment,
          label: link.treatment,
        });
      }
    });

    // Add cited cases (cases cited by this case)
    cited.forEach((link, index) => {
      if (link.targetCase) {
        const node: GraphNode = {
          id: link.targetCase.id,
          label: truncateText(link.targetCase.title, 25),
          citation: link.targetCase.citation,
          type: 'cited',
          treatmentSignal: link.signal,
        };
        newNodes.push(node);

        newEdges.push({
          from: centerCase.id,
          to: link.targetCase.id,
          treatment: link.treatment,
          isNegative: link.isNegativeTreatment,
          label: link.treatment,
        });
      }
    });

    // Calculate positions for force-directed layout
    positionNodes(newNodes, newEdges);

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const positionNodes = (nodes: GraphNode[], edges: GraphEdge[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;

    nodes.forEach((node, index) => {
      if (node.type === 'source') {
        // Center node
        node.x = centerX;
        node.y = centerY;
      } else if (node.type === 'citing') {
        // Citing cases in a circle above
        const citingNodes = nodes.filter((n) => n.type === 'citing');
        const citingIndex = citingNodes.findIndex((n) => n.id === node.id);
        const angle = (Math.PI * 2 * citingIndex) / citingNodes.length - Math.PI / 2;
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle) - 100;
      } else {
        // Cited cases in a circle below
        const citedNodes = nodes.filter((n) => n.type === 'cited');
        const citedIndex = citedNodes.findIndex((n) => n.id === node.id);
        const angle = (Math.PI * 2 * citedIndex) / citedNodes.length + Math.PI / 2;
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle) + 100;
      }
    });
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);

      if (fromNode && toNode && fromNode.x && fromNode.y && toNode.x && toNode.y) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);

        // Color based on treatment
        if (edge.isNegative) {
          ctx.strokeStyle = '#dc2626'; // red
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = '#9ca3af'; // gray
          ctx.lineWidth = 1;
        }

        ctx.stroke();

        // Draw arrow
        drawArrow(ctx, fromNode.x, fromNode.y, toNode.x, toNode.y, edge.isNegative);
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      if (!node.x || !node.y) return;

      const isHovered = hoveredNode?.id === node.id;
      const isSelected = selectedNode?.id === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, isHovered || isSelected ? 30 : 25, 0, Math.PI * 2);

      // Color based on type and signal
      if (node.type === 'source') {
        ctx.fillStyle = '#3b82f6'; // blue
      } else if (node.treatmentSignal === 'red_flag') {
        ctx.fillStyle = '#dc2626'; // red
      } else if (node.treatmentSignal === 'yellow_flag') {
        ctx.fillStyle = '#eab308'; // yellow
      } else if (node.treatmentSignal === 'green_c') {
        ctx.fillStyle = '#22c55e'; // green
      } else {
        ctx.fillStyle = '#6b7280'; // gray
      }

      ctx.fill();

      if (isHovered || isSelected) {
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 45);
    });
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    isNegative: boolean
  ) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 10;

    ctx.save();
    ctx.translate(toX, toY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-arrowLength, -arrowLength / 2);
    ctx.lineTo(0, 0);
    ctx.lineTo(-arrowLength, arrowLength / 2);
    ctx.fillStyle = isNegative ? '#dc2626' : '#9ca3af';
    ctx.fill();
    ctx.restore();
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    const clickedNode = nodes.find((node) => {
      if (!node.x || !node.y) return false;
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      return distance <= 25;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      onCaseClick?.(clickedNode.id);
    }
  };

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find hovered node
    const hovered = nodes.find((node) => {
      if (!node.x || !node.y) return false;
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      return distance <= 25;
    });

    setHoveredNode(hovered || null);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading citation graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Citation Network</h3>
              <p className="text-sm text-gray-600">
                {caseLaw?.title || 'Loading...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Current Case</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>Negative Treatment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Positive Treatment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="p-4">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasHover}
          className="border border-gray-200 rounded-lg w-full"
        />
      </div>

      {/* Node Info Panel */}
      {selectedNode && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{selectedNode.label}</p>
              <p className="text-sm text-gray-600 font-mono mt-1">
                {selectedNode.citation}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {selectedNode.type === 'citing' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Cites this case
                  </span>
                )}
                {selectedNode.type === 'cited' && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Cited by this case
                  </span>
                )}
                {selectedNode.treatmentSignal === 'red_flag' && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Negative Treatment
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{citingCases.length}</p>
            <p className="text-sm text-gray-600">Citing Cases</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{citedCases.length}</p>
            <p className="text-sm text-gray-600">Cited Cases</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{nodes.length}</p>
            <p className="text-sm text-gray-600">Total Nodes</p>
          </div>
        </div>
      </div>
    </div>
  );
};
