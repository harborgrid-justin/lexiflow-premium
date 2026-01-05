
import React, { useState, useRef, useEffect, useCallback, useTransition } from 'react';
import { Button } from '../common/Button.tsx';
import { 
  Plus, ArrowRight, Save, Layout, ZoomIn, ZoomOut, Move, 
  Settings, Trash2, X, ChevronRight, ChevronLeft, Menu,
  Play, Square, GitBranch, Clock, CheckCircle, MousePointer2, Rocket
} from 'lucide-react';
import { Input, TextArea } from '../common/Inputs.tsx';
import { Badge } from '../common/Badge.tsx';
import { WorkflowTemplateData } from './TemplatePreview.tsx';

// --- Types ---
type NodeType = 'Start' | 'Task' | 'Decision' | 'Parallel' | 'Delay' | 'End';

interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
}

interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
}

interface WorkflowTemplateBuilderProps {
  initialTemplate?: WorkflowTemplateData | null;
}

// --- Icons Helper ---
const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case 'Start': return <Play className="h-4 w-4 text-green-600" />;
    case 'End': return <Square className="h-4 w-4 text-red-600" />;
    case 'Task': return <Layout className="h-4 w-4 text-blue-600" />;
    case 'Decision': return <GitBranch className="h-4 w-4 text-purple-600" />;
    case 'Delay': return <Clock className="h-4 w-4 text-amber-600" />;
    default: return <CheckCircle className="h-4 w-4 text-slate-600" />;
  }
};

const getNodeStyles = (type: NodeType, isSelected: boolean) => {
  const base = "absolute flex flex-col items-center justify-center p-3 rounded-xl border-2 shadow-sm cursor-pointer transition-all hover:shadow-md select-none";
  const selected = isSelected ? "ring-2 ring-blue-500 ring-offset-2 z-10" : "z-0";
  
  let color = "bg-white border-slate-200";
  let size = "w-40 h-20";

  switch (type) {
    case 'Start': 
      color = "bg-green-50 border-green-200";
      size = "w-32 h-16 rounded-full";
      break;
    case 'End': 
      color = "bg-red-50 border-red-200";
      size = "w-32 h-16 rounded-full";
      break;
    case 'Decision': 
      color = "bg-purple-50 border-purple-200";
      size = "w-32 h-32 rotate-45"; // Diamond shape via rotation container would be better, keeping simple for now
      break;
    case 'Task':
      color = "bg-white border-blue-200 border-l-4 border-l-blue-500";
      break;
    case 'Delay':
      color = "bg-amber-50 border-amber-200 dashed-border";
      break;
  }

  return `${base} ${color} ${size} ${selected}`;
};

export const WorkflowTemplateBuilder: React.FC<WorkflowTemplateBuilderProps> = ({ initialTemplate }) => {
  // --- State Initialization ---
  
  const [nodes, setNodes] = useState<WorkflowNode[]>(() => {
    if (initialTemplate) {
      // Auto-layout based on template stages
      const generatedNodes: WorkflowNode[] = [
        { id: 'start', type: 'Start', label: 'Start', x: 50, y: 300, config: {} }
      ];
      
      const spacingX = 220;
      initialTemplate.stages.forEach((stage, idx) => {
        generatedNodes.push({
          id: `n-${idx}`,
          type: 'Task',
          label: stage,
          x: 50 + ((idx + 1) * spacingX),
          y: 300,
          config: { 
            description: `Execute stage: ${stage}`,
            assignee: 'Unassigned',
            sla: '48'
          }
        });
      });

      generatedNodes.push({
        id: 'end',
        type: 'End',
        label: 'Process Complete',
        x: 50 + ((initialTemplate.stages.length + 1) * spacingX),
        y: 300,
        config: {}
      });

      return generatedNodes;
    }

    // Default blank canvas
    return [
      { id: 'start', type: 'Start', label: 'Trigger: New Case', x: 50, y: 200, config: {} },
      { id: 'n1', type: 'Task', label: 'Conflict Check', x: 250, y: 200, config: { assignee: 'Paralegal', sla: '24' } },
      { id: 'n2', type: 'Decision', label: 'Clear?', x: 500, y: 200, config: {} },
    ];
  });
  
  const [connections, setConnections] = useState<WorkflowConnection[]>(() => {
    if (initialTemplate) {
      // Connect nodes linearly
      const conns: WorkflowConnection[] = [];
      const stageCount = initialTemplate.stages.length;
      
      if (stageCount > 0) {
        conns.push({ id: 'c-start', from: 'start', to: 'n-0' });
        for (let i = 0; i < stageCount - 1; i++) {
          conns.push({ id: `c-${i}`, from: `n-${i}`, to: `n-${i+1}` });
        }
        conns.push({ id: 'c-end', from: `n-${stageCount-1}`, to: 'end' });
      } else {
        conns.push({ id: 'c-direct', from: 'start', to: 'end' });
      }
      return conns;
    }

    // Default connections
    return [
      { id: 'c1', from: 'start', to: 'n1' },
      { id: 'c2', from: 'n1', to: 'n2' },
    ];
  });
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [templateName, setTemplateName] = useState(initialTemplate?.title || 'Civil Litigation Standard');
  
  // Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Guideline 3: Use transition for heavy graph updates
  const [isPending, startTransition] = useTransition();

  // --- Handlers ---

  const handleAddNode = (type: NodeType) => {
    const id = `n-${Date.now()}`;
    // Center logic
    const canvasCenter = canvasRef.current ? 
      { x: canvasRef.current.clientWidth / 2 / scale - 60, y: canvasRef.current.clientHeight / 2 / scale - 30 } : 
      { x: 100, y: 100 };

    const newNode: WorkflowNode = {
      id,
      type,
      label: `New ${type}`,
      x: canvasCenter.x + (Math.random() * 40), 
      y: canvasCenter.y + (Math.random() * 40),
      config: {}
    };
    
    startTransition(() => {
        setNodes([...nodes, newNode]);
        setSelectedNodeId(id);
    });
    if (window.innerWidth < 1024) setIsSidebarOpen(false); // Close sidebar on mobile/tablet to show canvas
    setIsPropertiesOpen(true);
  };

  const handleDeleteNode = (id: string) => {
    startTransition(() => {
        setNodes(nodes.filter(n => n.id !== id));
        setConnections(connections.filter(c => c.from !== id && c.to !== id));
        if (selectedNodeId === id) setSelectedNodeId(null);
    });
  };

  const handleUpdateNode = (id: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleSave = () => {
    // Simulate API save
    const payload = {
      name: templateName,
      version: '1.0',
      definition: { nodes, connections }
    };
    console.log('Saving Workflow:', payload);
    alert('Workflow template saved to configuration database.');
  };

  const handleDeploy = () => {
    // Simulate deploying to Process Monitor
    alert(`Process "${templateName}" initiated successfully.\n\nAssigned Process ID: PROC-${Date.now().toString().slice(-4)}\nMonitoring started in Operations Center.`);
  };

  // --- Drag & Drop Logic ---

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;
      
      setDragOffset({
        x: mouseX - node.x,
        y: mouseY - node.y
      });
      setDraggingNodeId(id);
      setSelectedNodeId(id);
      setIsPropertiesOpen(true);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;
      
      // We don't wrap mouse move in transition to keep 1:1 feel, but could debounce if heavy
      handleUpdateNode(draggingNodeId, {
        x: mouseX - dragOffset.x,
        y: mouseY - dragOffset.y
      });
    }
  }, [draggingNodeId, dragOffset, scale]);

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // --- SVG Path Calculation ---
  const getConnectorPath = (conn: WorkflowConnection) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return '';

    // Simple dimensions approximation
    const w = fromNode.type === 'Decision' ? 100 : 160;
    const h = fromNode.type === 'Decision' ? 100 : 80;
    
    const startX = fromNode.x + w; 
    const startY = fromNode.y + (h/2);
    const endX = toNode.x;
    const endY = toNode.y + (h/2);

    const dist = Math.abs(endX - startX);
    const controlPoint1 = { x: startX + dist * 0.5, y: startY };
    const controlPoint2 = { x: endX - dist * 0.5, y: endY };

    return `M ${startX} ${startY} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${endX} ${endY}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative shadow-sm">
      
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-200 bg-white px-4 flex justify-between items-center z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-md lg:hidden">
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <Layout className="h-6 w-6 text-blue-600 hidden md:block" />
          <div className="flex flex-col">
            <input 
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="font-bold text-slate-800 bg-transparent border-none outline-none focus:ring-0 w-32 md:w-64 p-0 text-sm md:text-base"
            />
            <span className="text-[10px] text-slate-400">Version 1.0 • {initialTemplate ? 'From Template' : 'Draft'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex bg-slate-100 rounded-lg p-1 mr-2 border border-slate-200">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-white rounded text-slate-500"><ZoomOut className="h-4 w-4"/></button>
            <span className="px-2 text-xs flex items-center text-slate-500 font-mono w-12 justify-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1.5 hover:bg-white rounded text-slate-500"><ZoomIn className="h-4 w-4"/></button>
          </div>
          <Button variant="ghost" size="sm" icon={Save} onClick={handleSave} className="hidden md:flex">Save</Button>
          <Button variant="primary" size="sm" icon={Rocket} onClick={handleDeploy}>Deploy & Execute</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar: Palette */}
        <div className={`
          absolute md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-10 transition-transform duration-300 shadow-xl md:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16 lg:w-64'}
        `}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 md:hidden lg:flex">
                <h4 className="font-bold text-xs text-slate-500 uppercase">Components</h4>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X className="h-4 w-4 text-slate-400"/></button>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto">
              {[
                { type: 'Task', desc: 'Manual or Auto Task' }, 
                { type: 'Decision', desc: 'Branch Logic' }, 
                { type: 'Delay', desc: 'Wait Period' }, 
                { type: 'Parallel', desc: 'Split Paths' }, 
                { type: 'End', desc: 'Terminate Flow' }
              ].map((item) => (
                <button 
                  key={item.type}
                  onClick={() => handleAddNode(item.type as NodeType)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group text-left"
                >
                  <div className="p-2 bg-white rounded-md shadow-sm group-hover:text-blue-600 border border-slate-100">
                    {getNodeIcon(item.type as NodeType)}
                  </div>
                  <div className="md:hidden lg:block">
                    <span className="text-sm font-medium text-slate-700 block">{item.type}</span>
                    <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                  </div>
                  <Plus className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 text-blue-500 md:hidden lg:block" />
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 md:hidden lg:block">
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
                <strong>Tip:</strong> Drag components to canvas. Select to configure logic.
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 bg-slate-100 relative overflow-hidden cursor-move"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
            backgroundSize: `${20 * scale}px ${20 * scale}px` 
          }}
        >
          <div 
            className="w-full h-full transform origin-top-left transition-transform duration-75"
            style={{ transform: `scale(${scale})` }}
          >
            {/* Connection Lines Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
              {connections.map(conn => (
                <g key={conn.id}>
                  <path 
                    d={getConnectorPath(conn)} 
                    stroke="#94a3b8" 
                    strokeWidth="2" 
                    fill="none" 
                    markerEnd={`url(#arrow-${conn.id})`}
                  />
                  <defs>
                    <marker id={`arrow-${conn.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                  </defs>
                </g>
              ))}
            </svg>

            {/* Nodes Layer */}
            {nodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    className={getNodeStyles(node.type, isSelected)}
                    style={{ left: node.x, top: node.y }}
                  >
                    <div className="mb-2">{getNodeIcon(node.type)}</div>
                    <span className="text-xs font-bold text-slate-800 text-center leading-tight line-clamp-2 w-full px-2">
                        {node.label}
                    </span>
                    
                    {node.type === 'Task' && (
                        <div className="mt-2 flex gap-1">
                            {node.config.assignee && <Badge variant="neutral" className="text-[8px] px-1 h-4">{node.config.assignee}</Badge>}
                            {node.config.sla && <span className="text-[8px] bg-red-100 text-red-700 px-1 rounded h-4 flex items-center">{node.config.sla}h</span>}
                        </div>
                    )}

                    {/* Connection Points (Visual Only for Demo) */}
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full hover:bg-blue-500 hover:border-blue-500 transition-colors"></div>
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full"></div>
                  </div>
                );
            })}
          </div>
          
          {/* Empty State / Watermark */}
          {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="text-center">
                      <MousePointer2 className="h-16 w-16 mx-auto mb-4"/>
                      <h3 className="text-2xl font-bold">Workflow Canvas</h3>
                      <p>Add nodes to start designing</p>
                  </div>
              </div>
          )}
        </div>

        {/* Right Sidebar: Properties */}
        <div className={`
          absolute md:static inset-y-0 right-0 w-80 bg-white border-l border-slate-200 z-30 shadow-2xl md:shadow-none transition-transform duration-300
          ${isPropertiesOpen ? 'translate-x-0' : 'translate-x-full md:hidden'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h4 className="font-bold text-sm text-slate-800 flex items-center">
                <Settings className="h-4 w-4 mr-2" /> Configuration
              </h4>
              <button onClick={() => setIsPropertiesOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {selectedNodeId ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Label / Name</label>
                    <Input 
                      value={nodes.find(n => n.id === selectedNodeId)?.label}
                      onChange={(e) => handleUpdateNode(selectedNodeId, { label: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Component Type</label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200 text-sm text-slate-600">
                        {getNodeIcon(nodes.find(n => n.id === selectedNodeId)?.type as NodeType)}
                        {nodes.find(n => n.id === selectedNodeId)?.type}
                    </div>
                  </div>

                  {nodes.find(n => n.id === selectedNodeId)?.type === 'Task' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Assignee Role</label>
                        <select 
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          value={nodes.find(n => n.id === selectedNodeId)?.config.assignee || ''}
                          onChange={(e) => {
                            const node = nodes.find(n => n.id === selectedNodeId);
                            if (node) handleUpdateNode(selectedNodeId, { config: { ...node.config, assignee: e.target.value } });
                          }}
                        >
                          <option value="">Select Role...</option>
                          <option value="Senior Partner">Senior Partner</option>
                          <option value="Associate">Associate</option>
                          <option value="Paralegal">Paralegal</option>
                          <option value="Finance">Finance</option>
                          <option value="System">System (Automated)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">SLA (Hours)</label>
                        <Input 
                          type="number"
                          value={nodes.find(n => n.id === selectedNodeId)?.config.sla || ''}
                          onChange={(e) => {
                            const node = nodes.find(n => n.id === selectedNodeId);
                            if (node) handleUpdateNode(selectedNodeId, { config: { ...node.config, sla: e.target.value } });
                          }}
                        />
                      </div>
                    </>
                  )}

                  <TextArea 
                    label="Description / Logic Instructions" 
                    rows={4}
                    placeholder="Describe what needs to happen in this step..."
                    value={nodes.find(n => n.id === selectedNodeId)?.config.description || ''}
                    onChange={(e) => {
                      const node = nodes.find(n => n.id === selectedNodeId);
                      if (node) handleUpdateNode(selectedNodeId, { config: { ...node.config, description: e.target.value } });
                    }}
                  />

                  <div className="pt-4 border-t border-slate-100">
                    <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDeleteNode(selectedNodeId)} className="w-full">
                      Delete Node
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Move className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Select a node on the canvas to configure it.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
