
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { NexusPhysics } from '../../../utils/nexusPhysics';
import { Tabs } from '../../common/Tabs';
import { Button } from '../../common/Button';
import { ImpactAnalysis } from './lineage/ImpactAnalysis';
import { LineageCanvas } from './lineage/LineageCanvas';
import { DataService } from '../../../services/dataService';
import { useQuery } from '../../../services/queryClient';
import { LineageNode, LineageLink } from '../../../types';

interface LineageGraphProps {
    initialTab?: string;
}

export const LineageGraph: React.FC<LineageGraphProps> = ({ initialTab = 'graph' }) => {
  const { theme, mode } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isAnimating, setIsAnimating] = useState(true);

  // Physics State
  const physicsState = useRef({
      buffer: new Float32Array(0),
      links: [] as {sourceIndex: number, targetIndex: number, strength: number}[],
      count: 0,
      alpha: 1
  });
  const [nodeLabels, setNodeLabels] = useState<any[]>([]);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const { data: graphData, isLoading } = useQuery<{ nodes: LineageNode[], links: LineageLink[] }>(
      ['lineage', 'graph'],
      DataService.catalog.getLineageGraph
  );

  // Initialize Graph Data
  useEffect(() => {
      if (activeTab !== 'graph' || !graphData) return;
      
      // We assume reasonable default dimensions until canvas mounts and resizes
      const width = 800;
      const height = 600;

      const { buffer, idMap, meta } = NexusPhysics.initSystem(graphData.nodes, width, height);
      setNodeLabels(meta);

      const links = graphData.links.map(l => ({
          sourceIndex: idMap.get(l.source)!,
          targetIndex: idMap.get(l.target)!,
          strength: l.strength
      })).filter(l => l.sourceIndex !== undefined && l.targetIndex !== undefined);

      physicsState.current = { buffer, links, count: graphData.nodes.length, alpha: 1 };
  }, [activeTab, graphData]);

  // Effect to wake up physics on Theme Change
  useEffect(() => {
      physicsState.current.alpha = 0.1; // Trigger a few frames to repaint colors
  }, [mode]);

  const handleReheat = () => {
      physicsState.current.alpha = 1;
      if (!isAnimating) {
          setIsAnimating(true);
      }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="flex flex-col h-full">
        <div className={cn("px-6 pt-6 border-b shrink-0", theme.border.default)}>
            <div className="flex justify-between items-center mb-4">
                <h3 className={cn("text-xl font-bold", theme.text.primary)}>Data Lineage Explorer</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleReheat}>Refresh Layout</Button>
                </div>
            </div>
            <Tabs 
                tabs={['graph', 'impact', 'history']}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as any)}
            />
        </div>

        <div className={cn("flex-1 overflow-hidden relative", theme.surface.highlight)}>
            {activeTab === 'graph' && (
                <LineageCanvas 
                    isAnimating={isAnimating} 
                    setIsAnimating={setIsAnimating} 
                    physicsState={physicsState} 
                    nodeLabels={nodeLabels} 
                />
            )}

            {activeTab === 'impact' && (
                <ImpactAnalysis />
            )}

            {activeTab === 'history' && (
                <div className={cn("p-6 text-center italic", theme.text.tertiary)}>
                    No recent lineage changes detected.
                </div>
            )}
        </div>
    </div>
  );
};

export default LineageGraph;
