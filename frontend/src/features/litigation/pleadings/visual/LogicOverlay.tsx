import React, { useMemo } from 'react';
import { GitBranch, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '@/utils/cn';
import { PleadingDocument, PleadingSection } from '../../../../types';

interface LogicOverlayProps {
  document: PleadingDocument;
}

interface LogicNode {
  id: string;
  title: string;
  type: 'claim' | 'fact' | 'evidence' | 'legal' | 'conclusion';
  connections: string[];
  strength: 'strong' | 'medium' | 'weak';
}

export const LogicOverlay: React.FC<LogicOverlayProps> = ({ document }) => {
  const { theme } = useTheme();

  // Analyze document sections and create logic flow with proper graph connections
  const logicNodes = useMemo<LogicNode[]>(() => {
    return document.sections.map((section, index) => {
      // Determine section type based on PleadingSectionType
      let type: LogicNode['type'] = 'fact';
      const sectionType = section.type?.toLowerCase() || '';
      const contentLower = section.content?.toLowerCase() || '';
      
      if (sectionType.includes('heading') || sectionType.includes('caption')) {
        type = 'claim';
      } else if (contentLower.includes('exhibit') || contentLower.includes('evidence') || section.linkedEvidenceIds?.length) {
        type = 'evidence';
      } else if (contentLower.includes('pursuant to') || contentLower.includes('rule ') || section.linkedArgumentId) {
        type = 'legal';
      } else if (sectionType.includes('signature') || sectionType.includes('certificate')) {
        type = 'conclusion';
      }

      // Calculate strength based on content length, citations, and links
      const contentLength = section.content?.length || 0;
      const hasCitations = /\d+\s+[A-Z][a-z]+\.?\s+\d+/.test(section.content || '');
      const hasEvidence = (section.linkedEvidenceIds?.length || 0) > 0;
      const hasArgument = !!section.linkedArgumentId;
      
      const strength: LogicNode['strength'] = 
        (contentLength > 500 && hasCitations) || (hasEvidence && hasArgument) ? 'strong' :
        contentLength > 200 || hasEvidence || hasArgument ? 'medium' : 'weak';

      // Create connections based on actual links and flow
      const connections: string[] = [];
      
      // Add sequential connection
      if (index < document.sections.length - 1) {
        connections.push(document.sections[index + 1].id);
      }
      
      // Add connections to linked evidence sections
      if (section.linkedEvidenceIds?.length) {
        section.linkedEvidenceIds.forEach(evidenceId => {
          // Find sections that reference this evidence
          const linkedSection = document.sections.find(s => 
            s.content?.includes(evidenceId) || s.id === evidenceId
          );
          if (linkedSection && !connections.includes(linkedSection.id)) {
            connections.push(linkedSection.id);
          }
        });
      }
      
      // Add connection to linked argument
      if (section.linkedArgumentId) {
        const argumentSection = document.sections.find(s => s.id === section.linkedArgumentId);
        if (argumentSection && !connections.includes(argumentSection.id)) {
          connections.push(argumentSection.id);
        }
      }

      return {
        id: section.id,
        title: section.type || `Section ${index + 1}`,
        type,
        connections,
        strength
      };
    });
  }, [document.sections]);

  const getTypeColor = (type: LogicNode['type']) => {
    switch (type) {
      case 'claim': return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'fact': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'evidence': return 'bg-emerald-100 border-emerald-300 text-emerald-700';
      case 'legal': return 'bg-amber-100 border-amber-300 text-amber-700';
      case 'conclusion': return 'bg-rose-100 border-rose-300 text-rose-700';
      default: return 'bg-slate-100 border-slate-300 text-slate-700';
    }
  };

  const getStrengthIndicator = (strength: LogicNode['strength']) => {
    switch (strength) {
      case 'strong': return <CheckCircle className="h-3 w-3 text-emerald-500" />;
      case 'medium': return <AlertCircle className="h-3 w-3 text-amber-500" />;
      case 'weak': return <AlertCircle className="h-3 w-3 text-rose-500" />;
    }
  };

  if (logicNodes.length === 0) {
    return (
      <div className={cn(
        "absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center",
        "animate-fade-in"
      )}>
        <div className={cn("text-center p-8 rounded-lg", theme.surface.overlay)}>
          <GitBranch className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <h3 className={cn("font-bold mb-2", theme.text.primary)}>No Sections to Analyze</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Add content to see the logic flow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "absolute inset-0 bg-slate-900/80 backdrop-blur-sm overflow-auto p-8",
      "animate-fade-in"
    )}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={cn("mb-6 p-4 rounded-lg", theme.surface.overlay)}>
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-5 w-5 text-blue-500" />
            <h3 className={cn("font-bold", theme.text.primary)}>Argument Logic Flow</h3>
          </div>
          <p className={cn("text-sm", theme.text.secondary)}>
            Visual representation of how your arguments connect and build upon each other.
          </p>
        </div>

        {/* Logic Flow */}
        <div className="space-y-4">
          {logicNodes.map((node, index) => (
            <div key={node.id} className="flex items-start gap-4">
              {/* Node */}
              <div className={cn(
                "flex-1 p-4 rounded-lg border-2 transition-all hover:shadow-lg",
                getTypeColor(node.type)
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide">{node.type}</span>
                  <div className="flex items-center gap-1">
                    {getStrengthIndicator(node.strength)}
                    <span className="text-[10px] capitalize">{node.strength}</span>
                  </div>
                </div>
                <h4 className="font-semibold">{node.title}</h4>
              </div>

              {/* Connection Arrow */}
              {index < logicNodes.length - 1 && (
                <div className="flex flex-col items-center pt-4">
                  <ArrowRight className="h-5 w-5 text-slate-400 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className={cn("mt-8 p-4 rounded-lg", theme.surface.overlay)}>
          <h4 className={cn("text-xs font-bold uppercase mb-3", theme.text.secondary)}>Legend</h4>
          <div className="flex flex-wrap gap-3">
            {(['claim', 'fact', 'evidence', 'legal', 'conclusion'] as const).map(type => (
              <div key={type} className={cn("px-2 py-1 rounded text-xs font-medium border", getTypeColor(type))}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogicOverlay;
