
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { NexusPhysics } from '../../../utils/nexusPhysics';
import { Tabs } from '../../common/Tabs';
import { Button } from '../../common/Button';
import { ImpactAnalysis } from './lineage/ImpactAnalysis';
import { LineageCanvas } from './lineage/LineageCanvas';

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

  // Initialize Graph Data
  useEffect(() => {
      if (activeTab !== 'graph') return;
      
      // We assume reasonable default dimensions until canvas mounts and resizes
      const width = 800;
      const height = 600;

      // Mock Lineage Data
      const nodes = [
          { id: 'src1', label: 'Salesforce CRM', type: 'root' },
          { id: 'src2', label: 'Website Logs', type: 'root' },
          { id: 'stg1', label: 'Raw Zone (S3)', type: 'org' },
          { id: 'etl1', label: 'Cleaning Job', type: 'party' },
          { id: 'wh1', label: 'Data Warehouse', type: 'org' },
          { id: 'rpt1', label: 'Revenue Dashboard', type: 'evidence' },
          { id: 'rpt2', label: 'User Activity Report', type: 'evidence' }
      ];

      const { buffer, idMap, meta } = NexusPhysics.initSystem(nodes, width, height);
      setNodeLabels(meta);

      const links = [
          { source: 'src1', target: 'stg1' },
          { source: 'src2', target: 'stg1' },
          { source: 'stg1', target: 'etl1' },
          { source: 'etl1', target: 'wh1' },
          { source: 'wh1', target: 'rpt1' },
          { source: 'wh1', target: 'rpt2' }
      ].map(l => ({
          sourceIndex: idMap.get(l.source)!,
          targetIndex: idMap.get(l.target)!,
          strength: 0.5
      }));

      physicsState.current = { buffer, links, count: nodes.length, alpha: 1 };
  }, [activeTab]);

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

        <div className={cn("flex-1 overflow-hidden relative", theme.surfaceHighlight)}>
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
