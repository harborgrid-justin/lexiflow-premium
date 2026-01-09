import { Button } from '@/shared/ui/atoms/Button';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { ConsistentHashRing } from '@/utils/datastructures/consistentHashRing';
import { ArrowRight, Database, Plus, Server, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ShardingVisualizer - React 18 optimized with React.memo
 */
export const ShardingVisualizer = React.memo(function ShardingVisualizer() {
    const { theme } = useTheme();
    const [ring, setRing] = useState(new ConsistentHashRing(5));
    const [nodes, setNodes] = useState<string[]>(['Shard-A', 'Shard-B', 'Shard-C']);
    const [key, setKey] = useState('case:12345');
    const [mappedNode, setMappedNode] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Effect discipline: Synchronize ring with external state (nodes)
    // React 18: Tolerate double-invocation in Strict Mode
    useEffect(() => {
        const newRing = new ConsistentHashRing(5);
        nodes.forEach(n => newRing.addNode(n));
        setRing(newRing);
        // No cleanup needed - ring is idempotent
    }, [nodes]);

    // Derived state computed during render, not in effect
    useEffect(() => {
        setMappedNode(ring.getNode(key));
    }, [ring, key]);

    // Canvas rendering is synchronization with external system (Principle #6)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { width, height } = canvas;
        const center = { x: width / 2, y: height / 2 };
        const radius = Math.min(width, height) / 2 - 40;

        ctx.clearRect(0, 0, width, height);

        // Draw ring
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        // Extract border color from class if possible or fallback
        ctx.strokeStyle = theme.chart.grid;
        ctx.lineWidth = 4;
        ctx.stroke();

        const { ring: ringMap, sortedKeys } = ring.getRingState();
        const maxHash = 2 ** 31 - 1;

        // Draw nodes
        sortedKeys.forEach(hash => {
            const angle = (hash / maxHash) * 2 * Math.PI;
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            const nodeName = ringMap.get(hash)!;

            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = mappedNode === nodeName ? theme.chart.colors.primary : theme.chart.colors.neutral;
            ctx.fill();

            ctx.fillStyle = theme.chart.text;
            ctx.font = '12px sans-serif';
            ctx.fillText((nodeName || '').split(':')[0]!, x + 15, y + 5);
        });

        // Draw key
        if (key && mappedNode) {
            const keyHash = (ring as unknown as { hash: (k: string) => number }).hash(key);
            const angle = (keyHash / maxHash) * 2 * Math.PI;
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = theme.chart.colors.danger;
            ctx.fill();
        }

        // No cleanup needed - canvas rendering is idempotent
        // Strict Mode will re-run this safely
    }, [ring, key, mappedNode, theme]);

    // Functional state updates for concurrent-safe mutations (Principle #5)
    // Wrapped in useCallback for stable identity (Principle #13)
    const addNode = useCallback(() => {
        setNodes(prev => {
            const newNode = `Shard-${String.fromCharCode(65 + prev.length)}`;
            return [...prev, newNode];
        });
    }, []);

    const removeNode = useCallback(() => {
        setNodes(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
    }, []);

    return (
        <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>Consistent Hashing Ring</h3>
                <div className="flex gap-2">
                    <Button size="sm" icon={Plus} onClick={addNode}>Add Shard</Button>
                    <Button size="sm" variant="danger" icon={Trash2} onClick={removeNode}>Remove Shard</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                <div className="lg:col-span-2 relative h-96 lg:h-auto">
                    <canvas ref={canvasRef} width="800" height="600" className="w-full h-full"></canvas>
                </div>
                <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
                    <h4 className={cn("text-sm font-bold mb-4", theme.text.primary)}>Simulation</h4>
                    <div className="space-y-4">
                        <div>
                            <label className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Data Key</label>
                            <input value={key} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey(e.target.value)} className={cn("w-full p-2 border rounded font-mono text-sm", theme.surface.input, theme.border.default, theme.text.primary)} />
                        </div>
                        <div className="flex items-center justify-center gap-4 text-center">
                            <Database className={cn("h-8 w-8", theme.text.primary)} />
                            <ArrowRight className={cn("h-6 w-6", theme.text.tertiary)} />
                            <div className={cn("p-3 rounded-lg border", theme.primary.light, theme.primary.border)}>
                                <Server className={cn("h-8 w-8", theme.primary.text)} />
                            </div>
                        </div>
                        <div className={cn("text-center p-4 rounded border", theme.surface.highlight, theme.border.default)}>
                            <p className={cn("text-xs", theme.text.secondary)}>Key '{key}' maps to</p>
                            <p className={cn("font-bold", theme.primary.text)}>{mappedNode}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
