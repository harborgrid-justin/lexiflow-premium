import React, { useEffect, useState, useRef } from 'react';
import { PleadingDocument, PleadingSection } from '@/types';
import { useTheme } from '@/providers';

interface LogicOverlayProps {
    document: PleadingDocument;
}

export const LogicOverlay: React.FC<LogicOverlayProps> = ({ document: pleadingDoc }) => {
    const { theme } = useTheme();
    const svgRef = useRef<SVGSVGElement>(null);
    const [paths, setPaths] = useState<React.ReactElement[]>([]);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        // Optimization: Use requestAnimationFrame to throttle updates
        const scheduleUpdate = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(calculatePaths);
        };

        const calculatePaths = () => {
            if (!svgRef.current) return;

            // Optimization: Batch Read - Get container dimensions once
            const svgRect = svgRef.current.getBoundingClientRect();

            // Optimization: Batch Read - Collect all target elements first
            const targets = pleadingDoc.sections
                .filter(s => (s.linkedEvidenceIds?.length || s.linkedArgumentId))
                .map(section => {
                    const el = window.document.getElementById(`node-${section.id}`);
                    if (!el) return null;
                    return {
                        section,
                        rect: el.getBoundingClientRect()
                    };
                })
                .filter(item => item !== null) as { section: PleadingSection, rect: DOMRect }[];

            // Optimization: Batch Calculation/Write
            const newPaths = targets.map(({ section, rect }) => {
                const startX = rect.right - svgRect.left - 12; // Adjusted offset
                const startY = rect.top - svgRect.top + rect.height / 2;

                // Draw to imaginary sidebar nodes for visualization effect
                const endX = svgRect.width - 20;

                // Deterministic pseudo-random Y for visual distribution based on ID hash
                const pseudoRandomY = (section.id.charCodeAt(section.id.length-1) % 100) - 50;
                const endY = startY + pseudoRandomY;

                const controlX1 = startX + (endX - startX) / 2;
                const strokeColor = section.linkedArgumentId ? theme.chart.colors.secondary : theme.chart.colors.warning;

                return (
                    <g key={section.id}>
                        <path
                            d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX1} ${endY}, ${endX} ${endY}`}
                            stroke={strokeColor}
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="5,5"
                            className="animate-dash"
                        />
                        <circle cx={startX} cy={startY} r="3" fill={theme.surface.default} stroke={strokeColor} strokeWidth={1.5} />
                        <circle cx={endX} cy={endY} r="3" fill={strokeColor} />
                    </g>
                );
            });

            setPaths(newPaths);
        };

        // Initial calc
        scheduleUpdate();

        // Listeners with throttling
        window.addEventListener('resize', scheduleUpdate);
        window.addEventListener('scroll', scheduleUpdate, true); // Capture scroll on any parent

        return () => {
            window.removeEventListener('resize', scheduleUpdate);
            window.removeEventListener('scroll', scheduleUpdate, true);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        }
    }, [pleadingDoc, theme]);

    return (
        <svg
            ref={svgRef}
            className="absolute inset-0 pointer-events-none z-50 w-full h-full overflow-visible"
        >
            <defs>
                <style>{`
                    @keyframes dash { to { stroke-dashoffset: -20; } }
                    .animate-dash { animation: dash 1s linear infinite; }
                `}</style>
            </defs>
            {paths}
        </svg>
    );
};

export default LogicOverlay;
