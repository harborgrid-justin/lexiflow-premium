import React, { useState, useEffect, useRef } from 'react';

import { RefreshCw, Loader2 } from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

import { useTheme } from '../../../context/ThemeContext';
import { DataService } from '../../../services/dataService';
import { useQuery } from '../../../services/queryClient';
import { LineageNode, LineageLink } from '../../../types';
import { cn } from '../../../utils/cn';
import { NexusPhysics } from '../../../utils/nexusPhysics';
import { Button } from '../../common/Button';
import { Tabs } from '../../common/Tabs';

import { ImpactAnalysis } from './lineage/ImpactAnalysis';
import { LineageCanvas } from './lineage/LineageCanvas';

interface LineageGraphProps {
    initialTab?: string;
}

interface NodeLabel {
    id: string;
    label: string;
    type: string;
}

export function LineageGraph({ initialTab = 'graph' }: LineageGraphProps): JSX.Element {
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
  const [nodeLabels, setNodeLabels] = useState<NodeLabel[]>([]);

  useEffect(() => {
      if (initialTab !== '') {setActiveTab(initialTab);}
  }, [initialTab]);

  const { data: graphData, isLoading } = useQuery<{ nodes: LineageNode[], links: LineageLink[] }>(
      ['lineage', 'graph'],
      () => DataService.catalog.getLineageGraph() as Promise<{ nodes: LineageNode[], links: LineageLink[] }>
  );

  // Initialize Graph Data
  useEffect(() => {
      if (activeTab !== 'graph' || graphData === null || graphData === undefined) {return;}
      
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

  const handleReheat = (): void => {
      physicsState.current.alpha = 1;
      if (!isAnimating) {
          setIsAnimating(true);
      }
  };

  if (isLoading) {return <div className="flex h-full items-center justify-center"><Loader2 className={cn("animate-spin", theme.primary.text)}/></div>;}

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
                onChange={(t) => setActiveTab(t)}
            />
        </div>

        <div className={cn("flex-1 overflow-hidden relative", theme.surface.highlight)}>
            {activeTab === 'graph' && (
                <LineageCanvas 
                    isAnimating={isAnimating} 
                    setIsAnimating={setIsAnimating} 
                    physicsStateRef={physicsState} 
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
}

export default LineageGraph;
