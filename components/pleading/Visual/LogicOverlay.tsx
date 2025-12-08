
import React, { useEffect, useState, useRef } from 'react';
import { PleadingDocument } from '../../../types/pleadingTypes';

interface LogicOverlayProps {
    document: PleadingDocument;
}

export const LogicOverlay: React.FC<LogicOverlayProps> = ({ document: pleadingDoc }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [paths, setPaths] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        // Calculate paths after render
        const calculatePaths = () => {
            const newPaths: React.ReactElement[] = [];
            
            pleadingDoc.sections.forEach(section => {
                const nodeEl = window.document.getElementById(`node-${section.id}`);
                
                if (nodeEl && (section.linkedEvidenceIds?.length || section.linkedArgumentId)) {
                    const rect = nodeEl.getBoundingClientRect();
                    const svgRect = svgRef.current?.getBoundingClientRect();
                    
                    if (svgRect) {
                        const startX = rect.left - svgRect.left + 4;
                        const startY = rect.top - svgRect.top + 4;
                        
                        // Draw to imaginary sidebar nodes for visualization effect
                        // In a real d3/react-flow implementation, we'd have exact coords for target nodes.
                        // Here we fan them out to the right.
                        
                        const endX = svgRect.width - 20; 
                        const endY = startY + (Math.random() * 100 - 50); // Random scatter for demo effect

                        const controlX1 = startX + (endX - startX) / 2;
                        
                        newPaths.push(
                            <g key={section.id}>
                                <path 
                                    d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX1} ${endY}, ${endX} ${endY}`}
                                    stroke={section.linkedArgumentId ? "#8b5cf6" : "#f59e0b"} 
                                    strokeWidth="2" 
                                    fill="none"
                                    strokeDasharray="5,5"
                                    className="animate-dash"
                                />
                                <circle cx={startX} cy={startY} r="4" fill={section.linkedArgumentId ? "#8b5cf6" : "#f59e0b"} />
                                <circle cx={endX} cy={endY} r="4" fill={section.linkedArgumentId ? "#8b5cf6" : "#f59e0b"} />
                                <text x={endX - 10} y={endY} textAnchor="end" fill="#64748b" fontSize="10" fontWeight="bold">
                                    {section.linkedArgumentId ? 'ARG' : 'EVID'}
                                </text>
                            </g>
                        );
                    }
                }
            });
            setPaths(newPaths);
        };

        // Recalculate on window resize or scroll
        window.addEventListener('resize', calculatePaths);
        // Small delay to ensure DOM is ready
        setTimeout(calculatePaths, 100);
        
        return () => window.removeEventListener('resize', calculatePaths);
    }, [pleadingDoc]);

    return (
        <svg 
            ref={svgRef}
            className="absolute inset-0 pointer-events-none z-50 w-full h-full overflow-visible"
        >
            <defs>
                <style>{`
                    @keyframes dash {
                        to {
                            stroke-dashoffset: -20;
                        }
                    }
                    .animate-dash {
                        animation: dash 1s linear infinite;
                    }
                `}</style>
            </defs>
            {paths}
        </svg>
    );
};
