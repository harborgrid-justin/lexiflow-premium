import React, { useEffect, useState, useRef } from 'react';
import { PleadingDocument } from '../../../../types';

interface LogicOverlayProps {
    document: PleadingDocument;
}

const LogicOverlay: React.FC<LogicOverlayProps> = ({ document: pleadingDoc }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [paths, setPaths] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        const calculatePaths = () => {
            const newPaths: React.ReactElement[] = [];
            if (!svgRef.current) return;
            const svgRect = svgRef.current.getBoundingClientRect();
            
            pleadingDoc.sections.forEach((section) => {
                const nodeEl = window.document.getElementById(`block-${section.id}`);
                
                if (nodeEl && (section.linkedEvidenceIds?.length || section.linkedArgumentId)) {
                    const rect = nodeEl.getBoundingClientRect();
                    
                    if (svgRect) {
                        const startX = rect.right - svgRect.left - 12; // From right side of block
                        const startY = rect.top - svgRect.top + rect.height / 2;
                        
                        const endX = svgRect.width - 20; 
                        const endY = startY + (Math.random() * 80 - 40);

                        const controlX1 = startX + (endX - startX) / 2;
                        
                        newPaths.push(
                            <g key={section.id}>
                                <path 
                                    d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX1} ${endY}, ${endX} ${endY}`}
                                    stroke={section.linkedArgumentId ? "#8b5cf6" : "#f59e0b"} 
                                    strokeWidth="1.5" 
                                    fill="none"
                                    strokeDasharray="4,4"
                                    className="animate-dash"
                                />
                                <circle cx={startX} cy={startY} r="3" fill="white" stroke={section.linkedArgumentId ? "#8b5cf6" : "#f59e0b"} strokeWidth={1.5} />
                                <circle cx={endX} cy={endY} r="3" fill={section.linkedArgumentId ? "#8b5cf6" : "#f59e0b"} />
                            </g>
                        );
                    }
                }
            });
            setPaths(newPaths);
        };

        const timer = setTimeout(calculatePaths, 100);
        window.addEventListener('resize', calculatePaths);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculatePaths);
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
