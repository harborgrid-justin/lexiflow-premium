
import React, { useEffect, useState, useRef } from 'react';
import { PleadingDocument } from '../../../../types/pleadingTypes';

interface LogicOverlayProps {
    document: PleadingDocument;
}

export const LogicOverlay: React.FC<LogicOverlayProps> = ({ document: pleadingDoc }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [paths, setPaths] = useState<React.ReactElement[]>([]);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        // Debounced calculation using RAF
        const scheduleUpdate = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(calculatePaths);
        };

        const calculatePaths = () => {
            if (!svgRef.current) return;
            
            // 1. Batch Reads: Get SVG rect first
            const svgRect = svgRef.current.getBoundingClientRect();
            
            // 2. Batch Reads: Collect all relevant node positions
            // We filter sections that need links first
            const linksToDraw = pleadingDoc.sections
                .filter(s => (s.linkedEvidenceIds?.length || s.linkedArgumentId))
                .map(section => {
                    const el = window.document.getElementById(`node-${section.id}`);
                    if (!el) return null;
                    return {
                        section,
                        rect: el.getBoundingClientRect()
                    };
                })
                .filter(item => item !== null) as { section: any, rect: DOMRect }[];

            // 3. Batch Writes/Calculations (React State Update)
            const newPaths = linksToDraw.map(({ section, rect }) => {
                const startX = rect.right - svgRect.left - 12; // From right side of block
                const startY = rect.top - svgRect.top + rect.height / 2;
                
                // Draw to imaginary sidebar nodes for visualization effect
                // In a real d3/react-flow implementation, we'd have exact coords for target nodes.
                // Here we fan them out to the right.
                const endX = svgRect.width - 20; 
                
                // Deterministic pseudo-random Y for stability
                const pseudoRandomY = (section.id.charCodeAt(section.id.length-1) % 100) - 50;
                const endY = startY + pseudoRandomY;

                const controlX1 = startX + (endX - startX) / 2;
                
                return (
                    <g key={section.id}>
                        <path 
                            d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX1} ${endY}, ${endX} ${endY}`}
                            stroke={section.linkedArgumentId ? "#8b5cf6" : "#f59e0b"} 
                            strokeWidth="2" 
                            fill="none"
                            strokeDasharray="5,5"
                            className="animate-dash"
                        />
                        <circle cx={startX} cy={startY} r="3" fill="white" stroke={section.linkedArgumentId ? "#8b5cf6" : "#f59e0b"} strokeWidth={1.5} />
                        <circle cx={endX} cy={endY} r="3" fill={section.linkedArgumentId ? "#8b5cf6" : "#f59e0b"} />
                    </g>
                );
            });

            setPaths(newPaths);
        };

        // Initial calc
        scheduleUpdate();

        // Listeners
        window.addEventListener('resize', scheduleUpdate);
        window.addEventListener('scroll', scheduleUpdate, true); // Capture scroll on any parent
        
        return () => {
            window.removeEventListener('resize', scheduleUpdate);
            window.removeEventListener('scroll', scheduleUpdate, true);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        }
    }, [pleadingDoc]);

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
